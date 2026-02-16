// 首页 - 显示 10 只股票实时价格

const app = getApp()

Page({
  data: {
    stocks: [],
    loading: true,
    error: '',
    refreshing: false,
    lastUpdateTime: '',
  },

  onLoad() {
    this.loadStocks()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadStocks()
  },

  onPullDownRefresh() {
    this.loadStocks()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 加载股票列表
  async loadStocks() {
    this.setData({ loading: true, error: '' })

    try {
      const response = await app.stocks.getList()

      this.setData({
        stocks: response.data.stocks,
        lastUpdateTime: new Date(response.data.timestamp).toLocaleString('zh-CN'),
        loading: false
      })

      console.log('✅ 加载股票列表成功:', response.data.stocks.length, '只')
    } catch (error) {
      console.error('❌ 加载失败:', error)
      this.setData({
        error: error.message || '加载失败，请检查网络',
        loading: false
      })
    }
  },

  // 点击股票进入详情页
  goToDetail(event) {
    const symbol = event.currentTarget.dataset.symbol
    wx.navigateTo({
      url: `/pages/stock-detail/index?symbol=${symbol}`
    })
  },

  // 获取涨幅排行
  async showTopGainers() {
    wx.showLoading({ title: '加载中...' })

    try {
      const response = await app.stocks.getTopGainers()

      wx.hideLoading()

      // 显示涨幅排行信息
      const gainers = response.data.gainers.map(item =>
        `${item.symbol}: ${item.changePercent}%`
      ).join('\n')

      wx.showModal({
        title: '🚀 涨幅排行',
        content: gainers,
        showCancel: false,
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },
})
