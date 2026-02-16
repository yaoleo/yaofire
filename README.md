# Wealth Tracker - Full Stack Application

一个财富追踪应用，包含 React 前端和 Node.js 后端，配置好 Railway 自动部署。

## 📁 项目结构

```
yaofire/
├── wealth-tracker/           # 主应用目录
│   ├── server/              # Node.js 后端 API
│   │   ├── server.js
│   │   ├── package.json
│   │   └── .env
│   ├── src/                 # React 前端源码
│   ├── public/              # 静态资源
│   ├── vite.config.js       # Vite 配置
│   └── package.json
├── Procfile                 # Railway 部署配置
├── railway.json             # Railway 构建配置
├── package.json             # 根级 npm 配置
└── README.md
```

## 🚀 快速开始

### 本地开发

**方式 1：直接运行（推荐）**

终端 1 - 启动后端：
```bash
cd wealth-tracker/server
npm install  # 首次需要
npm start
```

终端 2 - 启动前端：
```bash
cd wealth-tracker
npm install  # 首次需要
npm run dev
```

访问：
- 前端：http://localhost:5173
- API：http://localhost:3001
- 健康检查：http://localhost:3001/api/health

**方式 2：使用 Docker**

```bash
docker-compose up
```

## 🌐 部署到 Railway

### 第一次部署

1. **创建 Railway 账户**
   - 访问 [railway.app](https://railway.app)
   - 用 GitHub 账户登录

2. **连接 GitHub 仓库**
   - 新建项目 → 选择 "Deploy from GitHub"
   - 连接账户，选择此仓库
   - 选择 `main` 分支

3. **Railway 会自动：**
   - 检测 `Procfile` 配置
   - 运行 `npm install` 安装依赖
   - 启动服务器

### 自动部署配置

每次推送到 `main` 分支，Railway 会自动重新部署。

### 环境变量

在 Railway 项目中设置：
- `NODE_ENV=production`
- `PORT=3001`（通常自动设置）

## 📡 API 端点

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/data` | 测试数据端点 |

## 🔧 开发指南

### 添加新的 API 路由

编辑 `wealth-tracker/server/server.js`：

```javascript
app.post('/api/transactions', (req, res) => {
  // 你的逻辑
  res.json({ success: true });
});
```

### 连接数据库

1. 在 Railway 项目中添加 PostgreSQL 或 MongoDB 服务
2. 更新 `wealth-tracker/server/.env` 中的数据库连接字符串
3. 在 `server.js` 中连接数据库

## 📋 部署状态

部署完成后，访问：
```
https://your-project.up.railway.app/api/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2026-02-16T..."
}
```

## 🐛 故障排除

### Railway 部署失败

检查以下内容：
1. `Procfile` 存在且内容正确
2. `wealth-tracker/server/package.json` 有 `"start"` 脚本
3. 查看 Railway 日志了解详细错误

### 本地开发问题

```bash
# 清除 node_modules 重新安装
cd wealth-tracker/server
rm -rf node_modules package-lock.json
npm install

# 同样清理前端
cd ../
rm -rf node_modules package-lock.json
npm install
```

## 📚 更多资源

- [Railway 文档](https://docs.railway.app)
- [Express.js 文档](https://expressjs.com)
- [React 文档](https://react.dev)
- [Vite 文档](https://vitejs.dev)

## 📝 许可

MIT License

---

有问题？查看 `wealth-tracker/RAILWAY_SETUP.md` 了解更多部署细节。
