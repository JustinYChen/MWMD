import type { Category, Level, DrawMode, Phase } from './question'

export interface DeckFilters {
  levels: Level[]
  categories: Category[]
  intimacyMax: number
}

export interface HistoryRecord {
  question: import('./question').Question
  drawnAt: number
  mode: DrawMode
  favorited: boolean
}

export type { Category, Level, DrawMode, Phase }
