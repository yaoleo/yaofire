# 🗺️ Wealth Tracker - 完整开发路线图

**项目目标**: 开发财富管理应用 (后端 API + Web + 微信小程序)
**开始日期**: 2026-02-16
**预计完成**: 2026-04-30 (10-12 周)

---

## 📱 三端架构

```
┌─────────────────────────────────────────┐
│         Wealth Tracker                  │
├─────────────────────────────────────────┤
│                                         │
│  🌐 Web端         📱 小程序端    🔧 后端API│
│  React+Vite       WeChat Mini   Node.js│
│  http://web...    微信小程序     Railway │
│  (Vercel/         (微信服务器)   (数据库) │
│   Netlify)                        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🏗️ 完整的开发阶段

### Phase 1-4: 基础设施 (已完成 ✅)
- [x] 本地开发环境
- [x] 部署基础设施 (Railway)
- [x] GitHub Actions 自动化
- [x] 项目文档

**总耗时**: ~8 小时 ✅

---

### Phase 5: 后端 API 核心 (⏳ 待开始)
**目标**: 完成所有后端 API，三端共用的数据接口

#### 5.1 数据库设计
- 用户表 (users)
- 交易表 (transactions)
- 分类表 (categories)
- 资产表 (assets)

#### 5.2 核心 API 端点
```
认证模块:
  POST   /api/auth/register        注册
  POST   /api/auth/login           登录
  GET    /api/auth/profile         个人信息
  PUT    /api/auth/update-profile  更新信息
  POST   /api/auth/logout          登出

交易管理:
  POST   /api/transactions         创建交易
  GET    /api/transactions         列表 (分页/过滤)
  GET    /api/transactions/:id     详情
  PUT    /api/transactions/:id     编辑
  DELETE /api/transactions/:id     删除

分类管理:
  GET    /api/categories           分类列表
  POST   /api/categories           创建分类
  PUT    /api/categories/:id       编辑分类
  DELETE /api/categories/:id       删除分类

资产管理:
  GET    /api/assets               资产列表
  POST   /api/assets               创建资产
  PUT    /api/assets/:id           编辑资产
  DELETE /api/assets/:id           删除资产

统计分析:
  GET    /api/reports/summary      总体统计
  GET    /api/reports/income       收入统计
  GET    /api/reports/expense      支出统计
  GET    /api/reports/trend        趋势分析
  GET    /api/reports/category     分类分析
```

**预计工时**: 16-20 小时
**优先级**: 🔴 高 (Web 和小程序都依赖)

---

### Phase 6A: Web 应用开发 (⏳ 待开始)
**目标**: 开发 Web 版本，与后端 API 集成

#### 主要功能
- 登录/注册页面
- 仪表板 (Dashboard)
- 交易管理界面
- 资产管理界面
- 统计报表
- 用户设置

#### 部署方案
- **选项1** (推荐): 部署到 Vercel/Netlify
- **选项2**: 在 Railway 后端服务器上提供静态文件

**预计工时**: 20-25 小时
**优先级**: 🔴 高

---

### Phase 6B: 微信小程序开发 (⏳ 待开始)
**目标**: 开发微信小程序版本，与后端 API 集成

#### 小程序特点
- 用 WeChat Mini Program 框架开发
- 相同的后端 API
- 移动端优化的 UI
- 微信支付集成 (可选)
- 离线数据支持

#### 技术选型

**推荐方案A**: 原生小程序
```
使用微信官方框架
├─ pages/        小程序页面
├─ components/   可复用组件
├─ utils/        工具函数
├─ api/          API 调用
└─ app.json      配置文件
```

**推荐方案B**: 跨平台框架
```
Taro (推荐)
├─ 一套代码，多端运行
├─ 支持: 微信小程序、H5、RN
└─ 类 React 开发体验

或 uni-app
├─ 支持: 微信小程序、H5、App
└─ Vue 开发体验
```

#### 主要页面
- 登录/注册 (扫码登录 + 手机号登录)
- 首页/仪表板
- 交易记录
- 资产列表
- 统计报表
- 我的页面

#### 微信特定功能
- 微信登录 (openid/unionid)
- 微信支付 (可选)
- 微信分享
- 后台推送通知
- 离线能力

**预计工时**: 20-25 小时
**优先级**: 🔴 高

---

### Phase 7: 测试和优化 (⏳ 待开始)

#### 7.1 后端测试
- 单元测试
- 集成测试
- 性能测试
- 安全测试

#### 7.2 Web 测试
- 功能测试
- 浏览器兼容性测试
- 响应式测试
- 性能优化

#### 7.3 小程序测试
- 功能测试
- 微信开发者工具测试
- 真机测试
- 性能优化
- 包体积优化

#### 7.4 集成测试
- 三端 API 调用测试
- 用户流程测试
- 登录/登出流程
- 数据同步测试

**预计工时**: 15-20 小时
**优先级**: 🟡 中等

---

### Phase 8: 上线准备 (⏳ 待开始)

#### 8.1 Web 上线
- Vercel/Netlify 部署
- 域名配置
- HTTPS 证书
- CDN 加速

#### 8.2 小程序上线
- 微信小程序开发者认证
- 提交微信审核
- 应用市场上线
- 版本管理

#### 8.3 后端生产化
- 数据库备份策略
- 监控告警
- 日志系统
- 容量规划

#### 8.4 文档和支持
- 用户手册
- API 文档
- 常见问题
- 反馈渠道

**预计工时**: 8-12 小时
**优先级**: 🔴 高

---

## 📊 时间规划

### 总体工时估算

| Phase | 内容 | 预计工时 | 并行 |
|-------|------|---------|------|
| 1-4 | 基础设施 | 8h | - |
| 5 | 后端 API | 16-20h | - |
| 6A | Web 开发 | 20-25h | ✓ 可与 6B 并行 |
| 6B | 小程序开发 | 20-25h | ✓ 可与 6A 并行 |
| 7 | 测试优化 | 15-20h | - |
| 8 | 上线准备 | 8-12h | - |
| **总计** | | **87-120h** | **可缩短至 70-100h** |

### 每周目标

**Week 1 (现在)**: Phase 5 - 后端 API (16-20h)
- 数据库设计
- 用户认证 API
- 交易 CRUD API
- 统计报表 API
- 基础测试

**Week 2-3**: Phase 6A + 6B (并行开发)
- Web 应用开发 (20-25h)
- 小程序开发 (20-25h)

**Week 4-5**: Phase 7 - 测试 (15-20h)
- 三端测试
- 性能优化
- 集成测试

**Week 6**: Phase 8 - 上线 (8-12h)
- 部署上线
- 审核提交
- 用户反馈

**总计**: 10-12 周

---

## 🎯 小程序的关键决策

### 1. 技术框架选择

#### 方案A: 原生小程序 ✅ (推荐初期)
**优点**:
- 官方支持
- 文档完善
- 性能最好
- 审核通过快

**缺点**:
- Web 代码无法复用
- 开发工作量大

#### 方案B: Taro 框架 ✅ (长期推荐)
**优点**:
- 代码可复用
- 一套代码多端
- 可部署 H5 版本
- 开发效率高

**缺点**:
- 学习曲线
- 可能有兼容性问题

#### 方案C: uni-app
**优点**:
- 支持多端
- Vue 开发体验
- 社区活跃

**缺点**:
- 与 React Web 技术栈不一致

**建议**:
- 短期: 原生小程序 (快速上线)
- 长期: Taro 框架 (代码复用)

---

### 2. 微信登录方案

```
用户进入小程序
    ↓
微信登录 (wx.login)
    ↓
获取 code
    ↓
发送 code 到后端 (/api/auth/wechat)
    ↓
后端调用微信 API 获取 openid
    ↓
创建或更新用户
    ↓
返回 JWT token
    ↓
小程序存储 token (本地存储)
    ↓
调用其他 API 时附带 token
```

#### 需要添加的 API
```
POST /api/auth/wechat
{
  "code": "微信登录 code"
}
返回:
{
  "token": "jwt_token",
  "user": { ... }
}
```

---

### 3. 小程序需要的额外功能

#### 微信特定 API
- `wx.login()` - 登录
- `wx.getUserProfile()` - 获取用户信息 (需授权)
- `wx.getPhoneNumber()` - 获取电话号码
- `wx.requestPayment()` - 微信支付 (可选)
- `wx.showToast()` / `wx.showLoading()` - 提示
- `wx.navigateTo()` - 页面跳转
- `wx.storage` - 本地存储

#### 后端需要支持
- 微信登录接口
- 微信支付接口 (如果需要)
- 推送通知 (服务器->小程序)

---

### 4. 小程序目录结构示例

```
miniprogram/
├── pages/
│   ├── index/              首页/仪表板
│   ├── login/              登录页
│   ├── transactions/       交易列表
│   ├── add-transaction/    添加交易
│   ├── assets/             资产管理
│   ├── reports/            统计报表
│   ├── profile/            个人信息
│   └── settings/           设置
├── components/
│   ├── nav-bar/            导航栏
│   ├── transaction-item/   交易列表项
│   ├── chart/              图表组件
│   └── ...
├── api/                    API 调用
├── utils/                  工具函数
├── styles/                 全局样式
├── app.js                  应用入口
├── app.json                应用配置
└── app.wxss                应用样式
```

---

## 📋 关键问题

### 1. 是否需要微信支付？
- 如果是免费应用: 不需要
- 如果有付费功能: 需要集成微信支付

**建议**: MVP 不包含支付功能

### 2. 是否需要后台推送？
- 用户端: 可以使用微信通知
- 后端: 可选配置消息推送

**建议**: MVP 不包含推送

### 3. 用户数据如何同步？
- Web 和小程序使用相同的后端 API
- 登录后获得相同的 token
- 数据实时同步

### 4. 什么时候上线小程序？
- MVP: 先完成后端和 Web
- 然后开发小程序
- 小程序审核通过后上线

---

## 🚀 完整的交付物

### 后端 (Railway)
```
https://yaofire.up.railway.app/api/
├── 用户认证 API
├── 交易管理 API
├── 资产管理 API
├── 统计报表 API
└── 数据库 (PostgreSQL)
```

### Web 应用 (Vercel/Netlify)
```
https://wealth-tracker.vercel.app/
├── 登录/注册页面
├── 仪表板
├── 交易管理
├── 资产管理
├── 统计报表
└── 用户设置
```

### 微信小程序
```
微信小程序 - Wealth Tracker
├── 登录/注册
├── 首页仪表板
├── 交易管理
├── 资产管理
├── 统计报表
└── 个人信息
```

---

## 📈 发布顺序

### 第一个 Release (MVP)
1. ✅ 后端 API (Phase 5)
2. ✅ Web 应用 (Phase 6A)
3. 📝 基础测试 (部分 Phase 7)
4. 📝 文档 (部分 Phase 8)

**时间**: 4-5 周

### 第二个 Release (小程序)
5. ✅ 微信小程序 (Phase 6B)
6. ✅ 完整测试 (Phase 7)
7. ✅ 微信审核和上线 (Phase 8)

**时间**: 2-3 周

### 后续 Release
- 支付功能
- 分享功能
- 数据导出
- 高级分析

---

## 🎯 成功标准

### MVP 成功标准
- ✅ 后端 API 完整 (所有端点)
- ✅ Web 应用可用 (主要功能)
- ✅ 能正常部署到 Railway
- ✅ 能正常部署到 Vercel
- ✅ 70%+ 测试覆盖率
- ✅ 完整的 API 文档

### 小程序成功标准
- ✅ 所有页面实现
- ✅ 通过微信审核
- ✅ 用户可正常使用
- ✅ 数据与 Web 同步
- ✅ 性能良好 (包体积 < 2MB)

---

## 📚 参考资源

### 微信小程序
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [Taro 官方文档](https://taro.jd.com/)
- [微信登录流程](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)

### 框架和工具
- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) - 微信开发者工具
- [Taro CLI](https://taro.jd.com/docs/GETTING-STARTED) - Taro 命令行工具

---

## 🎉 总结

你的最终目标是:
1. **后端**: Node.js API (Railway)
2. **Web**: React 应用 (Vercel/Netlify)
3. **小程序**: 微信小程序 (微信服务器)

总工作量: **87-120 小时** (可优化至 70-100 小时)
总耗时: **10-12 周**

**下一步**: 立即开始 Phase 5 - 后端 API 开发！

---

**问题?**
- 需要详细的小程序开发指南吗？
- 需要修改技术选型吗？
- 需要调整工作量估算吗？
