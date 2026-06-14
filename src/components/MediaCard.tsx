import type { MediaItem } from '../types/media'

type MediaCardProps = {
  item: MediaItem
}

function MediaCard({ item }: MediaCardProps) {
  return (
    <article className="media-card">
      <img className="media-poster" src={item.poster} alt={item.title} />

      <div className="media-info">
        <p className="media-type">{item.type}</p>
        <h2>{item.title}</h2>
        <span className="media-status">{item.status}</span>
      </div>
    </article>
  )
}

export default MediaCard
