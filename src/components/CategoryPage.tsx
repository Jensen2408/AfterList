import { demoItems } from '../data/demoItems'
import type { MediaType } from '../types/media'
import MediaCard from './MediaCard'

type CategoryPageProps = {
  title: string
  type: MediaType
}

function CategoryPage({ title, type }: CategoryPageProps) {
  const filteredItems = demoItems.filter((item) => item.type === type)

  return (
    <section>
      <h1>{title}</h1>

      <div className="media-grid">
        {filteredItems.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default CategoryPage
