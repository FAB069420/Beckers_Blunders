import { useState, useEffect } from 'react'
import './App.css'
import CryptoChart from './components/CryptoChart'
import AdminPanel from './components/AdminPanel'
import CoinSelector from './components/CoinSelector'

// Check if admin mode is enabled (only in development)
const isAdminMode = import.meta.env.VITE_ADMIN_MODE === 'true'

function App() {
  const [selectedCoin, setSelectedCoin] = useState('DSYNC')
  const [coins, setCoins] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdmin, setShowAdmin] = useState(false)

  // Load data from static JSON files on mount
  useEffect(() => {
    // In development mode, check localStorage first
    if (isAdminMode) {
      const savedPredictions = localStorage.getItem('crypto-predictions')
      const savedCoins = localStorage.getItem('crypto-coins')

      if (savedPredictions || savedCoins) {
        // Load from localStorage if available
        if (savedPredictions) setPredictions(JSON.parse(savedPredictions))
        if (savedCoins) setCoins(JSON.parse(savedCoins))
        setLoading(false)
        return
      }
    }

    // Otherwise load from JSON files
    Promise.all([
      fetch('/data/predictions.json').then(r => r.json()),
      fetch('/data/coins.json').then(r => r.json())
    ])
      .then(([predictionsData, coinsData]) => {
        setPredictions(predictionsData)
        setCoins(coinsData)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading data:', error)
        alert('❌ Failed to load data. Please check that the JSON files exist in /public/data/')
        setLoading(false)
      })
  }, [])

  // Save to localStorage in development mode whenever data changes
  useEffect(() => {
    if (isAdminMode && predictions.length > 0) {
      localStorage.setItem('crypto-predictions', JSON.stringify(predictions))
    }
  }, [predictions])

  useEffect(() => {
    if (isAdminMode && coins.length > 0) {
      localStorage.setItem('crypto-coins', JSON.stringify(coins))
    }
  }, [coins])

  const addPrediction = (newPrediction) => {
    const prediction = {
      ...newPrediction,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    setPredictions([...predictions, prediction])
  }

  const updatePrediction = (id, updatedData) => {
    setPredictions(predictions.map(p =>
      p.id === id ? { ...p, ...updatedData } : p
    ))
  }

  const deletePrediction = (id) => {
    if (confirm('Are you sure you want to delete this prediction?')) {
      setPredictions(predictions.filter(p => p.id !== id))
    }
  }

  const addCoin = (newCoin) => {
    setCoins([...coins, { ...newCoin, id: newCoin.ticker }])
  }

  const exportData = () => {
    const data = {
      coins,
      predictions,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crypto-predictions-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    console.log('\n📋 DEPLOYMENT INSTRUCTIONS:\n')
    console.log('1. Copy the "predictions" array from the downloaded JSON file')
    console.log('2. Paste it into public/data/predictions.json')
    console.log('3. Commit and push to GitHub → auto-deploys to Netlify!')
    console.log('\nSee DEPLOYMENT.md for full instructions.\n')
  }

  const currentCoinPredictions = predictions.filter(p => p.coin === selectedCoin)

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="title">Becker's Blunders</h1>
          <p className="subtitle">I hope this website prevents someone from being scammed by these crypto KOL influencer scammers</p>
        </div>
        <div className="header-actions">
          {isAdminMode && (
            <>
              <button className="export-button" onClick={exportData}>
                💾 Export Data
              </button>
              <button
                className="admin-toggle"
                onClick={() => setShowAdmin(!showAdmin)}
              >
                {showAdmin ? 'Hide Admin' : 'Show Admin'}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="main-content">
        <CoinSelector
          coins={coins}
          selectedCoin={selectedCoin}
          onSelectCoin={setSelectedCoin}
        />

        <CryptoChart
          coin={selectedCoin}
          predictions={currentCoinPredictions}
          coinColor={coins.find(c => c.id === selectedCoin)?.color}
          onUpdatePrediction={isAdminMode ? updatePrediction : null}
          onDeletePrediction={isAdminMode ? deletePrediction : null}
        />

        {isAdminMode && showAdmin && (
          <AdminPanel
            coins={coins}
            selectedCoin={selectedCoin}
            onAddPrediction={addPrediction}
            onAddCoin={addCoin}
          />
        )}
      </div>
    </div>
  )
}

export default App
