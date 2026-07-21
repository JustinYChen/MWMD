import type { Level, Category } from '@/types/question'

/**
 * 题目自动分类器。
 *
 * 基于关键词权重评分,分析题目文本(中英双语)自动推断:
 * - level: 深度分级(破冰 / 升温 / 灵魂)
 * - category: 类别(回忆 / 未来 / 浪漫 / 价值观 / 成长 / 趣味)
 * - intimacy: 亲密度(1-5)
 *
 * 分析时同时考虑中文和英文文本,取综合得分最高者。
 */

interface CategoryKeywords {
  memory: string[]
  future: string[]
  romance: string[]
  values: string[]
  growth: string[]
  fun: string[]
}

/** 各类别关键词(中英混合) */
const CATEGORY_KEYWORDS: CategoryKeywords = {
  memory: [
    '记得', '回忆', '第一次', '过去', '曾经', '一起做过', '那天', '当时', '那次',
    '那刻', '那年', '之前', '还记得', '记忆', '往事', '初遇', '相识',
    'remember', 'recall', 'first time', 'past', 'used to', 'back then',
    'that day', 'memory', 'memories', 'first met', 'when we',
  ],
  future: [
    '未来', '以后', '将来', '想象', '希望', '计划', '梦想', '如果我们',
    '五年', '十年', '明年', ' someday', '老去', '以后的日子',
    'future', 'imagine', 'hope', 'plan', 'dream', 'someday', 'will',
    'years from', 'down the road', 'envision',
  ],
  romance: [
    '爱', '心动', '吻', '拥抱', '浪漫', '喜欢', '温柔', '心跳', '被爱',
    '心动', '暧昧', '甜蜜', '亲密', '吸引', '魅力', '感觉',
    'love', 'kiss', 'hug', 'romantic', 'heart', 'tender', 'feel loved',
    'attracted', 'sweet', 'intimate', 'desire',
  ],
  values: [
    '认为', '重要', '应该', '价值', '看法', '观点', '怎么看', '定义',
    '信仰', '原则', '底线', '道德', '对错', '意义', '态度',
    'believe', 'important', 'should', 'value', 'think', 'define',
    'opinion', 'principle', 'matter', 'meaning', 'stance',
  ],
  growth: [
    '改变', '变化', '成长', '努力', '变得', '学到', '改掉', '克服',
    '进步', '提升', '蜕变', '反思', '习惯', '弱点', '优点',
    'change', 'grow', 'improve', 'become', 'learn', 'overcome',
    'progress', 'better', 'transform', 'reflect', 'habit',
  ],
  fun: [
    '如果', '假如', '游戏', '搞笑', '有趣', '动物', '电影', '互换',
    '超能力', '穿越', '世界末日', '丧尸', '组合', '名字', '角色',
    'if', 'game', 'fun', 'silly', 'animal', 'movie', 'swap',
    'superpower', 'apocalypse', 'zombie', 'character',
  ],
}

/** 深度分级关键词 — 越深的关键词权重越高 */
const LEVEL_KEYWORDS: Record<Level, string[]> = {
  icebreaker: [
    '喜欢', '什么', '最', '如果', '假如', '哪个', '哪种', '觉得',
    '像', '动物', '电影', '颜色', '食物',
    'favorite', 'what', 'which', 'if', 'like', 'fun', 'silly',
  ],
  warming: [
    '感觉', '想法', '担心', '害怕', '记得', '那次', '争吵', '感动',
    '为你', '担心', '在乎', '不确定', '迷茫',
    'feel', 'think', 'worry', 'afraid', 'argue', 'moved',
    'care', 'uncertain', 'concerned',
  ],
  soul: [
    '为什么', '意义', '灵魂', '深处', '恐惧', '死亡', '信仰', '存在',
    '本质', '永远', '放下', '原谅', '遗憾', '最深处', '秘密',
    'why', 'meaning', 'soul', 'deep', 'fear', 'death', 'believe',
    'existence', 'forever', 'forgive', 'regret', 'secret',
  ],
}

/** 亲密度提升关键词 */
const INTIMACY_KEYWORDS = [
  { words: ['恐惧', '死亡', '信仰', '秘密', '最深处', '灵魂', 'fear', 'death', 'soul', 'secret'], boost: 2 },
  { words: ['害怕', '担心', '脆弱', '哭', '原谅', '遗憾', 'afraid', 'vulnerable', 'cry', 'forgive'], boost: 1 },
  { words: ['争吵', '冲突', '失望', 'argue', 'conflict', 'disappoint'], boost: 1 },
  { words: ['感觉', '心动', '被爱', 'feel', 'loved', 'heart'], boost: 0.5 },
]

export interface ClassificationResult {
  level: Level
  category: Category
  intimacy: number
  /** 各维度得分明细,用于调试/展示 */
  scores: {
    category: Record<Category, number>
    level: Record<Level, number>
  }
}

/**
 * 对题目文本进行自动分类。
 * @param zh 中文文本
 * @param en 英文文本(可选)
 */
export function classifyQuestion(zh: string, en = ''): ClassificationResult {
  const text = `${zh} ${en}`.toLowerCase()
  const textZh = zh.toLowerCase()

  // ── 类别评分 ──
  const categoryScores = {
    memory: 0, future: 0, romance: 0, values: 0, growth: 0, fun: 0,
  } as Record<Category, number>

  ;(Object.keys(CATEGORY_KEYWORDS) as Category[]).forEach((cat) => {
    for (const kw of CATEGORY_KEYWORDS[cat]) {
      if (text.includes(kw.toLowerCase())) {
        categoryScores[cat] += 1
      }
    }
  })

  // ── 深度评分 ──
  const levelScores = {
    icebreaker: 0, warming: 0, soul: 0,
  } as Record<Level, number>

  ;(Object.keys(LEVEL_KEYWORDS) as Level[]).forEach((lv) => {
    for (const kw of LEVEL_KEYWORDS[lv]) {
      if (text.includes(kw.toLowerCase())) {
        levelScores[lv] += 1
      }
    }
  })

  // ── 选出最高分 ──
  let bestCategory: Category = 'fun' // 默认趣味
  let maxCat = 0
  ;(Object.keys(categoryScores) as Category[]).forEach((c) => {
    if (categoryScores[c] > maxCat) {
      maxCat = categoryScores[c]
      bestCategory = c
    }
  })

  let bestLevel: Level = 'icebreaker' // 默认破冰
  let maxLv = 0
  ;(Object.keys(levelScores) as Level[]).forEach((l) => {
    if (levelScores[l] > maxLv) {
      maxLv = levelScores[l]
      bestLevel = l
    }
  })

  // 如果没有匹配到任何关键词,给一个合理的默认值
  if (maxCat === 0) bestCategory = 'romance'
  if (maxLv === 0) {
    // 根据文本长度和标点推断深度
    if (textZh.length > 25 || text.length > 60) bestLevel = 'warming'
  }

  // ── 亲密度计算 ──
  let intimacy = bestLevel === 'icebreaker' ? 1 : bestLevel === 'warming' ? 3 : 4
  for (const group of INTIMACY_KEYWORDS) {
    for (const w of group.words) {
      if (text.includes(w.toLowerCase())) {
        intimacy += group.boost
        break // 每组只加一次
      }
    }
  }
  intimacy = Math.min(5, Math.max(1, Math.round(intimacy)))

  return {
    level: bestLevel,
    category: bestCategory,
    intimacy,
    scores: { category: categoryScores, level: levelScores },
  }
}

/**
 * 猜测文本语言。
 * 含中文字符 → 'zh',否则 → 'en'。
 */
export function detectLang(text: string): 'zh' | 'en' {
  return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en'
}
