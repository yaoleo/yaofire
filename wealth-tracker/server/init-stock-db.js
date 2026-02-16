// 股票追踪数据库初始化脚本
// 用于在 Railway 上初始化股票相关数据表

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// 优先使用 DATABASE_URL，否则用单个变量
const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString,
});

async function initDatabase() {
  console.log('🔧 开始初始化股票追踪数据库...');
  console.log(`📍 连接到: ${process.env.DB_HOST || 'remote'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`);

  try {
    // 测试连接
    const testRes = await pool.query('SELECT NOW()');
    console.log('✅ 数据库连接成功！');
    console.log(`   时间: ${testRes.rows[0].now}`);

    // 读取 stock-schema.sql
    const schemaPath = new URL('./db/stock-schema.sql', import.meta.url);
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // 执行 schema
    console.log('📝 执行数据库脚本...');
    await pool.query(schema);
    console.log('✅ 数据库表创建成功！');

    // 检查表
    const tablesRes = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`
    );

    console.log('');
    console.log('📋 已创建的表：');
    tablesRes.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // 检查默认股票数据
    const stocksRes = await pool.query('SELECT COUNT(*) as count FROM stocks');
    console.log('');
    console.log(`📊 默认股票数量: ${stocksRes.rows[0].count} 只`);

    const defaultStocks = await pool.query(
      'SELECT symbol, name FROM stocks WHERE is_default = TRUE ORDER BY symbol'
    );
    console.log('🎯 默认追踪的股票:');
    defaultStocks.rows.forEach((row) => {
      console.log(`   ✓ ${row.symbol} - ${row.name}`);
    });

    console.log('');
    console.log('🎉 股票追踪数据库初始化完成！');
    console.log('');
    console.log('📖 后续步骤:');
    console.log('   1. 配置 Alpha Vantage API Key');
    console.log('   2. 创建数据同步任务（每天更新价格数据）');
    console.log('   3. 开发后端 API 端点');
    console.log('   4. 开发小程序 UI');

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
