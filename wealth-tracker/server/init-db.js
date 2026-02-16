// 数据库初始化脚本
// 用于在 Railway 上初始化数据库表

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wealth_tracker',
});

async function initDatabase() {
  console.log('🔧 开始初始化数据库...');
  console.log(`📍 连接到: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

  try {
    // 测试连接
    const testRes = await pool.query('SELECT NOW()');
    console.log('✅ 数据库连接成功！');
    console.log(`   时间: ${testRes.rows[0].now}`);

    // 读取 schema.sql
    const schemaPath = new URL('./db/schema.sql', import.meta.url);
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // 执行 schema
    console.log('📝 执行数据库脚本...');
    await pool.query(schema);
    console.log('✅ 数据库表创建成功！');

    // 检查表
    const tablesRes = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public'`
    );

    console.log('');
    console.log('📋 已创建的表：');
    tablesRes.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('');
    console.log('🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    if (error.detail) {
      console.error('   详情:', error.detail);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
