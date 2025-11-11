import { fetchCoinHistory, getCachedPrice, setCachedPrice } from './priceAPI'

// Generate realistic-looking mock price data for crypto charts (fallback)
export function generateMockPriceData(coin) {
  const data = []
  const now = new Date()
  const startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago

  // Base prices for different coins
  const basePrices = {
    BTC: 45000,
    ETH: 2500,
    DSYNC: 0.04  // Updated to realistic price
  }

  let basePrice = basePrices[coin] || 1000
  const volatility = 0.02 // 2% daily volatility

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)

    // Random walk with trend
    const change = (Math.random() - 0.48) * basePrice * volatility
    basePrice += change

    // Add to data array
    data.push({
      timestamp: date.getTime(),
      price: parseFloat(basePrice.toFixed(8)),
      formattedDate: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      dateObj: date
    })
  }

  return data
}

/**
 * Fetch real price data with fallback to mock data
 * @param {string} coinTicker - Ticker symbol
 * @param {string} contractAddress - Contract address if applicable
 * @returns {Promise<Array>} Price data array
 */
export async function fetchPriceData(coinTicker, contractAddress) {
  // Check cache first
  const cacheKey = `${coinTicker}-${contractAddress || 'native'}`
  const cached = getCachedPrice(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const realData = await fetchCoinHistory(coinTicker, contractAddress, 365)

    if (realData && realData.length > 0) {
      setCachedPrice(cacheKey, realData)
      return realData
    }
  } catch (error) {
    console.warn('Failed to fetch real price data, using mock:', error)
  }

  // Fallback to mock data
  const mockData = generateMockPriceData(coinTicker)
  return mockData
}

// Format date for display
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
