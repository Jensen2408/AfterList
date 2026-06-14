import MediaCard from './components/MediaCard'
import { demoItems } from './data/demoItems'



function App() {
  return (
    <main>
      <h1>AfterList</h1>
      <p>Track anime, movies, and TV series.</p>

      <section>
        {demoItems.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </section>
    </main>
  )
}

export default App
