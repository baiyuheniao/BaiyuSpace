<!--
  导航栏组件 (Navbar.vue)
  负责网站顶部导航栏的展示和用户认证状态管理
  包含站点标志、登录/注册链接或用户菜单（已登录状态）
-->
<template>
  <!-- 主导航栏容器 -->
  <nav class="navbar">
    <div class="container">
      <!-- 网站品牌/Logo区域 -->
      <div class="navbar-brand">
        <router-link to="/" class="navbar-logo">BaiyuSpace</router-link>
      </div>
      
      <!-- 导航菜单区域 -->
      <div class="navbar-menu">
        <div class="navbar-end">
          <!-- 已登录用户菜单选项 -->
          <template v-if="isAuthenticated">
            <router-link to="/create-post" class="navbar-item">发布文章</router-link>
            <router-link to="/profile" class="navbar-item">{{ user.username }}</router-link>
            <a @click="logout" class="navbar-item">登出</a>
          </template>
          <!-- 未登录用户菜单选项 -->
          <template v-else>
            <router-link to="/login" class="navbar-item">登录</router-link>
            <router-link to="/register" class="navbar-item">注册</router-link>
          </template>
        </div>
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
    window.addEventListener('storage', (event) => {
      if (event.key === 'user' || event.key === 'token') {
        this.fetchUserInfo();
      }
    });
  }
};
</script>

<style scoped>
/* 导航栏基础样式 - 暗色主题 */
.navbar {
  background-color: #121212; /* 深色背景 */
  padding: 1rem 0;
  color: white;
}

/* 导航容器布局 - 使用Flex实现两端对齐 */
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 品牌/Logo区域样式 */
.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

/* Logo链接样式 */
.navbar-logo {
  color: white;
  text-decoration: none;
}

/* 菜单容器样式 */
.navbar-menu {
  display: flex;
}

/* 右侧菜单项容器 */
.navbar-end {
  display: flex;
  align-items: center;
}

/* 菜单项基础样式 */
.navbar-item {
  color: white;
  margin-left: 1.5rem;
  text-decoration: none;
  cursor: pointer;
}

/* 菜单项悬停效果 */
.navbar-item:hover {
  color: #aaa;
  text-decoration: none;
}
</style> 