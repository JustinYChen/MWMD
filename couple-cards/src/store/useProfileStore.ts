import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types/profile'

interface ProfileStore extends Profile {
  setProfile: (p: Partial<Profile>) => void
  completeSetup: () => void
  reset: () => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      // 固定情侣信息(单人使用,写死)
      nameA: '陈小孩儿',
      nameB: '张小孩儿',
      anniversary: '2026-07-04',
      setupCompleted: true,
      setProfile: (p) => set((s) => ({ ...s, ...p })),
      completeSetup: () => set({ setupCompleted: true }),
      reset: () =>
        set({ nameA: '陈小孩儿', nameB: '张小孩儿', anniversary: '2026-07-04', setupCompleted: true }),
    }),
    {
      name: 'cc:profile',
      version: 2,
      migrate: (persisted: unknown, fromVersion: number) => {
        // v1 → v2:强制覆盖为固定情侣信息
        if (fromVersion < 2) {
          return {
            nameA: '陈小孩儿',
            nameB: '张小孩儿',
            anniversary: '2026-07-04',
            setupCompleted: true,
          }
        }
        return persisted as Record<string, unknown>
      },
    }
  )
)
