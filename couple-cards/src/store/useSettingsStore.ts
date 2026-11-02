import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types/profile'
import { audioEngine } from '@/lib/audioEngine'

interface SettingsStore extends Settings {
  /** 设置最后修改时间 ISO;多设备合并时据此判断哪一方的设置更新 */
  updatedAt?: string
  toggleTheme: () => void
  setTheme: (t: 'light' | 'dark') => void
  setSound: (b: boolean) => void
  setBgm: (b: boolean) => void
  setVolume: (v: number) => void
  setLanguage: (l: 'zh' | 'en') => void
}

/** 把主题写到 <html data-theme>,让 CSS 变量生效 */
export function applyTheme(theme: 'light' | 'dark') {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

function now(): string {
  return new Date().toISOString()
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      soundEnabled: true,
      bgmEnabled: true,
      volume: 0.6,
      language: 'zh',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light'
          applyTheme(next)
          return { theme: next, updatedAt: now() }
        }),
      setTheme: (t) => {
        applyTheme(t)
        set({ theme: t, updatedAt: now() })
      },
      setSound: (b) => {
        audioEngine.setSoundEnabled(b)
        set({ soundEnabled: b, updatedAt: now() })
      },
      setBgm: (b) => {
        audioEngine.setBgmEnabled(b)
        set({ bgmEnabled: b, updatedAt: now() })
      },
      setVolume: (v) => {
        audioEngine.setVolume(v)
        set({ volume: v, updatedAt: now() })
      },
      setLanguage: (l) => set({ language: l, updatedAt: now() }),
    }),
    {
      name: 'cc:settings',
      version: 2,
      migrate: (persisted: unknown, fromVersion: number) => {
        const s = (persisted || {}) as Partial<SettingsStore>
        // v1 → v2:重置 bgmEnabled 为 true,确保新方案下打开网页自动播放
        if (fromVersion < 2) {
          s.bgmEnabled = true
        }
        return s
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
          audioEngine.setSoundEnabled(state.soundEnabled)
          audioEngine.setVolume(state.volume)
        }
      },
    }
  )
)
