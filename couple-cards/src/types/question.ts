/** 深度分级 */
export type Level = 'icebreaker' | 'warming' | 'soul'

/** 问题类别 */
export type Category = 'memory' | 'future' | 'romance' | 'values' | 'growth' | 'fun'

/** 抽牌模式 */
export type DrawMode = 'single' | 'triple' | 'cross'

/** 抽卡流程阶段 */
export type Phase = 'idle' | 'spreading' | 'flipping' | 'revealed'

/** 主题 */
export type Theme = 'light' | 'dark'

/** 语言 */
export type Lang = 'zh' | 'en'

/** 双语文本 */
export interface Bilingual {
  zh: string
  en: string
}

/** 追问 */
export interface FollowUp extends Bilingual {}

/** 单道问题 */
export interface Question {
  id: string
  level: Level
  category: Category
  text: Bilingual
  followUp?: FollowUp[]
  tags?: string[]
  /** 亲密度 1-5,用于过滤 */
  intimacy?: number
  /** 题目来源标注(如 Arthur Aron 36 Questions、Gottman Love Maps),仅用于溯源 */
  _src?: string
}

/** 级别元数据 */
export interface LevelMeta {
  key: Level
  label: Bilingual
  color: string
  description: Bilingual
}

/** 类别元数据 */
export interface CategoryMeta {
  key: Category
  label: Bilingual
  icon: string
  color: string
}

/** 题库根结构 */
export interface QuestionDeck {
  version: string
  questions: Question[]
  meta: {
    levels: LevelMeta[]
    categories: CategoryMeta[]
  }
}
