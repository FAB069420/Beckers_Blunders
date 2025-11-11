import { useEffect, useState } from 'react'
import './MediaViewer.css'

function MediaViewer({ prediction, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    sourceUrl: prediction.sourceUrl || '',
    notes: prediction.notes || ''
  })

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSave = () => {
    onUpdate(prediction.id, editData)
    setIsEditing(false)
    onClose()
  }

  const handleDelete = () => {
    onDelete(prediction.id)
    onClose()
  }

  const renderMedia = () => {
    if (prediction.mediaType === 'image') {
      return (
        <img
          src={prediction.mediaUrl}
          alt="Prediction screenshot"
          className="media-content"
        />
      )
    }

    if (prediction.mediaType === 'video') {
      return (
        <video
          src={prediction.mediaUrl}
          controls
          className="media-content"
        />
      )
    }

    if (prediction.mediaType === 'link') {
      return (
        <div className="link-preview">
          <a
            href={prediction.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            View Original Tweet →
          </a>
          <iframe
            src={prediction.mediaUrl}
            className="link-iframe"
            title="Tweet preview"
          />
        </div>
      )
    }
  }

  return (
    <div className="media-viewer-overlay" onClick={onClose}>
      <div className="media-viewer" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>

        <div className="viewer-header">
          <div className="prediction-info">
            {!isEditing && prediction.sourceUrl && (
              <a
                href={prediction.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="header-action-link"
                title="View Original Source"
              >
                Source
              </a>
            )}
            <span className="prediction-date">
              {new Date(prediction.date).toLocaleString()}
            </span>
          </div>
          <div className="header-actions">
            {onUpdate && onDelete && (
              !isEditing ? (
                <>
                  <button className="header-icon-button" onClick={() => setIsEditing(true)} title="Edit">
                    ✏️
                  </button>
                  <button className="header-icon-button delete" onClick={handleDelete} title="Delete">
                    🗑️
                  </button>
                </>
              ) : (
                <>
                  <button className="header-icon-button save" onClick={handleSave} title="Save">
                    💾
                  </button>
                  <button className="header-icon-button cancel" onClick={() => setIsEditing(false)} title="Cancel">
                    ❌
                  </button>
                </>
              )
            )}
          </div>
        </div>

        <div className="viewer-content">
          {renderMedia()}
        </div>

        {!isEditing && prediction.notes && (
          <div className="viewer-notes">
            <h4>Notes:</h4>
            <p>{prediction.notes}</p>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <div className="viewer-edit-form">
            <div className="form-group">
              <label>Original Source URL</label>
              <input
                type="url"
                placeholder="https://twitter.com/username/status/..."
                value={editData.sourceUrl}
                onChange={(e) => setEditData({ ...editData, sourceUrl: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                placeholder="Add context or additional notes..."
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows="3"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaViewer
