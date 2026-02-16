-- Stock Price Tracker Database Schema
-- 股票价格追踪应用数据模型

-- ============================================
-- 1. Stocks (股票基础信息表)
-- ============================================
CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,

  -- 股票基础信息
  symbol VARCHAR(20) UNIQUE NOT NULL,  -- 股票代码 (AAPL, MSFT 等)
  name VARCHAR(255) NOT NULL,           -- 股票名称 (Apple Inc.)
  sector VARCHAR(100),                  -- 行业 (Technology, Finance 等)
  industry VARCHAR(100),                -- 细分行业
  market VARCHAR(20) NOT NULL,          -- 交易市场 (US, HK, CN 等)
  currency VARCHAR(10) DEFAULT 'USD',   -- 交易货币

  -- 股票状态
  is_default BOOLEAN DEFAULT FALSE,     -- 是否为默认追踪股票
  is_active BOOLEAN DEFAULT TRUE,       -- 是否活跃

  -- API 同步信息
  last_updated_at TIMESTAMP,            -- 最后更新时间（来自 API）
  last_synced_at TIMESTAMP,             -- 最后同步时间

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_stocks_is_default ON stocks(is_default);
CREATE INDEX idx_stocks_market ON stocks(market);

-- ============================================
-- 2. Stock Prices (股票价格历史表)
-- ============================================
CREATE TABLE IF NOT EXISTS stock_prices (
  id SERIAL PRIMARY KEY,

  -- 关系
  stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,

  -- 价格数据（OHLCV - Open High Low Close Volume）
  trade_date DATE NOT NULL,              -- 交易日期
  open_price DECIMAL(12, 4),             -- 开盘价
  high_price DECIMAL(12, 4),             -- 最高价
  low_price DECIMAL(12, 4),              -- 最低价
  close_price DECIMAL(12, 4) NOT NULL,   -- 收盘价
  volume BIGINT,                         -- 交易量

  -- 计算字段
  price_change DECIMAL(12, 4),           -- 价格变化 (close - open)
  change_percent DECIMAL(8, 4),          -- 涨跌幅 %

  -- 技术指标（可选）
  ma_5 DECIMAL(12, 4),                   -- 5日均线
  ma_20 DECIMAL(12, 4),                  -- 20日均线
  ma_50 DECIMAL(12, 4),                  -- 50日均线

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_prices_stock_id ON stock_prices(stock_id);
CREATE INDEX idx_stock_prices_trade_date ON stock_prices(trade_date);
CREATE INDEX idx_stock_prices_stock_date ON stock_prices(stock_id, trade_date DESC);
CREATE UNIQUE INDEX idx_stock_prices_unique ON stock_prices(stock_id, trade_date);

-- ============================================
-- 3. Stock Sync Log (API 同步日志)
-- ============================================
CREATE TABLE IF NOT EXISTS stock_sync_logs (
  id SERIAL PRIMARY KEY,

  -- 同步信息
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  sync_type VARCHAR(50),                 -- 'daily', 'intraday', 'full_history'
  status VARCHAR(20),                    -- 'success', 'failed', 'pending'

  -- API 相关
  api_call_count INTEGER DEFAULT 0,      -- 调用次数
  records_added INTEGER DEFAULT 0,       -- 添加的记录数
  error_message TEXT,                    -- 错误信息

  -- 时间戳
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_sync_logs_stock_id ON stock_sync_logs(stock_id);
CREATE INDEX idx_sync_logs_status ON stock_sync_logs(status);
CREATE INDEX idx_sync_logs_created_at ON stock_sync_logs(started_at DESC);

-- ============================================
-- 4. Default Stocks (默认追踪的 10 只股票)
-- ============================================
INSERT INTO stocks (symbol, name, sector, industry, market, is_default)
VALUES
  ('AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics', 'US', TRUE),
  ('MSFT', 'Microsoft Corporation', 'Technology', 'Software', 'US', TRUE),
  ('GOOGL', 'Alphabet Inc.', 'Technology', 'Internet Services', 'US', TRUE),
  ('AMZN', 'Amazon.com Inc.', 'Consumer Cyclical', 'Internet Retail', 'US', TRUE),
  ('NVDA', 'NVIDIA Corporation', 'Technology', 'Semiconductors', 'US', TRUE),
  ('TSLA', 'Tesla Inc.', 'Consumer Cyclical', 'Automobiles', 'US', TRUE),
  ('META', 'Meta Platforms Inc.', 'Technology', 'Internet Services', 'US', TRUE),
  ('NFLX', 'Netflix Inc.', 'Consumer Cyclical', 'Internet Services', 'US', TRUE),
  ('UBER', 'Uber Technologies Inc.', 'Consumer Cyclical', 'Transportation', 'US', TRUE),
  ('JPM', 'JPMorgan Chase Co.', 'Financial', 'Banks', 'US', TRUE)
ON CONFLICT (symbol) DO NOTHING;

-- ============================================
-- 5. Views (视图)
-- ============================================

-- 每只股票的最新价格
CREATE OR REPLACE VIEW v_latest_prices AS
SELECT
  s.id,
  s.symbol,
  s.name,
  s.sector,
  sp.trade_date,
  sp.close_price,
  sp.price_change,
  sp.change_percent,
  sp.volume,
  sp.ma_5,
  sp.ma_20
FROM stocks s
LEFT JOIN LATERAL (
  SELECT * FROM stock_prices
  WHERE stock_id = s.id
  ORDER BY trade_date DESC
  LIMIT 1
) sp ON TRUE
WHERE s.is_active = TRUE;

-- 股票涨幅排行（今日）
CREATE OR REPLACE VIEW v_top_gainers AS
SELECT
  s.symbol,
  s.name,
  sp.close_price,
  sp.price_change,
  sp.change_percent,
  sp.trade_date
FROM stocks s
INNER JOIN stock_prices sp ON s.id = sp.stock_id
WHERE sp.trade_date = CURRENT_DATE
  AND s.is_active = TRUE
ORDER BY sp.change_percent DESC
LIMIT 10;

-- 股票跌幅排行（今日）
CREATE OR REPLACE VIEW v_top_losers AS
SELECT
  s.symbol,
  s.name,
  sp.close_price,
  sp.price_change,
  sp.change_percent,
  sp.trade_date
FROM stocks s
INNER JOIN stock_prices sp ON s.id = sp.stock_id
WHERE sp.trade_date = CURRENT_DATE
  AND s.is_active = TRUE
ORDER BY sp.change_percent ASC
LIMIT 10;

-- ============================================
-- 6. 数据统计视图
-- ============================================

-- 每只股票的统计信息（过去30天）
CREATE OR REPLACE VIEW v_stock_stats_30d AS
SELECT
  s.id,
  s.symbol,
  s.name,
  COUNT(sp.id) as days_count,
  MAX(sp.high_price) as max_price_30d,
  MIN(sp.low_price) as min_price_30d,
  AVG(sp.close_price) as avg_price_30d,
  STDDEV(sp.close_price) as volatility,
  MAX(sp.volume) as max_volume
FROM stocks s
LEFT JOIN stock_prices sp ON s.id = sp.stock_id
  AND sp.trade_date >= CURRENT_DATE - INTERVAL '30 days'
WHERE s.is_active = TRUE
GROUP BY s.id, s.symbol, s.name;

-- ============================================
-- 完成！Schema 设计完成
-- ============================================
/*
总共 3 张表：
1. stocks          - 股票基础信息（10+ 行，增长缓慢）
2. stock_prices    - 价格历史（10只股票 × 252个交易日 = 2,520+ 行）
3. stock_sync_logs - API 同步日志（监控和调试用）

关键特性：
✅ 每只股票一天只存一条记录（UNIQUE 约束）
✅ 支持多个市场（US, HK, CN 等）
✅ 包含技术指标字段（MA5, MA20, MA50）
✅ 自动计算涨跌幅
✅ 包含 4 个实用视图
✅ API 同步日志用于监控和错误排查
✅ 索引优化查询性能
*/
