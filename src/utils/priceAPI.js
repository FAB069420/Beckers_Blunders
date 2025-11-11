// CoinGecko API integration for real price data
// Free tier: No API key required, 50 calls/minute

const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// Map our tickers to CoinGecko IDs
const COIN_ID_MAP = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'DSYNC': null // Will need contract address lookup
}

/**
 * Fetch historical price data for a coin
 * @param {string} coinId - CoinGecko coin ID or contract address
 * @param {number} days - Number of days of history (max 365 for free tier)
 * @returns {Promise<Array>} Array of {timestamp, price, formattedDate, dateObj}
 */
export async function fetchCoinHistory(coinTicker, contractAddress, days = 365) {
  try {
    let url

    // If we have a contract address, use contract endpoint
    if (contractAddress) {
      url = `${COINGECKO_API}/coins/ethereum/contract/${contractAddress}/market_chart/?vs_currency=usd&days=${days}`
    } else {
      // Otherwise use coin ID
      const coinId = COIN_ID_MAP[coinTicker]
      if (!coinId) {
        console.warn(`No CoinGecko ID for ${coinTicker}, using mock data`)
        return null
      }
      url = `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // CoinGecko returns prices as [[timestamp, price], ...]
    const prices = data.prices.map(([timestamp, price]) => {
      const dateObj = new Date(timestamp)
      return {
        timestamp,
        price: parseFloat(price.toFixed(8)),
        formattedDate: dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        dateObj
      }
    })

    return prices

  } catch (error) {
    console.error('Error fetching price data:', error)
    return null
  }
}

/**
 * Get current price for a coin
 * @param {string} coinTicker - Ticker symbol
 * @param {string} contractAddress - Contract address if applicable
 * @returns {Promise<number>} Current price in USD
 */
export async function fetchCurrentPrice(coinTicker, contractAddress) {
  try {
    let url

    if (contractAddress) {
      url = `${COINGECKO_API}/simple/token_price/ethereum?contract_addresses=${contractAddress}&vs_currencies=usd`
    } else {
      const coinId = COIN_ID_MAP[coinTicker]
      if (!coinId) return null
      url = `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`
    }

    const response = await fetch(url)
    const data = await response.json()

    if (contractAddress) {
      return data[contractAddress.toLowerCase()]?.usd || null
    } else {
      const coinId = COIN_ID_MAP[coinTicker]
      return data[coinId]?.usd || null
    }

  } catch (error) {
    console.error('Error fetching current price:', error)
    return null
  }
}

/**
 * Cache management for API calls
 * CoinGecko free tier: 50 calls/minute
 */
const priceCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function getCachedPrice(key) {
  const cached = priceCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

export function setCachedPrice(key, data) {
  priceCache.set(key, {
    data,
    timestamp: Date.now()
  })
}
