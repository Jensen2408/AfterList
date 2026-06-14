export type MediaItem = {
  id: string
  title: string
  type: 'Anime' | 'Movie' | 'TV Series'
  status: 'Planned' | 'Watching' | 'Completed' | 'Dropped'
  poster: string
}