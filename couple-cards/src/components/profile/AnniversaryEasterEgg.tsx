import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAnniversary } from '@/hooks/useAnniversary'
import { useProfileStore } from '@/store/useProfileStore'

/** 纪念日 / 里程碑天数彩蛋:全屏花瓣 + 祝福 */
export function AnniversaryEasterEgg() {
  const egg = useAnniversary()
  const { nameA, nameB } = useProfileStore()
  const [shown, setShown] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (egg && !dismissed) {
      const t = setTimeout(() => setShown(true), 600)
      return () => clearTimeout(t)
    }
    setShown(false)
  }, [egg, dismissed])

  const petals = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 4,
        size: 10 + Math.random() * 12,
        hue: i % 2 === 0 ? 'var(--accent-rose)' : 'var(--accent-gold)',
      })),
    []
  )

  const message = egg?.kind === 'anniversary'
    ? `在一起第 ${egg.years} 年纪念日快乐`
    : egg?.kind === 'milestone'
      ? `在一起第 ${egg.days} 天`
      : ''

  const names = [nameA, nameB].filter(Boolean).join(' & ')

  return (
    <AnimatePresence>
      {shown && egg && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background:
              'radial-gradient(circle at center, color-mix(in srgb, var(--accent-rose) 30%, var(--bg)), var(--bg))',
          }}
        >
          {/* 花瓣飘落 */}
          {petals.map((p, i) => (
            <span
              key={i}
              className="pointer-events-none absolute top-0 rounded-full"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                background: p.hue,
                opacity: 0.7,
                animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
              }}
            />
          ))}

          <button
            onClick={() => setDismissed(true)}
            aria-label="关闭"
            className="absolute right-6 top-6 text-fg-soft transition-colors hover:text-fg"
          >
            <X size={22} />
          </button>

          <div className="relative z-10 px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-2xl italic text-fg-soft"
            >
              Happy day
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 180 }}
              className="mt-2 font-serif text-4xl font-bold text-fg md:text-6xl"
            >
              {message}
            </motion.h2>
            {names && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4 font-display text-xl italic text-rose"
              >
                {names}
              </motion.p>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-sm text-fg-soft"
            >
              愿你们继续，慢慢说，慢慢爱。
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
