// 用户认证路由
// 处理: 注册、登录、登出、个人信息

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// POST /api/auth/register - 用户注册
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '邮箱和密码是必需的'
        }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '密码至少需要 6 个字符'
        }
      });
    }

    // 2. 检查邮箱是否已存在
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: '该邮箱已被注册'
        }
      });
    }

    // 3. 密码加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. 插入用户
    const result = await query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, passwordHash, name || email.split('@')[0]]
    );

    const user = result.rows[0];

    // 5. 生成 JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 6. 返回成功
    console.log(`✅ User registered: ${email}`);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        }
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '注册失败，请稍后重试'
      }
    });
  }
});

// ============================================
// POST /api/auth/login - 用户登录
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '邮箱和密码是必需的'
        }
      });
    }

    // 2. 查询用户
    const result = await query('SELECT id, email, name, password_hash, status FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '邮箱或密码错误'
        }
      });
    }

    const user = result.rows[0];

    // 3. 检查账户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: '账户已被禁用'
        }
      });
    }

    // 4. 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '邮箱或密码错误'
        }
      });
    }

    // 5. 更新最后登录时间
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // 6. 生成 JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 7. 返回成功
    console.log(`✅ User logged in: ${email}`);
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '登录失败，请稍后重试'
      }
    });
  }
});

// ============================================
// GET /api/auth/profile - 获取个人信息 (需要认证)
// ============================================
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      'SELECT id, email, name, created_at, last_login_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '获取用户信息失败'
      }
    });
  }
});

// ============================================
// PUT /api/auth/profile - 更新个人信息 (需要认证)
// ============================================
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '名称不能为空'
        }
      });
    }

    const result = await query(
      'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, created_at',
      [name, userId]
    );

    res.json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '更新用户信息失败'
      }
    });
  }
});

// ============================================
// POST /api/auth/logout - 登出 (需要认证)
// ============================================
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // 注: JWT 是无状态的，登出主要是客户端删除 token
    // 服务器可选：记录登出日志、添加 token 黑名单等

    console.log(`✅ User logged out: ${req.user.email}`);
    res.json({
      success: true,
      data: {
        message: '登出成功'
      }
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '登出失败'
      }
    });
  }
});

// ============================================
// POST /api/auth/wechat - 微信登录 (小程序用)
// ============================================
router.post('/wechat', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '微信登录 code 是必需的'
        }
      });
    }

    // TODO: 调用微信 API 交换 openid
    // const wechatUser = await exchangeWechatCode(code);
    // const { openid, unionid } = wechatUser;

    // 临时实现（用于测试）
    const openid = `wechat_${code}_${Date.now()}`;

    // 查询或创建用户
    let result = await query('SELECT id, email, name FROM users WHERE wechat_openid = $1', [openid]);

    let user;
    if (result.rows.length > 0) {
      // 用户存在，更新登录时间
      user = result.rows[0];
      await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    } else {
      // 新用户，创建账户
      result = await query(
        'INSERT INTO users (wechat_openid, name) VALUES ($1, $2) RETURNING id, email, name',
        [openid, `User_${Date.now()}`]
      );
      user = result.rows[0];
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log(`✅ WeChat user logged in: ${openid}`);
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    });

  } catch (error) {
    console.error('❌ WeChat login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '微信登录失败'
      }
    });
  }
});

export default router;
