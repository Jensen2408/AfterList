import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { motion, useAnimationFrame, useReducedMotion } from 'motion/react'
import MediaCard from './MediaCard'
import type { MediaItem } from '../types/media'

type WatchlistRowProps = {
  title: string
  items: MediaItem[]
  onSelect: (item: MediaItem) => void
  hideControls?: boolean
}

const SLIDE_EASE = [0.22, 1, 0.36, 1] as const
const INFINITE_CARD_COPIES = 5
const INFINITE_CENTER_COPY = 2
const INFINITE_SPEED = 0.035
const ROW_GAP = 16

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export default function WatchlistRow({ title, items, onSelect, hideControls = false }: WatchlistRowProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const wrapTimeoutRef = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const [offset, setOffset] = useState(0)
  const [maxOffset, setMaxOffset] = useState(0)
  const [singleSetWidth, setSingleSetWidth] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isInfiniteRow = title.toLowerCase() === 'watched' && items.length > 4
  const showScrollControls = !hideControls && items.length > 4 && (isInfiniteRow || maxOffset > 8)

  const repeatedSets = useMemo(
    () => Array.from({ length: INFINITE_CARD_COPIES }, (_, copyIndex) => copyIndex),
    [],
  )

  const getCenterStart = useCallback((setWidth = singleSetWidth) => setWidth * INFINITE_CENTER_COPY, [singleSetWidth])

  const wrapInfiniteScroll = useCallback(
    (setWidth = singleSetWidth) => {
      const viewport = viewportRef.current
      if (!viewport || !setWidth) return

      const minScroll = setWidth * (INFINITE_CENTER_COPY - 1)
      const maxScroll = setWidth * (INFINITE_CENTER_COPY + 1)
      let nextScroll = viewport.scrollLeft

      while (nextScroll <= minScroll) nextScroll += setWidth
      while (nextScroll >= maxScroll) nextScroll -= setWidth

      if (Math.abs(nextScroll - viewport.scrollLeft) > 0.5) {
        viewport.scrollLeft = nextScroll
      }
    },
    [singleSetWidth],
  )

  const queueInfiniteWrap = useCallback(() => {
    if (wrapTimeoutRef.current) {
      window.clearTimeout(wrapTimeoutRef.current)
    }

    wrapTimeoutRef.current = window.setTimeout(() => {
      wrapInfiniteScroll()
      wrapTimeoutRef.current = null
    }, 520)
  }, [wrapInfiniteScroll])

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    if (isInfiniteRow) {
      const firstSet = track.querySelector<HTMLElement>('.row-scroll-set')
      const nextSetWidth = firstSet?.offsetWidth ?? 0

      if (nextSetWidth > 0) {
        setSingleSetWidth((currentWidth) => (Math.abs(currentWidth - nextSetWidth) > 1 ? nextSetWidth : currentWidth))

        const centerStart = nextSetWidth * INFINITE_CENTER_COPY
        const widthChanged = Math.abs(singleSetWidth - nextSetWidth) > 1

        if (viewport.scrollLeft < 1 || widthChanged) {
          viewport.scrollLeft = centerStart
        } else {
          wrapInfiniteScroll(nextSetWidth)
        }
      }

      setOffset(0)
      setMaxOffset(0)
      return
    }

    const nextMaxOffset = Math.max(0, track.scrollWidth - viewport.clientWidth)
    setMaxOffset(nextMaxOffset)
    setOffset((currentOffset) => Math.min(currentOffset, nextMaxOffset))
  }, [isInfiniteRow, singleSetWidth, wrapInfiniteScroll])

  useLayoutEffect(() => {
    updateMetrics()

    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const resizeObserver = new ResizeObserver(updateMetrics)
    resizeObserver.observe(viewport)
    resizeObserver.observe(track)

    return () => resizeObserver.disconnect()
  }, [items.length, isInfiniteRow, updateMetrics])

  useEffect(() => {
    return () => {
      if (wrapTimeoutRef.current) {
        window.clearTimeout(wrapTimeoutRef.current)
      }
    }
  }, [])

  useAnimationFrame((_, delta) => {
    if (!isInfiniteRow || prefersReducedMotion || isPaused || !singleSetWidth) return

    const viewport = viewportRef.current
    if (!viewport) return

    viewport.scrollLeft += delta * INFINITE_SPEED
    wrapInfiniteScroll()
  })

  if (items.length === 0) return null

  const getSlideAmount = () => {
    const viewport = viewportRef.current
    const card = trackRef.current?.querySelector<HTMLElement>('.media-card-wrapper')
    const cardStep = (card?.offsetWidth ?? 170) + ROW_GAP
    const viewportStep = (viewport?.clientWidth ?? cardStep * 3) * 0.72

    return clamp(viewportStep, cardStep * 2, cardStep * 5)
  }

  const slideRow = (direction: 'left' | 'right') => {
    const viewport = viewportRef.current
    if (!viewport) return

    const slideAmount = getSlideAmount()

    if (isInfiniteRow) {
      if (!singleSetWidth) updateMetrics()

      viewport.scrollBy({
        left: direction === 'left' ? -slideAmount : slideAmount,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })

      queueInfiniteWrap()
      return
    }

    setOffset((currentOffset) => {
      const nextOffset = direction === 'left' ? currentOffset - slideAmount : currentOffset + slideAmount
      return Math.min(Math.max(nextOffset, 0), maxOffset)
    })
  }

  const handleArrowClick = (direction: 'left' | 'right') => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    slideRow(direction)
  }

  const renderCards = (setName = 'base') =>
    items.map((item, index) => (
      <MediaCard key={`${setName}-${item.id}-${index}`} item={item} onSelect={onSelect} />
    ))

  return (
    <motion.section
      className={`watchlist-row${isInfiniteRow ? ' watchlist-row-infinite' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: SLIDE_EASE }}
    >
      <div className="row-head">
        <h2>{title}</h2>
        <span>{items.length} items</span>
      </div>

      <div
        className={`row-scroll-shell${showScrollControls ? ' has-scroll-controls' : ''}${isInfiniteRow ? ' is-infinite' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {showScrollControls && (
          <button
            className="row-scroll-button row-scroll-button-left"
            type="button"
            aria-label={`Slide ${title} left`}
            disabled={!isInfiniteRow && offset <= 0}
            onClick={handleArrowClick('left')}
          >
            ‹
          </button>
        )}

        <div className="row-scroll" ref={viewportRef} onScroll={isInfiniteRow ? () => wrapInfiniteScroll() : undefined}>
          {isInfiniteRow ? (
            <div className="row-scroll-track row-scroll-track-infinite" ref={trackRef} aria-label={`${title} circular list`}>
              {repeatedSets.map((copyIndex) => (
                <div className="row-scroll-set" aria-hidden={copyIndex !== INFINITE_CENTER_COPY} key={`loop-set-${copyIndex}`}>
                  {renderCards(`loop-${copyIndex}`)}
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="row-scroll-track"
              ref={trackRef}
              animate={{ x: -offset }}
              transition={{ type: 'spring', stiffness: 260, damping: 34, mass: 0.9 }}
            >
              {renderCards()}
            </motion.div>
          )}
        </div>

        {showScrollControls && (
          <>
            <button
              className="row-scroll-button row-scroll-button-right"
              type="button"
              aria-label={`Slide ${title} right`}
              disabled={!isInfiniteRow && offset >= maxOffset - 1}
              onClick={handleArrowClick('right')}
            >
              ›
            </button>

            {!isInfiniteRow && (
              <>
                <div className="row-fade row-fade-left" aria-hidden="true" />
                <div className="row-fade row-fade-right" aria-hidden="true" />
              </>
            )}
          </>
        )}
      </div>
    </motion.section>
  )
}
