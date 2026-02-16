import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Middleware
// ============================================
app.use(cors());
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================
// Health Check & Status
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Wealth Tracker API v1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      categories: '/api/categories',
      assets: '/api/assets',
      reports: '/api/reports'
    }
  });
});

// ============================================
// API Routes
// ============================================
app.use('/api/auth', authRoutes);

// TODO: 下一步添加其他路由
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/assets', assetRoutes);
// app.use('/api/reports', reportRoutes);

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${req.path} 不存在`
    }
  });
});

// ============================================
// Error Handling Middleware (全局错误处理)
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // 判断错误类型
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
      }
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '未授权'
      }
    });
  }

  // 默认错误
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || '服务器内部错误'
    }
  });
});

// ============================================
// Server Startup
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Wealth Tracker API Server Started    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`📍 Server Port:    ${PORT}`);
  console.log(`🌍 Environment:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database:       ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log('');
  console.log('📡 Endpoints:');
  console.log(`  ✓ Health:        http://localhost:${PORT}/api/health`);
  console.log(`  ✓ Status:        http://localhost:${PORT}/api/status`);
  console.log(`  ✓ Auth:          http://localhost:${PORT}/api/auth`);
  console.log('');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Shutting down server...');
  pool.end(() => {
    console.log('✅ Database connection closed');
    process.exit(0);
  });
});
