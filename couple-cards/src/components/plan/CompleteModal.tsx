import { useEffect, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { usePlansStore } from '@/store/usePlansStore'
import { Modal } from '@/components/ui/Modal'
import { compressImage, setPlanImage } from '@/lib/planMedia'
import type { Plan } from '@/types/plan'
import { cn } from '@/lib/utils'

interface CompleteModalProps {
  open: boolean
  plan: Plan | null
  onClose: () => void
  /** 完成后回调(用于成就彩蛋) */
  onCompleted?: (nthCompleted: number) => void
}

const textareaCls = cn(
  'w-full resize-none rounded-xl border border-border-c',
  'bg-[color-mix(in_srgb,var(--card)_50%,transparent)] px-3 py-2.5 text-sm leading-relaxed text-fg',
  'outline-none transition-all placeholder:text-fg-soft/50 focus:border-rose hover:border-rose/50'
)

export function CompleteModal({ open, plan, onClose, onCompleted }: CompleteModalProps) {
  const { completePlan, plans } = usePlansStore()
  const [reflection, setReflection] = useState('')
  const [photo, setPhoto] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!open) return
    setReflection(plan?.reflection ?? '')
    setPhoto(undefined)
  }, [open, plan])

  const handlePhoto = async (file: File) => {
    try {
      const dataUrl = await compressImage(file)
      setPhoto(dataUrl)
    } catch {
      alert('图片读取失败,请换一张试试')
    }
  }

  const handleConfirm = () => {
    if (!plan) return
    // 完成前已完成的数量 + 1 = 这是第几件
    const nth = plans.filter((p) => p.completed).length + 1
    completePlan(plan.id, reflection.trim())
    updateHasReflectionPhoto(plan.id, !!photo)
    if (photo) setPlanImage(plan.id, 'reflection', photo)
    onCompleted?.(nth)
    onClose()
  }

  const updateHasReflectionPhoto = (id: string, v: boolean) => {
    usePlansStore.getState().updatePlan(id, { hasReflectionPhoto: v })
  }

  return (
    <Modal open={open} onClose={onClose} title="完成这件小事" maxWidth="max-w-md">
      {plan && (
        <>
          <p className="mb-4 font-serif text-lg text-fg">“{plan.title}”</p>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="写点什么纪念这一刻…(可留空)"
            rows={3}
            className={textareaCls}
            autoFocus
          />

          <div className="mt-3">
            {photo ? (
              <div className="relative overflow-hidden rounded-xl">
                <img src={photo} alt="完成时刻" className="h-44 w-full object-cover" />
                <button
                  onClick={() => setPhoto(undefined)}
                  aria-label="移除照片"
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-rose"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border-c py-5 text-xs text-fg-soft transition-colors hover:border-rose/50 hover:text-fg">
                <Camera size={15} />
                拍下 / 选择这个时刻(仅存本机)
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handlePhoto(f)
                    e.target.value = ''
                  }}
                />
              </label>
            )}
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-full border border-border-c px-5 py-2 text-sm text-fg-soft hover:text-fg"
            >
              稍等,还没完成
            </button>
            <button
              onClick={handleConfirm}
              className="rounded-full px-6 py-2 text-sm font-medium text-bg shadow-card transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))',
              }}
            >
              完成 ✓
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
