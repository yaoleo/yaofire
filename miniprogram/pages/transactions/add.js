const app = getApp()
Page({
  data: {
    typeIndex: 0, types: ['支出', '收入'], amount: '', categoryIndex: 0, categories: [],
    date: new Date().toISOString().split('T')[0], description: '',
  },
  onLoad() {
    this.loadCategories()
  },
  async loadCategories() {
    try {
      const type = this.data.types[this.data.typeIndex].toLowerCase()
      const response = await app.request(`/transactions/categories/list?type=${type}`)
      if (response.success) {
        this.setData({ categories: response.data.categories })
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  },
  handleTypeChange(e) {
    this.setData({ typeIndex: e.detail.value, categoryIndex: 0 }, () => this.loadCategories())
  },
  handleAmountChange(e) { this.setData({ amount: e.detail.value }) },
  handleCategoryChange(e) { this.setData({ categoryIndex: e.detail.value }) },
  handleDateChange(e) { this.setData({ date: e.detail.value }) },
  handleDescChange(e) { this.setData({ description: e.detail.value }) },
  async handleSave() {
    if (!this.data.amount || !this.data.categories[this.data.categoryIndex]) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    try {
      const type = this.data.types[this.data.typeIndex] === '收入' ? 'income' : 'expense'
      const response = await app.request('/transactions', {
        method: 'POST',
        data: {
          type, amount: parseFloat(this.data.amount),
          category_id: this.data.categories[this.data.categoryIndex].id,
          transaction_date: this.data.date, description: this.data.description,
        },
      })
      if (response.success) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 1000)
      }
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' })
    }
  },
})
