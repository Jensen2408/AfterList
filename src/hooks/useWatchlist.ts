import { useState, useEffect } from 'react'
import { demoItems as initialItems } from '../data/demoItems'
import type { MediaItem, MediaStatus } from '../types/media'

export function useWatchlist() {
  const [items, setItems] = useState<MediaItem[]>(() => {
    const savedItems = localStorage.getItem('afterlist_items')

    return savedItems ? (JSON.parse(savedItems) as MediaItem[]) : initialItems
  })

  useEffect(() => {
    localStorage.setItem('afterlist_items', JSON.stringify(items))
  }, [items])

  const handleRemoveItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const handleUpdateStatus = (id: string, status: MediaStatus) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, status } : item)),
    )
  }

  return {
    items,
    handleRemoveItem,
    handleUpdateStatus,
  }
}
