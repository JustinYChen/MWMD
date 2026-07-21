import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

interface SparkleFallProps {
  /** 触发标识,改变即触发一次洒落 */
  trigger: number
}

/**
 * 金粉洒落粒子效果。
 * 在 trigger 值变化时播放:从顶部洒落玫瑰金色粒子,覆盖全屏,
 * 持续时间较长(3-4秒),带旋转和飘动。
 */
export function SparkleFall({ trigger }: SparkleFallProps) {
  const particles = useMemo(() => {
    if (trigger === 0) return []
    // 40个粒子,覆盖更大面积
    return Array.from({ length: 40 }, (_, i) => ({
      id: `${trigger}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2.5 + Math.random() * 2, // 2.5-4.5秒,持续更久
      size: 3 + Math.random() * 5,
      color: Math.random() > 0.5 ? 'var(--accent-gold)' : 'var(--accent-rose)',
      rotate: Math.random() * 720,
      drift: (Math.random() - 0.5) * 200, // 更大水平漂移
      startOpacity: 0.6 + Math.random() * 0.4,
    }))
  }, [trigger])

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: -30, x: 0, rotate: 0 }}
            animate={{
              opacity: [0, p.startOpacity, p.startOpacity, 0],
              y: ['-30px', '110vh'],
              x: [0, p.drift],
              rotate: p.rotate,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeIn',
              times: [0, 0.08, 0.85, 1],
            }}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: 0,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
