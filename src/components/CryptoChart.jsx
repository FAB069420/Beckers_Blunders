import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts'
import MediaViewer from './MediaViewer'
import { fetchPriceData, generateMockPriceData } from '../utils/chartUtils'
import './CryptoChart.css'

function CryptoChart({ coin, predictions, coinColor, onUpdatePrediction, onDeletePrediction }) {
  const [selectedPrediction, setSelectedPrediction] = useState(null)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [zoomDomain, setZoomDomain] = useState({ start: 0, end: 100 })
  const [isDragging, setIsDragging] = useState(false)

  // Fetch real price data when coin changes
  useEffect(() => {
    let isMounted = true

    async function loadPriceData() {
      setLoading(true)

      // Hardcoded contract addresses (should be passed as prop in future)
      const contractAddresses = {
        'DSYNC': '0xf94e7d0710709388bce3161c32b4eea56d3f91cc',
        'BTC': null,
        'ETH': null
      }

      const contractAddress = contractAddresses[coin]
      const data = await fetchPriceData(coin, contractAddress)

      if (isMounted) {
        setChartData(data || generateMockPriceData(coin))
        setLoading(false)
      }
    }

    loadPriceData()

    return () => {
      isMounted = false
    }
  }, [coin])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{data.formattedDate}</p>
          <p className="tooltip-price">${payload[0].value?.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  // Format timestamp for X-axis
  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    return `${month} ${day}`
  }

  // Zoom functions
  const handleZoomIn = () => {
    const range = zoomDomain.end - zoomDomain.start
    const newRange = range * 0.7
    const center = (zoomDomain.start + zoomDomain.end) / 2
    setZoomDomain({
      start: Math.max(0, center - newRange / 2),
      end: Math.min(100, center + newRange / 2)
    })
  }

  const handleZoomOut = () => {
    const range = zoomDomain.end - zoomDomain.start
    const newRange = Math.min(100, range * 1.3)
    const center = (zoomDomain.start + zoomDomain.end) / 2
    setZoomDomain({
      start: Math.max(0, center - newRange / 2),
      end: Math.min(100, center + newRange / 2)
    })
  }

  const handleResetZoom = () => {
    setZoomDomain({ start: 0, end: 100 })
  }

  // Pan/Drag functions
  const handleMouseDown = (e) => {
    setIsDragging(true)
    e.currentTarget.style.cursor = 'grabbing'
  }

  const handleMouseUp = (e) => {
    setIsDragging(false)
    e.currentTarget.style.cursor = 'grab'
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const containerWidth = e.currentTarget.offsetWidth
    const movePercent = (e.movementX / containerWidth) * (zoomDomain.end - zoomDomain.start) * -1

    const range = zoomDomain.end - zoomDomain.start
    let newStart = zoomDomain.start + movePercent
    let newEnd = zoomDomain.end + movePercent

    // Keep within bounds
    if (newStart < 0) {
      newStart = 0
      newEnd = range
    }
    if (newEnd > 100) {
      newEnd = 100
      newStart = 100 - range
    }

    setZoomDomain({ start: newStart, end: newEnd })
  }

  const handleMouseLeave = (e) => {
    if (isDragging) {
      setIsDragging(false)
      e.currentTarget.style.cursor = 'grab'
    }
  }

  // Calculate visible data based on zoom
  const getVisibleData = () => {
    if (!chartData.length) return []
    const startIdx = Math.floor((chartData.length - 1) * zoomDomain.start / 100)
    const endIdx = Math.ceil((chartData.length - 1) * zoomDomain.end / 100)
    return chartData.slice(startIdx, endIdx + 1)
  }

  const visibleData = getVisibleData()

  // Check if zoomed in (to show drag cursor)
  const isZoomedIn = zoomDomain.end - zoomDomain.start < 100

  if (loading || chartData.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h2 className="chart-title">{coin} Price Chart</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading price data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2 className="chart-title">{coin} Price Chart</h2>
      </div>

      <div className="chart-wrapper">
        <div className="zoom-controls">
          <button onClick={handleZoomOut} className="zoom-button" title="Zoom Out">-</button>
          <button onClick={handleResetZoom} className="zoom-button" title="Reset Zoom">Reset</button>
          <button onClick={handleZoomIn} className="zoom-button" title="Zoom In">+</button>
        </div>
        <div
          onMouseDown={isZoomedIn ? handleMouseDown : undefined}
          onMouseUp={isZoomedIn ? handleMouseUp : undefined}
          onMouseMove={isZoomedIn ? handleMouseMove : undefined}
          onMouseLeave={isZoomedIn ? handleMouseLeave : undefined}
          style={{ cursor: isZoomedIn ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <ResponsiveContainer
            width="100%"
            height={500}
          >
            <LineChart
              data={visibleData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
            <XAxis
              dataKey="timestamp"
              stroke="#a0a0b0"
              tick={{ fill: '#a0a0b0', fontSize: 11 }}
              tickFormatter={formatXAxis}
              minTickGap={50}
            />
            <YAxis
              stroke="#a0a0b0"
              tick={{ fill: '#a0a0b0', fontSize: 11 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={coinColor || '#667eea'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />

            {/* Vertical dashed lines for predictions */}
            {predictions.map((prediction) => {
              const predDate = new Date(prediction.date).getTime()
              const dataPoint = visibleData.find(d => {
                const diff = Math.abs(d.timestamp - predDate)
                return diff < 24 * 60 * 60 * 1000
              })

              if (!dataPoint) return null

              const colors = {
                bullish: '#26a69a',
                bearish: '#ef5350',
                neutral: '#ffd700'
              }

              return (
                <ReferenceLine
                  key={prediction.id}
                  x={dataPoint.timestamp}
                  stroke={colors[prediction.sentiment]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  ifOverflow="extendDomain"
                />
              )
            })}

            {/* Clickable dots at top of chart */}
            {predictions.map((prediction) => {
              const predDate = new Date(prediction.date).getTime()
              const dataPoint = visibleData.find(d => {
                const diff = Math.abs(d.timestamp - predDate)
                return diff < 24 * 60 * 60 * 1000
              })

              if (!dataPoint) return null

              const colors = {
                bullish: '#26a69a',
                bearish: '#ef5350',
                neutral: '#ffd700'
              }

              // Position all markers at the top of the chart
              const prices = visibleData.map(d => d.price)
              const maxPrice = Math.max(...prices)

              return (
                <ReferenceDot
                  key={`dot-${prediction.id}`}
                  x={dataPoint.timestamp}
                  y={maxPrice}
                  r={12}
                  fill={colors[prediction.sentiment]}
                  stroke="#ffffff"
                  strokeWidth={3}
                  onClick={() => setSelectedPrediction(prediction)}
                  isFront={true}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
        </div>

        <div className="zoom-hint">
          💡 Click the colored circles on the chart to view predictions
        </div>
      </div>

      <div className="predictions-timeline">
        <h3>Predictions Timeline</h3>
        <div className="timeline-items">
          {predictions.length === 0 ? (
            <p className="no-predictions">No predictions yet. Add one using the admin panel!</p>
          ) : (
            [...predictions]
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(prediction => {
                const colors = {
                  bullish: '#26a69a',
                  bearish: '#ef5350',
                  neutral: '#ffd700'
                }

                // Find the price at prediction time
                const predDate = new Date(prediction.date).getTime()
                const dataPoint = chartData.find(d => {
                  const diff = Math.abs(d.timestamp - predDate)
                  return diff < 24 * 60 * 60 * 1000 // Within 24 hours
                })
                const price = dataPoint ? dataPoint.price : null

                return (
                  <div
                    key={prediction.id}
                    className="timeline-item"
                    onClick={() => setSelectedPrediction(prediction)}
                    style={{ borderColor: colors[prediction.sentiment] }}
                  >
                    <div className="timeline-date">
                      {new Date(prediction.date).toLocaleString()}
                      {price && (
                        <span className="timeline-price"> • ${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}</span>
                      )}
                    </div>
                    <div className="timeline-content">
                      <span
                        className="timeline-dot"
                        style={{ backgroundColor: colors[prediction.sentiment] }}
                      ></span>
                      {prediction.mediaType === 'image' && <span className="media-icon">🖼️</span>}
                      {prediction.mediaType === 'video' && <span className="media-icon">🎥</span>}
                      {prediction.mediaType === 'link' && <span className="media-icon">🔗</span>}
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>

      {selectedPrediction && (
        <MediaViewer
          prediction={selectedPrediction}
          onClose={() => setSelectedPrediction(null)}
          onUpdate={onUpdatePrediction}
          onDelete={onDeletePrediction}
        />
      )}
    </div>
  )
}

export default CryptoChart
