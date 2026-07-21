import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * 路由切换光晕面纱。
 *
 * 工作原理:
 * - 监听 location.pathname 变化
 * - 在页面切换时于顶层 canvas 绘制径向光晕
 * - 前半段(扩散):配合旧页面 exit,光晕从中心向外覆盖
 * - 后半段(收缩):配合新页面 enter,光晕从外向中心消散
 * - 总时长 700ms,与 PageTransition 的 exit(350ms)+enter(350ms) 对齐
 *
 * 视觉风格:奶油白→玫瑰粉的柔和径向渐变,呼应"两心"暖色调。
 */
const DURATION = 700

export function TransitionVeil() {
  const loc = useLocation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const firstRef = useRef(true)

  // 初始化 canvas 尺寸 + 监听 resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // 路由变化 → 播放光晕
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return // 首次挂载不播放
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = window.innerWidth
    const h = window.innerHeight
    const maxR = Math.hypot(w, h) * 0.75
    const start = performance.now()

    const draw = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      ctx.clearRect(0, 0, w, h)

      if (t < 0.5) {
        // ── 扩散阶段:0 → maxR ──
        const p = t / 0.5
        const r = maxR * (1 - Math.pow(1 - p, 3)) // easeOutCubic
        drawBloom(ctx, w / 2, h / 2, r, p)
      } else {
        // ── 收缩阶段:maxR → 0 ──
        const p = (t - 0.5) / 0.5
        const r = maxR * (1 - p * p * p) // 1 - easeInCubic
        drawBloom(ctx, w / 2, h / 2, r, 1 - p)
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, w, h)
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loc.pathname])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[200]"
      aria-hidden
    />
  )
}

/**
 * 绘制单帧径向光晕。
 * 色彩:奶油白中心 → 玫瑰粉中环 → 暗玫瑰外环 → 透明。
 */
function drawBloom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
) {
  if (r <= 0 || alpha <= 0) return

  // 主光晕
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grad.addColorStop(0, `rgba(252, 245, 235, ${alpha * 0.92})`)
  grad.addColorStop(0.35, `rgba(232, 180, 165, ${alpha * 0.65})`)
  grad.addColorStop(0.7, `rgba(180, 130, 120, ${alpha * 0.2})`)
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

  // 中心高光(给光晕一点"芯")
  const coreR = r * 0.12
  if (coreR > 1) {
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
    core.addColorStop(0, `rgba(255, 250, 245, ${alpha * 0.5})`)
    core.addColorStop(1, 'rgba(255, 250, 245, 0)')
    ctx.fillStyle = core
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
  }
}
