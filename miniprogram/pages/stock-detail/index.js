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
      const response = await app.getStockDetail(this.data.symbol)

      const data = response.data

      // 格式化数据供模板使用
      const formattedLatestPrice = data.latestPrice ? {
        ...data.latestPrice,
        closeStr: data.latestPrice.close.toFixed(2),
        openStr: data.latestPrice.open.toFixed(2),
        highStr: data.latestPrice.high.toFixed(2),
        lowStr: data.latestPrice.low.toFixed(2),
        changePercentStr: data.latestPrice.changePercent.toFixed(2),
        volumeStr: (data.latestPrice.volume / 1000000).toFixed(1)
      } : null

      const formattedHistory = data.history.map(item => ({
        ...item,
        closeStr: item.close.toFixed(2),
        changePercentStr: item.changePercent.toFixed(2)
      }))

      this.setData({
        stock: data.stock,
        latestPrice: formattedLatestPrice,
        history: formattedHistory,
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
