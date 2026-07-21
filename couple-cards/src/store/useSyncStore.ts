import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

interface SyncStore {
  /** GitHub token(存 localStorage,不硬编码) */
  token: string
  /** 是否启用自动同步 */
  autoSync: boolean
  /** 上次同步时间(ISO) */
  lastSyncAt: string
  /** 同步状态 */
  status: SyncStatus
  /** 错误信息 */
  error: string
  setToken: (t: string) => void
  setAutoSync: (b: boolean) => void
  setLastSyncAt: (t: string) => void
  setStatus: (s: SyncStatus, err?: string) => void
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      token: '',
      autoSync: true,
      lastSyncAt: '',
      status: 'idle',
      error: '',
      setToken: (token) => set({ token }),
      setAutoSync: (autoSync) => set({ autoSync }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
      setStatus: (status, err = '') => set({ status, error: err }),
    }),
    {
      name: 'cc:sync',
      version: 1,
      // 只持久化 token 和 autoSync,不持久化运行时状态
      partialize: (s) => ({ token: s.token, autoSync: s.autoSync }),
    }
  )
)
