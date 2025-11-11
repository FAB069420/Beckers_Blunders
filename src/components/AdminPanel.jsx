import { useState, useEffect } from 'react'
import './AdminPanel.css'

function AdminPanel({ coins, selectedCoin, onAddPrediction, onAddCoin }) {
  const [formData, setFormData] = useState({
    coin: selectedCoin,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    sentiment: 'bullish',
    mediaType: 'image',
    mediaUrl: '',
    sourceUrl: '',
    notes: ''
  })

  const [coinFormData, setCoinFormData] = useState({
    name: '',
    ticker: '',
    color: '#667eea',
    contractAddress: ''
  })

  const [previewFile, setPreviewFile] = useState(null)
  const [userTimezone, setUserTimezone] = useState('')
  const [showCoinForm, setShowCoinForm] = useState(false)

  useEffect(() => {
    // Get user's timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(tz)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    const prediction = {
      coin: formData.coin,
      date: `${formData.date}T${formData.time}:00`,
      sentiment: formData.sentiment,
      mediaType: formData.mediaType,
      mediaUrl: previewFile || formData.mediaUrl,
      sourceUrl: formData.sourceUrl,
      notes: formData.notes
    }

    onAddPrediction(prediction)

    // Reset form
    setFormData({
      ...formData,
      mediaUrl: '',
      sourceUrl: '',
      notes: ''
    })
    setPreviewFile(null)
  }

  const handleCoinSubmit = (e) => {
    e.preventDefault()

    if (!coinFormData.name || !coinFormData.ticker) {
      alert('Please fill in all coin fields')
      return
    }

    onAddCoin({
      name: coinFormData.name,
      ticker: coinFormData.ticker.toUpperCase(),
      color: coinFormData.color,
      contractAddress: coinFormData.contractAddress || null
    })

    // Reset coin form
    setCoinFormData({
      name: '',
      ticker: '',
      color: '#667eea',
      contractAddress: ''
    })
    setShowCoinForm(false)
    alert('Coin added successfully!')
  }


  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      {userTimezone && (
        <div className="timezone-info">
          ⏰ All times are in your timezone: <strong>{userTimezone}</strong>
        </div>
      )}

      {/* Add New Coin Section */}
      <div className="section-divider">
        <button
          className="toggle-coin-form"
          onClick={() => setShowCoinForm(!showCoinForm)}
        >
          {showCoinForm ? '− Hide' : '+ Add New Coin'}
        </button>
      </div>

      {showCoinForm && (
        <form onSubmit={handleCoinSubmit} className="coin-form">
          <h3>Add New Coin</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Coin Name</label>
              <input
                type="text"
                placeholder="e.g., Bitcoin"
                value={coinFormData.name}
                onChange={(e) => setCoinFormData({ ...coinFormData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Ticker Symbol</label>
              <input
                type="text"
                placeholder="e.g., DSYNC"
                value={coinFormData.ticker}
                onChange={(e) => setCoinFormData({ ...coinFormData, ticker: e.target.value.toUpperCase() })}
                required
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label>Chart Color</label>
              <input
                type="color"
                value={coinFormData.color}
                onChange={(e) => setCoinFormData({ ...coinFormData, color: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contract Address (Optional)</label>
            <input
              type="text"
              placeholder="0xf94e7d0710709388bce3161c32b4eea56d3f91cc"
              value={coinFormData.contractAddress}
              onChange={(e) => setCoinFormData({ ...coinFormData, contractAddress: e.target.value })}
            />
            <small className="field-hint">
              For ERC-20 tokens. Leave blank for native coins like BTC/ETH.
            </small>
          </div>

          <button type="submit" className="submit-button">
            Add Coin
          </button>
        </form>
      )}

      {/* Add Prediction Section */}
      <div className="section-divider">
        <h3>Add New Prediction</h3>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Coin</label>
            <select
              value={formData.coin}
              onChange={(e) => setFormData({ ...formData, coin: e.target.value })}
            >
              {coins.map(coin => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.ticker})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sentiment</label>
            <select
              value={formData.sentiment}
              onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
            >
              <option value="bullish">Bullish</option>
              <option value="bearish">Bearish</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div className="form-group">
            <label>Media Type</label>
            <select
              value={formData.mediaType}
              onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
            >
              <option value="image">Image (Screenshot)</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Media URL</label>
          <input
            type="url"
            placeholder={formData.mediaType === 'link'
              ? "https://twitter.com/..."
              : "Paste image/video URL (Cloudinary, Imgur, etc.)"}
            value={formData.mediaUrl}
            onChange={(e) => {
              setFormData({ ...formData, mediaUrl: e.target.value })
              setPreviewFile(e.target.value)
            }}
            className="url-input"
            required
          />
        </div>

        {formData.mediaType !== 'link' && (
          <div className="form-group">
            <label>Original Source URL (Optional)</label>
            <input
              type="url"
              placeholder="https://twitter.com/username/status/... or https://youtube.com/..."
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="url-input"
            />
            <small className="field-hint">
              💡 Paste the link to the original tweet, video, or post. This will be shown prominently when viewing the prediction.
            </small>
          </div>
        )}

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            placeholder="Add context or additional notes about this prediction..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows="3"
          />
        </div>

        {previewFile && formData.mediaType === 'image' && (
          <div className="preview">
            <img src={previewFile} alt="Preview" />
          </div>
        )}

        <button type="submit" className="submit-button">
          Add Prediction
        </button>
      </form>
    </div>
  )
}

export default AdminPanel
