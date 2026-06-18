export type MediaType = 'Anime' | 'Movie' | 'TV Series'

export type MediaStatus = 'Planned' | 'Watching' | 'Watched' | 'Dropped'

export type MediaItem = {
  id: string
  title: string
  type: MediaType
  status: MediaStatus
  poster: string
  backdrop: string
  progress: string
  rating: string
  description: string
}
