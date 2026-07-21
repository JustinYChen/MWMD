import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DrawMode, Phase, Question, Level, Category } from '@/types/question'
import type { DeckFilters } from '@/types/deck'
import {
  drawQuestions,
  defaultFilters,
  remainingCount,
  MODE_COUNT,
} from '@/lib/shuffle'
import { useQuestionBankStore } from '@/store/useQuestionBankStore'

/** 获取当前活动题库的题目(默认题库或用户自建题库) */
function getActiveQuestions(): Question[] {
  return useQuestionBankStore.getState().getActiveQuestions()
}

interface DeckState {
  mode: DrawMode
  filters: DeckFilters
  drawnIds: string[]
  currentDraw: Question[]
  phase: Phase
  /** 抽牌后是否需要展示揭示层 */
  revealedIds: string[]
  setMode: (m: DrawMode) => void
  toggleLevel: (l: Level) => void
  toggleCategory: (c: Category) => void
  setIntimacyMax: (n: number) => void
  resetFilters: () => void
  draw: () => Question[]
  resetDeck: () => void
  setPhase: (p: Phase) => void
  markRevealed: (id: string) => void
  clearCurrent: () => void
  remaining: () => number
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      mode: 'single',
      filters: defaultFilters(),
      drawnIds: [],
      currentDraw: [],
      phase: 'idle',
      revealedIds: [],

      setMode: (m) => set({ mode: m, currentDraw: [], phase: 'idle', revealedIds: [] }),

      toggleLevel: (l) =>
        set((s) => {
          const levels = s.filters.levels.includes(l)
            ? s.filters.levels.filter((x) => x !== l)
            : [...s.filters.levels, l]
          return { filters: { ...s.filters, levels } }
        }),

      toggleCategory: (c) =>
        set((s) => {
          const categories = s.filters.categories.includes(c)
            ? s.filters.categories.filter((x) => x !== c)
            : [...s.filters.categories, c]
          return { filters: { ...s.filters, categories } }
        }),

      setIntimacyMax: (n) =>
        set((s) => ({ filters: { ...s.filters, intimacyMax: n } })),

      resetFilters: () => set({ filters: defaultFilters() }),

      draw: () => {
        const { mode, filters, drawnIds } = get()
        const questions = getActiveQuestions()
        let picked = drawQuestions(questions, filters, drawnIds, mode)
        // 剩余不足时,自动循环:清空已抽记录,从全库重新抽取
        if (picked.length === 0 || picked.length < MODE_COUNT[mode]) {
          set({ drawnIds: [] })
          picked = drawQuestions(questions, filters, [], mode)
        }
        if (picked.length === 0) return []
        set((s) => ({
          currentDraw: picked,
          drawnIds: [...s.drawnIds, ...picked.map((q) => q.id)],
          phase: 'spreading',
          revealedIds: [],
        }))
        return picked
      },

      resetDeck: () =>
        set({ drawnIds: [], currentDraw: [], phase: 'idle', revealedIds: [] }),

      setPhase: (p) => set({ phase: p }),

      markRevealed: (id) =>
        set((s) => {
          const revealedIds = [...s.revealedIds, id]
          // 全部翻完 -> revealed
          const phase: Phase =
            revealedIds.length >= s.currentDraw.length ? 'revealed' : 'flipping'
          return { revealedIds, phase }
        }),

      clearCurrent: () => set({ currentDraw: [], phase: 'idle', revealedIds: [] }),

      remaining: () => {
        const { filters, drawnIds } = get()
        return remainingCount(getActiveQuestions(), filters, drawnIds)
      },
    }),
    {
      name: 'cc:deck',
      version: 1,
      partialize: (s) => ({ drawnIds: s.drawnIds, mode: s.mode }),
    }
  )
)

export { MODE_COUNT }
