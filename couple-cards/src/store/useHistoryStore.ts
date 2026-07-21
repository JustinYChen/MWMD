import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, DrawMode } from '@/types/question'
import type { HistoryRecord } from '@/types/deck'

// 历史记录永久保存,不设上限。用户只能手动清空。
interface HistoryState {
  records: HistoryRecord[]
  addRecord: (q: Question, mode: DrawMode, favorited: boolean) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (q, mode, favorited) =>
        set((s) => ({
          records: [
            { question: q, drawnAt: Date.now(), mode, favorited },
            ...s.records,
          ],
        })),
      clearHistory: () => set({ records: [] }),
    }),
    {
      name: 'cc:history',
      version: 2,
      // 版本迁移:旧数据(records 结构未变,只是移除了200条上限)直接沿用
      migrate: (persisted) => persisted,
    }
  )
)
