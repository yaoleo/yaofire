const app = getApp()
Page({
  data: { assets: [], totalValue: 0, loading: true },
  onLoad() { this.loadAssets() },
  onShow() { this.loadAssets() },
  async loadAssets() {
    try {
      const response = await app.request('/assets')
      if (response.success) {
        const assets = response.data.assets
        const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.value), 0)
        this.setData({ assets, totalValue: totalValue.toFixed(2) })
      }
    } catch (error) { console.error('加载失败:', error) }
    finally { this.setData({ loading: false }) }
  },
  goToAdd() { wx.navigateTo({ url: '/pages/assets/add' }) },
})
