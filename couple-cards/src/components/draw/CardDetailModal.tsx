import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Copy, Check, X, MessageCircle, Layers, Tag } from 'lucide-react'
import { useState } from 'react'
import type { Question } from '@/types/question'
import { LEVEL_MAP } from '@/data/levels'
import { CATEGORY_MAP } from '@/data/categories'
import { CardTag } from '@/components/card/CardTag'
import { audioEngine } from '@/lib/audioEngine'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { cn } from '@/lib/utils'

interface Props {
  question: Question | null
  open: boolean
  onClose: () => void
  onToggleFavorite: (q: Question) => void
  /** 在牌阵中的位置标签,如"过去"、"现在"、"未来" */
  positionLabel?: { zh: string; en: string }
}

/**
 * 单卡片详情弹窗:在3D牌阵阶段点击已翻开的卡片时弹出,
 * 展示完整题目内容、追问、标签等详情。
 */
export function CardDetailModal({
  question,
  open,
  onClose,
  onToggleFavorite,
  positionLabel,
}: Props) {
  if (!question) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-lg rounded-4xl glass p-7 shadow-card"
          >
            <DetailContent
              question={question}
              positionLabel={positionLabel}
              onClose={onClose}
              onToggleFavorite={onToggleFavorite}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DetailContent({
  question,
  positionLabel,
  onClose,
  onToggleFavorite,
}: {
  question: Question
  positionLabel?: { zh: string; en: string }
  onClose: () => void
  onToggleFavorite: (q: Question) => void
}) {
  const [copied, setCopied] = useState(false)
  const isFav = useFavoritesStore((s) => s.items.some((x) => x.id === question.id))

  const lv = LEVEL_MAP[question.level]
  const cat = CATEGORY_MAP[question.category]

  const handleCopy = () => {
    const text = `${question.text.zh}\n${question.text.en}`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const handleFav = () => {
    onToggleFavorite(question)
    if (!isFav) audioEngine.playFavorite()
  }

  return (
    <>
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-fg-soft transition-colors hover:bg-card hover:text-fg"
        aria-label="关闭"
      >
        <X size={18} />
      </button>

      {/* 位置标签 */}
      {positionLabel && (
        <div className="mb-3 flex items-center gap-2">
          <span className="font-display text-sm italic text-gold">
            {positionLabel.zh} · {positionLabel.en}
          </span>
        </div>
      )}

      {/* 标签 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <CardTag level={question.level} category={question.category} size="md" />
        {typeof question.intimacy === 'number' && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border-c px-3 py-1 text-xs text-fg-soft">
            <Layers size={12} />
            亲密度 {question.intimacy}
          </span>
        )}
      </div>

      {/* 题目正文 */}
      <div className="mb-5">
        <p className="font-serif text-xl leading-relaxed text-fg md:text-2xl">
          {question.text.zh}
        </p>
        <p className="mt-2 font-display text-base italic text-fg-soft">
          {question.text.en}
        </p>
      </div>

      {/* 追问 */}
      {question.followUp && question.followUp.length > 0 && (
        <div className="mb-5 rounded-2xl border border-border-c/60 bg-card/40 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-fg-soft">
            <MessageCircle size={13} className="text-rose" />
            追问 · Follow-up
          </div>
          <ul className="flex flex-col gap-2">
            {question.followUp.map((f, i) => (
              <li key={i} className="text-sm text-fg">
                {f.zh}
                <span className="ml-2 font-display text-xs italic text-fg-soft">
                  {f.en}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 标签列表 */}
      {question.tags && question.tags.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          <Tag size={12} className="text-fg-soft" />
          {question.tags.map((t) => (
            <span key={t} className="text-xs text-fg-soft/70">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 来源 */}
      {question._src && (
        <p className="mb-4 text-xs italic text-gold/60">
          来源: {question._src}
        </p>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleFav}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors',
            isFav
              ? 'border-rose text-rose'
              : 'border-border-c text-fg-soft hover:text-rose'
          )}
        >
          <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
          {isFav ? '已收藏' : '收藏'}
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-c px-4 py-2 text-sm text-fg-soft transition-colors hover:text-fg"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
    </>
  )
}
