import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  hint?: string
  icon?: ReactNode
}

interface CustomSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * 自定义下拉框:替代原生 <select>,让下拉列表样式也可完全自定义。
 * - 点击触发器展开浮层列表(framer-motion 动画)
 * - 点击外部自动关闭
 * - 选中项高亮 + 勾号
 * - 键盘 ESC 关闭
 */
export function CustomSelect({
  options,
  value,
  onChange,
  className,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value) ?? options[0]

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

  const handleSelect = (v: string) => {
    onChange(v)
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
        <span className="flex min-w-0 items-center gap-1.5 text-[var(--fg)]">
          {selected?.icon}
          <span className="truncate">{selected?.label}</span>
          {selected?.hint && (
            <span className="shrink-0 text-[10px] text-[var(--fg-soft)]">
              {selected.hint}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-[var(--muted)] transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* 下拉列表 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="glass absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-xl border border-[var(--border-c)] p-1 shadow-card"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--card) 92%, transparent)',
            }}
          >
            {options.map((opt) => {
              const isActive = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'text-[var(--fg)]'
                      : 'text-[var(--fg-soft)] hover:bg-[color-mix(in_srgb,var(--accent-rose)_10%,transparent)] hover:text-[var(--fg)]'
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor:
                            'color-mix(in srgb, var(--accent-rose) 12%, transparent)',
                        }
                      : undefined
                  }
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                    {opt.hint && (
                      <span className="shrink-0 text-[10px] text-[var(--fg-soft)]">
                        {opt.hint}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <Check size={14} className="shrink-0 text-[var(--accent-rose)]" />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
