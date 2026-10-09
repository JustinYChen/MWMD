import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, CalendarPlus, MapPin, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import type { Plan, PlanCategory } from '@/types/plan'
import { getCountdown, countdownText, countdownColor, weekdayCN } from '@/lib/countdown'
import { getPlanImageUrl } from '@/lib/planMedia'
import { cn } from '@/lib/utils'

interface PlanCardProps {
  plan: Plan
  category?: PlanCategory
  /** 点击勾选(未完成→弹完成框;已完成→取消) */
  onToggleComplete: (plan: Plan) => void
  /** 点击卡片主体(编辑) */
  onEdit: (plan: Plan) => void
  /** 删除 */
  onDelete: (plan: Plan) => void
  /** 愿望"定日子" */
  onSetDate: (plan: Plan) => void
  index?: number
}

/** 分类小圆点 */
function CategoryDot({ c }: { c?: PlanCategory }) {
  if (!c) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-fg-soft">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
      {c.name}
    </span>
  )
}

/** 倒计时徽章 */
function CountdownBadge({ date }: { date: string }) {
  const info = getCountdown(date)
  const text = countdownText(info)
  if (!text) return null
  const color = countdownColor(info)
  return (
    <span
      className="shrink-0 rounded-full px-3 py-1 text-xs font-medium glass"
      style={color ? { color } : undefined}
    >
      {text}
    </span>
  )
}

/**
 * 云端图片:保存后文件可能还在异步上传中,首次加载会失败。
 * 失败后带间隔自动重试,超过次数放弃(如旧数据本就无文件)。
 */
function CloudImg({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [attempt, setAttempt] = useState(0)
  return (
    <img
      src={attempt ? `${src}?retry=${attempt}` : src}
      alt={alt}
      className={className}
      onError={() => {
        if (attempt < 6) setTimeout(() => setAttempt((a) => a + 1), 1500)
      }}
    />
  )
}

export function PlanCard({
  plan,
  category,
  onToggleComplete,
  onEdit,
  onDelete,
  onSetDate,
  index = 0,
}: PlanCardProps) {
  const [confirmDel, setConfirmDel] = useState(false)
  const cover = plan.hasCover ? getPlanImageUrl(plan.id, 'cover') : undefined
  const reflectionPhoto = plan.hasReflectionPhoto
    ? getPlanImageUrl(plan.id, 'reflection')
    : undefined
  const cd = getCountdown(plan.date)

  /* ---------- 已完成卡片 ---------- */
  if (plan.completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index, 8) * 0.04 }}
        className="group relative flex items-start gap-4 rounded-2xl glass p-5"
      >
        <button
          onClick={() => onToggleComplete(plan)}
          aria-label="取消完成"
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110"
          style={{ background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))' }}
        >
          <Check size={14} className="text-bg" />
        </button>
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEdit(plan)}>
          <div className="flex items-center gap-2 text-xs text-fg-soft">
            <span>{dayjs(plan.completedAt).format('YYYY年MM月DD日 HH:mm')} 完成</span>
          </div>
          <p className="mt-1 font-serif text-base text-fg line-through decoration-fg-soft/40">
            {plan.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <CategoryDot c={category} />
            {plan.location && (
              <span className="inline-flex items-center gap-1 text-xs text-fg-soft">
                <MapPin size={11} /> {plan.location}
              </span>
            )}
          </div>
          {(plan.reflection || reflectionPhoto) && (
            <div className="mt-3 rounded-xl border border-border-c/50 bg-[color-mix(in_srgb,var(--card)_40%,transparent)] p-3">
              {reflectionPhoto && (
                <CloudImg
                  src={reflectionPhoto}
                  alt="完成时刻"
                  className="mb-2 h-28 w-full rounded-lg object-cover"
                />
              )}
              {plan.reflection && (
                <p className="text-sm italic leading-relaxed text-fg-soft">
                  “{plan.reflection}”
                </p>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => (confirmDel ? onDelete(plan) : setConfirmDel(true))}
          onBlur={() => setConfirmDel(false)}
          aria-label="删除"
          className={cn(
            'shrink-0 rounded-full p-1.5 text-fg-soft/0 transition-all group-hover:text-fg-soft hover:text-rose',
            confirmDel && '!text-rose'
          )}
        >
          <Trash2 size={15} />
        </button>
      </motion.div>
    )
  }

  /* ---------- 带配图的卡片(愿景板风格) ---------- */
  if (cover) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index, 8) * 0.04 }}
        className="group relative cursor-pointer overflow-hidden rounded-3xl"
        onClick={() => onEdit(plan)}
      >
        <div className="relative h-44 md:h-52">
          <CloudImg src={cover} alt={plan.title} className="h-full w-full object-cover" />
          {/* 底部渐变遮罩,保证文字可读 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--bg) 88%, transparent) 12%, transparent 60%)',
            }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleComplete(plan)
                }}
                aria-label="完成"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gold/70 bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] transition-all hover:scale-110 hover:border-rose"
              >
                <Check size={13} className="text-fg-soft hover:text-rose" />
              </button>
              <p className="truncate font-serif text-lg font-semibold text-fg">
                {plan.title}
              </p>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <CategoryDot c={category} />
              {plan.location && (
                <span className="inline-flex items-center gap-1 text-xs text-fg-soft">
                  <MapPin size={11} /> {plan.location}
                </span>
              )}
              {plan.date && (
                <span className="text-xs text-fg-soft">
                  {dayjs(plan.date).format('M月D日')}
                </span>
              )}
            </div>
          </div>
          {plan.date && <CountdownBadge date={plan.date} />}
          {!plan.date && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSetDate(plan)
              }}
              className="inline-flex shrink-0 items-center gap-1 rounded-full glass px-3 py-1.5 text-xs text-gold transition-colors hover:text-rose"
            >
              <CalendarPlus size={12} /> 定日子
            </button>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            confirmDel ? onDelete(plan) : setConfirmDel(true)
          }}
          onBlur={() => setConfirmDel(false)}
          aria-label="删除"
          className={cn(
            'absolute right-3 top-3 rounded-full p-1.5 text-fg-soft/0 backdrop-blur-sm transition-all group-hover:text-fg-soft hover:!text-rose',
            confirmDel && '!text-rose'
          )}
        >
          <Trash2 size={15} />
        </button>
      </motion.div>
    )
  }

  /* ---------- 无图行卡片 ---------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="group relative flex items-center gap-4 rounded-2xl glass p-4 transition-colors hover:border-rose/30"
    >
      <button
        onClick={() => onToggleComplete(plan)}
        aria-label="完成"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-border-c transition-all hover:scale-110 hover:border-rose"
      >
        <Check size={13} className="text-transparent transition-colors group-hover:text-rose/0" />
      </button>
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={() => onEdit(plan)}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-serif text-base text-fg">{plan.title}</p>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <CategoryDot c={category} />
          {plan.location && (
            <span className="inline-flex items-center gap-1 text-xs text-fg-soft">
              <MapPin size={11} /> {plan.location}
            </span>
          )}
          {plan.date && (
            <span className={cn('text-xs', cd.kind === 'today' ? 'font-semibold text-rose' : 'text-fg-soft')}>
              {dayjs(plan.date).format('M月D日')} {weekdayCN(plan.date)}
            </span>
          )}
          {plan.budget != null && (
            <span className="text-xs text-fg-soft">预算 ¥{plan.budget}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {plan.date ? (
          <CountdownBadge date={plan.date} />
        ) : (
          <button
            onClick={() => onSetDate(plan)}
            className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs text-gold transition-colors hover:text-rose"
          >
            <CalendarPlus size={12} /> 定日子
          </button>
        )}
        <button
          onClick={() => (confirmDel ? onDelete(plan) : setConfirmDel(true))}
          onBlur={() => setConfirmDel(false)}
          aria-label="删除"
          className={cn(
            'rounded-full p-1.5 text-fg-soft/0 transition-all group-hover:text-fg-soft hover:!text-rose',
            confirmDel && '!text-rose'
          )}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  )
}
