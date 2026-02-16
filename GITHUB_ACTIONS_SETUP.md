# GitHub Actions 自动部署配置指南

本指南详细说明如何配置 GitHub Actions 工作流，使得每次推送代码时自动部署到 Railway。

## 📋 目录

1. [获取必要的凭证](#获取必要的凭证)
2. [配置 GitHub Secrets](#配置-github-secrets)
3. [工作流详解](#工作流详解)
4. [监控部署](#监控部署)
5. [故障排除](#故障排除)

---

## 🔐 获取必要的凭证

### 步骤 1：获取 Railway API Token

1. 访问 [Railway 仪表板](https://railway.app)
2. 点击右上角的 **设置图标** → **Account Settings**
3. 左侧菜单选择 **API Tokens**
4. 点击 **Create New Token**
5. 输入 token 名称（例如：`GitHub Actions`）
6. 点击 **Create**
7. **复制 Token 并妥善保管**（只会显示一次！）

示例：`pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 步骤 2：获取 Railway Project ID

1. 访问 [Railway 项目列表](https://railway.app)
2. 进入 **yaofire** 项目
3. 在 **Settings** 中查找 **Project ID**
4. **复制 Project ID**

示例：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

或者运行命令查看：
```bash
railway projects
```

---

## 🔑 配置 GitHub Secrets

### 方式 1：通过 GitHub Web 界面（推荐）

1. **打开你的 GitHub 仓库**
   ```
   https://github.com/你的用户名/yaofire
   ```

2. **进入 Settings 标签**
   - 点击 **Settings** 选项卡

3. **打开 Secrets and variables**
   - 左侧菜单 → **Secrets and variables** → **Actions**

4. **创建第一个 Secret：RAILWAY_TOKEN**
   - 点击 **New repository secret**
   - Name: `RAILWAY_TOKEN`
   - Secret: 粘贴你的 Railway API Token
   - 点击 **Add secret**

5. **创建第二个 Secret：RAILWAY_PROJECT_ID**
   - 点击 **New repository secret**
   - Name: `RAILWAY_PROJECT_ID`
   - Secret: 粘贴你的 Railway Project ID
   - 点击 **Add secret**

✅ 现在两个 secrets 都已配置！

### 方式 2：使用 GitHub CLI

```bash
# 需要先登录 GitHub CLI
gh auth login

# 设置 RAILWAY_TOKEN
gh secret set RAILWAY_TOKEN --body "pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 设置 RAILWAY_PROJECT_ID
gh secret set RAILWAY_PROJECT_ID --body "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 验证 secrets 已设置
gh secret list
```

---

## 📝 工作流详解

### 工作流文件位置
```
.github/workflows/deploy.yml
```

### 工作流触发条件

```yaml
on:
  push:
    branches:
      - main      # 推送到 main 分支时触发
      - develop   # 推送到 develop 分支时触发
  pull_request:
    branches:
      - main      # PR 到 main 分支时触发（用于验证）
```

**含义：**
- 推送代码到 `main` 或 `develop` 分支 → **自动部署到 Railway**
- 创建 PR 到 `main` 分支 → **验证工作流（不部署）**

### 工作流步骤详解

#### 1️⃣ 检出代码 (Checkout code)
```yaml
- name: 📥 Checkout code
  uses: actions/checkout@v4
```
**作用：** 从 GitHub 下载你的代码

#### 2️⃣ 设置 Node.js (Set up Node.js)
```yaml
- name: 📋 Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
```
**作用：** 安装 Node.js 18 版本，启用 npm 缓存加速

#### 3️⃣ 验证项目结构 (Validate project structure)
```yaml
- name: 🔍 Validate project structure
  run: |
    # 检查必要的配置文件是否存在
    if [ ! -f "Procfile" ]; then exit 1; fi
    if [ ! -f "railway.json" ]; then exit 1; fi
```
**作用：** 确保所有必要文件存在，失败则停止部署

#### 4️⃣ 验证 Secrets (Validate secrets)
```yaml
- name: 🔐 Validate secrets
  run: |
    # 检查 RAILWAY_TOKEN 和 RAILWAY_PROJECT_ID 是否已设置
    if [ -z "${{ secrets.RAILWAY_TOKEN }}" ]; then exit 1; fi
```
**作用：** 确保 GitHub Secrets 已正确配置

#### 5️⃣ 安装 Railway CLI (Install Railway CLI)
```yaml
- name: 📦 Install Railway CLI
  run: |
    npm install -g @railway/cli
    railway --version
```
**作用：** 安装 Railway 命令行工具

#### 6️⃣ 链接项目 (Link Railway project)
```yaml
- name: 🔗 Link Railway project
  run: |
    railway link ${{ secrets.RAILWAY_PROJECT_ID }}
```
**作用：** 连接到你的 Railway 项目

#### 7️⃣ 执行部署 (Deploy to Railway)
```yaml
- name: 🚀 Deploy to Railway
  run: |
    railway up --detach
    railway status
  timeout-minutes: 15
```
**作用：** 启动部署，等待最多 15 分钟

#### 8️⃣ 成功通知 (Notify on success)
```yaml
- name: ✅ Notify on success
  if: success()
```
**作用：** 部署成功时显示信息

#### 9️⃣ 失败处理 (Deployment failed)
```yaml
- name: ❌ Deployment failed
  if: failure()
  run: railway logs --tail 50
```
**作用：** 部署失败时显示最后 50 行日志

---

## 🚀 使用工作流

### 自动部署流程

**步骤 1：提交代码**
```bash
git add .
git commit -m "Add new feature"
```

**步骤 2：推送到 main 分支**
```bash
git push origin main
```

**步骤 3：工作流自动触发**
- GitHub Actions 自动启动
- 执行所有验证步骤
- 部署到 Railway

**步骤 4：查看部署状态**

#### 方式 1：GitHub 界面
1. 进入仓库主页
2. 点击 **Actions** 标签
3. 查看最新的工作流运行
4. 点击进入查看详细日志

#### 方式 2：命令行
```bash
gh run list                    # 查看最近的工作流运行
gh run view <run-id>          # 查看具体运行的详情
gh run view <run-id> --log    # 查看完整日志
```

---

## 📊 监控部署

### 在 GitHub 中监控

1. **Actions 标签**
   - 每个工作流运行都显示在这里
   - 绿色 ✅ = 成功
   - 红色 ❌ = 失败

2. **查看详细日志**
   - 点击工作流名称
   - 点击 **Deploy Application** 任务
   - 查看每个步骤的输出

### 在 Railway 中验证

1. 访问 Railway 仪表板
2. 进入项目
3. 查看 **Deployments** 标签
4. 确认最新部署状态为 "Running"

### 验证部署是否成功

访问你的 API：
```bash
curl https://yaofire.up.railway.app/api/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2026-02-16T..."
}
```

---

## 🐛 故障排除

### 问题 1：工作流显示红色 ❌

**检查内容：**

1. **查看具体错误**
   - GitHub Actions → 点击失败的工作流
   - 查看 "Validate secrets" 步骤

2. **常见原因和解决方案**

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `RAILWAY_TOKEN secret is not set` | Token 未配置 | 检查 GitHub Secrets 配置 |
| `RAILWAY_PROJECT_ID secret is not set` | Project ID 未配置 | 检查 GitHub Secrets 配置 |
| `Procfile not found` | 文件丢失 | 确保 Procfile 在项目根目录 |
| `railway link failed` | Token 过期或无效 | 重新生成 Railway API Token |

### 问题 2：部署超时（超过 15 分钟）

**解决方案：**
```yaml
# 在 deploy.yml 中修改超时时间
timeout-minutes: 30  # 改为 30 分钟
```

### 问题 3：部署成功但 Railway 显示错误

**检查：**
```bash
# 查看 Railway 日志
railway logs --tail 100

# 查看部署状态
railway status
```

### 问题 4：如何手动触发工作流？

```bash
# 使用 GitHub CLI
gh workflow run deploy.yml --ref main

# 或在 GitHub 界面：
# Actions → 选择工作流 → 点击 "Run workflow" 按钮
```

---

## 🔄 工作流变量参考

| 变量 | 说明 | 示例 |
|------|------|------|
| `${{ secrets.RAILWAY_TOKEN }}` | Railway API Token | pk_xxxx... |
| `${{ secrets.RAILWAY_PROJECT_ID }}` | Railway Project ID | xxxx-xxxx... |
| `${{ github.ref }}` | 当前分支 | refs/heads/main |
| `${{ github.sha }}` | 提交哈希 | abc123... |
| `${{ github.actor }}` | 提交者用户名 | your-username |

---

## 📚 进阶配置

### 添加 Slack 通知

编辑 `deploy.yml` 添加：

```yaml
- name: 💬 Send Slack notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: |
      Deployment ${{ job.status }}
      Branch: ${{ github.ref }}
      Commit: ${{ github.sha }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 仅在特定文件改变时部署

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'wealth-tracker/server/**'
      - 'Procfile'
      - 'railway.json'
```

### 添加部署前测试

```yaml
- name: 🧪 Run tests
  run: |
    cd wealth-tracker/server
    npm test
```

---

## ✅ 配置检查清单

- [ ] 获取了 Railway API Token
- [ ] 获取了 Railway Project ID
- [ ] 在 GitHub Secrets 中添加了 `RAILWAY_TOKEN`
- [ ] 在 GitHub Secrets 中添加了 `RAILWAY_PROJECT_ID`
- [ ] `.github/workflows/deploy.yml` 文件存在
- [ ] `Procfile` 在项目根目录
- [ ] `railway.json` 在项目根目录
- [ ] 推送代码到 `main` 分支
- [ ] 检查 GitHub Actions 工作流状态
- [ ] 验证 Railway 部署成功

---

## 📞 需要帮助？

如果工作流仍然有问题：

1. **查看 GitHub Actions 日志**
   - 点击失败的工作流 → 查看每个步骤的输出

2. **查看 Railway 日志**
   ```bash
   railway logs --tail 100
   ```

3. **重新生成凭证**
   - 重新生成 Railway API Token
   - 更新 GitHub Secrets

4. **手动测试 Railway CLI**
   ```bash
   railway login
   railway link <PROJECT_ID>
   railway up --detach
   railway status
   ```

---

## 🎉 完成！

现在每次推送代码到 `main` 分支时，GitHub Actions 会自动：
1. ✅ 验证项目结构
2. ✅ 检查 Secrets 配置
3. ✅ 部署到 Railway
4. ✅ 报告部署状态

祝贺你！🎊
