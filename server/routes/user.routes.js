/**
 * 用户相关路由配置
 * 定义用户注册、登录、信息获取等API路由
 */
const express = require('express');
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * 用户注册路由
 * POST /api/users/register
 * 接收用户名、邮箱和密码，创建新用户并返回JWT令牌
 */
router.post('/register', userController.register);

/**
 * 用户登录路由
 * POST /api/users/login
 * 验证用户凭据并返回JWT令牌
 */
router.post('/login', userController.login);

/**
 * 获取当前用户信息路由
 * GET /api/users/me
 * 需要身份验证，返回当前登录用户的详细信息
 */
router.get('/me', auth.verifyToken, userController.getCurrentUser);

module.exports = router; 