// 统计报表路由

import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/reports/summary - 总体统计
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    let whereClause = 'user_id = $1 AND deleted_at IS NULL';
    let params = [userId];

    if (month) {
      whereClause += ` AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $2::date)`;
      params.push(month);
    }

    const result = await query(
      `SELECT
        type,
        SUM(amount) as total
       FROM transactions
       WHERE ${whereClause}
       GROUP BY type`,
      params
    );

    const income = result.rows.find(r => r.type === 'income')?.total || 0;
    const expense = result.rows.find(r => r.type === 'expense')?.total || 0;

    res.json({
      success: true,
      data: {
        summary: {
          income: parseFloat(income),
          expense: parseFloat(expense),
          net: parseFloat(income) - parseFloat(expense)
        }
      }
    });
  } catch (error) {
    console.error('❌ Get summary error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: '获取统计失败' } });
  }
});

// GET /api/reports/category - 分类分析
router.get('/category', async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    let whereClause = 't.user_id = $1 AND t.deleted_at IS NULL';
    let params = [userId];
    let paramCount = 2;

    if (type && ['income', 'expense'].includes(type)) {
      whereClause += ` AND t.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    const result = await query(
      `SELECT
        c.id,
        c.name,
        t.type,
        SUM(t.amount) as total,
        COUNT(t.id) as count,
        ROUND(100.0 * SUM(t.amount) / SUM(SUM(t.amount)) OVER (PARTITION BY t.type), 2) as percentage
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE ${whereClause}
       GROUP BY c.id, c.name, t.type
       ORDER BY total DESC`,
      params
    );

    res.json({ success: true, data: { categories: result.rows } });
  } catch (error) {
    console.error('❌ Get category analysis error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: '获取分析失败' } });
  }
});

// GET /api/reports/trend - 趋势分析
router.get('/trend', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;  // day, week, month, year

    const dateFormat = period === 'day' ? 'YYYY-MM-DD' : period === 'week' ? 'YYYY-W' : period === 'month' ? 'YYYY-MM' : 'YYYY';

    const result = await query(
      `SELECT
        TO_CHAR(transaction_date, '${dateFormat}') as period,
        type,
        SUM(amount) as total,
        COUNT(*) as count
       FROM transactions
       WHERE user_id = $1 AND deleted_at IS NULL
       GROUP BY TO_CHAR(transaction_date, '${dateFormat}'), type
       ORDER BY period DESC
       LIMIT 30`,
      [userId]
    );

    res.json({ success: true, data: { trend: result.rows } });
  } catch (error) {
    console.error('❌ Get trend error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: '获取趋势失败' } });
  }
});

export default router;
