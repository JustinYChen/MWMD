import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartCrack, Heart } from 'lucide-react'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { QuestionCard2D } from '@/components/card/QuestionCard2D'
import { Footer } from '@/components/layout/Footer'
import type { Category } from '@/types/question'
import { CATEGORIES } from '@/data/categories'
import { cn } from '@/lib/utils'

export default function FavoritesPage() {
  const items = useFavoritesStore((s) => s.items)
  const remove = useFavoritesStore((s) => s.remove)
  const isFavorited = useFavoritesStore((s) => s.isFavorited)
  const [filter, setFilter] = useState<Category | 'all'>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((q) => q.category === filter)),
    [items, filter]
  )

  return (
    <div className="min-h-[100dvh] pt-24 md:pt-28">
      <div className="container-x">
        <header className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Heart className="text-rose" size={22} fill="currentColor" />
            <h1 className="font-serif text-3xl font-semibold text-fg">收藏夹</h1>
          </div>
          <p className="font-display text-sm italic text-fg-soft">
            Saved · 共 {items.length} 题
          </p>
        </header>

        {/* 类别筛选 */}
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            全部
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.key}
              active={filter === c.key}
              onClick={() => setFilter(c.key)}
            >
              {c.label.zh}
            </FilterChip>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((q, i) => (
              <QuestionCard2D
                key={q.id}
                question={q}
                index={i}
                favorited={isFavorited(q.id)}
                onToggleFavorite={(_q) => remove(q.id)}
                onRemove={remove}
              />
            ))}
          </div>
        )}
      </div>
      <div className="container-x mt-16">
        <Footer />
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm transition-all',
        active
          ? 'border-transparent text-bg'
          : 'border-border-c text-fg-soft hover:text-fg'
      )}
      style={active ? { background: 'var(--accent-rose)' } : undefined}
    >
      {children}
    </button>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-4xl glass py-20 text-center">
      <HeartCrack className="mb-4 text-fg-soft" size={40} />
      <p className="font-serif text-xl text-fg">还没有收藏的题</p>
      <p className="mt-2 text-sm text-fg-soft">去抽牌，把心动的问题留下来。</p>
      <Link
        to="/draw"
        className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3 font-medium text-bg shadow-card"
        style={{
          background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
        }}
      >
        去抽牌
      </Link>
    </div>
  )
}
