const app = getApp()

Page({
  data: {
    userInfo: {},
    summary: null,
    recentTransactions: [],
    loading: true,
  },

  onLoad() {
    this.checkAuth()
    this.loadData()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData(() => {
      wx.stopPullDownRefresh()
    })
  },

  checkAuth() {
    const token = wx.getStorageSync('authToken')
    if (!token) {
      wx.reLaunch({ url: '/pages/login/index' })
      return
    }

    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo: userInfo || {} })
  },

  async loadData(callback) {
    try {
      // 获取统计数据
      const summaryRes = await app.request('/reports/summary')
      if (summaryRes.success) {
        const { income, expense, net } = summaryRes.data.summary
        this.setData({
          summary: {
            income: income?.toFixed(2) || '0.00',
            expense: expense?.toFixed(2) || '0.00',
            net: net?.toFixed(2) || '0.00',
          },
        })
      }

      // 获取最近交易
      const transRes = await app.request('/transactions?limit=5&sort=created_at&order=DESC')
      if (transRes.success) {
        this.setData({
          recentTransactions: transRes.data.transactions.slice(0, 5),
        })
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      this.setData({ loading: false })
      if (callback) callback()
    }
  },

  // 导航方法
  goToAddTransaction() {
    wx.navigateTo({ url: '/pages/transactions/add' })
  },

  goToTransactions() {
    wx.switchTab({ url: '/pages/transactions/index' })
  },

  goToAssets() {
    wx.switchTab({ url: '/pages/assets/index' })
  },

  goToReports() {
    wx.switchTab({ url: '/pages/reports/index' })
  },
})
