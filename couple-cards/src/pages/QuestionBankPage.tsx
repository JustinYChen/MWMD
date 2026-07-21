import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Library,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  BookLock,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  useQuestionBankStore,
  type ActiveBankId,
} from '@/store/useQuestionBankStore'
import { useDeckStore } from '@/store/useDeckStore'
import { QuestionEditorModal } from '@/components/bank/QuestionEditorModal'
import { Modal } from '@/components/ui/Modal'
import { Footer } from '@/components/layout/Footer'
import { LEVELS } from '@/data/levels'
import { CATEGORIES } from '@/data/categories'
import { LEVEL_MAP } from '@/data/levels'
import { CATEGORY_MAP } from '@/data/categories'
import { ALL_QUESTIONS } from '@/lib/shuffle'
import type { Question, Level, Category } from '@/types/question'
import { cn } from '@/lib/utils'

export default function QuestionBankPage() {
  const banks = useQuestionBankStore((s) => s.banks)
  const activeBankId = useQuestionBankStore((s) => s.activeBankId)
  const setActiveBank = useQuestionBankStore((s) => s.setActiveBank)
  const addBank = useQuestionBankStore((s) => s.addBank)
  const deleteBank = useQuestionBankStore((s) => s.deleteBank)
  const renameBank = useQuestionBankStore((s) => s.renameBank)
  const addQuestion = useQuestionBankStore((s) => s.addQuestion)
  const updateQuestion = useQuestionBankStore((s) => s.updateQuestion)
  const deleteQuestion = useQuestionBankStore((s) => s.deleteQuestion)
  const resetDeck = useDeckStore((s) => s.resetDeck)

  const [editingBankId, setEditingBankId] = useState<ActiveBankId | null>(null)
  const [editingBankName, setEditingBankName] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deleteBankConfirm, setDeleteBankConfirm] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<Level | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  // 当前题库的题目
  const currentQuestions = useMemo(() => {
    if (activeBankId === 'default') return ALL_QUESTIONS
    return banks.find((b) => b.id === activeBankId)?.questions ?? []
  }, [activeBankId, banks])

  const isDefault = activeBankId === 'default'
  const currentBankName = isDefault
    ? '默认题库'
    : banks.find((b) => b.id === activeBankId)?.name ?? '未知题库'

  // 筛选后的题目
  const filteredQuestions = useMemo(() => {
    return currentQuestions.filter((q) => {
      if (filterLevel !== 'all' && q.level !== filterLevel) return false
      if (filterCategory !== 'all' && q.category !== filterCategory) return false
      return true
    })
  }, [currentQuestions, filterLevel, filterCategory])

  // 切换题库或筛选条件时重置到第一页
  useEffect(() => {
    setPage(1)
  }, [activeBankId, filterLevel, filterCategory])

  // 分页计算
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredQuestions.slice(start, start + pageSize)
  }, [filteredQuestions, currentPage])

  // 切换题库时重置抽牌堆
  const handleSelectBank = (id: ActiveBankId) => {
    setActiveBank(id)
    resetDeck()
  }

  // 添加题库
  const handleAddBank = () => {
    const id = addBank('新题库')
    setActiveBank(id)
    resetDeck()
    // 立即进入重命名
    setEditingBankId(id)
    setEditingBankName('新题库')
  }

  // 保存题库名
  const handleSaveBankName = () => {
    if (editingBankId && editingBankId !== 'default') {
      renameBank(editingBankId, editingBankName)
    }
    setEditingBankId(null)
  }

  // 保存题目(新增或编辑)
  const handleSaveQuestion = (q: Question) => {
    if (!isDefault && activeBankId !== 'default') {
      if (editingQuestion) {
        updateQuestion(activeBankId, q.id, q)
      } else {
        addQuestion(activeBankId, q)
      }
    }
  }

  // 删除题目
  const handleDeleteQuestion = (qId: string) => {
    if (!isDefault && activeBankId !== 'default') {
      deleteQuestion(activeBankId, qId)
    }
  }

  return (
    <div className="min-h-[100dvh] pt-24 md:pt-28">
      <div className="container-x max-w-4xl">
        {/* 标题 */}
        <header className="mb-6 flex items-center gap-2">
          <Library className="text-gold" size={22} />
          <h1 className="font-serif text-3xl font-semibold text-fg">题库管理</h1>
          <span className="ml-2 font-display text-sm italic text-fg-soft">
            Question Banks
          </span>
        </header>

        {/* 题库选择器 */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {/* 默认题库 */}
          <BankChip
            active={activeBankId === 'default'}
            onClick={() => handleSelectBank('default')}
            icon={<BookLock size={14} />}
            name="默认题库"
            count={ALL_QUESTIONS.length}
            locked
          />
          {/* 自建题库 */}
          {banks.map((b) => (
            <BankChip
              key={b.id}
              active={activeBankId === b.id}
              onClick={() => handleSelectBank(b.id)}
              icon={<BookOpen size={14} />}
              name={b.name}
              count={b.questions.length}
            />
          ))}
          {/* 添加按钮 */}
          <button
            onClick={handleAddBank}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border-c px-3 py-1.5 text-sm text-fg-soft transition-colors hover:border-rose hover:text-rose"
          >
            <Plus size={14} /> 新建题库
          </button>
        </div>

        {/* 当前题库信息栏 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-4xl glass p-5">
          <div className="flex items-center gap-3">
            {isDefault ? (
              <BookLock className="text-gold" size={20} />
            ) : (
              <BookOpen className="text-rose" size={20} />
            )}
            {editingBankId === activeBankId && !isDefault ? (
              <div className="flex items-center gap-2">
                <input
                  className="rounded-lg border border-rose/50 bg-transparent px-3 py-1 text-lg font-semibold text-fg outline-none"
                  value={editingBankName}
                  onChange={(e) => setEditingBankName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveBankName()
                    if (e.key === 'Escape') setEditingBankId(null)
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveBankName}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-rose text-bg"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingBankId(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border-c text-fg-soft"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="font-serif text-xl font-semibold text-fg">
                  {currentBankName}
                </span>
                <span className="text-xs text-fg-soft">
                  共 {currentQuestions.length} 题
                  {isDefault ? ' · 不可编辑' : ' · 可编辑'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isDefault && (
              <>
                {!editingBankId && (
                  <button
                    onClick={() => {
                      setEditingBankId(activeBankId)
                      setEditingBankName(currentBankName)
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-border-c px-3 py-1.5 text-xs text-fg-soft transition-colors hover:text-fg"
                  >
                    <Pencil size={12} /> 重命名
                  </button>
                )}
                <button
                  onClick={() => setDeleteBankConfirm(activeBankId)}
                  className="inline-flex items-center gap-1 rounded-full border border-rose/40 px-3 py-1.5 text-xs text-rose/80 transition-colors hover:bg-rose/10 hover:text-rose"
                >
                  <Trash2 size={12} /> 删除题库
                </button>
              </>
            )}
          </div>
        </div>

        {/* 筛选 + 添加题目 */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              active={filterLevel === 'all'}
              onClick={() => setFilterLevel('all')}
            >
              全部深度
            </FilterChip>
            {LEVELS.map((lv) => (
              <FilterChip
                key={lv.key}
                active={filterLevel === lv.key}
                onClick={() => setFilterLevel(lv.key)}
                color={lv.color}
              >
                {lv.label.zh}
              </FilterChip>
            ))}
            <span className="mx-1 text-border-c">|</span>
            <FilterChip
              active={filterCategory === 'all'}
              onClick={() => setFilterCategory('all')}
            >
              全部类别
            </FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c.key}
                active={filterCategory === c.key}
                onClick={() => setFilterCategory(c.key)}
                color={c.color}
              >
                {c.label.zh}
              </FilterChip>
            ))}
          </div>

          {!isDefault && (
            <button
              onClick={() => {
                setEditingQuestion(null)
                setEditorOpen(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-bg shadow-card"
              style={{
                background:
                  'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
              }}
            >
              <Plus size={14} /> 添加题目
            </button>
          )}
        </div>

        {/* 题目列表 */}
        {filteredQuestions.length === 0 ? (
          <EmptyQuestions isDefault={isDefault} />
        ) : (
          <>
            <div className="mb-3 text-xs text-fg-soft">
              共 {filteredQuestions.length} 题 · 第 {currentPage}/{totalPages} 页
            </div>
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {pagedQuestions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.15) }}
                  >
                    <QuestionRow
                      question={q}
                      index={(currentPage - 1) * pageSize + i + 1}
                      editable={!isDefault}
                      onEdit={() => {
                        setEditingQuestion(q)
                        setEditorOpen(true)
                      }}
                      onDelete={() => handleDeleteQuestion(q.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      <div className="container-x max-w-4xl mt-16">
        <Footer />
      </div>

      {/* 添加/编辑题目弹窗 */}
      <QuestionEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveQuestion}
        editingQuestion={editingQuestion}
      />

      {/* 删除题库确认 */}
      <Modal
        open={!!deleteBankConfirm}
        onClose={() => setDeleteBankConfirm(null)}
        title="删除题库？"
      >
        <p className="mb-6 text-sm text-fg-soft">
          确定要删除题库「
          {banks.find((b) => b.id === deleteBankConfirm)?.name}」吗？
          题库中的所有题目将永久丢失,此操作不可恢复。
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteBankConfirm(null)}
            className="rounded-full border border-border-c px-5 py-2 text-sm text-fg-soft hover:text-fg"
          >
            取消
          </button>
          <button
            onClick={() => {
              if (deleteBankConfirm) {
                deleteBank(deleteBankConfirm)
                resetDeck()
              }
              setDeleteBankConfirm(null)
            }}
            className="rounded-full bg-rose px-5 py-2 text-sm text-bg"
          >
            确认删除
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ── 子组件 ──

function BankChip({
  active,
  onClick,
  icon,
  name,
  count,
  locked,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  name: string
  count: number
  locked?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-all',
        active
          ? 'border-transparent text-bg'
          : 'border-border-c text-fg-soft hover:text-fg'
      )}
      style={active ? { background: 'var(--accent-rose)' } : undefined}
    >
      {icon}
      {name}
      <span className="text-[10px] opacity-70">{count}</span>
      {locked && <BookLock size={11} className="opacity-50" />}
    </button>
  )
}

function FilterChip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs transition-all',
        active
          ? 'border-transparent text-bg'
          : 'border-border-c text-fg-soft hover:text-fg'
      )}
      style={active ? { backgroundColor: color ?? 'var(--accent-rose)' } : undefined}
    >
      {children}
    </button>
  )
}

function QuestionRow({
  question,
  index,
  editable,
  onEdit,
  onDelete,
}: {
  question: Question
  index: number
  editable: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const lv = LEVEL_MAP[question.level]
  const cat = CATEGORY_MAP[question.category]

  return (
    <div className="group flex items-start gap-4 rounded-3xl glass p-4 transition-shadow hover:shadow-card">
      {/* 序号 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card text-xs font-semibold text-fg-soft">
        {index}
      </div>

      {/* 内容 */}
      <div className="min-w-0 flex-1">
        <p className="font-serif text-sm text-fg">{question.text.zh}</p>
        {question.text.en && (
          <p className="mt-0.5 font-display text-xs italic text-fg-soft">
            {question.text.en}
          </p>
        )}
        {/* 标签 */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge color={lv?.color}>{lv?.label.zh}</Badge>
          <Badge color={cat?.color}>{cat?.label.zh}</Badge>
          {typeof question.intimacy === 'number' && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-fg-soft">
              <Layers size={10} />
              亲密度 {question.intimacy}
            </span>
          )}
          {question.tags?.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] text-fg-soft/60">
              #{t}
            </span>
          ))}
          {question._src && (
            <span className="text-[10px] italic text-gold/60">
              来源: {question._src}
            </span>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      {editable && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-full text-fg-soft transition-colors hover:bg-card hover:text-fg"
            aria-label="编辑"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-full text-fg-soft transition-colors hover:bg-rose/10 hover:text-rose"
            aria-label="删除"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode
  color?: string
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: color ? `${color}22` : 'var(--card)',
        color: color ?? 'var(--fg-soft)',
      }}
    >
      {children}
    </span>
  )
}

function EmptyQuestions({ isDefault }: { isDefault: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-4xl glass py-20 text-center">
      <Library className="mb-4 text-fg-soft" size={40} />
      <p className="font-serif text-xl text-fg">
        {isDefault ? '没有匹配的题目' : '这个题库还是空的'}
      </p>
      <p className="mt-2 text-sm text-fg-soft">
        {isDefault
          ? '试试调整筛选条件'
          : '点击「添加题目」开始创建你的专属题库'}
      </p>
    </div>
  )
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  // 生成页码列表,最多显示 7 个,用省略号表示跳过的部分
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border-c text-fg-soft transition-colors hover:text-fg disabled:opacity-30"
        aria-label="上一页"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-fg-soft">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-sm transition-all',
              p === currentPage
                ? 'border-transparent text-bg'
                : 'border-border-c text-fg-soft hover:text-fg'
            )}
            style={p === currentPage ? { background: 'var(--accent-rose)' } : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border-c text-fg-soft transition-colors hover:text-fg disabled:opacity-30"
        aria-label="下一页"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
