import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { MagneticButton } from '@/components/ui/MagneticButton'

interface Props {
  onReset: () => void
}

export function DeckResetButton({ onReset }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-fg-soft transition-colors hover:text-rose"
        aria-label="重置牌堆"
      >
        <RotateCcw size={13} />
        重置牌堆
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="重置牌堆？">
        <p className="mb-6 text-sm leading-relaxed text-fg-soft">
          重置后，所有已抽过的题将重新回到牌堆，可以再次抽到。
          <br />
          （收藏夹与历史记录不会受影响）
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-border-c px-5 py-2 text-sm text-fg-soft hover:text-fg"
          >
            取消
          </button>
          <MagneticButton
            variant="primary"
            className="px-5 py-2 text-sm"
            onClick={() => {
              onReset()
              setOpen(false)
            }}
          >
            确认重置
          </MagneticButton>
        </div>
      </Modal>
    </>
  )
}
