import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useProfileStore } from '@/store/useProfileStore'
import { Modal } from '@/components/ui/Modal'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { DatePicker } from '@/components/ui/DatePicker'
import { cn } from '@/lib/utils'

/** 首次访问弹窗:录入情侣名字 + 纪念日 */
export function CoupleSetupModal() {
  const { setupCompleted, setProfile, completeSetup } = useProfileStore()
  const [open, setOpen] = useState(!setupCompleted)
  const [nameA, setNameA] = useState(useProfileStore.getState().nameA)
  const [nameB, setNameB] = useState(useProfileStore.getState().nameB)
  const [anniversary, setAnniversary] = useState(
    useProfileStore.getState().anniversary
  )

  const handleSubmit = () => {
    setProfile({ nameA: nameA.trim(), nameB: nameB.trim(), anniversary })
    completeSetup()
    setOpen(false)
  }
  const handleSkip = () => {
    completeSetup()
    setOpen(false)
  }

  return (
    <Modal open={open} onClose={handleSkip} title="认识一下你们" maxWidth="max-w-lg">
      <div className="mb-5 flex items-center gap-2 text-rose">
        <Heart size={18} fill="currentColor" />
        <span className="text-sm">填一填,让问候更贴近你们</span>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="你的名字">
            <input
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              placeholder="例：小满"
              className={inputCls}
            />
          </Field>
          <Field label="TA 的名字">
            <input
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              placeholder="例：小暑"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="在一起的日子">
          <DatePicker value={anniversary} onChange={setAnniversary} />
        </Field>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleSkip}
          className="text-sm text-fg-soft underline-offset-2 hover:text-fg hover:underline"
        >
          稍后再说
        </button>
        <MagneticButton onClick={handleSubmit} className="px-6 py-2.5 text-sm">
          <Heart size={15} /> 开始
        </MagneticButton>
      </div>
    </Modal>
  )
}

/** 输入框样式:匹配应用 glassmorphism 风格 */
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
