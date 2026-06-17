import { motion } from 'motion/react'
import MediaCard from './MediaCard'
import type { MediaItem } from '../types/media'

type WatchlistRowProps = {
  title: string
  items: MediaItem[]
  onSelect: (item: MediaItem) => void
}

export default function WatchlistRow({ title, items, onSelect }: WatchlistRowProps) {
  if (items.length === 0) return null

  return (
    <motion.section
      className="watchlist-row"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="row-head">
        <h2>{title}</h2>
        <span>{items.length} items</span>
      </div>

      <div className="row-scroll-shell">
        <div className="row-scroll">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onSelect={onSelect} />
          ))}
        </div>
        <div className="row-fade" aria-hidden="true" />
      </div>
    </motion.section>
  )
}
