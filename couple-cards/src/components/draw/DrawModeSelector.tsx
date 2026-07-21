import { motion } from 'framer-motion'
import { Sparkle, Layers, Cross } from 'lucide-react'
import type { DrawMode } from '@/types/question'
import { MODE_COUNT } from '@/lib/shuffle'
import { cn } from '@/lib/utils'

const MODES: { key: DrawMode; zh: string; en: string; icon: typeof Sparkle; desc: string }[] = [
  { key: 'single', zh: '单抽', en: 'Single', icon: Sparkle, desc: '一题深聊' },
  { key: 'triple', zh: '三张', en: 'Triple', icon: Layers, desc: '过去·现在·未来' },
  { key: 'cross', zh: '十字', en: 'Cross', icon: Cross, desc: '五维深度对话' },
]

interface Props {
  mode: DrawMode
  onChange: (m: DrawMode) => void
  disabled?: boolean
}

export function DrawModeSelector({ mode, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-widest text-fg-soft">抽牌模式 · Mode</span>
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((m) => {
          const active = m.key === mode
          const Icon = m.icon
          return (
            <button
              key={m.key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(m.key)}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-sm transition-colors disabled:opacity-50',
                active
                  ? 'border-rose text-fg'
                  : 'border-border-c text-fg-soft hover:text-fg'
              )}
            >
              {active && (
                <motion.span
                  layoutId="mode-active"
                  className="absolute inset-0 -z-10 rounded-2xl"
                  style={{
                    background:
                      'linear-gradient(120deg, color-mix(in srgb, var(--accent-rose) 18%, transparent), color-mix(in srgb, var(--accent-gold) 18%, transparent))',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                />
              )}
              <Icon size={18} className={active ? 'text-rose' : ''} />
              <span className="font-medium">{m.zh}</span>
              <span className="text-[10px] text-fg-soft">{MODE_COUNT[m.key]}张</span>
              <span className="text-[10px] text-fg-soft">{m.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
