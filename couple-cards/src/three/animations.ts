import * as THREE from 'three'

/** 帧率无关的 lerp 系数(基于 delta 与速度常数) */
export function dampK(delta: number, lambda = 8): number {
  return 1 - Math.exp(-delta * lambda)
}

/** 通用平滑插值 */
export function lerp(
  current: number,
  target: number,
  delta: number,
  lambda = 8
): number {
  return THREE.MathUtils.lerp(current, target, dampK(delta, lambda))
}

/** 缓动入场进度(0->1),基于经过时间与持续时间 */
export function easeProgress(
  elapsed: number,
  duration: number
): number {
  const t = Math.min(1, elapsed / duration)
  // easeOutCubic
  return 1 - Math.pow(1 - t, 3)
}
