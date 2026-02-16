// 交易管理路由
// 处理交易的增删改查（CRUD）和分类管理

import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

// ============================================
// 交易 CRUD
// ============================================

// POST /api/transactions - 创建交易
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, amount, category_id, description, transaction_date, tags, notes } = req.body;

    // 验证必需字段
    if (!type || !amount || !category_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '类型、金额、分类是必需的'
        }
      });
    }

    // 验证类型
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '类型必须是 income 或 expense'
        }
      });
    }

    // 验证金额
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '金额必须大于 0'
        }
      });
    }

    // 验证分类是否属于用户
    const categoryCheck = await query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [category_id, userId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '无权使用该分类'
        }
      });
    }

    // 插入交易
    const result = await query(
      `INSERT INTO transactions
       (user_id, type, amount, category_id, description, transaction_date, tags, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        type,
        amount,
        category_id,
        description || null,
        transaction_date || new Date().toISOString().split('T')[0],
        tags || null,
        notes || null
      ]
    );

    console.log(`✅ Transaction created: ${userId} - ${type} ¥${amount}`);
    res.status(201).json({
      success: true,
      data: {
        transaction: result.rows[0]
      }
    });

  } catch (error) {
    console.error('❌ Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '创建交易失败'
      }
    });
  }
});

// GET /api/transactions - 获取交易列表（分页、过滤）
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      type,
      category_id,
      start_date,
      end_date,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    // 参数验证
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // 构建查询条件
    let whereConditions = ['user_id = $1', 'deleted_at IS NULL'];
    let params = [userId];
    let paramCount = 2;

    if (type && ['income', 'expense'].includes(type)) {
      paramCount++;
      whereConditions.push(`type = $${paramCount}`);
      params.push(type);
    }

    if (category_id) {
      paramCount++;
      whereConditions.push(`category_id = $${paramCount}`);
      params.push(category_id);
    }

    if (start_date) {
      paramCount++;
      whereConditions.push(`transaction_date >= $${paramCount}`);
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereConditions.push(`transaction_date <= $${paramCount}`);
      params.push(end_date);
    }

    const whereClause = whereConditions.join(' AND ');

    // 验证排序字段
    const validSortFields = ['created_at', 'transaction_date', 'amount'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const orderDir = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    // 获取总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM transactions WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // 获取分页数据
    paramCount++;
    const limitParamIndex = paramCount;
    paramCount++;
    const offsetParamIndex = paramCount;

    const result = await query(
      `SELECT
        t.*,
        c.name as category_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE ${whereClause}
       ORDER BY ${sortField} ${orderDir}
       LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: {
        transactions: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取交易列表失败'
      }
    });
  }
});

// GET /api/transactions/:id - 获取单个交易详情
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const result = await query(
      `SELECT
        t.*,
        c.name as category_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1 AND t.user_id = $2 AND t.deleted_at IS NULL`,
      [transactionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '交易不存在'
        }
      });
    }

    res.json({
      success: true,
      data: {
        transaction: result.rows[0]
      }
    });

  } catch (error) {
    console.error('❌ Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取交易详情失败'
      }
    });
  }
});

// PUT /api/transactions/:id - 更新交易
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { type, amount, category_id, description, transaction_date, tags, notes } = req.body;

    // 检查交易是否存在且属于用户
    const existingResult = await query(
      'SELECT id FROM transactions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [transactionId, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '交易不存在'
        }
      });
    }

    // 如果更新分类，验证权限
    if (category_id) {
      const categoryCheck = await query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [category_id, userId]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '无权使用该分类'
          }
        });
      }
    }

    // 更新交易
    const result = await query(
      `UPDATE transactions SET
        type = COALESCE($1, type),
        amount = COALESCE($2, amount),
        category_id = COALESCE($3, category_id),
        description = COALESCE($4, description),
        transaction_date = COALESCE($5, transaction_date),
        tags = COALESCE($6, tags),
        notes = COALESCE($7, notes),
        updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [type, amount, category_id, description, transaction_date, tags, notes, transactionId, userId]
    );

    console.log(`✅ Transaction updated: ${transactionId}`);
    res.json({
      success: true,
      data: {
        transaction: result.rows[0]
      }
    });

  } catch (error) {
    console.error('❌ Update transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '更新交易失败'
      }
    });
  }
});

// DELETE /api/transactions/:id - 删除交易（软删除）
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    // 检查交易是否存在且属于用户
    const existingResult = await query(
      'SELECT id FROM transactions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [transactionId, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '交易不存在'
        }
      });
    }

    // 软删除：标记 deleted_at
    await query(
      'UPDATE transactions SET deleted_at = NOW() WHERE id = $1',
      [transactionId]
    );

    console.log(`✅ Transaction deleted: ${transactionId}`);
    res.json({
      success: true,
      data: {
        message: '交易已删除'
      }
    });

  } catch (error) {
    console.error('❌ Delete transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '删除交易失败'
      }
    });
  }
});

// ============================================
// 分类管理
// ============================================

// GET /api/transactions/categories/list - 获取用户分类
router.get('/categories/list', async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    let query_str = 'SELECT * FROM categories WHERE user_id = $1';
    let params = [userId];

    if (type && ['income', 'expense'].includes(type)) {
      query_str += ' AND type = $2';
      params.push(type);
    }

    query_str += ' ORDER BY order_index ASC';

    const result = await query(query_str, params);

    res.json({
      success: true,
      data: {
        categories: result.rows
      }
    });

  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取分类列表失败'
      }
    });
  }
});

// POST /api/transactions/categories - 创建分类
router.post('/categories', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '分类名称和类型是必需的'
        }
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '类型必须是 income 或 expense'
        }
      });
    }

    const result = await query(
      `INSERT INTO categories (user_id, name, type, icon, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, type, icon || null, color || null]
    );

    console.log(`✅ Category created: ${userId} - ${name}`);
    res.status(201).json({
      success: true,
      data: {
        category: result.rows[0]
      }
    });

  } catch (error) {
    if (error.code === '23505') {  // Unique constraint violation
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_CATEGORY',
          message: '该分类已存在'
        }
      });
    }

    console.error('❌ Create category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '创建分类失败'
      }
    });
  }
});

// PUT /api/transactions/categories/:id - 更新分类
router.put('/categories/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;
    const { name, icon, color } = req.body;

    // 检查分类是否存在且属于用户
    const existingResult = await query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '分类不存在'
        }
      });
    }

    const result = await query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        icon = COALESCE($2, icon),
        color = COALESCE($3, color),
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, icon, color, categoryId]
    );

    console.log(`✅ Category updated: ${categoryId}`);
    res.json({
      success: true,
      data: {
        category: result.rows[0]
      }
    });

  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '更新分类失败'
      }
    });
  }
});

// DELETE /api/transactions/categories/:id - 删除分类
router.delete('/categories/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    // 检查分类是否存在且属于用户
    const existingResult = await query(
      'SELECT is_default FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '分类不存在'
        }
      });
    }

    // 不允许删除默认分类
    if (existingResult.rows[0].is_default) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '不能删除默认分类'
        }
      });
    }

    // 删除分类
    await query('DELETE FROM categories WHERE id = $1', [categoryId]);

    console.log(`✅ Category deleted: ${categoryId}`);
    res.json({
      success: true,
      data: {
        message: '分类已删除'
      }
    });

  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '删除分类失败'
      }
    });
  }
});

export default router;
