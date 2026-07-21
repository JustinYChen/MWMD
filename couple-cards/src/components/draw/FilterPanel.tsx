import { motion } from 'framer-motion'
import { Clock, Sparkles, Heart, Compass, Sprout, Dice5, type LucideIcon } from 'lucide-react'
import type { Level, Category } from '@/types/question'
import { LEVELS } from '@/data/levels'
import { CATEGORIES } from '@/data/categories'
import type { DeckFilters } from '@/types/deck'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  Clock,
  Sparkles,
  Heart,
  Compass,
  Sprout,
  Dice5,
}

interface Props {
  filters: DeckFilters
  remaining: number
  onToggleLevel: (l: Level) => void
  onToggleCategory: (c: Category) => void
  onIntimacyMax: (n: number) => void
  onReset: () => void
}

export function FilterPanel({
  filters,
  remaining,
  onToggleLevel,
  onToggleCategory,
  onIntimacyMax,
  onReset,
}: Props) {
  const hasFilter =
    filters.levels.length > 0 ||
    filters.categories.length > 0 ||
    filters.intimacyMax < 5

  return (
    <div className="flex flex-col gap-5">
      {/* 深度 */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-fg-soft">深度 · Level</span>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((lv) => {
            const active = filters.levels.includes(lv.key)
            return (
              <button
                key={lv.key}
                type="button"
                onClick={() => onToggleLevel(lv.key)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-all',
                  active
                    ? 'border-transparent text-bg'
                    : 'border-border-c text-fg-soft hover:text-fg'
                )}
                style={active ? { backgroundColor: lv.color } : undefined}
              >
                {lv.label.zh}
                <span className="ml-1 text-[10px] opacity-70">{lv.label.en}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 类别 */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-fg-soft">类别 · Category</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = filters.categories.includes(c.key)
            const Icon = ICONS[c.icon] ?? Clock
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onToggleCategory(c.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
                  active
                    ? 'border-transparent text-bg'
                    : 'border-border-c text-fg-soft hover:text-fg'
                )}
                style={active ? { backgroundColor: c.color } : undefined}
              >
                <Icon size={14} />
                {c.label.zh}
              </button>
            )
          })}
        </div>
      </div>

      {/* 亲密度上限 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-fg-soft">
            亲密上限 · Intimacy ≤ {filters.intimacyMax}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={filters.intimacyMax}
          onChange={(e) => onIntimacyMax(Number(e.target.value))}
          className="w-full accent-[var(--accent-rose)]"
          aria-label="亲密度上限"
        />
      </div>

      {/* 剩余计数 + 重置 */}
      <div className="flex items-center justify-between border-t border-border-c pt-3 text-xs text-fg-soft">
        <motion.span key={remaining} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          牌堆剩余 <span className="font-semibold text-fg">{remaining}</span> 张
        </motion.span>
        {hasFilter && (
          <button
            type="button"
            onClick={onReset}
            className="text-fg-soft underline-offset-2 hover:text-rose hover:underline"
          >
            清除筛选
          </button>
        )}
      </div>
    </div>
  )
}
