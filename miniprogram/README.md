# 财富追踪 - 微信小程序

## 项目结构

```
miniprogram/
├── pages/              # 小程序页面
│   ├── login/         # 登录页
│   ├── index/         # 首页仪表板
│   ├── transactions/  # 交易管理
│   ├── assets/        # 资产管理
│   ├── reports/       # 数据报表
│   └── profile/       # 个人信息
├── app.js             # 应用主文件
├── app.json           # 应用配置
├── app.wxss           # 全局样式
└── sitemap.json       # SEO 配置
```

## 快速开始

### 1. 下载微信开发者工具
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 2. 导入项目
- 打开微信开发者工具
- 选择"本地项目"
- 导入此目录

### 3. 修改配置
编辑 `app.js` 中的 `baseUrl`:
```javascript
baseUrl: 'http://localhost:3001/api'  // 本地开发
// baseUrl: 'https://api.example.com/api'  // 生产环境
```

### 4. 预览/真机测试
- 开发者工具中点击"预览"
- 或点击"真机调试"进行真机测试

## 功能特性

- ✅ 微信一键登录
- ✅ 用户认证
- ✅ 交易管理（增删改查）
- ✅ 资产管理
- ✅ 数据统计和报表
- ✅ 下拉刷新
- ✅ 底部导航栏

## API 集成

所有 API 请求已通过 `app.js` 中的 `request` 方法封装，自动处理：
- JWT token 管理
- 错误处理
- 请求头配置

## 开发建议

### 页面开发流程
1. 创建页面目录
2. 创建 4 个文件：`index.wxml`, `index.js`, `index.json`, `index.wxss`
3. 在 `app.json` 中注册页面

### 调试技巧
- 使用开发者工具的"调试模式"
- 查看"Console"标签的日志
- 使用"Storage"标签查看本地存储

### 性能优化
- 使用图片压缩
- 避免在页面中进行大量计算
- 合理使用 `wx:if` 和 `wx:for`

## 注意事项

1. **域名白名单**: 在微信公众平台配置请求域名
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **请求签名**: 如果使用微信支付，需要配置签名
4. **隐私政策**: 发布前需要制定隐私政策

## 发布步骤

1. 编辑 `app.json` 中的版本号
2. 在微信开发者工具上传代码
3. 进入微信公众平台审核管理
4. 提交审核
5. 审核通过后发布

## 联系方式

有问题？查看微信小程序官方文档：
https://developers.weixin.qq.com/miniprogram/dev/
