// 小程序应用主文件 - 股票价格追踪

App({
  globalData: {
    baseUrl: 'https://yaofire.up.railway.app/api',
    // 本地开发: 'http://localhost:3001/api'
  },

  onLaunch() {
    console.log('🚀 股票追踪小程序启动')
  },

  // API 请求方法
  request(url, options = {}) {
    const fullUrl = `${this.globalData.baseUrl}${url}`
    const header = {
      'Content-Type': 'application/json',
      ...options.header,
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

  // 股票相关 API
  getStockList() {
    return this.request('/stocks')
  },

  getStockDetail(symbol) {
    return this.request(`/stocks/${symbol}`)
  },

  getStockHistory(symbol, days = 30, page = 1) {
    return this.request(`/stocks/${symbol}/history?days=${days}&page=${page}`)
  },

  getTopGainers() {
    return this.request('/stocks/stats/gainers')
  },
})
