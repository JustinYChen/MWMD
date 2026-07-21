import type { CategoryMeta } from '@/types/question'

/** 6 大类别元数据(icon 为 lucide-react 图标名) */
export const CATEGORIES: CategoryMeta[] = [
  {
    key: 'memory',
    label: { zh: '回忆', en: 'Memory' },
    icon: 'Clock',
    color: '#C9A86A',
  },
  {
    key: 'future',
    label: { zh: '未来', en: 'Future' },
    icon: 'Sparkles',
    color: '#8FA3A1',
  },
  {
    key: 'romance',
    label: { zh: '浪漫', en: 'Romance' },
    icon: 'Heart',
    color: '#C97064',
  },
  {
    key: 'values',
    label: { zh: '价值观', en: 'Values' },
    icon: 'Compass',
    color: '#A89B8C',
  },
  {
    key: 'growth',
    label: { zh: '成长', en: 'Growth' },
    icon: 'Sprout',
    color: '#9DAB86',
  },
  {
    key: 'fun',
    label: { zh: '趣味', en: 'Playful' },
    icon: 'Dice5',
    color: '#C9A86A',
  },
]

export const CATEGORY_MAP: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
)
