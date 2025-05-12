/**
 * 白雨空间后端服务入口文件
 * 配置Express服务器、中间件和API路由
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const userRoutes = require('./routes/user.routes');
const db = require('./utils/db');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(morgan('dev')); // 日志记录

// API路由
app.use('/api/users', userRoutes);

// 状态检查路由
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 测试数据库连接
db.testConnection()
  .then(() => console.log('数据库连接测试成功'))
  .catch(err => console.error('数据库连接测试失败:', err));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器已在端口 ${PORT} 上启动`);
  console.log(`API地址: http://localhost:${PORT}/api`);
}); 