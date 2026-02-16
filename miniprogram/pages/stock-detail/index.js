// 股票详情页

const app = getApp()

Page({
  data: {
    symbol: '',
    stock: null,
    latestPrice: null,
    history: [],
    loading: true,
    error: '',
  },

  onLoad(options) {
    const symbol = options.symbol

    if (!symbol) {
      this.setData({ error: '股票代码错误' })
      return
    }

    this.setData({ symbol })
    this.loadDetail()
  },

  // 加载详情
  async loadDetail() {
    this.setData({ loading: true, error: '' })

    try {
      const response = await app.stocks.getDetail(this.data.symbol)

      const data = response.data
      this.setData({
        stock: data.stock,
        latestPrice: data.latestPrice,
        history: data.history,
        loading: false
      })

      // 更新页面标题
      wx.setNavigationBarTitle({
        title: this.data.symbol
      })

      console.log('✅ 加载详情成功:', this.data.symbol)
    } catch (error) {
      console.error('❌ 加载失败:', error)
      this.setData({
        error: error.message || '加载失败',
        loading: false
      })
    }
  },

  // 重试
  loadDetail() {
    this.loadDetail()
  },
})
