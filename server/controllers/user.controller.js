/**
 * 用户控制器
 * 处理用户注册、登录、信息获取等逻辑
 */
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const auth = require('../middleware/auth');

// 模拟用户数据（实际应用中应从数据库获取）
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$yfH1zJ9oOxmGNnT1Qcq18.S7lZ4UFiC5ckHgisQMSgO0FV0dSUdoa', // "password"
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    password: '$2a$10$yfH1zJ9oOxmGNnT1Qcq18.S7lZ4UFiC5ckHgisQMSgO0FV0dSUdoa', // "password"
    role: 'user'
  }
];

/**
 * 用户注册
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 */
async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    
    // 验证请求数据
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码都是必填项'
      });
    }
    
    // 检查用户是否已存在（模拟）
    const existingUser = mockUsers.find(
      user => user.username === username || user.email === email
    );
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '用户名或邮箱已被占用'
      });
    }
    
    // 密码哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建新用户（模拟）
    const newUser = {
      id: mockUsers.length + 1,
      username,
      email,
      password: hashedPassword,
      role: 'user'
    };
    
    mockUsers.push(newUser);
    
    // 生成JWT令牌
    const token = auth.generateToken({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    });
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，注册失败'
    });
  }
}

/**
 * 用户登录
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    // 验证请求数据
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码都是必填项'
      });
    }
    
    // 查找用户（模拟）
    const user = mockUsers.find(
      user => user.username === username || user.email === username
    );
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名/邮箱或密码不正确'
      });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名/邮箱或密码不正确'
      });
    }
    
    // 生成JWT令牌
    const token = auth.generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: '登录成功',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，登录失败'
    });
  }
}

/**
 * 获取当前用户信息
 * @param {Request} req - Express请求对象（包含用户信息）
 * @param {Response} res - Express响应对象
 */
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;
    
    // 获取用户信息（模拟）
    const user = mockUsers.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取用户信息'
    });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser
}; 