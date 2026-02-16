const app = getApp()
Page({
  data: {
    transactions: [],
    typeIndex: 0,
    typeOptions: ['全部', '收入', '支出'],
    loading: true,
  },
  onLoad() {
    this.loadTransactions()
  },
  onShow() {
    this.loadTransactions()
  },
  async loadTransactions() {
    try {
      const response = await app.request('/transactions?limit=50')
      if (response.success) {
        this.setData({ transactions: response.data.transactions })
      }
    } catch (error) {
      console.error('加载失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },
  handleTypeChange(e) {
    this.setData({ typeIndex: e.detail.value })
  },
  goToAdd() {
    wx.navigateTo({ url: '/pages/transactions/add' })
  },
})
