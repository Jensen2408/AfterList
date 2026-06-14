import type { MediaItem } from '../types/media'

type MediaCardProps = {
  item: MediaItem
}

function MediaCard({ item }: MediaCardProps) {
  return (
    <article className="media-card">
      <img className="media-poster" src={item.poster} alt={item.title} />

      <div className="media-info">
        <strong>{item.title}</strong>
        <div className="card-meta">
          <span className="type-label">{item.type}</span>
          <span className={`pill ${item.status}`}>{item.status}</span>
        </div>
      </div>
    </article>
  )
}

export default MediaCard
