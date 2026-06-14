export type MediaType = 'Anime' | 'Movie' | 'TV Series'

export type MediaStatus = 'Planned' | 'Watching' | 'Completed' | 'Dropped'

export type MediaItem = {
  id: string
  title: string
  type: MediaType
  status: MediaStatus
  poster: string
}
