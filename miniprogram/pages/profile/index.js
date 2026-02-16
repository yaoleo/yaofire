Page({
  data: { userInfo: {} },
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo: userInfo || {} })
  },
  handleLogout() {
    wx.showModal({ title: '确认登出？', success: (res) => {
      if (res.confirm) {
        wx.removeStorageSync('authToken')
        wx.removeStorageSync('userInfo')
        wx.reLaunch({ url: '/pages/login/index' })
      }
    } })
  },
})
