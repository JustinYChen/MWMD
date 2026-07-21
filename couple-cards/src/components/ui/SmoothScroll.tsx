import { type ReactNode, useEffect, useRef } from 'react'
import Lenis from 'lenis'

/** 全局 lenis 实例引用,供其他组件暂停/恢复 */
let lenisInstance: Lenis | null = null
export function pauseLenis() {
  lenisInstance?.stop()
}
export function resumeLenis() {
  lenisInstance?.start()
}

/** Lenis 平滑滚动包装 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const ref = useRef<Lenis | null>(null)
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReduced) return
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    ref.current = lenis
    lenisInstance = lenis
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])
  return <>{children}</>
}
