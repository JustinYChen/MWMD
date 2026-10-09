import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { usePlansStore } from '@/store/usePlansStore'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

interface CategoryManagerProps {
  open: boolean
  onClose: () => void
}

const inputCls = cn(
  'w-full rounded-xl border border-border-c bg-[color-mix(in_srgb,var(--card)_50%,transparent)]',
  'px-3 py-2 text-sm text-fg outline-none transition-all',
  'placeholder:text-fg-soft/50 focus:border-rose'
)

/** 分类管理:改名 / 换色 / 增删 */
export function CategoryManager({ open, onClose }: CategoryManagerProps) {
  const { categories, plans, addCategory, updateCategory, removeCategory } = usePlansStore()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#9C7BB5')

  const usageOf = (id: string) => plans.filter((p) => p.categoryId === id).length

  const handleAdd = () => {
    const n = newName.trim()
    if (!n) return
    addCategory({ name: n, color: newColor })
    setNewName('')
  }

  return (
    <Modal open={open} onClose={onClose} title="管理分类" maxWidth="max-w-md">
      <div className="flex max-h-[55dvh] flex-col gap-2 overflow-y-auto pr-1" data-lenis-prevent>
        {categories.map((c) => {
          const usage = usageOf(c.id)
          return (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-xl border border-border-c/60 p-2"
            >
              <input
                type="color"
                value={c.color}
                onChange={(e) => updateCategory(c.id, { color: e.target.value })}
                aria-label="颜色"
                className="h-8 w-8 shrink-0 cursor-pointer rounded-full border-none bg-transparent p-0"
              />
              <input
                value={c.name}
                onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                className={cn(inputCls, 'border-transparent bg-transparent px-1')}
              />
              <span className="shrink-0 text-xs text-fg-soft/60">{usage} 件</span>
              <button
                onClick={() => {
                  if (usage > 0) {
                    if (!confirm(`「${c.name}」下有 ${usage} 件计划,删除后这些计划将变为未分类。确认删除?`)) return
                  }
                  removeCategory(c.id)
                }}
                aria-label="删除分类"
                className="shrink-0 rounded-full p-1.5 text-fg-soft transition-colors hover:text-rose"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {/* 新增分类 */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border-c p-2">
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          aria-label="新分类颜色"
          className="h-8 w-8 shrink-0 cursor-pointer rounded-full border-none bg-transparent p-0"
        />
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="新分类名称…"
          className={cn(inputCls, 'border-transparent bg-transparent px-1')}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          aria-label="添加分类"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-bg transition-transform hover:scale-110 disabled:opacity-40"
          style={{
            background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
          }}
        >
          <Plus size={15} />
        </button>
      </div>
    </Modal>
  )
}
