import type { MediaItem } from '../types/media'

type MediaCardProps = {
  item: MediaItem
}

function MediaCard({ item }: MediaCardProps) {
  return (
    <article>
      <img src={item.poster} alt={item.title} />
      <h2>{item.title}</h2>
      <p>{item.type}</p>
      <p>{item.status}</p>
    </article>
  )
}

export default MediaCard