const app = getApp()
Page({
  data: { summary: null, categories: [], loading: true },
  onLoad() { this.loadReports() },
  onShow() { this.loadReports() },
  async loadReports() {
    try {
      const summaryRes = await app.request('/reports/summary')
      const categoryRes = await app.request('/reports/category')
      if (summaryRes.success) {
        const s = summaryRes.data.summary
        this.setData({ summary: { income: s.income?.toFixed(2) || '0.00', expense: s.expense?.toFixed(2) || '0.00', net: s.net?.toFixed(2) || '0.00' } })
      }
      if (categoryRes.success) {
        this.setData({ categories: categoryRes.data.categories })
      }
    } catch (error) { console.error('加载失败:', error) }
    finally { this.setData({ loading: false }) }
  },
})
