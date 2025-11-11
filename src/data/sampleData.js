// Sample predictions to demonstrate the app
export const samplePredictions = [
  {
    id: 1,
    coin: 'BTC',
    date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
    sentiment: 'bullish',
    mediaType: 'image',
    mediaUrl: 'https://via.placeholder.com/600x400/26a69a/ffffff?text=BTC+to+60K+📈',
    notes: 'Strong technical breakout expected'
  },
  {
    id: 2,
    coin: 'BTC',
    date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months ago
    sentiment: 'bearish',
    mediaType: 'image',
    mediaUrl: 'https://via.placeholder.com/600x400/ef5350/ffffff?text=Correction+Incoming+📉',
    notes: 'Market showing signs of exhaustion'
  },
  {
    id: 3,
    coin: 'BTC',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months ago
    sentiment: 'bullish',
    mediaType: 'image',
    mediaUrl: 'https://via.placeholder.com/600x400/26a69a/ffffff?text=Bull+Run+Continues+🚀',
    notes: 'ETF approval catalyst'
  },
  {
    id: 4,
    coin: 'ETH',
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
    sentiment: 'bullish',
    mediaType: 'image',
    mediaUrl: 'https://via.placeholder.com/600x400/627EEA/ffffff?text=ETH+Breakout+📈',
    notes: 'Major upgrade expected'
  },
  {
    id: 5,
    coin: 'ETH',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    sentiment: 'neutral',
    mediaType: 'image',
    mediaUrl: 'https://via.placeholder.com/600x400/ffd700/333333?text=Consolidation+Phase+➖',
    notes: 'Waiting for market direction'
  },
  {
    id: 6,
    coin: 'DESTRA',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 1.5 months ago
    sentiment: 'bullish',
    mediaType: 'image',
    mediaUrl: 'https://via.placeholder.com/600x400/00D4AA/ffffff?text=DESTRA+Moon+🌙',
    notes: 'New partnership announcement'
  }
]
