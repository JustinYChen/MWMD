import { History as HistoryIcon, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { CardTag } from '@/components/card/CardTag'
import { Footer } from '@/components/layout/Footer'
import { Modal } from '@/components/ui/Modal'
import { useState, useMemo } from 'react'
import { LEVEL_MAP } from '@/data/levels'
import { cn } from '@/lib/utils'

const MODE_LABEL: Record<string, string> = {
  single: '单抽',
  triple: '三张',
  cross: '十字',
}

const PAGE_SIZE = 20

export default function HistoryPage() {
  const records = useHistoryStore((s) => s.records)
  const clearHistory = useHistoryStore((s) => s.clearHistory)
  const isFavorited = useFavoritesStore((s) => s.isFavorited)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)

  // 按日期分组
  const groups = useMemo(() => {
    return records.reduce<Record<string, typeof records>>((acc, r) => {
      const key = dayjs(r.drawnAt).format('YYYY-MM-DD')
      ;(acc[key] ??= []).push(r)
      return acc
    }, {})
  }, [records])

  // 日期键列表(倒序)
  const dateKeys = useMemo(() => Object.keys(groups).sort().reverse(), [groups])

  // 分页:将日期分组扁平化后按页切割
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  // 当前页包含的日期分组
  const pagedGroups = useMemo(() => {
    let count = 0
    const skipped = (currentPage - 1) * PAGE_SIZE
    const result: Record<string, typeof records> = {}
    for (const key of dateKeys) {
      const list = groups[key]
      if (count + list.length <= skipped) {
        count += list.length
        continue
      }
      if (count >= skipped + PAGE_SIZE) break
      const start = Math.max(0, skipped - count)
      const end = Math.min(list.length, skipped + PAGE_SIZE - count)
      result[key] = list.slice(start, end)
      count += list.length
    }
    return result
  }, [groups, dateKeys, currentPage])

  return (
    <div className="min-h-[100dvh] pt-24 md:pt-28">
      <div className="container-x">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <HistoryIcon className="text-gold" size={22} />
              <h1 className="font-serif text-3xl font-semibold text-fg">历史记录</h1>
            </div>
            <p className="font-display text-sm italic text-fg-soft">
              History · 共 {records.length} 题
            </p>
          </div>
          {records.length > 0 && (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm text-fg-soft transition-colors hover:text-rose"
            >
              <Trash2 size={14} /> 清空
            </button>
          )}
        </header>

        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-4xl glass py-20 text-center">
            <Clock className="mb-4 text-fg-soft" size={40} />
            <p className="font-serif text-xl text-fg">还没有抽过牌</p>
            <p className="mt-2 text-sm text-fg-soft">开始第一局，留下你们的对话痕迹。</p>
            <button
              onClick={() => navigate('/draw')}
              className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3 font-medium text-bg shadow-card"
              style={{
                background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
              }}
            >
              去抽牌
            </button>
          </div>
        ) : (
          <>
          <div className="flex flex-col gap-10">
            {Object.entries(pagedGroups).map(([date, list]) => (
              <div key={date}>
                <p className="mb-4 font-display text-sm italic text-fg-soft">
                  {dayjs(date).format('YYYY年MM月DD日')}
                </p>
                <div className="flex flex-col gap-3">
                  {list.map((r, i) => (
                    <motion.div
                      key={`${r.question.id}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (i % 6) * 0.05 }}
                      className="flex items-start gap-4 rounded-2xl glass p-5"
                    >
                      <span
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: LEVEL_MAP[r.question.level].color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2 text-xs text-fg-soft">
                          <span>{dayjs(r.drawnAt).format('HH:mm')}</span>
                          <span>· {MODE_LABEL[r.mode] ?? r.mode}</span>
                          {r.favorited && <span className="text-rose">· 已收藏</span>}
                        </div>
                        <p className="font-serif text-base text-fg">
                          {r.question.text.zh}
                        </p>
                        <p className="font-display text-xs italic text-fg-soft">
                          {r.question.text.en}
                        </p>
                        <div className="mt-3">
                          <CardTag level={r.question.level} category={r.question.category} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                  currentPage <= 1
                    ? 'cursor-not-allowed text-fg-soft/30'
                    : 'glass text-fg-soft hover:text-fg'
                )}
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true
                  if (p === 1 || p === totalPages) return true
                  if (Math.abs(p - currentPage) <= 1) return true
                  return false
                })
                .map((p, idx, arr) => {
                  const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsisBefore && (
                        <span className="px-1 text-fg-soft/50">···</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={cn(
                          'flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm transition-colors',
                          p === currentPage
                            ? 'font-semibold text-bg'
                            : 'glass text-fg-soft hover:text-fg'
                        )}
                        style={
                          p === currentPage
                            ? { background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))' }
                            : undefined
                        }
                      >
                        {p}
                      </button>
                    </span>
                  )
                })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                  currentPage >= totalPages
                    ? 'cursor-not-allowed text-fg-soft/30'
                    : 'glass text-fg-soft hover:text-fg'
                )}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          </>
        )}
      </div>
      <div className="container-x mt-16">
        <Footer />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="清空历史记录？">
        <p className="mb-6 text-sm text-fg-soft">
          清空后无法恢复，但收藏夹不受影响。
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-border-c px-5 py-2 text-sm text-fg-soft hover:text-fg"
          >
            取消
          </button>
          <button
            onClick={() => {
              clearHistory()
              setOpen(false)
            }}
            className="rounded-full px-5 py-2 text-sm text-bg"
            style={{ background: 'var(--accent-rose)' }}
          >
            确认清空
          </button>
        </div>
      </Modal>
    </div>
  )
}
