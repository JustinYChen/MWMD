import type { Question, DrawMode, Level, Category } from '@/types/question'
import type { DeckFilters } from '@/types/deck'
import deck from '@/data/questions.json'

export const ALL_QUESTIONS: Question[] = deck.questions as Question[]

/** 模式对应抽牌张数 */
export const MODE_COUNT: Record<DrawMode, number> = {
  single: 1,
  triple: 3,
  cross: 5,
}

/** Fisher-Yates 洗牌(原地) */
export function fisherYates<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 按过滤器筛选题库 */
export function filterQuestions(
  questions: Question[],
  filters: DeckFilters
): Question[] {
  return questions.filter((q) => {
    if (filters.levels.length && !filters.levels.includes(q.level)) return false
    if (filters.categories.length && !filters.categories.includes(q.category))
      return false
    if (typeof q.intimacy === 'number' && q.intimacy > filters.intimacyMax)
      return false
    return true
  })
}

/** 计算当前过滤器下剩余可抽数量 */
export function remainingCount(
  questions: Question[],
  filters: DeckFilters,
  drawnIds: string[]
): number {
  const pool = filterQuestions(questions, filters)
  const drawnSet = new Set(drawnIds)
  return pool.filter((q) => !drawnSet.has(q.id)).length
}

/** 抽牌纯函数:按过滤器筛选、排除已抽、洗牌取 N 张 */
export function drawQuestions(
  questions: Question[],
  filters: DeckFilters,
  drawnIds: string[],
  mode: DrawMode
): Question[] {
  const pool = filterQuestions(questions, filters).filter(
    (q) => !drawnIds.includes(q.id)
  )
  const shuffled = fisherYates(pool)
  return shuffled.slice(0, MODE_COUNT[mode])
}

/** 默认过滤器:全部级别、全部类别、亲密度上限 5 */
export function defaultFilters(): DeckFilters {
  return {
    levels: [] as Level[],
    categories: [] as Category[],
    intimacyMax: 5,
  }
}
