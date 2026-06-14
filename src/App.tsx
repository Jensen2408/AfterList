import { NavLink, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnimePage from './pages/AnimePage'
import MoviesPage from './pages/MoviesPage'
import SeriesPage from './pages/SeriesPage'
import './App.css'

function App() {
  return (
    <main className="app">
      <nav className="nav">
        <NavLink className="brand" to="/" end>
          AfterList
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" end>
            All
          </NavLink>
          <NavLink to="/anime">Anime</NavLink>
          <NavLink to="/movies">Movies</NavLink>
          <NavLink to="/series">TV Series</NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/anime" element={<AnimePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/series" element={<SeriesPage />} />
      </Routes>
    </main>
  )
}

export default App
