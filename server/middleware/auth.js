/**
 * 身份验证中间件
 * 用于验证请求中的JWT令牌并提取用户信息
 */
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'baiyuspace-jwt-secret';

/**
 * 生成JWT令牌
 * @param {Object} payload - 令牌载荷，通常包含用户ID和角色
 * @param {string} expiresIn - 令牌有效期
 * @returns {string} JWT令牌
 */
function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * 验证JWT中间件
 * 从请求头提取令牌并验证其有效性
 */
function verifyToken(req, res, next) {
  // 从请求头获取令牌
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '未提供认证令牌' 
    });
  }
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 将用户信息附加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: '认证令牌已过期' 
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      message: '无效的认证令牌' 
    });
  }
}

/**
 * 可选的JWT验证
 * 如果提供了令牌则验证，但不要求一定有令牌
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }
  
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  optionalAuth
}; 