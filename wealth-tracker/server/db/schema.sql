-- Wealth Tracker Database Schema
-- 财富追踪应用数据模型
-- 三端共用: Web + WeChat Mini Program + Backend API

-- ============================================
-- 1. Users (用户表)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,

  -- 基础信息
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  name VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,

  -- 微信相关 (小程序登录)
  wechat_openid VARCHAR(255) UNIQUE,
  wechat_unionid VARCHAR(255),

  -- 账户状态
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  -- 索引
  CONSTRAINT email_or_wechat CHECK (email IS NOT NULL OR wechat_openid IS NOT NULL)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- 2. Categories (分类表)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,

  -- 关系
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 分类信息
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  icon VARCHAR(50),  -- emoji 或图标代码
  color VARCHAR(20),  -- 颜色代码 #RRGGBB
  order_index INTEGER DEFAULT 0,  -- 排序

  -- 是否默认分类
  is_default BOOLEAN DEFAULT FALSE,

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- 约束: 用户内分类名称唯一
  UNIQUE (user_id, name, type)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- ============================================
-- 3. Transactions (交易表) - 核心业务
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,

  -- 关系
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE SET NULL,

  -- 交易信息
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) DEFAULT 'CNY',
  description VARCHAR(255),

  -- 交易日期
  transaction_date DATE NOT NULL,

  -- 标签 (可选的自定义标签)
  tags VARCHAR(255),

  -- 备注
  notes TEXT,

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP  -- 软删除
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);

-- ============================================
-- 4. Assets (资产表)
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,

  -- 关系
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 资产信息
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,  -- 银行卡、房产、股票、基金 等
  currency VARCHAR(10) DEFAULT 'CNY',
  value DECIMAL(15, 2) NOT NULL CHECK (value >= 0),
  description VARCHAR(255),

  -- 资产状态
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_created_at ON assets(created_at);

-- ============================================
-- 5. Budget (预算表) - 可选，MVP 不包含
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,

  -- 关系
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

  -- 预算信息
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) DEFAULT 'CNY',
  period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),

  -- 是否启用
  is_active BOOLEAN DEFAULT TRUE,

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);

-- ============================================
-- 6. User Sessions (会话表) - 用于管理登录会话
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,

  -- 关系
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 会话信息
  token_hash VARCHAR(255) UNIQUE NOT NULL,  -- 存储 JWT token 的哈希
  device_name VARCHAR(100),
  ip_address VARCHAR(45),  -- IPv4 或 IPv6
  user_agent VARCHAR(500),

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- ============================================
-- 7. Audit Log (审计日志) - 记录重要操作
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,

  -- 用户信息
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- 操作信息
  action VARCHAR(100) NOT NULL,  -- login, create_transaction, delete_asset 等
  resource_type VARCHAR(50),  -- transaction, asset, category 等
  resource_id INTEGER,

  -- 变化内容
  changes JSONB,  -- 存储前后对比

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- 8. Default Categories (初始化默认分类)
-- ============================================
-- 默认分类在创建新用户时由触发器自动创建
-- （见下方的 create_default_categories_for_user 函数）

-- ============================================
-- 数据关系图
-- ============================================
/*
users (1) ──────┬────── (N) categories
               ├────── (N) transactions
               ├────── (N) assets
               ├────── (N) budgets
               ├────── (N) user_sessions
               └────── (N) audit_logs

categories (1) ────── (N) transactions

transactions 和 categories 关系：
- 一个交易只属于一个分类
- 一个分类可以有多个交易
- 删除分类时交易的 category_id 设为 NULL

*/

-- ============================================
-- 视图：用于统计分析
-- ============================================

-- 每月收支统计视图
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT
  u.id as user_id,
  u.email,
  DATE_TRUNC('month', t.transaction_date)::DATE as month,
  t.type,
  SUM(t.amount) as total_amount,
  COUNT(t.id) as transaction_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id AND t.deleted_at IS NULL
WHERE u.status = 'active'
GROUP BY u.id, u.email, DATE_TRUNC('month', t.transaction_date), t.type;

-- 分类统计视图
CREATE OR REPLACE VIEW v_category_summary AS
SELECT
  t.user_id,
  t.type,
  c.id as category_id,
  c.name as category_name,
  SUM(t.amount) as total_amount,
  COUNT(t.id) as transaction_count
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.deleted_at IS NULL
GROUP BY t.user_id, t.type, c.id, c.name;

-- ============================================
-- 存储过程：创建新用户时初始化默认分类
-- ============================================
CREATE OR REPLACE FUNCTION create_default_categories_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 添加默认收入分类
  INSERT INTO categories (user_id, name, type, icon, is_default, order_index)
  VALUES
    (NEW.id, '工资', 'income', '💼', TRUE, 1),
    (NEW.id, '投资收益', 'income', '📈', TRUE, 2),
    (NEW.id, '奖金', 'income', '🎁', TRUE, 3),
    (NEW.id, '其他收入', 'income', '➕', TRUE, 4);

  -- 添加默认支出分类
  INSERT INTO categories (user_id, name, type, icon, is_default, order_index)
  VALUES
    (NEW.id, '食品', 'expense', '🍔', TRUE, 1),
    (NEW.id, '交通', 'expense', '🚗', TRUE, 2),
    (NEW.id, '房租', 'expense', '🏠', TRUE, 3),
    (NEW.id, '娱乐', 'expense', '🎮', TRUE, 4),
    (NEW.id, '购物', 'expense', '🛍️', TRUE, 5),
    (NEW.id, '医疗', 'expense', '⚕️', TRUE, 6),
    (NEW.id, '教育', 'expense', '📚', TRUE, 7),
    (NEW.id, '其他支出', 'expense', '➖', TRUE, 8);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 触发器：新用户创建时自动初始化分类
CREATE TRIGGER trigger_create_default_categories
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_categories_for_user();

-- ============================================
-- 权限和安全设置
-- ============================================
-- 创建应用用户 (应用连接用的账户)
-- 在部署时运行这个
-- CREATE USER wealth_tracker WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE wealth_tracker TO wealth_tracker;
-- GRANT USAGE ON SCHEMA public TO wealth_tracker;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wealth_tracker;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wealth_tracker;

-- ============================================
-- 完成！Schema 设计完成
-- ============================================
/*
总共 8 张表：
1. users          - 用户表 (1000+ 行)
2. categories     - 分类表 (每个用户 10-20 行)
3. transactions   - 交易表 (每个用户 100-1000+ 行)
4. assets         - 资产表 (每个用户 5-20 行)
5. budgets        - 预算表 (可选，每个用户 5-50 行)
6. user_sessions  - 会话表
7. audit_logs     - 审计日志
8. 默认分类       - 系统初始化

关键特性：
✅ 用户隔离 - 每个用户只能看到自己的数据
✅ 软删除 - transactions 使用 deleted_at
✅ 时间戳 - created_at, updated_at 便于追踪
✅ 微信登录 - wechat_openid, wechat_unionid
✅ 审计日志 - 记录所有操作
✅ 索引优化 - 常用查询字段都有索引
✅ 存储过程 - 自动初始化用户分类
*/
