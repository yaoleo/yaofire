-- 初始化数据库脚本
-- 执行方式：psql -U postgres -f init.sql

-- 1. 创建数据库
CREATE DATABASE wealth_tracker
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- 2. 连接到数据库
\c wealth_tracker

-- 3. 创建扩展 (用于 UUID 和 JSONB)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4. 执行主 schema 文件
\i schema.sql

-- 5. 完成
\echo '✅ 数据库初始化完成！'
