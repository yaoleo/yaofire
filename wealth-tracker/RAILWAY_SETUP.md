# Railway 部署指南

## 快速开始

### 1. 本地开发（同时运行前端和后端）

#### 终端 1 - 启动后端服务器：
```bash
cd wealth-tracker/server
npm install
npm start
```

服务器将在 `http://localhost:3001` 运行

#### 终端 2 - 启动前端开发服务器：
```bash
cd wealth-tracker
npm install
npm run dev
```

前端将在 `http://localhost:5173` 运行

### 2. 配置 Railway

#### 步骤 A: 创建 Railway 账户
1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 账户登录
3. 创建新项目

#### 步骤 B: 连接 Git 仓库
1. 在 Railway 中点击 "New Project"
2. 选择 "Deploy from GitHub"
3. 连接你的 GitHub 账户
4. 选择此仓库
5. 选择 `main` 分支自动部署

#### 步骤 C: 配置环境变量
1. 在 Railway 项目中打开 "Variables" 标签
2. 添加以下环境变量：
   ```
   NODE_ENV=production
   PORT=3001
   ```

### 3. 自动部署配置

#### 使用 GitHub Actions（推荐）

1. 在 GitHub 仓库中添加 Secrets：
   - `RAILWAY_TOKEN`: 从 Railway 账户设置中获取 API Token
   - `RAILWAY_PROJECT_ID`: 你的 Railway 项目 ID

2. 每次推送到 `main` 或 `develop` 分支时，自动部署到 Railway

#### 或使用 Railway CLI

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 链接现有项目
railway link <project-id>

# 部署
railway up
```

### 4. 部署后的测试

部署完成后，你可以访问：

```
https://your-project-name.up.railway.app/api/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T10:00:00.000Z"
}
```

### 5. 监控和日志

1. 在 Railway 仪表板查看日志
2. 检查部署历史
3. 配置告警通知

## 项目结构

```
wealth-tracker/
├── server/                 # Node.js 后端
│   ├── server.js          # Express 服务器
│   ├── package.json       # 后端依赖
│   └── .env.example       # 环境变量示例
├── src/                   # React 前端源码
├── public/                # 静态资源
├── vite.config.js         # Vite 配置
├── railway.json           # Railway 部署配置
├── Procfile              # Procfile 配置（Railway 使用）
└── .github/workflows/     # GitHub Actions 工作流
```

## 常见问题

### Q: 如何在 Railway 上运行前端？
A: 目前配置仅部署后端 API。前端可以：
- 在 Vercel/Netlify 上部署
- 将前端构建为静态资源并在后端服务

### Q: 如何更新部署？
A: 简单推送到 `main` 分支，GitHub Actions 会自动部署。

### Q: 如何查看实时日志？
A: 在 Railway 仪表板的 "Logs" 标签中查看

## 下一步

1. 在 `server/server.js` 中添加你的 API 路由
2. 连接数据库（如需要）
3. 部署到 Railway 并测试
4. 在生产环境中监控应用
