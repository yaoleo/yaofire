import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [assets, setAssets] = useState([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  // 从 localStorage 加载数据
  useEffect(() => {
    const saved = localStorage.getItem('wealthData')
    if (saved) {
      try {
        setAssets(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load data:', e)
      }
    }
  }, [])

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('wealthData', JSON.stringify(assets))
  }, [assets])

  // 添加资产
  const handleAddAsset = () => {
    if (name.trim() && amount.trim()) {
      const newAsset = {
        id: Date.now(),
        name: name.trim(),
        amount: parseFloat(amount),
        date: new Date().toLocaleDateString('zh-CN')
      }
      setAssets([...assets, newAsset])
      setName('')
      setAmount('')
    }
  }

  // 删除资产
  const handleDeleteAsset = (id) => {
    setAssets(assets.filter(asset => asset.id !== id))
  }

  // 计算总资产
  const totalWealth = assets.reduce((sum, asset) => sum + asset.amount, 0)

  // 按金额排序（从大到小）
  const sortedAssets = [...assets].sort((a, b) => b.amount - a.amount)

  return (
    <div className="app">
      <header className="header">
        <h1>💰 个人财富管理</h1>
        <p>记录你的财富自由之路</p>
      </header>

      <main className="container">
        {/* 总资产卡片 */}
        <div className="wealth-card">
          <h2>总资产</h2>
          <div className="wealth-amount">
            ¥ {totalWealth.toFixed(2)}
          </div>
          <p className="wealth-info">
            {assets.length} 项资产
          </p>
        </div>

        {/* 添加资产表单 */}
        <div className="form-card">
          <h3>添加新资产</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="资产名称（如：银行卡、房产、股票...）"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddAsset()}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="金额"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddAsset()}
            />
          </div>
          <button className="btn-primary" onClick={handleAddAsset}>
            添加资产
          </button>
        </div>

        {/* 资产列表 */}
        <div className="list-card">
          <h3>资产列表</h3>
          {sortedAssets.length === 0 ? (
            <p className="empty-message">还没有添加任何资产，开始记录你的财富吧！</p>
          ) : (
            <ul className="asset-list">
              {sortedAssets.map((asset, index) => (
                <li key={asset.id} className="asset-item">
                  <div className="asset-info">
                    <div className="asset-rank">#{index + 1}</div>
                    <div className="asset-details">
                      <div className="asset-name">{asset.name}</div>
                      <div className="asset-date">{asset.date}</div>
                    </div>
                  </div>
                  <div className="asset-right">
                    <div className="asset-amount">¥ {asset.amount.toFixed(2)}</div>
                    <div className="asset-percentage">
                      {((asset.amount / totalWealth) * 100).toFixed(1)}%
                    </div>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteAsset(asset.id)}
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
