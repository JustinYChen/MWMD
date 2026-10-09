import { useMemo, useState } from 'react'
import { CalendarHeart, Plus, Settings2, Clock, Sparkles, CheckCircle2, PenLine } from 'lucide-react'
import { usePlansStore } from '@/store/usePlansStore'
import { PlanCard } from '@/components/plan/PlanCard'
import { PlanEditor } from '@/components/plan/PlanEditor'
import { CompleteModal } from '@/components/plan/CompleteModal'
import { CategoryManager } from '@/components/plan/CategoryManager'
import { AchievementBurst } from '@/components/plan/AchievementBurst'
import { Footer } from '@/components/layout/Footer'
import { Modal } from '@/components/ui/Modal'
import { DatePicker } from '@/components/ui/DatePicker'
import { milestoneOf } from '@/lib/countdown'
import { removeCloudPlanImages } from '@/lib/planMedia'
import type { Plan } from '@/types/plan'
import { cn } from '@/lib/utils'

export default function PlansPage() {
  const { plans, categories, addPlan, updatePlan, removePlan } = usePlansStore()

  const [quickTitle, setQuickTitle] = useState('')
  const [editing, setEditing] = useState<Plan | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [completing, setCompleting] = useState<Plan | null>(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [datingPlan, setDatingPlan] = useState<Plan | null>(null)
  const [datingValue, setDatingValue] = useState('')
  const [milestone, setMilestone] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const categoryOf = (id: string) => categories.find((c) => c.id === id)

  /* 分组 */
  const { upcoming, wishes, completed } = useMemo(() => {
    const filtered = filter === 'all' ? plans : plans.filter((p) => p.categoryId === filter)
    const upcoming = filtered
      .filter((p) => !p.completed && p.date)
      .sort((a, b) => a.date.localeCompare(b.date))
    const wishes = filtered.filter((p) => !p.completed && !p.date)
    const completed = filtered
      .filter((p) => p.completed)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    return { upcoming, wishes, completed }
  }, [plans, filter])

  /* 快速添加:回车即建为愿望 */
  const handleQuickAdd = () => {
    const t = quickTitle.trim()
    if (!t) return
    addPlan({ title: t })
    setQuickTitle('')
  }

  const handleDelete = (plan: Plan) => {
    removePlan(plan.id)
    void removeCloudPlanImages(plan.id)
  }

  const handleToggleComplete = (plan: Plan) => {
    if (plan.completed) {
      // 已完成 → 取消完成(同时清掉感想照片)
      updatePlan(plan.id, { hasReflectionPhoto: false })
      usePlansStore.getState().uncompletePlan(plan.id)
      void removeCloudPlanImages(plan.id)
    } else {
      setCompleting(plan)
    }
  }

  const handleSetDate = (plan: Plan) => {
    setDatingPlan(plan)
    setDatingValue(plan.date || '')
  }

  const confirmDating = () => {
    if (!datingPlan) return
    updatePlan(datingPlan.id, { date: datingValue })
    setDatingPlan(null)
  }

  const Section = ({
    icon: Icon,
    title,
    hint,
    list,
    className,
  }: {
    icon: typeof Clock
    title: string
    hint?: string
    list: Plan[]
    className?: string
  }) => {
    if (list.length === 0) return null
    return (
      <section className={className}>
        <div className="mb-3 flex items-center gap-2">
          <Icon size={16} className="text-gold" />
          <h2 className="font-display text-sm italic text-fg-soft">
            {title}
            <span className="ml-2 text-xs text-fg-soft/60">{list.length}</span>
          </h2>
          {hint && <span className="text-xs text-fg-soft/50">{hint}</span>}
        </div>
        <div className="flex flex-col gap-3">
          {list.map((p, i) => (
            <PlanCard
              key={p.id}
              plan={p}
              category={categoryOf(p.categoryId)}
              onToggleComplete={handleToggleComplete}
              onEdit={(plan) => {
                setEditing(plan)
                setEditorOpen(true)
              }}
              onDelete={handleDelete}
              onSetDate={handleSetDate}
              index={i}
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-[100dvh] pt-24 md:pt-28">
      <div className="container-x">
        {/* 页头 */}
        <header className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarHeart className="text-gold" size={22} />
              <h1 className="font-serif text-3xl font-semibold text-fg">计划</h1>
            </div>
            <p className="font-display text-sm italic text-fg-soft">
              Plans · 想一起做的小事
            </p>
          </div>
          <button
            onClick={() => setCategoryOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm text-fg-soft transition-colors hover:text-rose"
          >
            <Settings2 size={14} /> 管理分类
          </button>
        </header>

        {/* 快速添加 + 详细模式 */}
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <PenLine
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-soft/60"
            />
            <input
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              placeholder="想到一件想一起做的事?敲下回车,先存进愿望池…"
              className={cn(
                'w-full rounded-full border border-border-c py-3 pl-11 pr-4 text-sm text-fg outline-none',
                'bg-[color-mix(in_srgb,var(--card)_50%,transparent)] transition-all',
                'placeholder:text-fg-soft/50 focus:border-rose hover:border-rose/50'
              )}
            />
          </div>
          <button
            onClick={() => {
              setEditing(null)
              setEditorOpen(true)
            }}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full px-5 text-sm font-medium text-bg shadow-card transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
            }}
          >
            <Plus size={16} /> 详细计划
          </button>
        </div>

        {/* 分类筛选 */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs transition-colors',
              filter === 'all'
                ? 'bg-fg text-bg'
                : 'glass text-fg-soft hover:text-fg'
            )}
          >
            全部 {plans.length}
          </button>
          {categories.map((c) => {
            const n = plans.filter((p) => p.categoryId === c.id).length
            return (
              <button
                key={c.id}
                onClick={() => setFilter(filter === c.id ? 'all' : c.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all',
                  filter === c.id
                    ? 'text-bg'
                    : 'glass text-fg-soft hover:text-fg'
                )}
                style={filter === c.id ? { backgroundColor: c.color } : undefined}
              >
                <span
                  className={cn('h-2 w-2 rounded-full', filter === c.id && 'bg-bg/60')}
                  style={filter === c.id ? undefined : { backgroundColor: c.color }}
                />
                {c.name} {n > 0 && n}
              </button>
            )
          })}
        </div>

        {/* 分组列表 */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-4xl glass py-20 text-center">
            <Sparkles className="mb-4 text-gold" size={40} />
            <p className="font-serif text-xl text-fg">从一件小事开始</p>
            <p className="mt-2 text-sm text-fg-soft">
              看一次日出、去一家想去很久的店、养一盆植物…
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <Section icon={Clock} title="即将到来" list={upcoming} />
            <Section icon={Sparkles} title="愿望池" hint="还没定日子的心动" list={wishes} />
            <Section icon={CheckCircle2} title="已完成" list={completed} />
          </div>
        )}
      </div>

      <div className="container-x mt-16">
        <Footer />
      </div>

      {/* 编辑 / 新建(详细) */}
      <PlanEditor
        open={editorOpen}
        plan={editing}
        onClose={() => {
          setEditorOpen(false)
          setEditing(null)
        }}
      />

      {/* 完成弹窗 */}
      <CompleteModal
        open={!!completing}
        plan={completing}
        onClose={() => setCompleting(null)}
        onCompleted={(nth) => {
          const m = milestoneOf(nth)
          if (m) setMilestone(m)
        }}
      />

      {/* 分类管理 */}
      <CategoryManager open={categoryOpen} onClose={() => setCategoryOpen(false)} />

      {/* 愿望定日子 */}
      <Modal
        open={!!datingPlan}
        onClose={() => setDatingPlan(null)}
        title="定个好日子"
        maxWidth="max-w-sm"
      >
        {datingPlan && (
          <>
            <p className="mb-4 font-serif text-base text-fg">“{datingPlan.title}”</p>
            <DatePicker value={datingValue} onChange={setDatingValue} />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDatingPlan(null)}
                className="rounded-full border border-border-c px-5 py-2 text-sm text-fg-soft hover:text-fg"
              >
                再想想
              </button>
              <button
                onClick={confirmDating}
                disabled={!datingValue}
                className="rounded-full px-6 py-2 text-sm font-medium text-bg shadow-card transition-transform hover:scale-105 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
                }}
              >
                就这天
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* 成就庆祝 */}
      <AchievementBurst milestone={milestone} onDone={() => setMilestone(null)} />
    </div>
  )
}
