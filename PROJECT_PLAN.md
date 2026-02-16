# 📊 Stock Price Tracker - 项目规划

## 🎯 项目目标
开发一个通用的股票价格趋势跟踪小程序，自动追踪 10 只热门股票的价格走势，提供实时数据和历史图表。

---

## 📱 整体架构

```
┌─────────────────────────────────────────────────────┐
│                  WeChat Mini Program                 │
│  (React Native / Native WeChat Framework)           │
│  - 首页: 10 只股票列表 + 实时价格                      │
│  - 详情页: 股票走势图 + 历史数据                       │
│  - 搜索页: 搜索其他股票                                │
└────────────────────────────────────────────────────────┘
                            ↓ HTTPS API
┌─────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)             │
│  - GET /api/stocks - 获取 10 只热门股票             │
│  - GET /api/stocks/:symbol - 获取单只股票详情      │
│  - GET /api/stocks/:symbol/history - 获取历史数据  │
│  - POST /api/stocks/add - 添加到关注列表            │
└────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────┐
│            External API (Alpha Vantage)             │
│  - 实时股票价格数据                                   │
│  - 历史日线数据                                       │
│  - 技术指标数据                                       │
└────────────────────────────────────────────────────────┘
```

---

## 🛠 技术栈

| 模块 | 技术 | 备注 |
|------|------|------|
| **小程序** | WeChat Mini Program (原生) | 已有框架 |
| **后端** | Node.js + Express + PostgreSQL | 已有基础 |
| **数据来源** | Alpha Vantage API | 免费，美股数据 |
| **缓存** | Redis (可选) | 减少 API 调用 |
| **图表** | ECharts / Chart.js | 前端展示 |

---

## 📋 项目阶段

### **Phase 1: 数据库设计** ✅ 完成
- [x] 分析需求
- [x] 设计 stocks 表（股票基础信息）
- [x] 设计 stock_prices 表（价格历史）
- [x] 设计 stock_sync_logs 表（API同步日志）
- [x] 创建索引和视图
- [x] 添加 10 只默认股票数据

### **Phase 2: 后端 API 开发** ✅ 完成
- [x] 集成 Alpha Vantage API (alphavantage.js)
- [x] 实现 GET /api/stocks 端点 (获取10只默认股票)
- [x] 实现 GET /api/stocks/:symbol 端点 (单只股票详情)
- [x] 实现 GET /api/stocks/:symbol/history 端点 (历史数据)
- [x] 实现 GET /api/stocks/stats/gainers 端点 (涨幅排行)
- [x] 创建数据同步服务 (stockSync.js)
- [x] 定时任务：每天 9:30 AM UTC 更新数据
- [x] API 速率限制和错误处理
- [x] 集成到主服务器

### **Phase 3: 小程序 UI 开发** 🔄 进行中 (60%)
- [x] 首页: 10 只股票列表
  - [x] 显示: 股票名称、代码、当前价格、涨跌幅（绿/红色）
  - [x] 支持: 点击查看详情
  - [x] 下拉刷新功能
  - [x] 涨幅排行按钮
- [ ] 详情页: 单只股票详情
  - [ ] 显示: 实时价格、涨跌、日期
  - [ ] 图表: 30天走势图
- [ ] 完善首页样式和交互
- [ ] 添加加载动画和错误处理

### **Phase 4: 数据可视化** ⏳ 待开始
- [ ] 集成图表库（ECharts）
- [ ] 实现 K 线图
- [ ] 实现趋势线图
- [ ] 实现对比功能（多只股票对比）

### **Phase 5: 优化和部署** ⏳ 待开始
- [ ] 性能优化
- [ ] 错误处理和异常恢复
- [ ] 用户隐私保护
- [ ] 部署到 Railway
- [ ] 小程序发布审核

### **Phase 6: 扩展功能** ⏳ 待开始
- [ ] 添加提醒功能（价格达到某个值时提醒）
- [ ] 添加自定义列表功能
- [ ] 添加对比分析功能
- [ ] 支持港股、A股等其他市场

---

## 📊 默认追踪的 10 只美股

| 代码 | 公司 | 行业 |
|------|------|------|
| AAPL | Apple | 科技 |
| MSFT | Microsoft | 科技 |
| GOOGL | Google | 科技 |
| AMZN | Amazon | 电商 |
| NVDA | NVIDIA | 芯片 |
| TSLA | Tesla | 汽车 |
| META | Meta | 社交媒体 |
| NFLX | Netflix | 流媒体 |
| UBER | Uber | 出行 |
| JPM | JPMorgan | 金融 |

---

## 🚀 当前进度

**总完成度**: 40% (2/6 阶段完成 + Phase 3 进行中)

```
Phase 1: ██████████████████░░ 100% ✅ 完成
Phase 2: ██████████████████░░ 100% ✅ 完成
Phase 3: ███████████░░░░░░░░░  60% ⏳ 进行中
Phase 4: ░░░░░░░░░░░░░░░░░░░░   0%
Phase 5: ░░░░░░░░░░░░░░░░░░░░   0%
Phase 6: ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 📝 更新日志

### 2026-02-16 - Phase 3 进行中 🔄
- ✅ **Phase 3: 小程序 UI 开发 (60% 完成)**
  - 重新设计小程序为股票追踪版本
  - 完成首页：显示 10 只股票实时价格
    * 股票列表：代码、名称、行业、当前价格、涨跌幅
    * 颜色区分：绿色上升 (+)，红色下跌 (-)
    * 下拉刷新功能
    * 点击股票进入详情页
  - 涨幅排行功能（弹窗显示）
  - 简化 app.json：只保留 2 个核心页面
  - 现代化样式设计
- ⏳ 下一步: 完成股票详情页（走势图）

### 2026-02-16 - Phase 2 完成 ✅
- ✅ **Phase 2: 后端 API 开发完成**
  - 创建 alphavantage.js (Alpha Vantage API 集成，包含速率限制)
  - 创建 stockSync.js (自动每日数据同步)
  - 创建 stocks.js 路由 (5 个 API 端点)
    * GET /api/stocks - 获取 10 只默认股票
    * GET /api/stocks/:symbol - 单只股票详情 + 30 天历史
    * GET /api/stocks/:symbol/history - 分页历史数据
    * GET /api/stocks/stats/gainers - 涨幅排行
  - 更新主服务器配置
  - API 连接测试和验证
  - 生产环境自动同步调度
- ⏳ 下一步: Phase 3 - 小程序 UI 开发

### 2026-02-16 - Phase 1 完成 ✅
- ✅ 项目规划完成
- ✅ 技术栈确定 (Alpha Vantage + Node.js + WeChat Mini Program)
- ✅ 创建 PROJECT_PLAN.md
- ✅ **Phase 1: 数据库设计完成**
  - 创建 stocks 表（10 只默认股票）
  - 创建 stock_prices 表（价格历史）
  - 创建 stock_sync_logs 表（API 同步日志）
  - 创建 4 个分析视图
  - 创建初始化脚本 init-stock-db.js

---

## 🔗 相关链接

- **GitHub**: https://github.com/yaoleo/yaofire
- **Railway**: https://yaofire.up.railway.app
- **Alpha Vantage**: https://www.alphavantage.co
- **小程序 AppID**: wxbd7d411ce0f83e74

---

## 💡 关键决策

1. ✅ **数据源**: Alpha Vantage（免费，美股）
2. ✅ **默认列表**: 10 只科技和热门股票
3. ✅ **无需登录**: 所有用户直接访问（匿名使用）
4. ✅ **缓存策略**: 每天 9:30 AM UTC 自动更新一次
5. ⏳ **图表库**: 待选择 (ECharts / Chart.js)

---

## 🔑 必需的配置步骤

### 1️⃣ 获取 Alpha Vantage API Key
```
1. 访问 https://www.alphavantage.co
2. 点击 "GET FREE API KEY"
3. 填写邮箱，立即获得免费 API Key
4. 限制: 5 次/分钟, 500 次/天 (免费版足够用)
```

### 2️⃣ 配置 Railway 环境变量
在 Railway 后端服务的 Variables 中添加：
```
ALPHA_VANTAGE_API_KEY=<你获得的API密钥>
```

### 3️⃣ 初始化股票数据库（可选）
如果需要手动初始化，运行：
```bash
cd wealth-tracker/server
DATABASE_URL=<你的数据库连接字符串> node init-stock-db.js
```

---

## 📊 API 端点文档

### 获取默认 10 只股票
```
GET /api/stocks

响应示例:
{
  "success": true,
  "data": {
    "stocks": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "currentPrice": 150.25,
        "changePercent": 2.5,
        "lastUpdateDate": "2026-02-16"
      }
    ],
    "count": 10
  }
}
```

### 获取单只股票详情 + 30 天历史
```
GET /api/stocks/AAPL

响应: 包含最新价格和过去 30 天的日线数据
```

### 获取分页历史数据
```
GET /api/stocks/AAPL/history?days=90&page=1

查询参数:
- days: 查询天数 (1-365)
- page: 页码 (默认 1)
```

### 获取涨幅排行
```
GET /api/stocks/stats/gainers

返回今日涨幅最大的 10 只股票
```
