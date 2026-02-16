const app = getApp()

Page({
  data: {
    email: '',
    password: '',
    name: '',
    showRegister: false,
    loading: false,
    error: '',
  },

  // 切换登录/注册
  toggleMode() {
    this.setData({
      showRegister: !this.data.showRegister,
      email: '',
      password: '',
      name: '',
      error: '',
    })
  },

  // 输入框事件
  handleEmailChange(e) {
    this.setData({ email: e.detail.value })
  },

  handlePasswordChange(e) {
    this.setData({ password: e.detail.value })
  },

  handleNameChange(e) {
    this.setData({ name: e.detail.value })
  },

  // 登录
  async handleLogin() {
    const { email, password } = this.data

    if (!email || !password) {
      this.setData({ error: '邮箱和密码不能为空' })
      return
    }

    this.setData({ loading: true, error: '' })

    try {
      const response = await app.request('/auth/login', {
        method: 'POST',
        data: { email, password },
      })

      if (response.success) {
        const { token, user } = response.data
        // 保存 token 和用户信息
        wx.setStorageSync('authToken', token)
        wx.setStorageSync('userInfo', user)
        app.globalData.authToken = token
        app.globalData.userInfo = user

        wx.switchTab({ url: '/pages/index/index' })
      }
    } catch (error) {
      this.setData({ error: error.message })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 注册
  async handleRegister() {
    const { email, password, name } = this.data

    if (!email || !password || !name) {
      this.setData({ error: '所有字段都不能为空' })
      return
    }

    this.setData({ loading: true, error: '' })

    try {
      const response = await app.request('/auth/register', {
        method: 'POST',
        data: { email, password, name },
      })

      if (response.success) {
        const { token, user } = response.data
        wx.setStorageSync('authToken', token)
        wx.setStorageSync('userInfo', user)
        app.globalData.authToken = token
        app.globalData.userInfo = user

        wx.switchTab({ url: '/pages/index/index' })
      }
    } catch (error) {
      this.setData({ error: error.message })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 微信一键登录（小程序推荐方式）
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
        throw new Error('获取 code 失败')
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

        wx.switchTab({ url: '/pages/index/index' })
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      this.setData({ error: error.message || '微信登录失败，请重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('authToken')
    if (token) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },
})
