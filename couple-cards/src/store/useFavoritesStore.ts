import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question } from '@/types/question'

interface FavoritesState {
  items: Question[]
  add: (q: Question) => void
  remove: (id: string) => void
  isFavorited: (id: string) => boolean
  clear: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (q) =>
        set((s) =>
          s.items.some((x) => x.id === q.id) ? s : { items: [q, ...s.items] }
        ),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      isFavorited: (id) => get().items.some((x) => x.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'cc:favorites', version: 1 }
  )
)
