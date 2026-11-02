import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question } from '@/types/question'
import type { Tombstone } from '@/types/plan'
import { pruneTombstones } from '@/lib/tombstone'

interface FavoritesState {
  items: Question[]
  /** 取消收藏墓碑:防止其他设备把"已取消收藏"当作没见过的新收藏又加回来 */
  removed: Tombstone[]
  add: (q: Question) => void
  remove: (id: string) => void
  isFavorited: (id: string) => boolean
  clear: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      removed: [],
      add: (q) =>
        set((s) =>
          s.items.some((x) => x.id === q.id)
            ? s
            : {
                items: [q, ...s.items],
                // 重新收藏后,旧墓碑失效
                removed: s.removed.filter((r) => r.id !== q.id),
              }
        ),
      remove: (id) =>
        set((s) => ({
          items: s.items.filter((x) => x.id !== id),
          removed: pruneTombstones([...s.removed, { id, at: new Date().toISOString() }]),
        })),
      isFavorited: (id) => get().items.some((x) => x.id === id),
      clear: () =>
        set((s) => {
          const at = new Date().toISOString()
          return {
            items: [],
            removed: pruneTombstones([
              ...s.removed,
              ...s.items.map((x) => ({ id: x.id, at })),
            ]),
          }
        }),
    }),
    { name: 'cc:favorites', version: 1 }
  )
)
