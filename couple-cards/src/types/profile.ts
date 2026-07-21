export interface Profile {
  nameA: string
  nameB: string
  anniversary: string // ISO 日期 yyyy-mm-dd
  setupCompleted: boolean
}

export interface Settings {
  theme: 'light' | 'dark'
  soundEnabled: boolean
  bgmEnabled: boolean
  volume: number // 0-1
  language: 'zh' | 'en'
}
