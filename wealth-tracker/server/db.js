// 数据库连接模块
// PostgreSQL 连接和查询处理

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// 创建连接池
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wealth_tracker',
});

// 连接错误处理
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// 测试连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully at', res.rows[0].now);
  }
});

// 导出查询函数
export const query = (text, params) => {
  return pool.query(text, params);
};

// 导出连接池
export default pool;
