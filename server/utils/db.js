/**
 * 数据库工具模块
 * 负责创建和管理与MySQL数据库的连接及执行查询
 */
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 数据库连接池配置
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'baiyuspace',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * 测试数据库连接
 * @returns {Promise<void>}
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功！');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    // 在开发环境中可以简单地使用模拟数据
    console.log('将使用模拟数据进行开发');
  }
}

/**
 * 执行SQL查询
 * @param {string} sql - SQL查询语句
 * @param {Array} params - 查询参数
 * @returns {Promise<any>} 查询结果
 */
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('SQL查询错误:', error.message);
    console.error('SQL语句:', sql);
    console.error('参数:', params);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection
}; 