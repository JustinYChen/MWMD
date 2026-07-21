import { motion } from 'framer-motion'
import { Heart, Copy, Check, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Question } from '@/types/question'
import { CardTag } from './CardTag'
import { audioEngine } from '@/lib/audioEngine'
import { cn } from '@/lib/utils'

interface Props {
  question: Question
  favorited: boolean
  onToggleFavorite: (q: Question) => void
  onRemove?: (id: string) => void
  index?: number
}

/** 收藏夹 / 历史记录中的 2D 卡片 */
export function QuestionCard2D({
  question,
  favorited,
  onToggleFavorite,
  onRemove,
  index = 0,
}: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(`${question.text.zh}\n${question.text.en}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const handleFav = () => {
    onToggleFavorite(question)
    if (!favorited) audioEngine.playFavorite()
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: (index % 6) * 0.06, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col rounded-3xl glass p-6 shadow-soft transition-shadow hover:shadow-card"
    >
      <div className="mb-4">
        <CardTag level={question.level} category={question.category} />
      </div>
      <p className="flex-1 font-serif text-lg leading-relaxed text-fg">
        {question.text.zh}
      </p>
      <p className="mt-2 font-display text-sm italic text-fg-soft">
        {question.text.en}
      </p>
      <div className="mt-5 flex items-center gap-2 border-t border-border-c/60 pt-4">
        <button
          onClick={handleFav}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors',
            favorited
              ? 'bg-rose/10 text-rose'
              : 'text-fg-soft hover:text-rose'
          )}
        >
          <Heart size={13} fill={favorited ? 'currentColor' : 'none'} />
          {favorited ? '已收藏' : '收藏'}
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-fg-soft transition-colors hover:text-fg"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? '已复制' : '复制'}
        </button>
        {onRemove && (
          <button
            onClick={() => onRemove(question.id)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-fg-soft transition-colors hover:text-rose"
          >
            <Trash2 size={13} />
            移除
          </button>
        )}
      </div>
    </motion.article>
  )
}
