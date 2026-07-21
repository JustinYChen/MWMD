import type { Level, Category } from '@/types/question'
import { LEVEL_MAP } from '@/data/levels'
import { CATEGORY_MAP } from '@/data/categories'

interface Props {
  level: Level
  category: Category
  size?: 'sm' | 'md'
}

/** 深度 + 类别标签 */
export function CardTag({ level, category, size = 'sm' }: Props) {
  const lv = LEVEL_MAP[level]
  const cat = CATEGORY_MAP[category]
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium text-bg ${pad}`}
        style={{ backgroundColor: lv.color }}
      >
        {lv.label.zh}
      </span>
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-border-c text-fg-soft ${pad}`}
      >
        {cat.label.zh}
      </span>
    </div>
  )
}
