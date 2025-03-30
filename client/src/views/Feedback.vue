<template>
  <div class="feedback-page">
    <div class="header-section">
      <h2 class="section-title">用户反馈</h2>
      <p class="section-desc">产品、网站建议收集系统，全部公开，实时同步到开发看板。</p>
      
      <div class="controls" v-if="isAuthenticated">
        <button class="btn-primary" @click="showCreateForm = true">
          <i class="fas fa-plus"></i> 提交新反馈
        </button>
      </div>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label>状态筛选：</label>
        <select v-model="filters.status" @change="loadFeedbacks">
          <option value="">全部</option>
          <option value="pending">待处理</option>
          <option value="approved">已批准</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>分类筛选：</label>
        <select v-model="filters.category" @change="loadFeedbacks">
          <option value="">全部</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>排序方式：</label>
        <select v-model="filters.sort" @change="loadFeedbacks">
          <option value="latest">最新</option>
          <option value="oldest">最早</option>
          <option value="most_voted">投票最多</option>
          <option value="most_commented">评论最多</option>
        </select>
      </div>
    </div>
    
    <div class="status-counts" v-if="statusCounts.length > 0">
      <div 
        v-for="status in statusCounts" 
        :key="status.status" 
        class="status-count"
        :class="{ active: filters.status === status.status }"
        @click="filters.status = status.status === filters.status ? '' : status.status; loadFeedbacks()"
      >
        <span class="status-label">{{ getStatusLabel(status.status) }}</span>
        <span class="count">{{ status.count }}</span>
      </div>
    </div>
    
    <div class="feedback-list" v-if="feedbacks.length > 0">
      <div 
        v-for="feedback in feedbacks" 
        :key="feedback.id" 
        class="feedback-card"
        @click="viewFeedbackDetail(feedback.id)"
      >
        <div class="feedback-header">
          <div class="feedback-title">{{ feedback.title }}</div>
          <div class="feedback-status" :class="feedback.status">
            {{ getStatusLabel(feedback.status) }}
          </div>
        </div>
        
        <div class="feedback-content">
          <p>{{ truncateText(feedback.description, 200) }}</p>
        </div>
        
        <div class="feedback-meta">
          <div class="author">
            <img 
              :src="feedback.author_avatar || '/images/default-avatar.png'" 
              :alt="feedback.author_name" 
              class="avatar" 
            />
            <span>{{ feedback.author_name }}</span>
          </div>
          <div class="created-at">{{ formatDate(feedback.created_at) }}</div>
        </div>
        
        <div class="feedback-stats">
          <div class="stat">
            <i class="fas fa-thumbs-up"></i>
            <span>{{ feedback.votes_count || 0 }}</span>
          </div>
          <div class="stat">
            <i class="fas fa-comment"></i>
            <span>{{ feedback.comments_count || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <div class="icon">
        <i class="fas fa-inbox"></i>
      </div>
      <h3>暂无反馈</h3>
      <p v-if="isAuthenticated">成为第一个提交反馈的用户！</p>
      <p v-else>请登录后提交反馈。</p>
    </div>
    
    <!-- 创建反馈表单 -->
    <div class="modal" v-if="showCreateForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>提交新反馈</h3>
          <button class="btn-close" @click="showCreateForm = false">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitFeedback">
            <div class="form-group">
              <label for="title">标题</label>
              <input 
                type="text" 
                id="title" 
                v-model="newFeedback.title" 
                required 
                placeholder="简短描述您的反馈" 
              />
            </div>
            
            <div class="form-group">
              <label for="category">分类</label>
              <select id="category" v-model="newFeedback.category_id" required>
                <option value="">请选择分类</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="description">详细描述</label>
              <textarea 
                id="description" 
                v-model="newFeedback.description" 
                required 
                rows="5" 
                placeholder="请提供详细信息，帮助我们更好地理解您的反馈"
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="showCreateForm = false">
                取消
              </button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? '提交中...' : '提交反馈' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- 反馈详情模态框 -->
    <div class="modal" v-if="showDetailModal">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>反馈详情</h3>
          <button class="btn-close" @click="showDetailModal = false">×</button>
        </div>
        
        <div class="modal-body" v-if="currentFeedback">
          <div class="detail-header">
            <h2>{{ currentFeedback.title }}</h2>
            <div class="feedback-status" :class="currentFeedback.status">
              {{ getStatusLabel(currentFeedback.status) }}
            </div>
          </div>
          
          <div class="detail-meta">
            <div class="author">
              <img 
                :src="currentFeedback.author_avatar || '/images/default-avatar.png'" 
                :alt="currentFeedback.author_name" 
                class="avatar" 
              />
              <span>{{ currentFeedback.author_name }}</span>
            </div>
            <div class="created-at">{{ formatDate(currentFeedback.created_at) }}</div>
          </div>
          
          <div class="detail-content">
            <p>{{ currentFeedback.description }}</p>
          </div>
          
          <div class="detail-actions" v-if="isAuthenticated">
            <button 
              class="btn-action" 
              :class="{ active: hasVoted }"
              @click="voteFeedback(currentFeedback.id)"
            >
              <i class="fas fa-thumbs-up"></i>
              {{ hasVoted ? '已赞同' : '赞同' }} ({{ voteCount }})
            </button>
          </div>
          
          <div class="admin-section" v-if="isAdmin && currentFeedback">
            <h3>管理员操作</h3>
            <div class="form-group">
              <label>更新状态</label>
              <select v-model="adminActions.status">
                <option value="pending">待处理</option>
                <option value="approved">已批准</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>管理员备注</label>
              <textarea 
                v-model="adminActions.comment" 
                rows="3" 
                placeholder="给用户的回复"
              ></textarea>
            </div>
            
            <button 
              class="btn-primary" 
              @click="updateFeedbackStatus(currentFeedback.id)"
              :disabled="isUpdatingStatus"
            >
              {{ isUpdatingStatus ? '更新中...' : '更新状态' }}
            </button>
          </div>
          
          <!-- 管理员备注 -->
          <div class="admin-comment" v-if="currentFeedback.admin_comment">
            <h3>官方回复</h3>
            <div class="comment-content">
              <p>{{ currentFeedback.admin_comment }}</p>
            </div>
          </div>
          
          <!-- 评论区 -->
          <div class="comments-section">
            <h3>评论 ({{ comments.length }})</h3>
            
            <div class="comment-list" v-if="comments.length > 0">
              <div v-for="comment in comments" :key="comment.id" class="comment">
                <div class="comment-header">
                  <div class="author">
                    <img 
                      :src="comment.avatar || '/images/default-avatar.png'" 
                      :alt="comment.username" 
                      class="avatar-sm" 
                    />
                    <span>{{ comment.username }}</span>
                  </div>
                  <div class="comment-date">{{ formatDate(comment.created_at) }}</div>
                </div>
                <div class="comment-content">
                  <p>{{ comment.content }}</p>
                </div>
              </div>
            </div>
            
            <div class="empty-comments" v-else>
              <p>暂无评论</p>
            </div>
            
            <!-- 添加评论 -->
            <div class="add-comment" v-if="isAuthenticated">
              <h4>添加评论</h4>
              <form @submit.prevent="submitComment">
                <div class="form-group">
                  <textarea 
                    v-model="newComment" 
                    rows="3" 
                    placeholder="写下您的评论..."
                    required
                  ></textarea>
                </div>
                <button type="submit" class="btn-primary" :disabled="isSubmittingComment">
                  {{ isSubmittingComment ? '提交中...' : '提交评论' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Feedback',
  data() {
    return {
      isAuthenticated: false,
      isAdmin: false,
      feedbacks: [],
      categories: [],
      statusCounts: [],
      filters: {
        status: '',
        category: '',
        sort: 'latest'
      },
      showCreateForm: false,
      showDetailModal: false,
      newFeedback: {
        title: '',
        description: '',
        category_id: ''
      },
      isSubmitting: false,
      currentFeedback: null,
      comments: [],
      newComment: '',
      isSubmittingComment: false,
      hasVoted: false,
      voteCount: 0,
      adminActions: {
        status: '',
        comment: ''
      },
      isUpdatingStatus: false
    };
  },
  created() {
    this.checkAuth();
    this.loadFeedbacks();
  },
  methods: {
    async checkAuth() {
      try {
        const response = await this.$axios.get('/api/users/me');
        this.isAuthenticated = response.data.success;
        
        if (this.isAuthenticated && response.data.user) {
          this.isAdmin = response.data.user.role === 'admin';
        }
      } catch (error) {
        this.isAuthenticated = false;
        this.isAdmin = false;
      }
    },
    async loadFeedbacks() {
      try {
        const { status, category, sort } = this.filters;
        const response = await this.$axios.get('/api/feedback', { 
          params: { status, category, sort } 
        });
        
        if (response.data.success) {
          this.feedbacks = response.data.data.feedbacks;
          this.categories = response.data.data.categories;
          this.statusCounts = response.data.data.statusCounts;
        }
      } catch (error) {
        console.error('加载反馈列表失败:', error);
      }
    },
    getStatusLabel(status) {
      const statusMap = {
        pending: '待处理',
        approved: '已批准',
        in_progress: '进行中',
        completed: '已完成',
        rejected: '已拒绝'
      };
      return statusMap[status] || status;
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    async submitFeedback() {
      if (!this.isAuthenticated) {
        this.$router.push('/login?redirect=' + this.$route.fullPath);
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        const response = await this.$axios.post('/api/feedback', this.newFeedback);
        
        if (response.data.success) {
          this.showCreateForm = false;
          this.newFeedback = {
            title: '',
            description: '',
            category_id: ''
          };
          this.loadFeedbacks();
          // 显示成功消息
          alert('反馈提交成功！');
        }
      } catch (error) {
        console.error('提交反馈失败:', error);
        alert('提交失败，请稍后重试');
      } finally {
        this.isSubmitting = false;
      }
    },
    async viewFeedbackDetail(id) {
      try {
        const response = await this.$axios.get(`/api/feedback/${id}`);
        
        if (response.data.success) {
          this.currentFeedback = response.data.data;
          this.comments = this.currentFeedback.comments || [];
          this.voteCount = this.currentFeedback.votes ? this.currentFeedback.votes.length : 0;
          this.hasVoted = this.currentFeedback.votes && this.isAuthenticated 
            ? this.currentFeedback.votes.some(vote => vote.user_id === this.$auth.user.id)
            : false;
            
          if (this.isAdmin) {
            this.adminActions.status = this.currentFeedback.status;
            this.adminActions.comment = this.currentFeedback.admin_comment || '';
          }
          
          this.showDetailModal = true;
        }
      } catch (error) {
        console.error('获取反馈详情失败:', error);
      }
    },
    async submitComment() {
      if (!this.isAuthenticated) {
        this.$router.push('/login?redirect=' + this.$route.fullPath);
        return;
      }
      
      if (!this.newComment.trim()) return;
      
      this.isSubmittingComment = true;
      
      try {
        const response = await this.$axios.post(
          `/api/feedback/${this.currentFeedback.id}/comments`,
          { content: this.newComment }
        );
        
        if (response.data.success) {
          this.comments.push(response.data.data);
          this.newComment = '';
        }
      } catch (error) {
        console.error('提交评论失败:', error);
        alert('评论提交失败，请稍后重试');
      } finally {
        this.isSubmittingComment = false;
      }
    },
    async voteFeedback(id) {
      if (!this.isAuthenticated) {
        this.$router.push('/login?redirect=' + this.$route.fullPath);
        return;
      }
      
      try {
        const response = await this.$axios.post(`/api/feedback/${id}/vote`);
        
        if (response.data.success) {
          this.hasVoted = response.data.voted;
          // 更新投票计数
          if (this.hasVoted) {
            this.voteCount++;
          } else {
            this.voteCount--;
          }
        }
      } catch (error) {
        console.error('投票失败:', error);
      }
    },
    async updateFeedbackStatus(id) {
      if (!this.isAdmin) return;
      
      this.isUpdatingStatus = true;
      
      try {
        const response = await this.$axios.put(`/api/feedback/${id}/status`, {
          status: this.adminActions.status,
          admin_comment: this.adminActions.comment
        });
        
        if (response.data.success) {
          // 更新当前显示的反馈
          this.currentFeedback.status = this.adminActions.status;
          this.currentFeedback.admin_comment = this.adminActions.comment;
          
          // 刷新列表
          this.loadFeedbacks();
          
          alert('反馈状态更新成功');
        }
      } catch (error) {
        console.error('更新反馈状态失败:', error);
        alert('更新失败，请稍后重试');
      } finally {
        this.isUpdatingStatus = false;
      }
    }
  }
}
</script>

<style scoped>
.feedback-page {
  max-width: 1200px;
  margin: 140px auto 0;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.header-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.section-desc {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.controls {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: #3a86ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #2a75ee;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-right: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.filter-group select {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  outline: none;
}

.status-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.status-count {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-count:hover, .status-count.active {
  background: rgba(255, 255, 255, 0.1);
}

.status-count .count {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 0.8rem;
}

.feedback-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feedback-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feedback-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.07);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.feedback-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.feedback-status {
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 500;
}

.feedback-status.pending {
  background: #ffc107;
  color: #000;
}

.feedback-status.approved {
  background: #4caf50;
  color: white;
}

.feedback-status.in_progress {
  background: #2196f3;
  color: white;
}

.feedback-status.completed {
  background: #9c27b0;
  color: white;
}

.feedback-status.rejected {
  background: #f44336;
  color: white;
}

.feedback-content {
  flex-grow: 1;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.feedback-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-sm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.feedback-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.empty-state .icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state p {
  color: rgba(255, 255, 255, 0.5);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(25, 25, 35, 0.95);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-lg {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  font-size: 1.5rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.btn-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s ease;
}

.btn-close:hover {
  color: rgba(255, 255, 255, 1);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  transition: border-color 0.3s ease;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: #3a86ff;
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.detail-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.9);
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.6);
}

.detail-content {
  margin-bottom: 2rem;
  line-height: 1.6;
  white-space: pre-line;
  color: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.detail-actions {
  display: flex;
  margin-bottom: 2rem;
  gap: 1rem;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action:hover, .btn-action.active {
  background: #3a86ff;
}

.admin-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.admin-comment {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(58, 134, 255, 0.1);
  border-radius: 12px;
  border-left: 4px solid #3a86ff;
}

.admin-comment h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #3a86ff;
}

.comments-section {
  margin-top: 2rem;
}

.comments-section h3 {
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-date {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.comment-content {
  color: rgba(255, 255, 255, 0.8);
}

.empty-comments {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.add-comment {
  margin-top: 2rem;
}

.add-comment h4 {
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .feedback-page {
    padding: 1rem;
    margin-top: 120px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .feedback-list {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: calc(100% - 2rem);
  }
}
</style> 