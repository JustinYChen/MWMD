import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Copy, Check, Shuffle, X } from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import type { Question, DrawMode } from '@/types/question'
import { SPREAD_LABELS } from '@/three/layouts'
import { CardTag } from '@/components/card/CardTag'
import { audioEngine } from '@/lib/audioEngine'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  cards: Question[]
  mode: DrawMode
  favorited: (id: string) => boolean
  onToggleFavorite: (q: Question) => void
  onRedraw: () => void
  onClose: () => void
}

export function CardRevealOverlay({
  open,
  cards,
  mode,
  onToggleFavorite,
  onRedraw,
  onClose,
}: Props) {
  const labels = SPREAD_LABELS[mode]
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩 */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

          {/* 滚动容器 */}
          <div
            ref={scrollRef}
            className="relative z-10 h-full overflow-y-auto overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* 光芒绽放背景(动效4):在滚动容器内部,作为内容区域的底层背景 */}
            <LightBloom />

            <div className="relative z-10 mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center gap-5 p-6 py-16">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-xl italic text-fg-soft"
              >
                翻开彼此 · Reveal each other
              </motion.p>

              {cards.map((q, i) => (
                <RevealCard
                  key={q.id}
                  q={q}
                  label={labels[i]}
                  index={i}
                  onToggleFavorite={() => onToggleFavorite(q)}
                />
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + cards.length * 0.1 }}
                className="mt-4 flex flex-wrap items-center justify-center gap-3"
              >
                <button
                  onClick={onRedraw}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-medium text-bg shadow-card"
                  style={{
                    background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
                  }}
                >
                  <Shuffle size={16} />
                  再抽一局
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-full border border-border-c px-7 py-3 font-medium text-fg-soft hover:text-fg"
                >
                  <X size={16} />
                  收起
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── 动效4:光芒绽放背景 ──
function LightBloom() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute"
        style={{
          width: '80vmax',
          height: '80vmax',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--accent-gold) 30%, transparent) 0%, color-mix(in srgb, var(--accent-rose) 15%, transparent) 25%, transparent 55%)',
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          width: '40vmax',
          height: '40vmax',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--accent-rose) 25%, transparent) 0%, transparent 50%)',
        }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
    </div>
  )
}

// ── 动效5:文字逐字浮现 ──
function TypewriterText({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const chars = useMemo(() => Array.from(text), [text])
  return (
    <span className={className}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.06,
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block' }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  )
}

// ── 动效6:收藏心形爆炸 ──
function HeartBurst({ trigger }: { trigger: number }) {
  const bursts = useMemo(() => {
    if (trigger === 0) return []
    const directions = [
      { x: -60, y: -40 }, { x: 60, y: -40 },
      { x: -80, y: 0 }, { x: 80, y: 0 },
      { x: -50, y: 40 }, { x: 50, y: 40 },
      { x: 0, y: -60 }, { x: 0, y: 60 },
      { x: -40, y: -60 }, { x: 40, y: -60 },
    ]
    return directions.map((d, i) => ({
      id: `${trigger}-${i}`,
      x: d.x + (Math.random() - 0.5) * 20,
      y: d.y + (Math.random() - 0.5) * 20,
      delay: i * 0.02,
      size: 10 + Math.random() * 6,
      color: Math.random() > 0.5 ? 'var(--accent-rose)' : 'var(--accent-gold)',
    }))
  }, [trigger])

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 0, x: b.x, y: b.y, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: b.delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              color: b.color,
              fontSize: b.size,
            }}
          >
            <Heart size={b.size} fill="currentColor" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── 揭示卡片 ──
function RevealCard({
  q,
  label,
  index,
  onToggleFavorite,
}: {
  q: Question
  label: { zh: string; en: string }
  index: number
  onToggleFavorite: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [burstTrigger, setBurstTrigger] = useState(0)
  const isFav = useFavoritesStore((s) => s.items.some((x) => x.id === q.id))

  const handleCopy = () => {
    const text = `${q.text.zh}\n${q.text.en}`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const handleFav = () => {
    onToggleFavorite()
    if (!isFav) {
      audioEngine.playFavorite()
      setBurstTrigger((t) => t + 1) // 触发心形爆炸
    }
  }

  const baseDelay = 0.15 + index * 0.12

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: baseDelay, type: 'spring', stiffness: 200, damping: 22 }}
      className="relative w-full overflow-visible rounded-4xl glass p-7 shadow-card"
    >
      <div className="relative mb-3 flex items-center justify-between">
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: baseDelay + 0.3 }}
          className="font-display text-sm italic text-gold"
        >
          {label.zh} · {label.en}
        </motion.span>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: baseDelay + 0.3 }}
        >
          <CardTag level={q.level} category={q.category} />
        </motion.div>
      </div>

      {/* 题目文字逐字浮现(动效5) */}
      <p className="font-serif text-2xl leading-relaxed text-fg md:text-3xl">
        <TypewriterText text={q.text.zh} delay={baseDelay + 0.4} />
      </p>
      <p className="mt-2 font-display text-lg italic text-fg-soft">
        <TypewriterText text={q.text.en} delay={baseDelay + 0.4 + Array.from(q.text.zh).length * 0.06} />
      </p>

      <div className="mt-5 flex items-center gap-3">
        {/* 收藏按钮 + 心形爆炸(动效6) */}
        <div className="relative">
          <button
            onClick={handleFav}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors',
              isFav
                ? 'border-rose text-rose'
                : 'border-border-c text-fg-soft hover:text-rose'
            )}
            aria-label={isFav ? '取消收藏' : '收藏'}
          >
            <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
            {isFav ? '已收藏' : '收藏'}
          </button>
          <HeartBurst trigger={burstTrigger} />
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-c px-4 py-2 text-sm text-fg-soft transition-colors hover:text-fg"
          aria-label="复制"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
    </motion.div>
  )
}
