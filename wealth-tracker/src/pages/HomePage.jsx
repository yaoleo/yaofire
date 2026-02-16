import { useState, useEffect } from 'react'
import { reportAPI } from '../api/client'
import './HomePage.css'

export default function HomePage({ user, onLogout }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await reportAPI.getSummary()
        if (response.success) {
          setSummary(response.data.summary)
        }
      } catch (error) {
        console.error('获取统计失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>💰 财富追踪</h1>
        <button className="btn-logout" onClick={onLogout}>
          登出
        </button>
      </header>

      <main className="home-main">
        <div className="user-info">
          <p>欢迎，<strong>{user?.name || user?.email}</strong></p>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : summary ? (
          <div className="stats">
            <div className="stat-card income">
              <h3>收入</h3>
              <p className="amount">¥{summary.income?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-card expense">
              <h3>支出</h3>
              <p className="amount">¥{summary.expense?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-card net">
              <h3>净额</h3>
              <p className="amount">¥{summary.net?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        ) : (
          <div className="no-data">还没有交易数据</div>
        )}

        <div className="tips">
          <p>✅ 后端 API 连接成功！</p>
          <p>🚀 Web 验证完成，开始小程序开发</p>
        </div>
      </main>
    </div>
  )
}
