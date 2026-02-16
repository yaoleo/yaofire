// 小程序应用主文件

App({
  globalData: {
    baseUrl: 'http://localhost:3001/api',
    // 生产环境改为: 'https://api.example.com/api'
    authToken: wx.getStorageSync('authToken') || null,
    userInfo: wx.getStorageSync('userInfo') || null,
  },

  onLaunch() {
    console.log('🚀 小程序启动')

    // 检查登录状态
    const token = wx.getStorageSync('authToken')
    if (token) {
      this.globalData.authToken = token
      // 验证 token 是否有效
      this.validateToken()
    }
  },

  validateToken() {
    const token = this.globalData.authToken
    if (!token) return

    wx.request({
      url: `${this.globalData.baseUrl}/auth/profile`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res) => {
        if (res.data.success) {
          this.globalData.userInfo = res.data.data.user
          wx.setStorageSync('userInfo', res.data.data.user)
        } else {
          this.logout()
        }
      },
      fail: (err) => {
        console.error('Token 验证失败:', err)
        this.logout()
      },
    })
  },

  logout() {
    this.globalData.authToken = null
    this.globalData.userInfo = null
    wx.removeStorageSync('authToken')
    wx.removeStorageSync('userInfo')
  },

  // API 请求方法
  request(url, options = {}) {
    const fullUrl = `${this.globalData.baseUrl}${url}`
    const header = {
      'Content-Type': 'application/json',
      ...options.header,
    }

    if (this.globalData.authToken) {
      header.Authorization = `Bearer ${this.globalData.authToken}`
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: fullUrl,
        method: options.method || 'GET',
        data: options.data,
        header,
        success: (res) => {
          if (res.data.success) {
            resolve(res.data)
          } else {
            // Token 过期
            if (res.statusCode === 401) {
              this.logout()
              wx.reLaunch({ url: '/pages/login/index' })
            }
            reject(new Error(res.data.error?.message || '请求失败'))
          }
        },
        fail: (err) => {
          console.error('❌ 请求失败:', err)
          reject(err)
        },
      })
    })
  },

  // 认证相关
  auth: {
    register: (email, password, name) =>
      this.request('/auth/register', {
        method: 'POST',
        data: { email, password, name },
      }),

    login: (email, password) =>
      this.request('/auth/login', {
        method: 'POST',
        data: { email, password },
      }),

    wechatLogin: (code) =>
      this.request('/auth/wechat', {
        method: 'POST',
        data: { code },
      }),

    getProfile: () => this.request('/auth/profile'),
  },

  // 交易相关
  transaction: {
    getList: (params) => {
      const query = new URLSearchParams(params).toString()
      return this.request(`/transactions?${query}`)
    },

    create: (data) =>
      this.request('/transactions', {
        method: 'POST',
        data,
      }),

    update: (id, data) =>
      this.request(`/transactions/${id}`, {
        method: 'PUT',
        data,
      }),

    delete: (id) =>
      this.request(`/transactions/${id}`, {
        method: 'DELETE',
      }),

    getCategories: (type) =>
      this.request(`/transactions/categories/list${type ? `?type=${type}` : ''}`),
  },

  // 资产相关
  asset: {
    getList: () => this.request('/assets'),

    create: (data) =>
      this.request('/assets', {
        method: 'POST',
        data,
      }),

    update: (id, data) =>
      this.request(`/assets/${id}`, {
        method: 'PUT',
        data,
      }),

    delete: (id) =>
      this.request(`/assets/${id}`, {
        method: 'DELETE',
      }),
  },

  // 报表相关
  report: {
    getSummary: (month) =>
      this.request(`/reports/summary${month ? `?month=${month}` : ''}`),

    getCategory: (type) =>
      this.request(`/reports/category${type ? `?type=${type}` : ''}`),

    getTrend: (period = 'month') =>
      this.request(`/reports/trend?period=${period}`),
  },
})
