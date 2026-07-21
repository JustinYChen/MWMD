import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** 合并 Tailwind 类名,处理冲突 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 限定范围的随机整数 */
export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 防抖 */
export function debounce<T extends (...args: never[]) => void>(fn: T, ms = 200) {
  let t: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

/** 判断是否移动端 */
export function isMobile() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 768px)').matches
}
