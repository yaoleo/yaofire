import { useState, useEffect } from 'react'
import './App.css'
import { authAPI, setAuthToken, getAuthToken, reportAPI } from './api/client'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 检查是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          const response = await authAPI.getProfile()
          if (response.success) {
            setUser(response.data.user)
            setIsLoggedIn(true)
          }
        } catch (error) {
          console.error('验证失败:', error)
          setAuthToken(null)
          setIsLoggedIn(false)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogin = (user, token) => {
    setAuthToken(token)
    setUser(user)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setAuthToken(null)
    setUser(null)
    setIsLoggedIn(false)
  }

  if (loading) {
    return <div className="app"><div className="loading">加载中...</div></div>
  }

  return (
    <div className="app">
      {isLoggedIn ? (
        <HomePage user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
