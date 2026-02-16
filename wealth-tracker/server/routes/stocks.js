// 股票相关路由
// 获取股票列表、详情、历史数据

import express from 'express';
import { query } from '../db.js';
import { getQuote } from '../services/alphavantage.js';

const router = express.Router();

// ============================================
// GET /api/stocks - 获取默认的 10 只股票
// ============================================
router.get('/', async (req, res) => {
  try {
    // 获取所有默认股票的最新价格
    const result = await query(`
      SELECT
        s.id,
        s.symbol,
        s.name,
        s.sector,
        s.industry,
        sp.trade_date,
        sp.close_price,
        sp.open_price,
        sp.high_price,
        sp.low_price,
        sp.price_change,
        sp.change_percent,
        sp.volume,
        s.last_updated_at
      FROM stocks s
      LEFT JOIN LATERAL (
        SELECT * FROM stock_prices
        WHERE stock_id = s.id
        ORDER BY trade_date DESC
        LIMIT 1
      ) sp ON TRUE
      WHERE s.is_default = TRUE AND s.is_active = TRUE
      ORDER BY s.symbol ASC
    `);

    res.json({
      success: true,
      data: {
        stocks: result.rows.map(row => ({
          id: row.id,
          symbol: row.symbol,
          name: row.name,
          sector: row.sector,
          industry: row.industry,
          currentPrice: row.close_price,
          openPrice: row.open_price,
          highPrice: row.high_price,
          lowPrice: row.low_price,
          change: row.price_change,
          changePercent: row.change_percent,
          volume: row.volume,
          lastUpdateDate: row.trade_date,
          lastSyncedAt: row.last_updated_at
        })),
        count: result.rows.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 获取股票列表失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取股票列表失败'
      }
    });
  }
});

// ============================================
// GET /api/stocks/:symbol - 获取单只股票详情
// ============================================
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    // 验证 symbol
    if (!symbol || symbol.length > 20) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '无效的股票代码'
        }
      });
    }

    // 获取股票基本信息
    const stockResult = await query(
      'SELECT id, symbol, name, sector, industry, market, currency FROM stocks WHERE symbol = $1 AND is_active = TRUE',
      [symbol.toUpperCase()]
    );

    if (stockResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '股票不存在'
        }
      });
    }

    const stock = stockResult.rows[0];

    // 获取最新价格
    const priceResult = await query(
      'SELECT * FROM stock_prices WHERE stock_id = $1 ORDER BY trade_date DESC LIMIT 1',
      [stock.id]
    );

    const latestPrice = priceResult.rows[0] || null;

    // 获取近 30 天的数据
    const historyResult = await query(
      `SELECT
        trade_date, open_price, high_price, low_price, close_price, volume,
        price_change, change_percent
      FROM stock_prices
      WHERE stock_id = $1
      ORDER BY trade_date DESC
      LIMIT 30`,
      [stock.id]
    );

    res.json({
      success: true,
      data: {
        stock: {
          id: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          industry: stock.industry,
          market: stock.market,
          currency: stock.currency
        },
        latestPrice: latestPrice ? {
          date: latestPrice.trade_date,
          open: latestPrice.open_price,
          high: latestPrice.high_price,
          low: latestPrice.low_price,
          close: latestPrice.close_price,
          volume: latestPrice.volume,
          change: latestPrice.price_change,
          changePercent: latestPrice.change_percent
        } : null,
        history: historyResult.rows.map(row => ({
          date: row.trade_date,
          open: row.open_price,
          high: row.high_price,
          low: row.low_price,
          close: row.close_price,
          volume: row.volume,
          change: row.price_change,
          changePercent: row.change_percent
        })),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 获取股票详情失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取股票详情失败'
      }
    });
  }
});

// ============================================
// GET /api/stocks/:symbol/history - 获取历史数据（分页）
// ============================================
router.get('/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 30, page = 1 } = req.query;

    const daysNum = Math.min(parseInt(days) || 30, 365); // 最多查询 1 年的数据
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = 50;
    const offset = (pageNum - 1) * pageSize;

    // 获取股票 ID
    const stockResult = await query(
      'SELECT id FROM stocks WHERE symbol = $1 AND is_active = TRUE',
      [symbol.toUpperCase()]
    );

    if (stockResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '股票不存在'
        }
      });
    }

    const stockId = stockResult.rows[0].id;

    // 获取总数
    const countResult = await query(
      'SELECT COUNT(*) as total FROM stock_prices WHERE stock_id = $1 AND trade_date >= CURRENT_DATE - INTERVAL $2',
      [stockId, `${daysNum} days`]
    );

    const total = parseInt(countResult.rows[0].total);

    // 获取分页数据
    const historyResult = await query(
      `SELECT
        trade_date, open_price, high_price, low_price, close_price, volume,
        price_change, change_percent
      FROM stock_prices
      WHERE stock_id = $1 AND trade_date >= CURRENT_DATE - INTERVAL $2
      ORDER BY trade_date DESC
      LIMIT $3 OFFSET $4`,
      [stockId, `${daysNum} days`, pageSize, offset]
    );

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        history: historyResult.rows.map(row => ({
          date: row.trade_date,
          open: row.open_price,
          high: row.high_price,
          low: row.low_price,
          close: row.close_price,
          volume: row.volume,
          change: row.price_change,
          changePercent: row.change_percent
        })),
        pagination: {
          page: pageNum,
          pageSize,
          total,
          pages: Math.ceil(total / pageSize)
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 获取历史数据失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取历史数据失败'
      }
    });
  }
});

// ============================================
// GET /api/stocks/stats/gainers - 涨幅排行
// ============================================
router.get('/stats/gainers', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        s.symbol,
        s.name,
        sp.close_price,
        sp.price_change,
        sp.change_percent,
        sp.trade_date
      FROM stocks s
      INNER JOIN LATERAL (
        SELECT * FROM stock_prices
        WHERE stock_id = s.id
        ORDER BY trade_date DESC
        LIMIT 1
      ) sp ON TRUE
      WHERE s.is_active = TRUE AND sp.trade_date = CURRENT_DATE
      ORDER BY sp.change_percent DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        gainers: result.rows.map(row => ({
          symbol: row.symbol,
          name: row.name,
          price: row.close_price,
          change: row.price_change,
          changePercent: row.change_percent
        })),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 获取涨幅排行失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取涨幅排行失败'
      }
    });
  }
});

export default router;
