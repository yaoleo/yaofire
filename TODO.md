# 📋 Wealth Tracker - TODO 和进度追踪

**更新日期**: 2026-02-16
**当前周**: Week 1 (2026-02-16 至 2026-02-22)

---

## 🎯 本周目标 (Week 1)

**主要任务**: 完成 Phase 5 - 后端 API 基础
**预计工时**: 16-20 小时
**优先级**: 🔴 高

---

## 📝 Task 列表

### Task 5.1: 数据库设计 (数据模型)

**状态**: ⏳ 待开始
**优先级**: 🔴 高
**预计工时**: 2-3 小时
**分配给**: 开发者
**截止日期**: 2026-02-17

**子任务**:
- [ ] 分析业务需求，定义用户需求
- [ ] 设计用户表 (users)
  - id, email, password_hash, name, created_at, updated_at
- [ ] 设计交易表 (transactions)
  - id, user_id, type(income/expense), amount, category, description, date, created_at
- [ ] 设计分类表 (categories)
  - id, user_id, name, type(income/expense), color
- [ ] 设计资产表 (assets)
  - id, user_id, name, type, value, currency, created_at, updated_at
- [ ] 创建 ER 图
- [ ] 创建 SQL Schema 文件
- [ ] 代码评审

**完成检查清单**:
- [ ] 所有表都已定义
- [ ] 关系正确映射
- [ ] 索引已添加
- [ ] Schema 文件可执行

---

### Task 5.2: PostgreSQL 配置和连接

**状态**: ⏳ 待开始
**优先级**: 🔴 高
**预计工时**: 2 小时
**分配给**: 开发者
**截止日期**: 2026-02-17

**子任务**:
- [ ] 在 Railway 上创建 PostgreSQL 服务
- [ ] 获取数据库连接字符串
- [ ] 在本地安装 PostgreSQL（开发环境）
- [ ] 创建 .env 文件配置数据库连接
- [ ] 安装 Node.js pg 库
- [ ] 创建数据库连接模块 (db.js)
- [ ] 测试本地连接
- [ ] 测试 Railway 连接

**完成检查清单**:
- [ ] 本地 PostgreSQL 运行正常
- [ ] Railway PostgreSQL 服务已创建
- [ ] 连接字符串正确
- [ ] 连接模块导出正确

---

### Task 5.3: 创建数据库表

**状态**: ⏳ 待开始
**优先级**: 🔴 高
**预计工时**: 1-2 小时
**分配给**: 开发者
**截止日期**: 2026-02-18

**子任务**:
- [ ] 创建迁移文件结构
- [ ] 编写用户表创建 SQL
- [ ] 编写交易表创建 SQL
- [ ] 编写分类表创建 SQL
- [ ] 编写资产表创建 SQL
- [ ] 本地运行迁移
- [ ] Railway 运行迁移
- [ ] 验证表创建成功

**完成检查清单**:
- [ ] 所有表都在本地数据库中
- [ ] 所有表都在 Railway 数据库中
- [ ] 可以执行 SELECT * FROM users 等查询

---

### Task 5.4: 用户认证 API - 注册和登录

**状态**: ⏳ 待开始
**优先级**: 🔴 高
**预计工时**: 3-4 小时
**分配给**: 开发者
**截止日期**: 2026-02-19

**子任务**:
- [ ] 安装 bcrypt（密码加密库）
- [ ] 安装 jsonwebtoken (JWT)
- [ ] 创建用户注册端点 POST /api/auth/register
  - 验证邮箱和密码
  - 密码加密存储
  - 返回 JWT token
- [ ] 创建用户登录端点 POST /api/auth/login
  - 验证邮箱和密码
  - 返回 JWT token
- [ ] 创建 JWT 验证中间件 (authMiddleware)
- [ ] 创建用户信息端点 GET /api/auth/profile (需要 token)
- [ ] 创建登出端点 POST /api/auth/logout
- [ ] 编写单元测试

**API 端点设计**:

```
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
返回: { "token": "jwt_token", "user": { ... } }

POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
返回: { "token": "jwt_token", "user": { ... } }

GET /api/auth/profile (需要 Authorization: Bearer token)
返回: { "user": { "id", "email", "name", ... } }

POST /api/auth/logout (需要 token)
返回: { "message": "Logged out successfully" }
```

**完成检查清单**:
- [ ] 可以成功注册新用户
- [ ] 可以用正确的凭证登录
- [ ] 返回有效的 JWT token
- [ ] 无效的 token 被拒绝
- [ ] 可以用 token 获取用户信息
- [ ] 密码已正确加密

---

### Task 5.5: 交易 CRUD API

**状态**: ⏳ 待开始
**优先级**: 🔴 高
**预计工时**: 4-5 小时
**分配给**: 开发者
**截止日期**: 2026-02-20

**子任务**:
- [ ] 创建交易模型类 (Transaction)
- [ ] 创建 POST /api/transactions (创建交易)
  - 需要认证
  - 验证输入（金额、分类等）
  - 保存到数据库
- [ ] 创建 GET /api/transactions (获取交易列表)
  - 需要认证
  - 分页支持
  - 按日期排序
  - 可选过滤：分类、日期范围
- [ ] 创建 GET /api/transactions/:id (获取单个交易)
  - 需要认证
  - 只能查看自己的交易
- [ ] 创建 PUT /api/transactions/:id (更新交易)
  - 需要认证
  - 验证权限
  - 验证输入
- [ ] 创建 DELETE /api/transactions/:id (删除交易)
  - 需要认证
  - 验证权限
- [ ] 创建分类管理端点
  - GET /api/categories (获取用户的分类)
  - POST /api/categories (创建新分类)
  - PUT /api/categories/:id (更新分类)
  - DELETE /api/categories/:id (删除分类)
- [ ] 编写单元测试
- [ ] 编写集成测试

**API 端点设计**:

```
POST /api/transactions
{
  "type": "expense",
  "amount": 50.00,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-02-16"
}

GET /api/transactions?page=1&limit=20&category=Food&startDate=2026-01-01&endDate=2026-02-16

PUT /api/transactions/1
{
  "amount": 60.00,
  ...
}

DELETE /api/transactions/1
```

**完成检查清单**:
- [ ] 可以创建新交易
- [ ] 可以获取交易列表
- [ ] 分页正常工作
- [ ] 过滤功能正常工作
- [ ] 只能访问自己的交易
- [ ] 可以更新交易
- [ ] 可以删除交易
- [ ] 所有测试通过

---

### Task 5.6: 统计和报表 API

**状态**: ⏳ 待开始
**优先级**: 🟡 中等
**预计工时**: 3-4 小时
**分配给**: 开发者
**截止日期**: 2026-02-21

**子任务**:
- [ ] 创建收入汇总端点 GET /api/reports/income-summary
  - 按时间段（日、周、月）
  - 按分类分解
- [ ] 创建支出汇总端点 GET /api/reports/expense-summary
  - 按时间段（日、周、月）
  - 按分类分解
- [ ] 创建净收入端点 GET /api/reports/net-income
  - 总收入 - 总支出
  - 按时间段
- [ ] 创建分类分析端点 GET /api/reports/category-analysis
  - 每个分类的总额
  - 百分比占比
- [ ] 创建时间序列数据端点 GET /api/reports/timeseries
  - 按日期的收入/支出趋势
- [ ] 编写单元测试

**完成检查清单**:
- [ ] 所有统计计算正确
- [ ] 时间段参数正常工作
- [ ] 性能良好（查询快速）
- [ ] 所有测试通过

---

### Task 5.7: 错误处理和验证

**状态**: ⏳ 待开始
**优先级**: 🔴 高
**预计工时**: 2 小时
**分配给**: 开发者
**截止日期**: 2026-02-20

**子任务**:
- [ ] 创建全局错误处理中间件
- [ ] 创建输入验证中间件
- [ ] 添加日志中间件
- [ ] 定义错误类型和状态码
- [ ] 创建错误响应格式
- [ ] 处理所有 API 端点的错误

**错误响应格式**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**完成检查清单**:
- [ ] 所有错误被正确处理
- [ ] 错误消息有用和安全
- [ ] 日志正常记录

---

### Task 5.8: 后端基础测试

**状态**: ⏳ 待开始
**优先级**: 🟡 中等
**预计工时**: 2-3 小时
**分配给**: 开发者
**截止日期**: 2026-02-21

**子任务**:
- [ ] 安装测试框架 (Jest)
- [ ] 创建测试目录结构
- [ ] 编写用户认证测试
- [ ] 编写交易 API 测试
- [ ] 编写统计 API 测试
- [ ] 达到 70% 代码覆盖率

**完成检查清单**:
- [ ] 所有单元测试通过
- [ ] 代码覆盖率 ≥ 70%
- [ ] 集成测试通过

---

## 📊 每日进度追踪

### Day 1 (2026-02-16)
- [ ] Task 5.1 - 数据库设计完成
- 预计: 2-3 小时
- 实际: _ 小时
- 完成度: ___%

### Day 2 (2026-02-17)
- [ ] Task 5.2 - PostgreSQL 配置完成
- [ ] Task 5.1 代码评审和修改
- 预计: 2-3 小时
- 实际: _ 小时
- 完成度: ___%

### Day 3 (2026-02-18)
- [ ] Task 5.3 - 创建数据库表完成
- [ ] Task 5.2 集成测试
- 预计: 2-3 小时
- 实际: _ 小时
- 完成度: ___%

### Day 4 (2026-02-19)
- [ ] Task 5.4 - 用户认证 API 完成
- [ ] Task 5.3 验证所有表
- 预计: 3-4 小时
- 实际: _ 小时
- 完成度: ___%

### Day 5 (2026-02-20)
- [ ] Task 5.5 - 交易 CRUD API 完成
- [ ] Task 5.7 - 错误处理完成
- 预计: 4-5 小时
- 实际: _ 小时
- 完成度: ___%

### Day 6 (2026-02-21)
- [ ] Task 5.6 - 统计 API 完成
- [ ] Task 5.8 - 测试完成
- 预计: 4-5 小时
- 实际: _ 小时
- 完成度: ___%

### Day 7 (2026-02-22)
- [ ] 代码评审和优化
- [ ] 文档完善
- [ ] 准备 Phase 6 前端开发
- 预计: 2-3 小时
- 实际: _ 小时
- 完成度: ___%

---

## 🎯 成功标准

### Phase 5 完成标准:
- ✅ 所有数据库表已创建
- ✅ 用户认证 API 工作正常
- ✅ 交易 CRUD API 完整
- ✅ 统计报表 API 可用
- ✅ 所有 API 都需要认证
- ✅ 错误处理完善
- ✅ 至少 70% 代码覆盖率
- ✅ 可以部署到 Railway 运行

### API 文档:
创建 API_DOCUMENTATION.md，包含所有端点的详细说明

### 代码质量:
- ✅ 通过 ESLint
- ✅ 通过所有单元测试
- ✅ 无未处理的错误
- ✅ 安全的密码处理

---

## 📈 进度统计

```
已完成任务:     0/8  (0%)
进行中任务:     0/8  (0%)
待开始任务:     8/8  (100%)

预计总工时:     16-20 小时
已花费工时:     0 小时
剩余工时:       16-20 小时

完成百分比:     ▒░░░░░░░░░░░░░░░░░░ 0%
```

---

## 💡 备注和提示

### 开发建议
1. **每天提交**: 保持小的、原子的提交
2. **测试驱动**: 先写测试，再实现功能
3. **定期部署**: 每完成一个任务就推送和部署
4. **文档同步**: 实现功能时更新文档

### 常用命令

```bash
# 启动开发服务器
cd wealth-tracker/server
npm start

# 运行测试
npm test

# 推送代码
git add .
git commit -m "feat: task name"
git push origin main

# 查看部署日志
railway logs --tail 50
```

### 文件位置
- 后端代码: `wealth-tracker/server/`
- 数据库脚本: `wealth-tracker/server/db/`
- API 路由: `wealth-tracker/server/routes/`
- 测试文件: `wealth-tracker/server/__tests__/`

---

**下一步**: 开始 Task 5.1 - 数据库设计

需要帮助？提醒我！
