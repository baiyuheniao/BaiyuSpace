<!--
  主题详情页面组件 (TopicDetail.vue)
  展示论坛主题的详细内容、评论列表和交互功能
  包含主题内容展示、评论发表、点赞、分享和删除等功能
-->
<template>
  <div class="topic-detail-page">
    <!-- 加载状态显示 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载主题内容...</p>
    </div>

    <!-- 错误状态显示 -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="$router.push({name: 'Forum'})" class="btn-primary">返回论坛</button>
    </div>

    <!-- 主题内容显示 -->
    <div v-else class="topic-container">
      <!-- 主题头部：标题、作者、分类和时间信息 -->
      <div class="topic-header">
        <h1 class="topic-title">{{ topic.title }}</h1>
        <div class="topic-meta">
          <span class="category-tag">{{ getCategoryName(topic.categoryId) }}</span>
          <div class="author-info">
            <img :src="topic.avatar || '/images/default-avatar.png'" alt="用户头像" class="avatar">
            <span class="username">{{ topic.username }}</span>
          </div>
          <span class="date">{{ formatDate(topic.createdAt) }}</span>
        </div>
      </div>

      <!-- 主题正文内容 -->
      <div class="topic-content">
        {{ topic.content }}
      </div>

      <!-- 主题操作按钮：点赞、分享和删除 -->
      <div class="topic-actions">
        <button @click="likeTopic" class="btn-action" :class="{ 'liked': userLiked }">
          <i class="icon-like"></i>
          <span>{{ topic.likes || 0 }} 赞</span>
        </button>
        <button @click="shareTopic" class="btn-action">
          <i class="icon-share"></i>
          <span>分享</span>
        </button>
        <button v-if="isTopicAuthor" @click="deleteTopic" class="btn-action btn-delete">
          <i class="icon-delete"></i>
          <span>删除</span>
        </button>
      </div>

      <!-- 评论区域 -->
      <div class="comments-section">
        <h3 class="comments-title">共 {{ comments.length }} 条评论</h3>

        <!-- 评论表单：已登录用户可见 -->
        <div v-if="isLoggedIn" class="comment-form">
          <textarea 
            v-model="newComment" 
            placeholder="添加评论..." 
            rows="4"
            :disabled="isSubmittingComment"
          ></textarea>
          <button 
            @click="submitComment" 
            class="btn-primary" 
            :disabled="!newComment.trim() || isSubmittingComment"
          >
            {{ isSubmittingComment ? '提交中...' : '提交评论' }}
          </button>
        </div>
        <!-- 未登录提示 -->
        <div v-else class="login-prompt">
          <p>请<a @click="redirectToLogin" href="javascript:void(0)">登录</a>后发表评论</p>
        </div>

        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-author">
              <img :src="comment.avatar || '/images/default-avatar.png'" alt="用户头像" class="avatar">
              <div class="author-meta">
                <span class="username">{{ comment.username }}</span>
                <span class="date">{{ formatDate(comment.createdAt) }}</span>
              </div>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
            <div class="comment-actions" v-if="isLoggedIn">
              <button @click="likeComment(comment)" class="btn-action-sm" :class="{ 'liked': isCommentLiked(comment.id) }">
                <i class="icon-like-sm"></i>
                <span>{{ comment.likes || 0 }}</span>
              </button>
              <button v-if="isCommentAuthor(comment)" @click="deleteComment(comment.id)" class="btn-action-sm">
                <i class="icon-delete-sm"></i>
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 无评论时的提示 -->
        <div v-else class="empty-comments">
          <p>暂无评论，发表第一条评论吧！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 主题详情页面组件
 * 用于展示论坛主题详细内容、评论互动和点赞功能
 */
import axios from 'axios';
import { getTopic, getComments, createComment, toggleTopicLike, toggleCommentLike, deleteComment, deleteTopic } from '../services/api'; // 导入API服务

export default {
  name: 'TopicDetail',
  props: {
    id: {
      type: [String, Number], // 接受字符串或数字类型的ID
      required: true          // ID为必填属性
    }
  },
  data() {
    return {
      topic: {},              // 主题详情数据
      comments: [],           // 评论列表
      categories: [           // 分类列表，默认值
        { id: 1, name: '技术交流' },
        { id: 2, name: '游戏讨论' },
        { id: 3, name: '设计艺术' },
        { id: 4, name: '开发运维' },
        { id: 5, name: '闲聊灌水' }
      ],
      loading: true,          // 加载状态标志
      error: null,            // 错误信息
      newComment: '',         // 新评论内容
      isSubmittingComment: false, // 评论提交状态
      isLoggedIn: false,      // 用户登录状态
      userId: null,           // 当前用户ID
      userLiked: false,       // 用户是否已点赞主题
      userLikedComments: []   // 用户已点赞的评论ID列表
    };
  },
  computed: {
    /**
     * 计算当前用户是否为主题作者
     * @returns {boolean} 是否为主题作者
     */
    isTopicAuthor() {
      // 实际应用中应该比较用户ID
      return this.isLoggedIn && this.topic.userId === this.userId;
    }
  },
  methods: {
    /**
     * 获取主题详情数据
     * 从API获取主题信息和用户点赞状态
     */
    async fetchTopicData() {
      this.loading = true;
      
      try {
        // 从API获取主题详情
        const response = await getTopic(this.id);
        this.topic = response.data.data;
        
        // 获取用户点赞状态
        if (response.data.meta) {
          this.userLiked = response.data.meta.userLiked;
          this.userLikedComments = response.data.meta.userLikedComments || [];
        }
        
        this.fetchComments();
        this.loading = false;
      } catch (error) {
        console.error('获取主题详情失败:', error);
        this.error = '获取主题详情失败，请稍后重试';
        this.loading = false;
      }
    },
    
    /**
     * 获取主题评论列表
     * 从API获取当前主题的所有评论
     */
    async fetchComments() {
      try {
        // 从API获取评论
        const response = await getComments(this.id);
        this.comments = response.data.data;
        
        // 获取用户点赞的评论
        if (response.data.meta && response.data.meta.userLikedComments) {
          this.userLikedComments = response.data.meta.userLikedComments;
        }
      } catch (error) {
        console.error('获取评论失败:', error);
      }
    },
    
    /**
     * 获取分类名称
     * 根据分类ID返回对应的分类名称
     * @param {number} categoryId 分类ID
     * @returns {string} 分类名称或默认文本
     */
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : '未分类';
    },
    
    /**
     * 格式化日期
     * 将日期转换为相对时间表示
     * @param {string|Date} date 日期对象或字符串
     * @returns {string} 格式化后的相对时间
     */
    formatDate(date) {
      if (!date) return '';
      
      const now = new Date();
      const diffMs = now - new Date(date);
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 0) {
        return `${diffDay}天前`;
      } else if (diffHour > 0) {
        return `${diffHour}小时前`;
      } else if (diffMin > 0) {
        return `${diffMin}分钟前`;
      } else {
        return '刚刚';
      }
    },
    
    /**
     * 提交评论
     * 验证并发送新评论到服务器
     */
    async submitComment() {
      if (!this.newComment.trim()) return;
      
      this.isSubmittingComment = true;
      
      try {
        const response = await createComment(this.id, { content: this.newComment });
        
        // 添加新评论到列表并更新评论计数
        this.comments.push(response.data.data);
        this.topic.replies = (this.topic.replies || 0) + 1;
        this.newComment = ''; // 清空输入框
      } catch (error) {
        console.error('提交评论失败:', error);
        alert('提交评论失败: ' + (error.response?.data?.message || '服务器错误'));
      } finally {
        this.isSubmittingComment = false;
      }
    },
    
    /**
     * 点赞主题
     * 切换用户对主题的点赞状态
     */
    async likeTopic() {
      if (!this.isLoggedIn) {
        this.redirectToLogin();
        return;
      }
      
      try {
        // 更新界面显示（乐观更新）
        this.userLiked = !this.userLiked;
        
        if (this.userLiked) {
          this.topic.likes_count = (this.topic.likes_count || 0) + 1;
        } else {
          this.topic.likes_count = Math.max(0, (this.topic.likes_count || 0) - 1);
        }
        
        // 发送请求
        const response = await toggleTopicLike(this.id, this.userLiked);
        
        // 使用服务器返回的精确点赞数
        if (response.data.data && response.data.data.likes !== undefined) {
          this.topic.likes_count = response.data.data.likes;
        }
      } catch (error) {
        console.error('点赞失败:', error);
        // 恢复原状态
        this.userLiked = !this.userLiked;
      }
    },
    
    /**
     * 点赞评论
     * 切换用户对评论的点赞状态
     * @param {Object} comment 评论对象
     */
    async likeComment(comment) {
      if (!this.isLoggedIn) {
        this.redirectToLogin();
        return;
      }
      
      const commentId = comment.id;
      const wasLiked = this.isCommentLiked(commentId);
      
      try {
        // 更新界面显示（乐观更新）
        if (wasLiked) {
          this.userLikedComments = this.userLikedComments.filter(id => id !== commentId);
          comment.likes_count = Math.max(0, (comment.likes_count || 0) - 1);
        } else {
          this.userLikedComments.push(commentId);
          comment.likes_count = (comment.likes_count || 0) + 1;
        }
        
        // 发送请求
        const response = await toggleCommentLike(commentId, !wasLiked);
        
        // 使用服务器返回的精确点赞数
        if (response.data.data && response.data.data.likes !== undefined) {
          comment.likes_count = response.data.data.likes;
        }
      } catch (error) {
        console.error('点赞评论失败:', error);
        // 恢复原状态
        if (wasLiked) {
          this.userLikedComments.push(commentId);
        } else {
          this.userLikedComments = this.userLikedComments.filter(id => id !== commentId);
        }
      }
    },
    
    /**
     * 检查评论是否已被点赞
     * @param {number} commentId 评论ID
     * @returns {boolean} 是否已点赞
     */
    isCommentLiked(commentId) {
      return this.userLikedComments.includes(commentId);
    },
    
    /**
     * 分享主题
     * 将当前页面URL复制到剪贴板
     */
    shareTopic() {
      // 复制当前页面URL到剪贴板
      const url = window.location.href;
      navigator.clipboard.writeText(url)
        .then(() => {
          alert('链接已复制到剪贴板，可以分享给好友了！');
        })
        .catch(err => {
          console.error('复制失败:', err);
          alert('复制链接失败，请手动复制地址栏中的URL');
        });
    },
    
    /**
     * 检查用户是否为评论作者
     * @param {Object} comment 评论对象
     * @returns {boolean} 是否为作者
     */
    isCommentAuthor(comment) {
      return this.isLoggedIn && comment.userId === this.userId;
    },
    
    /**
     * 删除评论
     * 确认后删除用户自己的评论
     * @param {number} commentId 评论ID
     */
    async deleteComment(commentId) {
      if (confirm('确定要删除这条评论吗？')) {
        try {
          await deleteComment(commentId);
          
          // 移除评论并更新评论数
          this.comments = this.comments.filter(c => c.id !== commentId);
          this.topic.replies = Math.max(0, (this.topic.replies || 0) - 1);
        } catch (error) {
          console.error(`删除评论失败:`, error);
          alert('删除评论失败: ' + (error.response?.data?.message || '服务器错误'));
        }
      }
    },
    
    /**
     * 删除主题
     * 确认后删除用户自己发布的主题
     */
    async deleteTopic() {
      if (confirm('确定要删除这个主题吗？删除后将无法恢复！')) {
        try {
          await deleteTopic(this.id);
          this.$router.push({ name: 'Forum' }); // 删除成功后返回论坛页面
        } catch (error) {
          console.error(`删除主题失败:`, error);
          alert('删除主题失败: ' + (error.response?.data?.message || '服务器错误'));
        }
      }
    },
    
    /**
     * 重定向到登录页
     * 将当前页面路径作为重定向参数，方便登录后返回
     */
    redirectToLogin() {
      this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } });
    },
    
    /**
     * 检查用户登录状态
     * 从本地存储获取token和用户信息
     */
    checkLoginStatus() {
      // 检查本地存储中是否有token
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
      
      // 模拟获取用户ID
      if (this.isLoggedIn) {
        this.userId = 101; // 实际应从token或用户会话中获取
      }
    }
  },
  /**
   * 生命周期钩子：组件创建时
   * 检查登录状态并获取主题数据
   */
  created() {
    this.checkLoginStatus();
    this.fetchTopicData();
  }
};
</script>

<style scoped>
/* 页面基础样式 - 设置最大宽度和居中对齐 */
.topic-detail-page {
  max-width: 1000px;
  margin: 140px auto 0; /* 顶部边距为导航栏预留空间 */
  padding: 2rem;
}

/* 加载和错误状态容器样式 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* 加载动画样式 */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid rgba(52, 152, 219, 0.8); /* 蓝色加载指示器 */
  animation: spin 1s linear infinite; /* 旋转动画 */
  margin-bottom: 1rem;
}

/* 旋转动画定义 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 主题容器样式 - 半透明玻璃效果 */
.topic-container {
  background: rgba(255, 255, 255, 0.05); /* 半透明背景 */
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(8px); /* 背景模糊效果 */
  border: 1px solid rgba(255, 255, 255, 0.1); /* 微妙的边框 */
}

/* 主题头部样式 */
.topic-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* 底部分隔线 */
  padding-bottom: 1.5rem;
}

/* 主题标题样式 */
.topic-title {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

/* 主题元数据样式 - 作者、时间等信息 */
.topic-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 作者信息样式 */
.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 头像样式 */
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%; /* 圆形头像 */
  background: rgba(255, 255, 255, 0.1); /* 头像占位背景 */
  object-fit: cover; /* 保持图片比例 */
}

/* 分类标签样式 */
.category-tag {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* 主题内容样式 */
.topic-content {
  font-size: 1.1rem;
  line-height: 1.7; /* 增加行高提高可读性 */
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  white-space: pre-line; /* 保留文本中的换行 */
}

/* 主题操作区样式 - 点赞、分享等按钮 */
.topic-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* 底部分隔线 */
}

/* 操作按钮基础样式 */
.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s; /* 平滑过渡效果 */
}

/* 按钮悬停效果 */
.btn-action:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 已点赞按钮样式 */
.btn-action.liked {
  background: rgba(52, 152, 219, 0.5); /* 蓝色背景表示已点赞 */
  color: white;
}

/* 删除按钮悬停效果 */
.btn-delete:hover {
  background: rgba(231, 76, 60, 0.7); /* 红色背景表示删除警告 */
  color: white;
}

/* 图标样式占位符 */
.icon-like, .icon-share, .icon-delete,
.icon-like-sm, .icon-delete-sm {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

/* 评论区样式 */
.comments-section {
  margin-top: 2rem;
}

/* 评论区标题样式 */
.comments-title {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
}

/* 评论表单样式 */
.comment-form {
  margin-bottom: 2rem;
}

/* 评论输入框样式 */
.comment-form textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.1); /* 半透明背景 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 1rem;
  color: white;
  margin-bottom: 1rem;
  resize: vertical; /* 只允许垂直调整大小 */
}

/* 评论输入框焦点样式 */
.comment-form textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5); /* 高亮边框 */
}

/* 主按钮样式 */
.btn-primary {
  background: rgba(52, 152, 219, 0.8); /* 蓝色按钮 */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

/* 主按钮悬停效果 */
.btn-primary:hover {
  background: rgba(52, 152, 219, 1); /* 悬停时加深背景 */
}

/* 主按钮禁用状态 */
.btn-primary:disabled {
  background: rgba(52, 152, 219, 0.4); /* 淡化背景表示禁用 */
  cursor: not-allowed;
}

/* 登录提示样式 */
.login-prompt {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 2rem;
}

/* 登录链接样式 */
.login-prompt a {
  color: #3498db; /* 蓝色链接 */
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}

/* 登录链接悬停效果 */
.login-prompt a:hover {
  text-decoration: underline;
}

/* 评论列表样式 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* 评论之间的间距 */
}

/* 单条评论样式 */
.comment-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* 评论作者信息样式 */
.comment-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* 作者元信息容器 */
.author-meta {
  display: flex;
  flex-direction: column;
}

/* 用户名样式 */
.author-meta .username {
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
}

/* 日期样式 */
.author-meta .date {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 评论内容样式 */
.comment-content {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  white-space: pre-line; /* 保留文本中的换行 */
}

/* 评论操作区样式 */
.comment-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 评论操作按钮样式 */
.btn-action-sm {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
}

/* 评论按钮悬停效果 */
.btn-action-sm:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

/* 已点赞评论按钮样式 */
.btn-action-sm.liked {
  color: #3498db; /* 蓝色表示已点赞 */
}

/* 空评论提示样式 */
.empty-comments {
  text-align: center;
  padding: 2rem 0;
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式适配规则 - 平板和移动设备 */
@media (max-width: 768px) {
  .topic-detail-page {
    padding: 1rem;
    margin-top: 120px; /* 调整顶部边距 */
  }
  
  .topic-title {
    font-size: 1.5rem; /* 减小标题字号 */
  }
  
  /* 垂直排列元数据 */
  .topic-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  /* 均匀分布操作按钮 */
  .topic-actions {
    justify-content: space-between;
  }
}
</style> 