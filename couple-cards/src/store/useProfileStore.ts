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
      nameA: '',
      nameB: '',
      anniversary: '',
      setupCompleted: false,
      setProfile: (p) => set((s) => ({ ...s, ...p })),
      completeSetup: () => set({ setupCompleted: true }),
      reset: () =>
        set({ nameA: '', nameB: '', anniversary: '', setupCompleted: false }),
    }),
    { name: 'cc:profile', version: 1 }
  )
)
