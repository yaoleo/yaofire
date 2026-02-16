// API 客户端
// 与后端通信的核心模块

// 使用线上后端 API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://yaofire.up.railway.app/api';

// 存储 token
let authToken = localStorage.getItem('authToken') || null;

// 设置 token
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// 获取 token
export const getAuthToken = () => authToken;

// API 请求函数
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 添加授权 token
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
};

// ============================================
// 认证 API
// ============================================

export const authAPI = {
  // 注册
  register: (email, password, name) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  // 登录
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // 获取个人信息
  getProfile: () => apiRequest('/auth/profile'),

  // 微信登录
  wechatLogin: (code) =>
    apiRequest('/auth/wechat', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  // 登出
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

// ============================================
// 交易 API
// ============================================

export const transactionAPI = {
  // 获取列表
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/transactions?${query}`);
  },

  // 创建
  create: (data) =>
    apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id, data) =>
    apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id) =>
    apiRequest(`/transactions/${id}`, {
      method: 'DELETE',
    }),

  // 获取分类
  getCategories: (type) =>
    apiRequest(`/transactions/categories/list${type ? `?type=${type}` : ''}`),
};

// ============================================
// 资产 API
// ============================================

export const assetAPI = {
  // 获取列表
  getList: () => apiRequest('/assets'),

  // 创建
  create: (data) =>
    apiRequest('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (id, data) =>
    apiRequest(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除
  delete: (id) =>
    apiRequest(`/assets/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// 报表 API
// ============================================

export const reportAPI = {
  // 总体统计
  getSummary: (month) =>
    apiRequest(`/reports/summary${month ? `?month=${month}` : ''}`),

  // 分类分析
  getCategory: (type) =>
    apiRequest(`/reports/category${type ? `?type=${type}` : ''}`),

  // 趋势
  getTrend: (period = 'month') =>
    apiRequest(`/reports/trend?period=${period}`),
};
