import { useEffect, useRef, useState } from 'react'
import type { MediaItem, MediaSource, MediaStatus } from '../types/media'
import { useAuth } from '../context/AuthContext'
import {
  createCloudWatchlistItem,
  deleteCloudWatchlistItem,
  fetchCloudWatchlist,
  updateCloudWatchlistItemStatus,
} from '../services/watchlistItems'
import { supabase } from '../services/supabase'
import { areSameMediaEntry, dedupeMediaItems } from '../utils/media'

type LegacyMediaSource = MediaSource | 'demo' | 'mock-api'

type LegacyMediaItem = Omit<MediaItem, 'status' | 'source'> & {
  status: MediaStatus | 'Completed'
  source?: LegacyMediaSource
}

const LOCAL_STORAGE_KEY = 'afterlist_items'
const apiSources = new Set<MediaSource>(['tmdb', 'anilist'])

function isApiMediaItem(item: unknown): item is LegacyMediaItem & { source: MediaSource; externalId: string } {
  if (!item || typeof item !== 'object') return false

  const candidate = item as LegacyMediaItem
  return Boolean(candidate.externalId && candidate.source && apiSources.has(candidate.source as MediaSource))
}

function migrateStatus(item: LegacyMediaItem & { source: MediaSource; externalId: string }): MediaItem {
  return {
    ...item,
    status: item.status === 'Completed' ? 'Watched' : item.status,
  }
}

function loadSavedItems(): MediaItem[] {
  const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY)

  if (!savedItems) return []

  try {
    const parsedItems = JSON.parse(savedItems)

    if (!Array.isArray(parsedItems)) return []

    return dedupeMediaItems(parsedItems.filter(isApiMediaItem).map(migrateStatus))
  } catch {
    return []
  }
}

export function useWatchlist() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [items, setItems] = useState<MediaItem[]>(loadSavedItems)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const loadRequestRef = useRef(0)
  const isCloudMode = Boolean(user && supabase)

  useEffect(() => {
    if (isAuthLoading) return undefined

    if (!user || !supabase) {
      setItems(loadSavedItems())
      setIsSyncing(false)
      setSyncError(null)
      return undefined
    }

    const requestId = loadRequestRef.current + 1
    loadRequestRef.current = requestId
    let isCancelled = false

    setIsSyncing(true)
    setSyncError(null)

    fetchCloudWatchlist(user.id)
      .then((cloudItems) => {
        if (isCancelled || loadRequestRef.current !== requestId) return
        setItems(dedupeMediaItems(cloudItems))
      })
      .catch((error) => {
        if (isCancelled || loadRequestRef.current !== requestId) return
        console.error(error)
        setSyncError(error instanceof Error ? error.message : 'Could not load your cloud watchlist.')
        setItems([])
      })
      .finally(() => {
        if (isCancelled || loadRequestRef.current !== requestId) return
        setIsSyncing(false)
      })

    return () => {
      isCancelled = true
    }
  }, [isAuthLoading, user])

  useEffect(() => {
    if (isAuthLoading || isCloudMode) return
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
  }, [isAuthLoading, isCloudMode, items])

  const handleAddItem = async (item: MediaItem) => {
    const alreadyExists = items.some((existingItem) => areSameMediaEntry(existingItem, item))
    if (alreadyExists) return

    if (!user || !supabase) {
      setItems((prevItems) => [item, ...prevItems])
      return
    }

    setIsSyncing(true)
    setSyncError(null)

    try {
      const createdItem = await createCloudWatchlistItem(item, user.id)
      setItems((prevItems) => {
        const stillExists = prevItems.some((existingItem) => areSameMediaEntry(existingItem, createdItem))
        return stillExists ? prevItems : [createdItem, ...prevItems]
      })
    } catch (error) {
      console.error(error)
      setSyncError(error instanceof Error ? error.message : 'Could not save this item to your account.')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleRemoveItem = async (id: string) => {
    const previousItems = items
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))

    if (!user || !supabase) return

    setIsSyncing(true)
    setSyncError(null)

    try {
      await deleteCloudWatchlistItem(id, user.id)
    } catch (error) {
      console.error(error)
      setSyncError(error instanceof Error ? error.message : 'Could not remove this item from your account.')
      setItems(previousItems)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: MediaStatus) => {
    const previousItems = items
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, status } : item)))

    if (!user || !supabase) return

    setIsSyncing(true)
    setSyncError(null)

    try {
      const updatedItem = await updateCloudWatchlistItemStatus(id, status, user.id)
      setItems((prevItems) => prevItems.map((item) => (item.id === id ? updatedItem : item)))
    } catch (error) {
      console.error(error)
      setSyncError(error instanceof Error ? error.message : 'Could not update this item.')
      setItems(previousItems)
    } finally {
      setIsSyncing(false)
    }
  }

  return {
    items,
    isCloudMode,
    isSyncing,
    syncError,
    handleAddItem,
    handleRemoveItem,
    handleUpdateStatus,
  }
}
