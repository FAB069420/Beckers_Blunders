import './PredictionMarker.css'

function PredictionMarker({ prediction, onClick }) {
  return (
    <div
      className={`prediction-marker ${prediction.sentiment}`}
      onClick={onClick}
      title={`Click to view ${prediction.sentiment} prediction`}
    >
      <div className="marker-icon">
        {prediction.sentiment === 'bullish' && '↑'}
        {prediction.sentiment === 'bearish' && '↓'}
        {prediction.sentiment === 'neutral' && '●'}
      </div>
    </div>
  )
}

export default PredictionMarker
