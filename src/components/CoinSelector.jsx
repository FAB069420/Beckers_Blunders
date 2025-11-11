import './CoinSelector.css'

function CoinSelector({ coins, selectedCoin, onSelectCoin }) {
  return (
    <div className="coin-selector">
      {coins.map(coin => (
        <button
          key={coin.id}
          className={`coin-button ${selectedCoin === coin.id ? 'active' : ''}`}
          onClick={() => onSelectCoin(coin.id)}
          style={{
            '--coin-color': coin.color
          }}
        >
          <span className="coin-name">{coin.name}</span>
          <span className="coin-symbol">{coin.id}</span>
        </button>
      ))}
    </div>
  )
}

export default CoinSelector
