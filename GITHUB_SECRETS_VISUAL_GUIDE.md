# GitHub Secrets 配置 - 可视化指南

## 📍 完整的配置步骤

### 第 1 部分：获取 Railway 凭证

#### 获取 Railway API Token

1. **打开 Railway 仪表板**
   ```
   https://railway.app
   ```

2. **点击右上角的设置图标**
   - 找到你的头像/用户名右边的齿轮图标 ⚙️

3. **选择 "Account Settings"**
   - 从下拉菜单中选择

4. **左侧菜单选择 "API Tokens"**
   - 点击左侧菜单的 API Tokens 选项

5. **点击 "Create New Token"**
   - 蓝色按钮 "New API Token"

6. **输入 Token 名称**
   - 例如：`GitHub Actions`
   - 点击 "Create"

7. **复制 Token**
   ```
   pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ 重要：只显示一次，立即复制！

---

#### 获取 Railway Project ID

**方式 1：从仪表板**

1. **打开 Railway 项目页面**
   ```
   https://railway.app
   ```

2. **进入 "yaofire" 项目**
   - 从项目列表中点击

3. **打开项目设置**
   - 项目页面 → 点击 **Settings** 齿轮图标

4. **查找 Project ID**
   - 在 Settings 页面找到 "Project ID" 字段
   ```
   xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

5. **复制 Project ID**

**方式 2：使用 CLI**

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 查看项目列表
railway projects

# 输出示例：
# yaofire          | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | Node
```

---

### 第 2 部分：配置 GitHub Secrets

#### 打开 GitHub Repository Settings

1. **打开你的 GitHub 仓库**
   ```
   https://github.com/你的用户名/yaofire
   ```

2. **点击 "Settings" 标签**
   - 在仓库页面顶部，找到 Settings 标签

3. **左侧菜单选择 "Secrets and variables"**
   - 展开左侧菜单
   - 找到 "Secrets and variables" → 选择 "Actions"

4. **现在在 "Repository secrets" 部分**

---

#### 添加第 1 个 Secret：RAILWAY_TOKEN

1. **点击 "New repository secret" 按钮**
   - 右上角的绿色按钮

2. **配置 Secret**

   **Name 字段：**
   ```
   RAILWAY_TOKEN
   ```

   **Secret 字段：**
   ```
   pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   （粘贴你从 Railway 复制的 Token）

3. **点击 "Add secret" 按钮**

4. **验证：**
   - 应该看到 `RAILWAY_TOKEN` 出现在列表中
   - 显示为 "Updated XX seconds ago"

---

#### 添加第 2 个 Secret：RAILWAY_PROJECT_ID

1. **点击 "New repository secret" 按钮**
   - 右上角的绿色按钮

2. **配置 Secret**

   **Name 字段：**
   ```
   RAILWAY_PROJECT_ID
   ```

   **Secret 字段：**
   ```
   xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
   （粘贴你从 Railway 复制的 Project ID）

3. **点击 "Add secret" 按钮**

4. **验证：**
   - 应该看到 `RAILWAY_PROJECT_ID` 出现在列表中

---

#### 最终验证

你的 Secrets 列表应该显示：

```
✓ RAILWAY_PROJECT_ID    (Updated 2 minutes ago)
✓ RAILWAY_TOKEN         (Updated 3 minutes ago)
```

✅ **现在 GitHub Secrets 配置完成！**

---

### 第 3 部分：测试工作流

#### 推送代码触发自动部署

1. **在本地提交更改**
   ```bash
   git add .
   git commit -m "Configure GitHub Actions"
   git push origin main
   ```

2. **查看工作流运行**
   - GitHub 仓库 → **Actions** 标签
   - 应该看到工作流 "🚀 Deploy to Railway" 正在运行

3. **查看详细日志**
   - 点击工作流名称
   - 点击 "Deploy Application" 任务
   - 查看实时日志

4. **等待部署完成**
   - 绿色 ✅ = 成功
   - 红色 ❌ = 失败

---

## 🔍 查看工作流执行日志

### 在 GitHub 界面

1. **打开 Actions 标签**
   ```
   https://github.com/你的用户名/yaofire/actions
   ```

2. **点击最新的工作流运行**
   - "🚀 Deploy to Railway" 旁边的日期

3. **展开各个步骤查看详细日志**
   - 📥 Checkout code
   - 📋 Set up Node.js
   - 🔍 Validate project structure
   - 🔐 Validate secrets
   - ...等等

4. **查看完整输出**
   - 点击任何步骤查看完整输出
   - 搜索关键字找到问题

---

## 🔐 Security 最佳实践

### ✅ 该做的：

- ✓ 定期更新 API Token
- ✓ 只在需要时创建新 Token
- ✓ 给 Token 命名（便于识别和管理）
- ✓ 在 GitHub Secrets 中保管凭证

### ❌ 不该做的：

- ✗ 不要在代码中硬编码 Token
- ✗ 不要在 commit 中包含 .env 文件
- ✗ 不要在公开讨论中分享 Token
- ✗ 不要在仓库 README 中暴露 Secrets

---

## 🆘 如果 Secrets 泄露了

1. **立即删除 Token**
   - Railway → Account Settings → API Tokens
   - 删除相关 Token

2. **创建新 Token**
   - 按照上面的步骤创建新 Token

3. **更新 GitHub Secret**
   - GitHub → Settings → Secrets
   - 点击 RAILWAY_TOKEN
   - 点击 "Update" 按钮
   - 粘贴新 Token
   - 点击 "Update secret"

4. **重新部署**
   ```bash
   git push origin main
   # 或手动触发工作流
   gh workflow run deploy.yml --ref main
   ```

---

## 🧪 测试 Secrets 是否正确配置

### 方法 1：等待自动部署

推送代码到 main 分支，观察 Actions 日志中的：
```
✓ All required secrets are configured
```

### 方法 2：使用 GitHub CLI

```bash
# 查看仓库的 secrets（只显示名称，不显示值）
gh secret list

# 输出示例：
# RAILWAY_PROJECT_ID   Updated 2026-02-16 at 10:00:00
# RAILWAY_TOKEN        Updated 2026-02-16 at 10:05:00
```

### 方法 3：手动触发工作流

```bash
# 手动运行工作流
gh workflow run deploy.yml --ref main

# 查看运行日志
gh run list
gh run view <run-id> --log
```

---

## 📋 配置检查清单

使用这个清单确保一切配置正确：

- [ ] 访问了 Railway 仪表板
- [ ] 复制了 API Token（pk_xxx...）
- [ ] 复制了 Project ID（xxxx-xxxx...）
- [ ] 打开了 GitHub 仓库 Settings
- [ ] 进入了 Secrets and variables → Actions
- [ ] 添加了 RAILWAY_TOKEN secret
- [ ] 添加了 RAILWAY_PROJECT_ID secret
- [ ] 两个 secrets 都显示在列表中
- [ ] 推送代码到 main 分支
- [ ] 检查了 Actions 标签，工作流正在运行或已完成
- [ ] 查看了日志中的"✓ All required secrets are configured"
- [ ] 验证了部署成功（绿色 ✅）

---

## 🎯 下一步

完成配置后：

1. **本地开发**
   ```bash
   cd wealth-tracker/server
   npm start
   ```

2. **推送代码自动部署**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

3. **监控部署**
   - GitHub Actions → 查看日志
   - Railway 仪表板 → 查看状态

4. **验证部署**
   ```bash
   curl https://yaofire.up.railway.app/api/health
   ```

---

## ❓ FAQ

**Q: Secret 值会显示在日志中吗？**
A: 不会！GitHub 会自动隐藏 Secret 值（显示为 ***）

**Q: 可以删除并重新添加相同的 Secret 吗？**
A: 可以，删除后重新添加（用于更新值）

**Q: Token 过期了吗？**
A: Railway API Token 不过期，但如果泄露应立即删除并创建新的

**Q: 如何更新 Secret 值？**
A: 点击 Secret 名称 → "Update" 按钮 → 输入新值 → "Update secret"

---

## 📞 需要帮助？

查看：
- 完整指南：`GITHUB_ACTIONS_SETUP.md`
- 快速参考：`GITHUB_ACTIONS_QUICK_REFERENCE.md`
- Railway 文档：https://docs.railway.app
