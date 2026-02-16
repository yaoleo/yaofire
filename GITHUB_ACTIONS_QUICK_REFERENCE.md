# GitHub Actions 快速参考卡

## 🚀 3 步配置 GitHub Actions

### 1️⃣ 获取凭证

**Railway Token:**
1. Railway 仪表板 → 右上角设置 → Account Settings
2. API Tokens → Create New Token
3. 复制 Token（只显示一次！）

**Project ID:**
1. 进入 yaofire 项目
2. Settings → Project ID
3. 复制 ID

### 2️⃣ 配置 GitHub Secrets

访问：`https://github.com/你的用户名/yaofire/settings/secrets/actions`

添加 2 个 Secrets：

| Secret 名称 | 值 |
|------------|-----|
| `RAILWAY_TOKEN` | pk_xxxxxxxxxxxx... |
| `RAILWAY_PROJECT_ID` | xxxxxxxx-xxxx... |

### 3️⃣ 完成！

完成后，每次推送到 `main` 分支就会自动部署！

---

## 📊 工作流监控

### 查看部署状态
1. GitHub 仓库 → **Actions** 标签
2. 查看工作流运行状态
3. 绿色 ✅ = 成功，红色 ❌ = 失败

### 查看详细日志
```bash
gh run list              # 查看最近运行
gh run view <run-id>     # 查看特定运行
gh run view <run-id> --log  # 查看完整日志
```

---

## 🐛 常见问题

| 问题 | 解决方案 |
|------|---------|
| "Secret is not set" | 检查 GitHub Secrets 配置 |
| "Procfile not found" | 确保 Procfile 在项目根目录 |
| "railway link failed" | 重新生成 Railway API Token |
| 部署超时 | 增加 timeout（deploy.yml 第 86 行） |

---

## 🔄 工作流触发条件

| 事件 | 触发 | 行为 |
|------|------|------|
| 推送到 `main` | ✅ | 部署到 Railway |
| 推送到 `develop` | ✅ | 部署到 Railway |
| PR 到 `main` | ⚠️ | 验证（不部署） |

---

## 📝 手动触发工作流

```bash
# 使用 GitHub CLI
gh workflow run deploy.yml --ref main

# 或在 GitHub 网页界面：
# Actions → deploy.yml → Run workflow 按钮
```

---

## 🧪 本地测试部署

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 链接项目
railway link <PROJECT_ID>

# 4. 部署
railway up --detach

# 5. 检查状态
railway status

# 6. 查看日志
railway logs
```

---

## 📚 完整指南

详细信息请查看：`GITHUB_ACTIONS_SETUP.md`

---

## ✅ 验证部署成功

```bash
# 测试 API
curl https://yaofire.up.railway.app/api/health

# 应返回：
# {"status":"ok","timestamp":"2026-02-16T..."}
```

---

## 🔗 重要链接

- [GitHub Actions 日志](https://github.com/你的用户名/yaofire/actions)
- [Railway 仪表板](https://railway.app)
- [Railway 项目](https://railway.app/project/PROJECT_ID)

---

**需要帮助？** 查看 `GITHUB_ACTIONS_SETUP.md` 中的 [故障排除](GITHUB_ACTIONS_SETUP.md#-故障排除) 部分。
