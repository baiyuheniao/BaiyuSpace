/**
 * 前端路由配置模块
 * 定义应用的所有路由规则、页面组件和路由守卫
 */

import { createRouter, createWebHistory } from 'vue-router';  // Vue Router核心
import axios from 'axios';                                   // HTTP客户端
import Home from '../views/Home.vue';                        // 首页组件
import TopicDetail from '../views/TopicDetail.vue';          // 话题详情组件
import Login from '@/views/Login.vue';                       // 登录页组件
import Register from '@/views/Register.vue';                 // 注册页组件
import Profile from '@/views/Profile.vue';                   // 个人资料页组件

// 使用动态导入实现代码分割，提高应用性能
// 这些组件会在需要时才加载，而不是在应用启动时全部加载
const PostDetail = () => import('../views/PostDetail.vue');   // 文章详情页
const CreatePost = () => import('../views/CreatePost.vue');   // 创建文章页
const EditPost = () => import('../views/EditPost.vue');       // 编辑文章页
const TagPosts = () => import('../views/TagPosts.vue');       // 标签文章列表页

/**
 * 路由配置数组
 * 定义应用的所有路由规则和对应的组件
 */
const routes = [
  {
    path: '/',                   // 路由路径
    name: 'Home',                // 路由名称，用于编程式导航
    component: Home              // 路由对应的组件
  },
  {
    path: '/videos',
    name: 'Videos',
    // 使用动态导入，实现按需加载，减小初始加载体积
    component: () => import(/* webpackChunkName: "videos" */ '../views/Videos.vue')
  },
  {
    path: '/games',
    name: 'Games',
    component: () => import(/* webpackChunkName: "games" */ '../views/Games.vue')
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import(/* webpackChunkName: "forum" */ '../views/Forum.vue')
  },
  {
    path: '/forum/topics/:id',   // 动态路由，:id是路径参数
    name: 'TopicDetail',
    component: TopicDetail,
    props: true                  // 将路由参数作为组件属性传递
  },
  {
    path: '/software',
    name: 'Software',
    component: () => import(/* webpackChunkName: "software" */ '../views/Software.vue')
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import(/* webpackChunkName: "feedback" */ '../views/Feedback.vue')
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import(/* webpackChunkName: "support" */ '../views/Support.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }  // 元数据：仅允许未登录用户访问
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }  // 元数据：仅允许未登录用户访问
  },
  {
    path: '/posts/:id',          // 文章详情动态路由
    name: 'PostDetail',
    component: PostDetail,
    props: true                  // 将路由参数作为组件属性传递
  },
  {
    path: '/posts/create',
    name: 'CreatePost',
    component: CreatePost,
    meta: { requiresAuth: true } // 元数据：需要登录才能访问
  },
  {
    path: '/posts/:id/edit',
    name: 'EditPost',
    component: EditPost,
    props: true,
    meta: { requiresAuth: true } // 元数据：需要登录才能访问
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true } // 元数据：需要登录才能访问
  },
  {
    path: '/tags/:id',
    name: 'TagPosts',
    component: TagPosts,
    props: true
  }
];

/**
 * 创建路由器实例
 */
const router = createRouter({
  // 使用HTML5历史模式，利用浏览器的history API实现无刷新页面切换
  history: createWebHistory(process.env.BASE_URL),
  routes  // 路由配置数组
});

/**
 * 全局路由守卫
 * 在每次路由导航前执行，用于实现路由访问控制
 * 
 * @param {Object} to - 目标路由对象
 * @param {Object} from - 来源路由对象
 * @param {Function} next - 解析导航的函数
 */
router.beforeEach(async (to, from, next) => {
  // 检查用户是否已登录
  let isLoggedIn = false;
  try {
    // 向服务器发送请求，验证用户登录状态
    const response = await axios.get('/api/users/me');
    isLoggedIn = response.data.success;
  } catch (error) {
    isLoggedIn = false;
  }

  // 处理需要认证的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      // 用户未登录，重定向到登录页，并保存目标路径
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else {
      // 用户已登录，允许访问
      next();
    }
  } 
  // 处理仅限游客的路由（如登录、注册页）
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isLoggedIn) {
      // 用户已登录，重定向到首页
      next({ name: 'Home' });
    } else {
      // 用户未登录，允许访问
      next();
    }
  } else {
    // 无特殊要求的路由，直接允许访问
    next();
  }
});

// 导出路由器实例，供主应用文件使用
export default router; 