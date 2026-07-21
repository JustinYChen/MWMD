import { useCallback } from 'react'
import { useDeckStore } from '@/store/useDeckStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import type { Question, Level, Category } from '@/types/question'

/** 抽卡流程编排:封装 deck/history/favorites 联动 */
export function useDrawEngine() {
  const mode = useDeckStore((s) => s.mode)
  const filters = useDeckStore((s) => s.filters)
  const drawnIds = useDeckStore((s) => s.drawnIds)
  const currentDraw = useDeckStore((s) => s.currentDraw)
  const phase = useDeckStore((s) => s.phase)
  const revealedIds = useDeckStore((s) => s.revealedIds)
  const setMode = useDeckStore((s) => s.setMode)
  const toggleLevel = useDeckStore((s) => s.toggleLevel)
  const toggleCategory = useDeckStore((s) => s.toggleCategory)
  const setIntimacyMax = useDeckStore((s) => s.setIntimacyMax)
  const resetFilters = useDeckStore((s) => s.resetFilters)
  const draw = useDeckStore((s) => s.draw)
  const resetDeck = useDeckStore((s) => s.resetDeck)
  const setPhase = useDeckStore((s) => s.setPhase)
  const markRevealed = useDeckStore((s) => s.markRevealed)
  const clearCurrent = useDeckStore((s) => s.clearCurrent)
  const remaining = useDeckStore((s) => s.remaining())

  const addHistory = useHistoryStore((s) => s.addRecord)
  const isFavorited = useFavoritesStore((s) => s.isFavorited)
  const addFavorite = useFavoritesStore((s) => s.add)
  const removeFavorite = useFavoritesStore((s) => s.remove)

  const handleReveal = useCallback(
    (q: Question) => {
      markRevealed(q.id)
      addHistory(q, mode, isFavorited(q.id))
    },
    [markRevealed, addHistory, mode, isFavorited]
  )

  const handleDraw = useCallback(() => {
    return draw()
  }, [draw])

  const handleRedraw = useCallback(() => {
    clearCurrent()
    setTimeout(() => draw(), 60)
  }, [clearCurrent, draw])

  const toggleFavorite = useCallback(
    (q: Question) => {
      if (isFavorited(q.id)) removeFavorite(q.id)
      else addFavorite(q)
    },
    [isFavorited, addFavorite, removeFavorite]
  )

  return {
    mode,
    filters,
    drawnIds,
    currentDraw,
    phase,
    revealedIds,
    remaining,
    setMode,
    toggleLevel,
    toggleCategory,
    setIntimacyMax,
    resetFilters,
    draw: handleDraw,
    redraw: handleRedraw,
    resetDeck,
    setPhase,
    clearCurrent,
    handleReveal,
    toggleFavorite,
    isFavorited,
  }
}

export type DrawEngine = ReturnType<typeof useDrawEngine>
export type { Level, Category }
