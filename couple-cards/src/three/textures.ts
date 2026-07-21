import * as THREE from 'three'
import type { Question, Theme, Level, Category } from '@/types/question'

/** 主题对应的文本/背景色 */
const THEME_COLORS: Record<Theme, { bg: string; fg: string; fgSoft: string; gold: string; rose: string }> = {
  light: { bg: '#E8DCC8', fg: '#3A3530', fgSoft: 'rgba(58,53,48,0.55)', gold: '#C9A86A', rose: '#C97064' },
  dark: { bg: '#3A332B', fg: '#F5EFE6', fgSoft: 'rgba(245,239,230,0.55)', gold: '#D4B074', rose: '#D88C7A' },
}

/** 各深度的牌面渐变色(按主题) */
const LEVEL_GRADIENT: Record<Level, Record<Theme, [string, string]>> = {
  icebreaker: {
    light: ['#EFE6DB', '#E0D2BC'],
    dark: ['#3A332B', '#2A2520'],
  },
  warming: {
    light: ['#D88C7A', '#C97064'],
    dark: ['#5A3A33', '#3A2620'],
  },
  soul: {
    light: ['#D4B074', '#C9A86A'],
    dark: ['#5A4A2E', '#3A2F1C'],
  },
}

const W = 512
const H = 768

let fontsReady = false
export async function ensureFonts() {
  if (fontsReady) return
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready
  } catch {
    /* noop */
  }
  fontsReady = true
}

/** canvas 文本自动换行 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 8
) {
  const chars = Array.from(text)
  let line = ''
  let lines: string[] = []
  for (const ch of chars) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
      if (lines.length >= maxLines - 1) break
    } else {
      line = test
    }
  }
  if (line && lines.length < maxLines) lines.push(line)
  if (lines.length === maxLines) {
    // 截断省略
    const last = lines[maxLines - 1]
    lines[maxLines - 1] = last.length > 14 ? last.slice(0, 13) + '…' : last
  }
  const startY = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight))
}

/** 绘制简单类别图形(避免依赖图标字体在 canvas 渲染) */
function drawCategoryIcon(
  ctx: CanvasRenderingContext2D,
  category: Category,
  cx: number,
  cy: number,
  r: number,
  color: string
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 3
  switch (category) {
    case 'memory': // 时钟
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy - r * 0.6)
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + r * 0.5, cy)
      ctx.stroke()
      break
    case 'future': // 星星
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
        const px = cx + Math.cos(a) * r
        const py = cy + Math.sin(a) * r
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        const a2 = a + Math.PI / 5
        ctx.lineTo(cx + Math.cos(a2) * r * 0.45, cy + Math.sin(a2) * r * 0.45)
      }
      ctx.closePath()
      ctx.fill()
      break
    case 'romance': // 心形
      ctx.beginPath()
      ctx.moveTo(cx, cy + r * 0.55)
      ctx.bezierCurveTo(cx - r, cy - r * 0.3, cx - r * 0.5, cy - r, cx, cy - r * 0.3)
      ctx.bezierCurveTo(cx + r * 0.5, cy - r, cx + r, cy - r * 0.3, cx, cy + r * 0.55)
      ctx.fill()
      break
    case 'values': // 罗盘
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx, cy + r)
      ctx.moveTo(cx - r, cy)
      ctx.lineTo(cx + r, cy)
      ctx.stroke()
      break
    case 'growth': // 嫩芽
      ctx.beginPath()
      ctx.moveTo(cx, cy + r * 0.6)
      ctx.lineTo(cx, cy - r * 0.2)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(cx - r * 0.4, cy - r * 0.1, r * 0.4, r * 0.25, -0.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx + r * 0.4, cy - r * 0.35, r * 0.4, r * 0.25, 0.6, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'fun': // 骰子点
      ctx.beginPath()
      ctx.roundRect(cx - r, cy - r, r * 2, r * 2, r * 0.3)
      ctx.stroke()
      ctx.beginPath()
      ;[
        [cx - r * 0.4, cy - r * 0.4],
        [cx, cy],
        [cx + r * 0.4, cy + r * 0.4],
      ].forEach(([px, py]) => {
        ctx.moveTo(px + r * 0.12, py)
        ctx.arc(px, py, r * 0.12, 0, Math.PI * 2)
      })
      ctx.fill()
      break
  }
  ctx.restore()
}

/** 生成牌面纹理 */
export function makeFrontTexture(question: Question, theme: Theme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const tc = THEME_COLORS[theme]
  const [c1, c2] = LEVEL_GRADIENT[question.level][theme]

  // 背景渐变
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, c1)
  grad.addColorStop(1, c2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 内层柔光
  const glow = ctx.createRadialGradient(W / 2, H * 0.35, 40, W / 2, H * 0.35, W * 0.7)
  glow.addColorStop(0, 'rgba(255,255,255,0.18)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // 金色边框(双层)
  ctx.strokeStyle = tc.gold
  ctx.lineWidth = 6
  ctx.strokeRect(24, 24, W - 48, H - 48)
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, W - 80, H - 80)

  // 类别图标
  drawCategoryIcon(ctx, question.category, W / 2, 150, 34, tc.gold)

  // 深度标签(英文小字)
  ctx.fillStyle = tc.fgSoft
  ctx.font = '500 22px "Cormorant Garamond", serif'
  ctx.textAlign = 'center'
  ctx.fillText(question.level.toUpperCase(), W / 2, 220)

  // 装饰分隔线
  ctx.strokeStyle = tc.gold
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(W * 0.3, 250)
  ctx.lineTo(W * 0.7, 250)
  ctx.stroke()

  // 中文问题
  ctx.fillStyle = tc.fg
  ctx.font = '600 36px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  wrapText(ctx, question.text.zh, W / 2, H * 0.5, W - 120, 52, 6)

  // 英文小字
  ctx.fillStyle = tc.fgSoft
  ctx.font = 'italic 22px "Cormorant Garamond", serif'
  wrapText(ctx, question.text.en, W / 2, H * 0.78, W - 100, 30, 4)

  // 底部点缀
  ctx.fillStyle = tc.gold
  ctx.beginPath()
  ctx.arc(W / 2, H - 80, 4, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

/** 生成牌背纹理(玫红花环 + 中心标志) */
let backTextureCache: Partial<Record<Theme, THREE.CanvasTexture>> = {}
export function makeBackTexture(theme: Theme): THREE.CanvasTexture {
  if (backTextureCache[theme]) return backTextureCache[theme]!
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const tc = THEME_COLORS[theme]

  // 背景:裸色渐变
  const [c1, c2] = LEVEL_GRADIENT.icebreaker[theme]
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, c2)
  grad.addColorStop(1, c1)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 金色边框
  ctx.strokeStyle = tc.gold
  ctx.lineWidth = 6
  ctx.strokeRect(24, 24, W - 48, H - 48)
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, W - 80, H - 80)

  // 中心玫红花环
  const cx = W / 2
  const cy = H / 2
  ctx.strokeStyle = tc.rose
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, 120, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = tc.gold
  ctx.beginPath()
  ctx.arc(cx, cy, 96, 0, Math.PI * 2)
  ctx.stroke()

  // 花环上的小花瓣
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12
    const px = cx + Math.cos(a) * 120
    const py = cy + Math.sin(a) * 120
    ctx.fillStyle = i % 2 === 0 ? tc.rose : tc.gold
    ctx.beginPath()
    ctx.ellipse(px, py, 9, 5, a, 0, Math.PI * 2)
    ctx.fill()
  }

  // 中心心形
  ctx.fillStyle = tc.rose
  ctx.beginPath()
  ctx.moveTo(cx, cy + 32)
  ctx.bezierCurveTo(cx - 44, cy - 12, cx - 26, cy - 44, cx, cy - 16)
  ctx.bezierCurveTo(cx + 26, cy - 44, cx + 44, cy - 12, cx, cy + 32)
  ctx.fill()

  // 上下文字
  ctx.fillStyle = tc.fgSoft
  ctx.font = '500 16px "Cormorant Garamond", serif'
  ctx.textAlign = 'center'
  ctx.fillText('SLOW ASK SLOW ANSWER', cx, 130)
  ctx.font = '500 20px "Noto Serif SC", serif'
  ctx.fillText('"慢"问"慢"答', cx, H - 110)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.needsUpdate = true
  backTextureCache[theme] = texture
  return texture
}

/** 释放缓存的牌背纹理(主题切换或卸载时调用) */
export function disposeBackTextures() {
  Object.values(backTextureCache).forEach((t) => t?.dispose())
  backTextureCache = {}
}
