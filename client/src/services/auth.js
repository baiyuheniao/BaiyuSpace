/**
 * 认证服务模块
 * 提供用户身份验证、登录、注册和会话管理功能
 * 实现了JWT(JSON Web Token)认证流程
 */

import axios from 'axios';

// 本地存储中保存的认证相关信息的键名
const AUTH_TOKEN_KEY = 'auth_token';  // 存储身份验证令牌的键名
const USER_KEY = 'user_data';         // 存储用户信息的键名

/**
 * 认证服务类
 * 管理用户认证状态和认证相关操作
 */
class AuthService {
  /**
   * 构造函数
   * 初始化认证状态和拦截器
   */
  constructor() {
    // 初始化认证状态，从本地存储加载令牌和用户信息
    this.token = localStorage.getItem(AUTH_TOKEN_KEY) || null;
    this.user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    
    // 设置请求拦截器，为每个请求自动添加认证头
    axios.interceptors.request.use(
      config => {
        // 如果有令牌，添加到请求头中
        if (this.token) {
          config.headers['Authorization'] = `Bearer ${this.token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    
    // 设置响应拦截器，处理认证错误
    axios.interceptors.response.use(
      response => response,
      error => {
        // 如果收到 401 未授权响应，清除登录状态
        if (error.response && error.response.status === 401) {
          this.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * 用户登录方法
   * 发送登录请求并保存认证信息
   * 
   * @param {Object} credentials - 登录凭据(用户名/邮箱和密码)
   * @returns {Promise} 登录结果的Promise
   */
  async login(credentials) {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      
      if (response.data.success) {
        // 登录成功，保存令牌和用户信息
        this.setAuth(response.data.token, response.data.user);
        return response.data;
      }
      
      return Promise.reject(new Error(response.data.message || '登录失败'));
    } catch (error) {
      return Promise.reject(error);
    }
  }
  
  /**
   * 用户注册方法
   * 发送注册请求并保存认证信息
   * 
   * @param {Object} userData - 用户注册数据(用户名、邮箱、密码等)
   * @returns {Promise} 注册结果的Promise
   */
  async register(userData) {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.data.success) {
        // 注册成功，保存令牌和用户信息
        this.setAuth(response.data.token, response.data.user);
        return response.data;
      }
      
      return Promise.reject(new Error(response.data.message || '注册失败'));
    } catch (error) {
      return Promise.reject(error);
    }
  }
  
  /**
   * 用户登出方法
   * 清除所有认证相关信息
   */
  logout() {
    this.clearAuth();
  }
  
  /**
   * 设置认证信息
   * 保存令牌和用户信息到内存和本地存储
   * 
   * @param {string} token - JWT认证令牌
   * @param {Object} user - 用户信息对象
   */
  setAuth(token, user) {
    this.token = token;
    this.user = user;
    
    // 保存到本地存储，实现持久化登录状态
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  
  /**
   * 清除认证信息
   * 从内存和本地存储中移除所有认证相关信息
   */
  clearAuth() {
    this.token = null;
    this.user = null;
    
    // 从本地存储中移除
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  
  /**
   * 检查用户是否已登录
   * 
   * @returns {boolean} 如果用户已登录返回true，否则返回false
   */
  isAuthenticated() {
    return !!this.token && !!this.user;
  }
  
  /**
   * 获取当前登录用户信息
   * 
   * @returns {Object|null} 当前用户信息，未登录时返回null
   */
  getUser() {
    return this.user;
  }
  
  /**
   * 获取当前认证令牌
   * 
   * @returns {string|null} 当前JWT令牌，未登录时返回null
   */
  getToken() {
    return this.token;
  }
  
  /**
   * 检查用户是否为管理员
   * 
   * @returns {boolean} 如果用户是管理员返回true，否则返回false
   */
  isAdmin() {
    return this.user && this.user.role === 'admin';
  }
  
  /**
   * 刷新用户信息
   * 从服务器获取最新的用户数据
   * 
   * @returns {Promise} 包含更新后用户信息的Promise
   */
  async refreshUserInfo() {
    if (!this.isAuthenticated()) {
      return Promise.reject(new Error('用户未登录'));
    }
    
    try {
      const response = await axios.get('/api/users/me');
      
      if (response.data.success && response.data.user) {
        // 更新用户信息
        this.user = response.data.user;
        // 更新本地存储中的用户信息
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
        return this.user;
      }
      
      return Promise.reject(new Error('获取用户信息失败'));
    } catch (error) {
      // 如果是认证错误，清除登录状态
      if (error.response && error.response.status === 401) {
        this.clearAuth();
      }
      return Promise.reject(error);
    }
  }
}

// 创建认证服务实例
const authService = new AuthService();

// 导出认证服务实例，供其他模块使用
export default authService; 