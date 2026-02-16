// 资产管理路由

import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/assets - 获取资产列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT * FROM assets WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
      [userId, 'active']
    );

    const total = result.rows.reduce((sum, asset) => sum + asset.value, 0);

    res.json({
      success: true,
      data: {
        assets: result.rows,
        total_value: total
      }
    });
  } catch (error) {
    console.error('❌ Get assets error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: '获取资产列表失败' } });
  }
});

// POST /api/assets - 创建资产
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, value, currency, description } = req.body;

    if (!name || !type || value === undefined) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '必需字段缺失' } });
    }

    const result = await query(
      'INSERT INTO assets (user_id, name, type, value, currency, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, name, type, value, currency || 'CNY', description || null]
    );

    res.status(201).json({ success: true, data: { asset: result.rows[0] } });
  } catch (error) {
    console.error('❌ Create asset error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: '创建资产失败' } });
  }
});

// PUT /api/assets/:id - 更新资产
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const assetId = req.params.id;
    const { name, type, value, description } = req.body;

    const result = await query(
      'UPDATE assets SET name = COALESCE($1, name), type = COALESCE($2, type), value = COALESCE($3, value), description = COALESCE($4, description), updated_at = NOW() WHERE id = $5 AND user_id = $6 RETURNING *',
      [name, type, value, description, assetId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '资产不存在' } });
    }

    res.json({ success: true, data: { asset: result.rows[0] } });
  } catch (error) {
    console.error('❌ Update asset error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: '更新资产失败' } });
  }
});

// DELETE /api/assets/:id - 删除资产
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const assetId = req.params.id;

    await query('UPDATE assets SET status = $1 WHERE id = $2 AND user_id = $3', ['inactive', assetId, userId]);

    res.json({ success: true, data: { message: '资产已删除' } });
  } catch (error) {
    console.error('❌ Delete asset error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: '删除资产失败' } });
  }
});

export default router;
