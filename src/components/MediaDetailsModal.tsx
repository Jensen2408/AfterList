import { motion } from 'motion/react'
import type { MediaItem, MediaStatus } from '../types/media'

const statusOptions: MediaStatus[] = ['Planned', 'Watching', 'Watched', 'Dropped']

type MediaDetailsModalProps = {
  item: MediaItem
  onClose: () => void
  onRemove: (id: string) => void
  onStatusChange: (id: string, status: MediaStatus) => void
}

function MediaDetailsModal({ item, onClose, onRemove, onStatusChange }: MediaDetailsModalProps) {
  const yearLabel = item.year ?? item.progress

  return (
    <div className="modal-backdrop details-result-backdrop" onClick={onClose}>
      <motion.section
        className="details-modal details-result-modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img className="details-modal-backdrop-art" src={item.backdrop || item.poster} alt="" aria-hidden="true" />

        <button className="modal-close" type="button" aria-label="Close details" onClick={onClose}>
          ✕
        </button>

        <div className="details-result-body">
          <img className="modal-poster details-result-poster" src={item.poster} alt={item.title} />

          <div className="modal-content details-result-content">
            <p className="eyebrow details-preview-label">Saved item</p>
            <h2>{item.title}</h2>

            <div className="hero-meta details-result-meta">
              <span>{item.type}</span>
              {yearLabel && <span>{yearLabel}</span>}
              <span>★ {item.rating}</span>
              <span className={`pill ${item.status}`}>{item.status}</span>
            </div>

            <p className="details-result-description">{item.description}</p>

            <div className="details-action-panel">
              <label className="status-editor details-status-editor">
                <span>Edit status</span>
                <select
                  value={item.status}
                  aria-label={`Edit status for ${item.title}`}
                  onChange={(event) => onStatusChange(item.id, event.target.value as MediaStatus)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="delete-btn details-delete-btn"
                type="button"
                aria-label={`Delete ${item.title}`}
                title="Delete"
                onClick={() => onRemove(item.id)}
              >
                Remove from AfterList
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default MediaDetailsModal
