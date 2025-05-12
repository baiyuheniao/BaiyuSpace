<!--
  导航栏组件 (Navbar.vue)
  负责网站顶部导航栏的展示和用户认证状态管理
  包含站点标志、登录/注册链接或用户菜单（已登录状态）
-->
<template>
  <!-- 主导航栏容器 -->
  <nav class="main-nav">
    <div class="nav-group">
      <router-link to="/" class="nav-item">首页</router-link>
      <router-link to="/videos" class="nav-item">视频</router-link>
      <router-link to="/games" class="nav-item">游戏</router-link>
      <router-link to="/forum" class="nav-item">论坛</router-link>
      <router-link to="/software" class="nav-item">软件</router-link>
      <router-link to="/feedback" class="nav-item">反馈</router-link>
      <router-link to="/support" class="nav-item">支持</router-link>
      
      <!-- 右侧用户菜单 -->
      <div class="user-menu">
        <!-- 已登录用户菜单选项 -->
        <template v-if="isAuthenticated">
          <router-link to="/posts/create" class="nav-item">发布文章</router-link>
          <router-link to="/profile" class="nav-item">{{ user.username }}</router-link>
          <a @click="logout" class="nav-item">登出</a>
        </template>
        <!-- 未登录用户菜单选项 -->
        <template v-else>
          <router-link to="/login" class="nav-item">登录</router-link>
          <router-link to="/register" class="nav-item">注册</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
/**
 * 导航栏组件
 * 实现网站顶部导航栏功能，包括用户认证状态的管理
 */
import authService from '@/services/auth'; // 导入认证服务

export default {
  name: 'Navbar',
  data() {
    return {
      showMenu: false,       // 控制移动端菜单显示状态
      user: null,            // 存储当前登录用户信息
      showUserMenu: false    // 控制用户下拉菜单显示状态
    };
  },
  computed: {
    /**
     * 计算属性：用户是否已认证
     * @returns {boolean} 认证状态
     */
    isAuthenticated() {
      return !!this.user; // 转换为布尔值，user存在则为已认证
    }
  },
  methods: {
    /**
     * 切换移动端菜单显示状态
     */
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    
    /**
     * 切换用户菜单显示状态
     */
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    
    /**
     * 关闭用户菜单
     */
    closeUserMenu() {
      this.showUserMenu = false;
    },
    
    /**
     * 用户登出处理
     * 调用认证服务的登出方法并关闭用户菜单
     */
    async logout() {
      this.closeUserMenu();
      authService.logout();
    },
    
    /**
     * 获取用户信息
     * 首先尝试从本地存储获取，如果不存在则从服务器获取
     */
    async fetchUserInfo() {
      this.user = authService.getUser();
      
      // 如果本地存储没有用户信息，尝试从服务器获取
      if (!this.user) {
        try {
          this.user = await authService.getCurrentUser();
        } catch (error) {
          console.error('获取用户信息失败:', error);
        }
      }
    }
  },
  /**
   * 生命周期钩子：组件创建时
   * 获取用户信息并监听存储变化事件
   */
  created() {
    this.fetchUserInfo();
    
    // 监听存储变化事件，更新用户状态
    this.storageHandler = (event) => {
      if (event.key === 'user' || event.key === 'token') {
        this.fetchUserInfo();
      }
    };
    window.addEventListener('storage', this.storageHandler);
  },

  beforeUnmount() {
    // 移除事件监听器
    if (this.storageHandler) {
      window.removeEventListener('storage', this.storageHandler);
    }
  }
};
</script>

<style scoped>
/* 导航栏样式 */
.main-nav {
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.9);
  padding: 1rem;
  display: flex;
  justify-content: center;
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.nav-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  width: auto;
  transform: translateX(0);
  position: relative;
}

/* 导航项样式 */
.nav-item {
  position: relative;
  padding-left: 40px;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  width: 30px;
  height: 30px;
  background: #666;
  border-radius: 6px;
}

/* 用户菜单样式 */
.user-menu {
  display: flex;
  margin-left: auto;
  gap: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.8rem;
  }
  
  .nav-group {
    gap: 0.8rem;
    flex-direction: column;
  }
  
  .nav-item {
    padding-left: 32px;
    font-size: 1.1rem;
  }
  
  .user-menu {
    margin-left: 0;
    margin-top: 0.5rem;
    flex-direction: column;
  }
}
</style>