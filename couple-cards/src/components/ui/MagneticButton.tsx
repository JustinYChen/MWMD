import { useRef, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  className?: string
  variant?: 'primary' | 'ghost'
  strength?: number
  type?: 'button' | 'submit'
  disabled?: boolean
  ariaLabel?: string
}

/** 磁吸按钮:鼠标靠近时轻微跟随 */
export function MagneticButton({
  children,
  onClick,
  className,
  variant = 'primary',
  strength = 0.35,
  type = 'button',
  disabled,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }
  const handleLeave = () => {
    const el = ref.current
    if (el) el.style.transform = 'translate(0,0)'
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-medium transition-[transform,box-shadow] duration-300 will-change-transform disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary'
          ? 'text-bg shadow-card'
          : 'border border-border-c text-fg hover:border-rose',
        className
      )}
      style={
        variant === 'primary'
          ? { background: 'linear-gradient(120deg, var(--accent-rose), var(--accent-gold))' }
          : undefined
      }
    >
      {children}
    </motion.button>
  )
}
