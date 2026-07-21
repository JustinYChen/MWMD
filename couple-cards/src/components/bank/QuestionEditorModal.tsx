import { useState, useEffect, useCallback } from 'react'
import { Loader2, Wand2, Languages, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { LEVELS } from '@/data/levels'
import { CATEGORIES } from '@/data/categories'
import type { Question, Level, Category } from '@/types/question'
import { classifyQuestion, detectLang } from '@/lib/questionClassifier'
import { translateText } from '@/lib/translator'
import { genQuestionId } from '@/store/useQuestionBankStore'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (q: Question) => void
  /** 传入则为编辑模式,不传为新增模式 */
  editingQuestion?: Question | null
}

export function QuestionEditorModal({
  open,
  onClose,
  onSave,
  editingQuestion,
}: Props) {
  const isEdit = !!editingQuestion
  const [zh, setZh] = useState('')
  const [en, setEn] = useState('')
  const [level, setLevel] = useState<Level>('icebreaker')
  const [category, setCategory] = useState<Category>('romance')
  const [intimacy, setIntimacy] = useState(2)
  const [tags, setTags] = useState('')
  const [autoApplied, setAutoApplied] = useState(false)
  const [translating, setTranslating] = useState<'zh2en' | 'en2zh' | null>(null)
  const [translateError, setTranslateError] = useState('')

  // 打开弹窗时初始化
  useEffect(() => {
    if (!open) return
    if (editingQuestion) {
      setZh(editingQuestion.text.zh)
      setEn(editingQuestion.text.en)
      setLevel(editingQuestion.level)
      setCategory(editingQuestion.category)
      setIntimacy(editingQuestion.intimacy ?? 2)
      setTags((editingQuestion.tags ?? []).join(', '))
      setAutoApplied(true)
    } else {
      setZh('')
      setEn('')
      setLevel('icebreaker')
      setCategory('romance')
      setIntimacy(2)
      setTags('')
      setAutoApplied(false)
    }
    setTranslateError('')
    setTranslating(null)
  }, [open, editingQuestion])

  // 自动分类:当中文或英文文本变化时(仅新增模式 + 尚未手动调整)
  const runAutoClassify = useCallback(() => {
    if (isEdit) return // 编辑模式不自动覆盖
    if (!zh.trim() && !en.trim()) return
    const result = classifyQuestion(zh, en)
    setLevel(result.level)
    setCategory(result.category)
    setIntimacy(result.intimacy)
    setAutoApplied(true)
  }, [zh, en, isEdit])

  // 文本变化时延迟自动分类(debounced)
  useEffect(() => {
    if (isEdit) return
    if (!zh.trim() && !en.trim()) {
      setAutoApplied(false)
      return
    }
    const t = setTimeout(runAutoClassify, 500)
    return () => clearTimeout(t)
  }, [zh, en, isEdit, runAutoClassify])

  // 翻译
  const handleTranslate = async (direction: 'zh2en' | 'en2zh') => {
    setTranslateError('')
    if (direction === 'zh2en') {
      if (!zh.trim()) return
      setTranslating('zh2en')
      const result = await translateText(zh, 'en')
      setTranslating(null)
      if (result) {
        setEn(result)
      } else {
        setTranslateError('翻译服务暂不可用,请手动输入英文')
      }
    } else {
      if (!en.trim()) return
      setTranslating('en2zh')
      const result = await translateText(en, 'zh')
      setTranslating(null)
      if (result) {
        setZh(result)
      } else {
        setTranslateError('翻译服务暂不可用,请手动输入中文')
      }
    }
  }

  const handleSave = () => {
    const trimmedZh = zh.trim()
    const trimmedEn = en.trim()
    if (!trimmedZh && !trimmedEn) return

    const question: Question = {
      id: editingQuestion?.id ?? genQuestionId(),
      level,
      category,
      text: {
        zh: trimmedZh || trimmedEn, // 至少有一个
        en: trimmedEn || trimmedZh,
      },
      intimacy,
      tags: tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean),
    }
    onSave(question)
    onClose()
  }

  const canSave = zh.trim().length > 0 || en.trim().length > 0
  const zhLang = detectLang(zh)
  const enLang = detectLang(en)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑题目' : '添加题目'}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-5">
        {/* 中文输入 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-fg-soft">中文题目</label>
            <button
              type="button"
              onClick={() => handleTranslate('zh2en')}
              disabled={!zh.trim() || translating !== null}
              className="inline-flex items-center gap-1 text-xs text-rose transition-opacity hover:opacity-80 disabled:opacity-30"
            >
              {translating === 'zh2en' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Languages size={12} />
              )}
              译为英文
            </button>
          </div>
          <textarea
            className="bank-input min-h-[72px] resize-none"
            value={zh}
            onChange={(e) => setZh(e.target.value)}
            placeholder="输入中文题目…"
            rows={2}
          />
        </div>

        {/* 英文输入 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-fg-soft">English Question</label>
            <button
              type="button"
              onClick={() => handleTranslate('en2zh')}
              disabled={!en.trim() || translating !== null}
              className="inline-flex items-center gap-1 text-xs text-rose transition-opacity hover:opacity-80 disabled:opacity-30"
            >
              {translating === 'en2zh' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Languages size={12} />
              )}
              译为中文
            </button>
          </div>
          <textarea
            className="bank-input min-h-[72px] resize-none"
            value={en}
            onChange={(e) => setEn(e.target.value)}
            placeholder="Type English question…"
            rows={2}
          />
        </div>

        {translateError && (
          <p className="text-xs text-rose/80">{translateError}</p>
        )}

        {/* 自动分析提示 */}
        {autoApplied && !isEdit && (
          <div className="flex items-center gap-1.5 rounded-xl bg-rose/10 px-3 py-2 text-xs text-fg-soft">
            <Wand2 size={12} className="text-rose" />
            已根据文本自动分析深度、类别与亲密度,可手动调整
          </div>
        )}

        {/* 深度分级 */}
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-fg-soft">
            深度 · Level
          </span>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((lv) => (
              <button
                key={lv.key}
                type="button"
                onClick={() => setLevel(lv.key)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-all',
                  level === lv.key
                    ? 'border-transparent text-bg'
                    : 'border-border-c text-fg-soft hover:text-fg'
                )}
                style={level === lv.key ? { backgroundColor: lv.color } : undefined}
              >
                {lv.label.zh}
                <span className="ml-1 text-[10px] opacity-70">{lv.label.en}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 类别 */}
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-fg-soft">
            类别 · Category
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-all',
                  category === c.key
                    ? 'border-transparent text-bg'
                    : 'border-border-c text-fg-soft hover:text-fg'
                )}
                style={category === c.key ? { backgroundColor: c.color } : undefined}
              >
                {c.label.zh}
              </button>
            ))}
          </div>
        </div>

        {/* 亲密度 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-fg-soft">
              亲密度 · Intimacy
            </span>
            <span className="text-sm font-semibold text-fg">{intimacy}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={intimacy}
            onChange={(e) => setIntimacy(Number(e.target.value))}
            className="w-full accent-[var(--accent-rose)]"
          />
        </div>

        {/* 标签 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-fg-soft">标签(可选,逗号分隔)</label>
          <input
            className="bank-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="如:甜蜜, 深度, sweet, deep"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-full border border-border-c px-5 py-2 text-sm text-fg-soft hover:text-fg"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm text-bg transition-opacity disabled:opacity-40"
            style={{ background: 'var(--accent-rose)' }}
          >
            <Check size={14} />
            {isEdit ? '保存修改' : '添加'}
          </button>
        </div>
      </div>

      <style>{`
        .bank-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--border-c);
          background: color-mix(in srgb, var(--bg) 60%, transparent);
          padding: 0.6rem 0.85rem;
          font-size: 0.95rem;
          color: var(--fg);
          outline: none;
          transition: border-color .2s;
        }
        .bank-input:focus { border-color: var(--accent-rose); }
      `}</style>
    </Modal>
  )
}
