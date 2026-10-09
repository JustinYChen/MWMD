import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

interface SyncStore {
  /** 已登录的共享账号 email(空 = 未登录;session 由 supabase-js 管理) */
  account: string
  /** 是否启用自动同步 */
  autoSync: boolean
  /** 本地有未成功推送到云端的变更(防止 pull 覆盖丢数据) */
  hasPending: boolean
  /** 上次同步时间(ISO) */
  lastSyncAt: string
  /** 同步状态 */
  status: SyncStatus
  /** 错误信息 */
  error: string
  setAccount: (a: string) => void
  setAutoSync: (b: boolean) => void
  setHasPending: (b: boolean) => void
  setLastSyncAt: (t: string) => void
  setStatus: (s: SyncStatus, err?: string) => void
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      account: '',
      autoSync: true,
      hasPending: false,
      lastSyncAt: '',
      status: 'idle',
      error: '',
      setAccount: (account) => set({ account }),
      setAutoSync: (autoSync) => set({ autoSync }),
      setHasPending: (hasPending) => set({ hasPending }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
      setStatus: (status, err = '') => set({ status, error: err }),
    }),
    {
      name: 'cc:sync',
      version: 2,
      // v1 存的是 GitHub token(Gist 同步),v2 起换 Supabase 账号登录,token 弃用
      migrate: (persisted) => {
        const old = persisted as { autoSync?: boolean; hasPending?: boolean }
        return {
          account: '',
          autoSync: old.autoSync ?? true,
          hasPending: old.hasPending ?? false,
        }
      },
      // 只持久化 account/autoSync/hasPending,不持久化运行时状态
      partialize: (s) => ({
        account: s.account,
        autoSync: s.autoSync,
        hasPending: s.hasPending,
      }),
    }
  )
)
