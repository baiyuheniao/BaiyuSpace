<!--
  论坛页面组件 (Forum.vue)
  实现社区交流论坛功能，包括主题分类、搜索、发布、浏览等功能
  为用户提供技术交流、游戏讨论等互动平台
-->
<template>
  <div class="forum-page">
    <h2 class="section-title">论坛交流</h2>
    <p class="section-desc">专业技术与游戏讨论社区，涵盖开发运维、设计艺术等领域</p>
    
    <div class="forum-container">
      <!-- 论坛操作栏：包含搜索框和发布按钮 -->
      <div class="forum-actions">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索主题..." 
            @keyup.enter="searchTopics"
          />
          <button @click="searchTopics" class="btn-search">搜索</button>
        </div>
        <button v-if="isLoggedIn" @click="showNewTopicForm = true" class="btn-primary">发布新主题</button>
        <button v-else @click="redirectToLogin" class="btn-primary">登录发布</button>
      </div>

      <!-- 分类导航栏：用于筛选不同类别的主题 -->
      <div class="categories">
        <div 
          class="category-item" 
          :class="{ active: selectedCategory === null }"
          @click="selectCategory(null)"
        >
          全部主题
        </div>
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </div>
      </div>

      <!-- 新主题表单：仅在点击发布新主题按钮后显示 -->
      <div v-if="showNewTopicForm" class="new-topic-form">
        <h3>发布新主题</h3>
        <select v-model="newTopic.categoryId" required>
          <option value="" disabled selected>请选择分类</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <input 
          type="text" 
          v-model="newTopic.title" 
          placeholder="主题标题" 
          required
        />
        <textarea 
          v-model="newTopic.content" 
          placeholder="主题内容..." 
          rows="6" 
          required
        ></textarea>
        <div class="form-actions">
          <button @click="createTopic" class="btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '发布中...' : '发布主题' }}
          </button>
          <button @click="showNewTopicForm = false" class="btn-cancel">取消</button>
        </div>
      </div>

      <!-- 加载状态指示器：在数据加载过程中显示 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载主题...</p>
      </div>

      <!-- 主题列表：展示已筛选的主题 -->
      <div v-else-if="topics.length > 0" class="topic-list">
        <div v-for="topic in filteredTopics" :key="topic.id" class="topic-item">
          <div class="topic-info">
            <h3 class="topic-title" @click="viewTopic(topic.id)">{{ topic.title }}</h3>
            <div class="topic-meta">
              <span class="category-tag">{{ getCategoryName(topic.categoryId) }}</span>
              <span class="author">{{ topic.username }}</span>
              <span class="date">{{ formatDate(topic.createdAt) }}</span>
            </div>
          </div>
          <div class="topic-stats">
            <div class="stat">
              <span class="stat-value">{{ topic.views || 0 }}</span>
              <span class="stat-label">浏览</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ topic.replies || 0 }}</span>
              <span class="stat-label">回复</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态：当没有主题时显示 -->
      <div v-else class="empty-state">
        <p>暂无主题，成为第一个发言的人吧！</p>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 论坛页面组件
 * 实现用户交流的社区功能，包括主题浏览、筛选、搜索和发布
 */
import axios from 'axios';
import { getForumCategories, getTopics, createTopic } from '../services/api'; // 导入API服务

export default {
  name: 'Forum',
  data() {
    return {
      topics: [],              // 存储所有主题数据
      categories: [           // 主题分类列表，默认值
        { id: 1, name: '技术交流' },
        { id: 2, name: '游戏讨论' },
        { id: 3, name: '设计艺术' },
        { id: 4, name: '开发运维' },
        { id: 5, name: '闲聊灌水' }
      ],
      selectedCategory: null,  // 当前选中的分类
      searchQuery: '',         // 搜索关键词
      loading: true,           // 加载状态标志
      error: null,             // 错误信息
      showNewTopicForm: false, // 控制新主题表单显示
      newTopic: {              // 新主题表单数据
        title: '',
        content: '',
        categoryId: ''
      },
      isSubmitting: false,     // 表单提交状态
      isLoggedIn: false        // 用户登录状态
    };
  },
  computed: {
    /**
     * 计算属性：根据分类和搜索条件过滤主题列表
     * @returns {Array} 过滤后的主题数组
     */
    filteredTopics() {
      let result = [...this.topics];
      
      // 按分类过滤
      if (this.selectedCategory !== null) {
        result = result.filter(topic => topic.categoryId === this.selectedCategory);
      }
      
      // 按搜索关键词过滤
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(topic => 
          topic.title.toLowerCase().includes(query) || 
          topic.content.toLowerCase().includes(query)
        );
      }
      
      return result;
    }
  },
  methods: {
    /**
     * 获取主题列表
     * 从API获取论坛主题数据
     */
    async fetchTopics() {
      this.loading = true;
      
      try {
        // 从API获取主题
        const response = await getTopics({
          categoryId: this.selectedCategory,
          page: 1,
          limit: 20,
          search: this.searchQuery
        });
        
        this.topics = response.data.data;
        this.loading = false;
      } catch (error) {
        console.error('获取主题列表失败:', error);
        this.error = '获取主题列表失败，请稍后重试';
        this.loading = false;
      }
    },
    
    /**
     * 获取分类列表
     * 从API获取论坛分类数据
     */
    async fetchCategories() {
      try {
        const response = await getForumCategories();
        this.categories = response.data.data;
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    },
    
    /**
     * 创建新主题
     * 验证表单并提交新主题到API
     */
    async createTopic() {
      // 表单验证
      if (!this.newTopic.title || !this.newTopic.content || !this.newTopic.categoryId) {
        alert('请填写完整信息');
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        // 调用API创建主题
        const response = await createTopic(this.newTopic);
        
        // 添加到列表顶部，实现即时反馈
        this.topics.unshift({
          ...response.data.data,
          username: localStorage.getItem('username') || '当前用户',
          createdAt: new Date(),
          views: 0,
          replies: 0
        });
        
        // 重置表单状态
        this.isSubmitting = false;
        this.showNewTopicForm = false;
        this.newTopic = {
          title: '',
          content: '',
          categoryId: ''
        };
      } catch (error) {
        console.error('创建主题失败:', error);
        alert('创建主题失败: ' + (error.response?.data?.message || '服务器错误'));
        this.isSubmitting = false;
      }
    },
    
    /**
     * 选择分类
     * 设置当前选中的分类ID
     * @param {number|null} categoryId 分类ID，null表示全部
     */
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
    },
    
    /**
     * 搜索主题
     * 触发主题过滤，实际过滤逻辑已在计算属性中实现
     */
    searchTopics() {
      // 已在计算属性中处理
    },
    
    /**
     * 查看主题详情
     * 导航到指定主题的详情页
     * @param {number} topicId 主题ID
     */
    viewTopic(topicId) {
      // 导航到主题详情页
      this.$router.push({ name: 'TopicDetail', params: { id: topicId } });
    },
    
    /**
     * 重定向到登录页
     * 存储当前页面路径，用于登录后重定向回来
     */
    redirectToLogin() {
      this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } });
    },
    
    /**
     * 获取分类名称
     * 根据分类ID返回分类名称
     * @param {number} categoryId 分类ID
     * @returns {string} 分类名称或默认文本
     */
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : '未分类';
    },
    
    /**
     * 格式化日期
     * 将日期转换为友好的相对时间显示
     * @param {string|Date} date 日期对象或日期字符串
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
     * 检查登录状态
     * 根据本地存储中的token判断用户是否已登录
     */
    checkLoginStatus() {
      // 检查本地存储中是否有token
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
    }
  },
  /**
   * 生命周期钩子：组件创建时
   * 加载主题和分类数据，检查登录状态
   */
  created() {
    this.fetchTopics();
    this.fetchCategories();
    this.checkLoginStatus();
  }
};
</script>

<style scoped>
/* 论坛页面基础样式 - 设置最大宽度和外边距 */
.forum-page {
  max-width: 1200px;
  margin: 140px auto 0; /* 顶部边距为导航栏预留空间 */
  padding: 2rem;
}

/* 页面标题样式 */
.section-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

/* 页面描述样式 */
.section-desc {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

/* 论坛主容器样式 - 毛玻璃效果卡片 */
.forum-container {
  background: rgba(255, 255, 255, 0.05); /* 半透明背景 */
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(8px); /* 背景模糊效果 */
  border: 1px solid rgba(255, 255, 255, 0.1); /* 微妙的边框 */
}

/* 操作栏样式 - 顶部搜索和按钮区域 */
.forum-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* 搜索框样式 */
.search-box {
  display: flex;
  gap: 0.5rem; /* 搜索框和按钮间距 */
  flex-grow: 1;
  max-width: 500px;
}

/* 搜索输入框样式 */
.search-box input {
  background: rgba(255, 255, 255, 0.1); /* 半透明输入框 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: white;
  flex-grow: 1;
}

/* 搜索框焦点样式 */
.search-box input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5); /* 高亮边框 */
}

/* 搜索框占位符样式 */
.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* 搜索按钮样式 */
.btn-search {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s; /* 平滑过渡效果 */
}

/* 搜索按钮悬停效果 */
.btn-search:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 主按钮样式 - 用于重要操作如发布 */
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
  background: rgba(52, 152, 219, 1); /* 加深颜色 */
}

/* 主按钮禁用状态 */
.btn-primary:disabled {
  background: rgba(52, 152, 219, 0.4); /* 更淡的背景色 */
  cursor: not-allowed;
}

/* 取消按钮样式 */
.btn-cancel {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

/* 取消按钮悬停效果 */
.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 分类导航栏样式 - 横向滚动导航 */
.categories {
  display: flex;
  gap: 1rem; /* 分类项间距 */
  margin-bottom: 2rem;
  overflow-x: auto; /* 允许横向滚动 */
  padding-bottom: 0.5rem;
}

/* 分类项样式 */
.category-item {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap; /* 防止文字换行 */
}

/* 分类项悬停效果 */
.category-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 激活分类项样式 */
.category-item.active {
  background: rgba(52, 152, 219, 0.8); /* 蓝色背景表示选中 */
  color: white;
}

/* 新主题表单样式 */
.new-topic-form {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* 表单标题样式 */
.new-topic-form h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

/* 表单输入控件通用样式 */
.new-topic-form select,
.new-topic-form input,
.new-topic-form textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: white;
  margin-bottom: 1rem;
}

/* 下拉选择框样式 - 自定义下拉箭头 */
.new-topic-form select {
  appearance: none; /* 移除默认样式 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

/* 输入控件焦点样式 */
.new-topic-form select:focus,
.new-topic-form input:focus,
.new-topic-form textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5); /* 高亮边框 */
}

/* 表单操作区域样式 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* 主题列表样式 - 垂直堆叠的主题卡片 */
.topic-list {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 主题项间距 */
}

/* 主题项样式 - 卡片式布局 */
.topic-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: transform 0.2s, background 0.2s;
}

/* 主题项悬停效果 - 轻微上浮 */
.topic-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
}

/* 主题信息区域样式 */
.topic-info {
  flex-grow: 1;
}

/* 主题标题样式 */
.topic-title {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

/* 主题标题悬停效果 */
.topic-title:hover {
  color: #3498db; /* 高亮蓝色 */
}

/* 主题元数据样式 - 作者、时间等信息 */
.topic-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  flex-wrap: wrap;
}

/* 分类标签样式 */
.category-tag {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* 统计信息区域样式 - 浏览量和回复数 */
.topic-stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

/* 统计项样式 */
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 统计数值样式 */
.stat-value {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

/* 统计标签样式 */
.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 加载状态容器样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

/* 加载旋转动画样式 */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid rgba(52, 152, 219, 0.8); /* 蓝色加载指示器 */
  animation: spin 1s linear infinite; /* 旋转动画 */
  margin-bottom: 1rem;
}

/* 定义旋转动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态样式 - 无数据时显示 */
.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式适配规则 - 平板和移动设备 */
@media (max-width: 768px) {
  .forum-page {
    padding: 1rem;
    margin-top: 120px; /* 调整顶部边距 */
  }
  
  .section-title {
    font-size: 2rem; /* 缩小标题 */
  }
  
  /* 垂直堆叠操作栏 */
  .forum-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-box {
    max-width: none; /* 全宽搜索框 */
  }
  
  /* 垂直堆叠主题项内容 */
  .topic-item {
    flex-direction: column;
  }
  
  /* 调整统计信息位置 */
  .topic-stats {
    margin-top: 1rem;
    justify-content: flex-end;
  }
}
</style> 