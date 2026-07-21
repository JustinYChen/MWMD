import { motion } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  onDraw: () => void
  onRedraw?: () => void
  remaining: number
  need: number
  phase: 'idle' | 'spreading' | 'flipping' | 'revealed'
}

// 粒子轨道配置:不同半径、速度、颜色、大小(12个粒子)
const ORBITS = [
  { radius: 54, duration: 4, color: 'gold', size: 4, delay: 0 },
  { radius: 48, duration: 3, color: 'rose', size: 3.5, delay: 0.3 },
  { radius: 60, duration: 5, color: 'gold', size: 3, delay: 0.6 },
  { radius: 44, duration: 3.5, color: 'rose', size: 3, delay: 0.9 },
  { radius: 66, duration: 6, color: 'gold', size: 4, delay: 0.2 },
  { radius: 40, duration: 2.8, color: 'rose', size: 2.5, delay: 1.2 },
  { radius: 70, duration: 5.5, color: 'gold', size: 3, delay: 0.5 },
  { radius: 52, duration: 4.2, color: 'rose', size: 3.5, delay: 1.5 },
  { radius: 58, duration: 3.8, color: 'gold', size: 2.5, delay: 0.8 },
  { radius: 46, duration: 3.2, color: 'rose', size: 4, delay: 1.8 },
  { radius: 64, duration: 4.8, color: 'gold', size: 3, delay: 1.1 },
  { radius: 42, duration: 2.5, color: 'rose', size: 2.5, delay: 2 },
]

const COLOR_MAP: Record<string, string> = {
  gold: 'var(--accent-gold)',
  rose: 'var(--accent-rose)',
}

export function DrawButton({ onDraw, onRedraw, remaining, need, phase }: Props) {
  const showRedraw = (phase === 'revealed' || phase === 'flipping') && onRedraw
  const cycling = remaining < need
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 粒子星河:悬停时出现 */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {ORBITS.map((o, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ width: 1, height: 1 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: o.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: o.delay,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: o.size,
                height: o.size,
                borderRadius: '50%',
                background: COLOR_MAP[o.color],
                left: o.radius,
                top: -o.size / 2,
                boxShadow: `0 0 8px ${COLOR_MAP[o.color]}`,
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* 光晕呼吸 */}
      <motion.span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--accent-rose) 40%, transparent), transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.button
        onClick={showRedraw ? onRedraw : onDraw}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-9 py-4 font-semibold text-bg shadow-card transition-shadow'
        )}
        style={{
          background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
        }}
      >
        <Shuffle size={18} />
        {showRedraw ? '再抽一次' : '抽 牌'}
      </motion.button>
      {cycling && (
        <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-fg-soft">
          牌堆将自动循环重置
        </p>
      )}
    </div>
  )
}
