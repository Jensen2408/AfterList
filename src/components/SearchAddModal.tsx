import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { searchCatalog } from '../data/searchCatalog'
import type { SearchCatalogItem } from '../data/searchCatalog'
import type { MediaItem, MediaStatus } from '../types/media'

const statusOptions: MediaStatus[] = ['Planned', 'Watching', 'Watched', 'Dropped']

const modalEase = [0.22, 1, 0.36, 1] as const

type SearchAddModalProps = {
  onClose: () => void
  onCreate: (item: MediaItem) => void
}

function createId(result: SearchCatalogItem) {
  return `${result.source}-${result.externalId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createMediaItem(result: SearchCatalogItem, status: MediaStatus): MediaItem {
  return {
    id: createId(result),
    externalId: result.externalId,
    source: result.source,
    title: result.title,
    type: result.type,
    status,
    poster: result.poster,
    backdrop: result.backdrop,
    progress: status === 'Watched' ? 'Watched' : result.year,
    rating: result.rating,
    description: result.description,
    year: result.year,
  }
}

function SearchAddModal({ onClose, onCreate }: SearchAddModalProps) {
  const [query, setQuery] = useState('')
  const [selectedResult, setSelectedResult] = useState<SearchCatalogItem | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<MediaStatus>('Planned')

  const normalizedQuery = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (!normalizedQuery) return []

    return searchCatalog
      .filter((item) => {
        const searchableText = `${item.title} ${item.type} ${item.year}`.toLowerCase()
        return searchableText.includes(normalizedQuery)
      })
      .slice(0, 8)
  }, [normalizedQuery])

  const handleSelectResult = (result: SearchCatalogItem) => {
    setSelectedResult(result)
    setSelectedStatus('Planned')
  }

  const handleCreate = () => {
    if (!selectedResult) return

    onCreate(createMediaItem(selectedResult, selectedStatus))
    onClose()
  }

  return (
    <div className="modal-backdrop search-modal-backdrop" onClick={onClose}>
      <motion.section
        className="search-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Search and add media"
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.28, ease: modalEase }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label="Close search" onClick={onClose}>
          ✕
        </button>

        <div className="search-modal-grid">
          <section className="search-panel">
            <p className="eyebrow">Search / Add</p>
            <h2>Add something new</h2>
            <p className="search-copy">
              Search movies, TV series, and anime. Click a result to preview it, then create it in your list.
            </p>

            <label className="search-field">
              <span>Search title</span>
              <input
                autoFocus
                value={query}
                placeholder="Try Dune"
                onChange={(event) => {
                  setQuery(event.target.value)
                  setSelectedResult(null)
                }}
              />
            </label>

            <div className="search-results" aria-live="polite">
              {!normalizedQuery && (
                <div className="search-empty">
                  <strong>Start with a title.</strong>
                  <span>Type “Dune” to test the create flow.</span>
                </div>
              )}

              {normalizedQuery && results.length === 0 && (
                <div className="search-empty">
                  <strong>No results yet.</strong>
                  <span>This is the mock search catalog until the real APIs are connected.</span>
                </div>
              )}

              {results.map((result) => (
                <button
                  key={`${result.source}-${result.externalId}`}
                  className={`search-result-card${selectedResult?.externalId === result.externalId ? ' selected' : ''}`}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                >
                  <img src={result.poster} alt="" loading="lazy" />
                  <span className="search-result-info">
                    <strong>{result.title}</strong>
                    <span>{result.type} · {result.year}</span>
                    <small>{result.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="search-detail-panel">
            <AnimatePresence mode="wait">
              {selectedResult ? (
                <motion.div
                  key={selectedResult.externalId}
                  className="search-detail-card"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22, ease: modalEase }}
                >
                  <img className="search-detail-backdrop" src={selectedResult.backdrop} alt="" />
                  <div className="search-detail-body">
                    <img className="search-detail-poster" src={selectedResult.poster} alt={selectedResult.title} />
                    <div>
                      <p className="eyebrow">Preview result</p>
                      <h3>{selectedResult.title}</h3>
                      <div className="hero-meta search-detail-meta">
                        <span>{selectedResult.type}</span>
                        <span>{selectedResult.year}</span>
                        <span>★ {selectedResult.rating}</span>
                      </div>
                      <p>{selectedResult.description}</p>

                      <label className="status-editor create-status-editor">
                        <span>Status</span>
                        <select
                          value={selectedStatus}
                          aria-label={`Choose status for ${selectedResult.title}`}
                          onChange={(event) => setSelectedStatus(event.target.value as MediaStatus)}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button className="create-item-btn" type="button" onClick={handleCreate}>
                        Create
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-preview"
                  className="search-preview-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <span>Preview</span>
                  <strong>Click a result</strong>
                  <p>The detail popup will show the poster, title, year, description, type, status picker, and Create button.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </motion.section>
    </div>
  )
}

export default SearchAddModal
