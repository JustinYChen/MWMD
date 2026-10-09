import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

interface AchievementBurstProps {
  /** 里程碑数字(10/50/100),null = 不显示 */
  milestone: number | null
  /** 结束回调 */
  onDone: () => void
}

/**
 * 成就庆祝:完成第 10 / 50 / 100 件计划时全屏播放。
 * 金粉洒落 + 中心大爱心扩散 + 文案。
 */
export function AchievementBurst({ milestone, onDone }: AchievementBurstProps) {
  useEffect(() => {
    if (milestone == null) return
    const t = setTimeout(onDone, 4200)
    return () => clearTimeout(t)
  }, [milestone, onDone])

  return (
    <AnimatePresence>
      {milestone != null && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景柔光 */}
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              background:
                'radial-gradient(circle, color-mix(in srgb, var(--accent-rose) 18%, transparent), color-mix(in srgb, var(--bg) 55%, transparent))',
            }}
            animate={{ opacity: [0, 1, 1, 0.6] }}
            transition={{ duration: 4, times: [0, 0.15, 0.8, 1] }}
          />

          {/* 金粉洒落(复用粒子逻辑) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 56 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -30, x: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 0.9, 0.9, 0],
                  y: ['-30px', '110vh'],
                  x: [(Math.random() - 0.5) * 120],
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 2.5 + Math.random() * 2,
                  delay: Math.random() * 1.2,
                  ease: 'easeIn',
                }}
                style={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  top: 0,
                  width: 3 + Math.random() * 5,
                  height: 3 + Math.random() * 5,
                  borderRadius: '50%',
                  background:
                    Math.random() > 0.5 ? 'var(--accent-gold)' : 'var(--accent-rose)',
                  boxShadow: `0 0 12px ${Math.random() > 0.5 ? 'var(--accent-gold)' : 'var(--accent-rose)'}`,
                }}
              />
            ))}
          </div>

          {/* 中心内容 */}
          <div className="relative z-10 flex flex-col items-center gap-5 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.25, 1], rotate: [-20, 6, 0] }}
              transition={{ duration: 0.8, ease: 'backOut' }}
              className="flex h-24 w-24 items-center justify-center rounded-full shadow-card"
              style={{
                background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
              }}
            >
              <Heart size={44} className="text-bg" fill="currentColor" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <p className="font-serif text-3xl font-bold text-fg md:text-4xl">
                第 {milestone} 件
              </p>
              <p className="mt-2 font-display text-lg italic text-fg-soft">
                一起完成的心愿,又多了一件
              </p>
            </motion.div>

            {/* 环形扩散 */}
            <motion.div
              className="absolute -z-10 h-24 w-24 rounded-full border-2"
              style={{ borderColor: 'var(--accent-rose)' }}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: [1, 2.6], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, repeat: 2, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
