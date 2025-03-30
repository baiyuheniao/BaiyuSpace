<template>
  <div class="post-detail">
    <div v-if="loading" class="loading">
      正在加载文章...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="post" class="post-content">
      <h1 class="post-title">{{ post.title }}</h1>
      
      <div class="post-meta">
        <span class="post-author">作者: {{ post.username }}</span>
        <span class="post-date">发布于: {{ formatDate(post.created_at) }}</span>
      </div>
      
      <div class="post-actions" v-if="isAuthor">
        <router-link :to="{ name: 'EditPost', params: { id: post.id } }" class="edit-button">
          编辑文章
        </router-link>
        <button @click="deletePost" class="delete-button">删除文章</button>
      </div>
      
      <div class="post-tags" v-if="post.tags && post.tags.length > 0">
        <TagList :tags="post.tags" />
      </div>
      
      <div class="post-body">
        {{ post.content }}
      </div>
      
      <div class="comments-section">
        <h2 class="comments-title">评论 ({{ post.comments.length }})</h2>
        
        <div v-if="isLoggedIn" class="comment-form">
          <textarea
            v-model="newComment"
            class="form-control"
            rows="3"
            placeholder="写下你的评论..."
          ></textarea>
          <button @click="addComment" class="comment-button" :disabled="commentLoading">
            {{ commentLoading ? '提交中...' : '提交评论' }}
          </button>
        </div>
        
        <div v-else class="login-to-comment">
          请 <router-link to="/login">登录</router-link> 后发表评论
        </div>
        
        <div v-if="post.comments.length === 0" class="no-comments">
          暂无评论，成为第一个评论的人吧！
        </div>
        
        <div v-else class="comments-list">
          <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="comment-author">{{ comment.username }}</span>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import TagList from '../components/TagList.vue';

export default {
  name: 'PostDetail',
  components: {
    TagList
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      post: null,
      loading: true,
      error: null,
      isLoggedIn: false,
      currentUser: null,
      newComment: '',
      commentLoading: false
    };
  },
  computed: {
    isAuthor() {
      return this.isLoggedIn && this.post && this.currentUser && this.post.user_id === this.currentUser.id;
    }
  },
  methods: {
    async checkLoginStatus() {
      try {
        const response = await axios.get('/api/users/me');
        if (response.data.success) {
          this.isLoggedIn = true;
          this.currentUser = response.data.user;
        }
      } catch (error) {
        this.isLoggedIn = false;
        this.currentUser = null;
      }
    },
    async fetchPost() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`/api/posts/${this.id}`);
        if (response.data.success) {
          this.post = response.data.data;
        } else {
          this.error = '获取文章失败';
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.error = '文章不存在';
        } else {
          this.error = '网络错误，请稍后重试';
          console.error('获取文章失败:', error);
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    async addComment() {
      if (!this.newComment.trim()) {
        return;
      }
      
      this.commentLoading = true;
      
      try {
        const response = await axios.post(`/api/posts/${this.id}/comments`, {
          content: this.newComment
        });
        
        if (response.data.success) {
          // 重新加载文章以获取新评论
          this.fetchPost();
          this.newComment = '';
        }
      } catch (error) {
        console.error('添加评论失败:', error);
        alert('添加评论失败，请稍后重试');
      } finally {
        this.commentLoading = false;
      }
    },
    async deletePost() {
      if (!confirm('确定要删除这篇文章吗？此操作不可恢复！')) {
        return;
      }
      
      try {
        const response = await axios.delete(`/api/posts/${this.id}`);
        
        if (response.data.success) {
          this.$router.push('/');
        }
      } catch (error) {
        console.error('删除文章失败:', error);
        alert('删除文章失败，请稍后重试');
      }
    }
  },
  created() {
    this.checkLoginStatus();
    this.fetchPost();
  }
};
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.error {
  color: #e74c3c;
}

.post-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.post-title {
  font-size: 2rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.post-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.edit-button, .delete-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.edit-button {
  background-color: #3498db;
  color: white;
  text-decoration: none;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
}

.post-tags {
  margin-bottom: 1.5rem;
}

.post-body {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #34495e;
  margin-bottom: 2rem;
  white-space: pre-line;
}

.comments-section {
  margin-top: 3rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.comments-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.comment-form {
  margin-bottom: 2rem;
}

.comment-form textarea {
  margin-bottom: 1rem;
}

.comment-button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.7rem 1rem;
  cursor: pointer;
}

.comment-button:disabled {
  background-color: #bdc3c7;
}

.login-to-comment {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: center;
}

.login-to-comment a {
  color: #3498db;
  text-decoration: none;
}

.no-comments {
  text-align: center;
  padding: 1.5rem;
  color: #7f8c8d;
  font-style: italic;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: bold;
  color: #3498db;
}

.comment-date {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.comment-content {
  line-height: 1.6;
}
</style> 