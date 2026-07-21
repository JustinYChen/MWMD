import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * 自定义光标:跟随鼠标,悬停可交互元素时放大(仅桌面)。
 * 在输入框/文本域内隐藏自定义光标,恢复系统光标,避免遮挡输入位置。
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine) return
    setEnabled(true)

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...pos }
    let raf = 0

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      }
      const target = e.target as HTMLElement
      // 在输入框/文本域/contenteditable 内隐藏自定义光标,恢复系统光标
      const inTextInput = !!target.closest(
        'input, textarea, [contenteditable="true"], [contenteditable=""]'
      )
      setHidden(inTextInput)
      if (inTextInput) {
        document.body.classList.remove('custom-cursor-active')
      } else {
        document.body.classList.add('custom-cursor-active')
        setActive(
          !!target.closest('a, button, [role="button"], label, .cursor-target')
        )
      }
    }
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18
      ringPos.y += (pos.y - ringPos.y) * 0.18
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      document.body.classList.remove('custom-cursor-active')
    }
  }, [])

  if (!enabled) return null
  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full transition-opacity duration-200"
        style={{ background: 'var(--accent-rose)', opacity: hidden ? 0 : 1 }}
      />
      <motion.div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border transition-opacity duration-200"
        style={{ borderColor: 'var(--accent-gold)', opacity: hidden ? 0 : active ? 0.9 : 0.5 }}
        animate={{
          width: active ? 44 : 30,
          height: active ? 44 : 30,
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      />
    </>
  )
}
