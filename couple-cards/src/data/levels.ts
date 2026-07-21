import type { LevelMeta } from '@/types/question'

/** 3 级深度元数据:破冰 / 升温 / 灵魂 */
export const LEVELS: LevelMeta[] = [
  {
    key: 'icebreaker',
    label: { zh: '破冰', en: 'Icebreaker' },
    color: '#E8DCC8',
    description: {
      zh: '轻松开场,慢慢靠近彼此',
      en: 'Light starts, gently drawing closer',
    },
  },
  {
    key: 'warming',
    label: { zh: '升温', en: 'Warming' },
    color: '#C97064',
    description: {
      zh: '深入一些,让温度慢慢升起',
      en: 'Go a little deeper, let warmth rise',
    },
  },
  {
    key: 'soul',
    label: { zh: '灵魂', en: 'Soul' },
    color: '#C9A86A',
    description: {
      zh: '触及内心,看见真正的彼此',
      en: 'Touch the soul, truly see each other',
    },
  },
]

export const LEVEL_MAP: Record<string, LevelMeta> = Object.fromEntries(
  LEVELS.map((l) => [l.key, l])
)
