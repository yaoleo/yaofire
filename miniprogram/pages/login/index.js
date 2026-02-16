const app = getApp()

Page({
  data: {
    loading: false,
    error: '',
  },

  // 微信一键登录
  async handleWechatLogin() {
    this.setData({ loading: true, error: '' })

    try {
      // 第一步：获取微信登录 code
      const codeRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject,
        })
      })

      if (!codeRes.code) {
        throw new Error('获取微信 code 失败')
      }

      // 第二步：用 code 交换 token
      const response = await app.request('/auth/wechat', {
        method: 'POST',
        data: { code: codeRes.code },
      })

      if (response.success) {
        const { token, user } = response.data
        wx.setStorageSync('authToken', token)
        wx.setStorageSync('userInfo', user)
        app.globalData.authToken = token
        app.globalData.userInfo = user

        // 登录成功，跳到首页
        wx.switchTab({ url: '/pages/index/index' })
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      this.setData({ error: error.message || '登录失败，请重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('authToken')
    if (token) {
      // 如果已有 token，直接跳到首页
      wx.switchTab({ url: '/pages/index/index' })
    }
  },
})
