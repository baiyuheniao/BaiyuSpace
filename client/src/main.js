/**
 * BaiyuSpace 前端应用入口文件
 * 负责初始化Vue应用、配置全局功能和挂载根组件
 */

import { createApp } from 'vue';            // 引入Vue 3创建应用的核心方法
import App from './App.vue';                // 引入根组件
import router from './router';              // 引入路由配置
import axios from 'axios';                  // 引入HTTP请求库
import './services/auth';                   // 导入认证服务以初始化拦截器
import authService from './services/auth';  // 导入认证服务实例

/**
 * 设置全局 axios 默认值
 */
// 配置API基础URL，优先使用环境变量中的配置，否则使用本地开发地址
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000';
// 允许跨域请求携带身份凭证（cookies、HTTP认证及客户端SSL证明等）
axios.defaults.withCredentials = true;

/**
 * 创建Vue应用实例
 */
const app = createApp(App);

/**
 * 注册全局属性
 * 这些属性可以在任何组件中通过this.$属性名访问
 */
// 在任何组件中可以通过this.$axios访问axios实例
app.config.globalProperties.$axios = axios;
// 在任何组件中可以通过this.$auth访问认证服务
app.config.globalProperties.$auth = authService;

/**
 * 路由全局前置守卫
 * 用于处理需要身份验证的路由访问控制
 */
router.beforeEach((to, from, next) => {
  // 检查路由是否需要用户登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果需要登录但用户未登录，则重定向到登录页面
    if (!authService.isAuthenticated()) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath } // 保存尝试访问的页面路径，登录后可以跳转回来
      });
    } else {
      // 已登录用户允许访问
      next();
    }
  } 
  // 检查路由是否要求用户未登录（如登录页、注册页）
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    // 如果用户已登录，则重定向到主页
    if (authService.isAuthenticated()) {
      next({ name: 'Home' });
    } else {
      // 未登录用户允许访问
      next();
    }
  } else {
    // 对于没有特殊要求的路由，所有用户都可以访问
    next();
  }
});

/**
 * 注册全局插件
 */
// 使用Vue路由器
app.use(router);

/**
 * 挂载应用到DOM
 * 将根组件挂载到id为app的DOM元素上
 */
app.mount('#app');

/**
 * 热重载接口
 * 用于开发环境中的模块热替换(HMR)功能
 */
if (module.hot) {
  module.hot.accept();
} 