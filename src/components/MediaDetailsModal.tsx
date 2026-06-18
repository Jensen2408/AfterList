import type { MediaItem, MediaStatus } from '../types/media'

const statusOptions: MediaStatus[] = ['Planned', 'Watching', 'Watched', 'Dropped']

type MediaDetailsModalProps = {
  item: MediaItem
  onClose: () => void
  onRemove: (id: string) => void
  onStatusChange: (id: string, status: MediaStatus) => void
}

function MediaDetailsModal({ item, onClose, onRemove, onStatusChange }: MediaDetailsModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label="Close details" onClick={onClose}>
          ✕
        </button>

        <img className="modal-poster" src={item.poster} alt={item.title} />

        <div className="modal-content">
          <p className="eyebrow">{item.type}</p>
          <h2>{item.title}</h2>
          <p>{item.description}</p>

          <div className="hero-meta">
            <span className={`pill ${item.status}`}>{item.status}</span>
            <span>{item.progress}</span>
            <span>★ {item.rating}</span>
          </div>

          <label className="status-editor">
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

          <div className="modal-footer">
            <button
              className="delete-btn"
              type="button"
              aria-label={`Delete ${item.title}`}
              title="Delete"
              onClick={() => onRemove(item.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MediaDetailsModal
