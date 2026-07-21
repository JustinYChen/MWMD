import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value: string // YYYY-MM-DD 格式
  onChange: (value: string) => void
  className?: string
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]

/** 将 Date 格式化为 YYYY-MM-DD(本地时区) */
function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 解析 YYYY-MM-DD 为 Date(本地时区,避免 UTC 偏移) */
function parseDate(s: string): Date | null {
  if (!s) return null
  const parts = s.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

/** 格式化日期为中文显示 */
function formatDisplay(s: string): string {
  const d = parseDate(s)
  if (!d) return '选择日期'
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 自定义日期选择器:替代原生 <input type="date">。
 * - 点击触发器展开日历面板
 * - 支持月份切换、日期选择
 * - 样式完全自定义,匹配应用 glassmorphism 风格
 * - 点击外部或 ESC 关闭
 */
export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = parseDate(value)
  const today = new Date()
  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? today.getFullYear()
  )
  const [viewMonth, setViewMonth] = useState(
    selected?.getMonth() ?? today.getMonth()
  )

  // 打开面板时定位到选中日期或今天
  useEffect(() => {
    if (!open) return
    const base = parseDate(value) ?? new Date()
    setViewYear(base.getFullYear())
    setViewMonth(base.getMonth())
  }, [open, value])

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  // 生成日历网格(6 行 x 7 列,含前后月补齐)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startWeekday = firstDay.getDay() // 0=周日
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const cells: { date: Date; current: boolean }[] = []
    // 前月补齐
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({
        date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
        current: false,
      })
    }
    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(viewYear, viewMonth, d), current: true })
    }
    // 后月补齐至 42 格(6 行)
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        date: new Date(viewYear, viewMonth + 1, d),
        current: false,
      })
    }
    return cells
  }, [viewYear, viewMonth])

  const isSameDay = (a: Date, b: Date | null) =>
    b && a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const isToday = (a: Date) => isSameDay(a, today)

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handlePick = (d: Date) => {
    onChange(formatDate(d))
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn('relative z-50', className)}>
      {/* 触发器 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm transition-all',
          open
            ? 'border-[var(--accent-rose)] bg-[color-mix(in_srgb,var(--card)_70%,transparent)]'
            : 'border-[var(--border-c)] bg-[color-mix(in_srgb,var(--card)_50%,transparent)] hover:border-[var(--accent-rose)]'
        )}
      >
        <span
          className={cn(
            'truncate',
            value ? 'text-[var(--fg)]' : 'text-[var(--fg-soft)]'
          )}
        >
          {formatDisplay(value)}
        </span>
        <Calendar
          size={14}
          className={cn(
            'shrink-0 transition-colors',
            open ? 'text-[var(--accent-rose)]' : 'text-[var(--muted)]'
          )}
        />
      </button>

      {/* 日历面板 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="glass absolute left-0 right-0 top-[calc(100%+6px)] z-50 w-[20rem] rounded-2xl border border-[var(--border-c)] p-3 shadow-card"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--card) 92%, transparent)',
            }}
          >
            {/* 月份导航 */}
            <div className="mb-3 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--fg-soft)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent-rose)_10%,transparent)] hover:text-[var(--fg)]"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-serif text-sm font-semibold text-[var(--fg)]">
                {viewYear}年 {MONTH_NAMES[viewMonth]}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--fg-soft)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent-rose)_10%,transparent)] hover:text-[var(--fg)]"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* 星期表头 */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="flex h-7 items-center justify-center text-[10px] font-medium text-[var(--fg-soft)]"
                >
                  {w}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, i) => {
                const isSelected = isSameDay(cell.date, selected)
                const isCurrentDay = isToday(cell.date)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePick(cell.date)}
                    className={cn(
                      'flex h-8 items-center justify-center rounded-lg text-xs transition-all',
                      cell.current
                        ? 'text-[var(--fg)]'
                        : 'text-[var(--fg-soft)] opacity-40',
                      isSelected
                        ? 'font-semibold text-[var(--bg)]'
                        : 'hover:bg-[color-mix(in_srgb,var(--accent-rose)_12%,transparent)]'
                    )}
                    style={
                      isSelected
                        ? { backgroundColor: 'var(--accent-rose)' }
                        : isCurrentDay && cell.current
                          ? {
                              border: '1px solid var(--accent-rose)',
                              color: 'var(--accent-rose)',
                            }
                          : undefined
                    }
                  >
                    {cell.date.getDate()}
                  </button>
                )
              })}
            </div>

            {/* 底部操作栏 */}
            <div className="mt-3 flex items-center justify-between border-t border-[var(--border-c)] pt-2">
              <button
                type="button"
                onClick={() => handlePick(today)}
                className="rounded-full px-3 py-1 text-xs text-[var(--accent-rose)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent-rose)_10%,transparent)]"
              >
                今天
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    setOpen(false)
                  }}
                  className="rounded-full px-3 py-1 text-xs text-[var(--fg-soft)] transition-colors hover:text-[var(--fg)]"
                >
                  清除
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
