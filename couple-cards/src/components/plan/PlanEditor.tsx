import { useEffect, useState } from 'react'
import { Image as ImageIcon, Trash2, Upload, X } from 'lucide-react'
import { usePlansStore } from '@/store/usePlansStore'
import { Modal } from '@/components/ui/Modal'
import { DatePicker } from '@/components/ui/DatePicker'
import { compressImage, getPlanImage, setPlanImage, removePlanImage } from '@/lib/planMedia'
import type { Plan } from '@/types/plan'
import { cn } from '@/lib/utils'

interface PlanEditorProps {
  open: boolean
  /** null = 新建;有值 = 编辑 */
  plan: Plan | null
  onClose: () => void
}

/** 输入框样式:与设置页/情侣弹窗一致 */
const inputCls = cn(
  'w-full rounded-xl border border-border-c bg-[color-mix(in_srgb,var(--card)_50%,transparent)]',
  'px-3 py-2 text-sm text-fg outline-none transition-all',
  'placeholder:text-fg-soft/50 focus:border-rose',
  'hover:border-rose/50'
)

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-fg-soft">{label}</span>
      {children}
    </label>
  )
}

export function PlanEditor({ open, plan, onClose }: PlanEditorProps) {
  const { categories, addPlan, updatePlan, removePlan } = usePlansStore()

  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [actualCost, setActualCost] = useState('')
  const [cover, setCover] = useState<string | undefined>(undefined)
  const [confirmDel, setConfirmDel] = useState(false)

  // open / plan 变化时初始化表单
  useEffect(() => {
    if (!open) return
    if (plan) {
      setTitle(plan.title)
      setNote(plan.note)
      setDate(plan.date)
      setCategoryId(plan.categoryId)
      setLocation(plan.location)
      setBudget(plan.budget != null ? String(plan.budget) : '')
      setActualCost(plan.actualCost != null ? String(plan.actualCost) : '')
      setCover(plan.hasCover ? getPlanImage(plan.id, 'cover') : undefined)
    } else {
      setTitle('')
      setNote('')
      setDate('')
      setCategoryId('')
      setLocation('')
      setBudget('')
      setActualCost('')
      setCover(undefined)
    }
    setConfirmDel(false)
  }, [open, plan])

  const handleCoverFile = async (file: File) => {
    try {
      const dataUrl = await compressImage(file)
      setCover(dataUrl)
    } catch {
      alert('图片读取失败,请换一张试试')
    }
  }

  const handleSave = () => {
    const t = title.trim()
    if (!t) return
    const b = budget.trim() === '' ? null : Number(budget)
    const a = actualCost.trim() === '' ? null : Number(actualCost)

    if (plan) {
      updatePlan(plan.id, {
        title: t,
        note: note.trim(),
        date,
        categoryId,
        location: location.trim(),
        budget: Number.isFinite(b as number) ? b : null,
        actualCost: Number.isFinite(a as number) ? a : null,
        hasCover: !!cover,
      })
      // 图片写入本机存储
      if (cover) setPlanImage(plan.id, 'cover', cover)
      else removePlanImage(plan.id, 'cover')
    } else {
      addPlan({
        title: t,
        note: note.trim(),
        date,
        categoryId,
        location: location.trim(),
        budget: Number.isFinite(b as number) ? b : null,
        actualCost: Number.isFinite(a as number) ? a : null,
        hasCover: !!cover,
      })
      // 新建的 id 在 store 内生成,这里无法立即写图 —— 通过队列在下一帧补写
      if (cover) {
        // addPlan 后 store 里最新一条即新建项
        setTimeout(() => {
          const latest = usePlansStore.getState().plans[0]
          if (latest) setPlanImage(latest.id, 'cover', cover)
        }, 0)
      }
    }
    onClose()
  }

  const handleDelete = () => {
    if (!plan) return
    if (!confirmDel) {
      setConfirmDel(true)
      return
    }
    removePlan(plan.id)
    removePlanImage(plan.id, 'cover')
    removePlanImage(plan.id, 'reflection')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={plan ? '编辑计划' : '新的计划'}
      maxWidth="max-w-lg"
    >
      <div className="flex max-h-[70dvh] flex-col gap-4 overflow-y-auto pr-1" data-lenis-prevent>
        <Field label="标题 *">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="想一起做的事…"
            className={inputCls}
            autoFocus
          />
        </Field>

        <Field label="备注">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="想怎么过、有什么小期待…"
            rows={2}
            className={cn(inputCls, 'resize-none')}
          />
        </Field>

        <Field label="日期(留空 = 先放进愿望池)">
          <DatePicker value={date} onChange={setDate} />
        </Field>

        <Field label="分类">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(categoryId === c.id ? '' : c.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all',
                  categoryId === c.id
                    ? 'border-transparent text-bg'
                    : 'border-border-c text-fg-soft hover:text-fg'
                )}
                style={
                  categoryId === c.id
                    ? { backgroundColor: c.color }
                    : undefined
                }
              >
                <span
                  className={cn('h-2 w-2 rounded-full', categoryId === c.id && 'bg-bg/60')}
                  style={categoryId === c.id ? undefined : { backgroundColor: c.color }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="地点">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="可选"
              className={inputCls}
            />
          </Field>
          <Field label="预算(¥)">
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              inputMode="decimal"
              placeholder="可选"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="实际花费(¥)">
          <input
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value)}
            inputMode="decimal"
            placeholder="可选"
            className={inputCls}
          />
        </Field>

        <Field label="配图(仅存本机,不上云)">
          {cover ? (
            <div className="relative overflow-hidden rounded-xl">
              <img src={cover} alt="配图" className="h-40 w-full object-cover" />
              <button
                onClick={() => setCover(undefined)}
                aria-label="移除配图"
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-rose"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label
              className={cn(
                inputCls,
                'flex cursor-pointer items-center justify-center gap-2 border-dashed py-6 text-fg-soft'
              )}
            >
              <Upload size={15} />
              <span className="text-xs">选择一张图片</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleCoverFile(f)
                  e.target.value = ''
                }}
              />
            </label>
          )}
        </Field>
      </div>

      <div className="mt-5 flex items-center justify-between">
        {plan ? (
          <button
            onClick={handleDelete}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm transition-colors',
              confirmDel ? 'text-rose' : 'text-fg-soft hover:text-rose'
            )}
          >
            <Trash2 size={14} /> {confirmDel ? '确认删除?' : '删除'}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-fg-soft/60">
            <ImageIcon size={11} /> Ctrl+Enter 保存
          </span>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-border-c px-5 py-2 text-sm text-fg-soft hover:text-fg"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="rounded-full px-6 py-2 text-sm font-medium text-bg shadow-card transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </Modal>
  )
}
