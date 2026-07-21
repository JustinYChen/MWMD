import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

/**
 * 路由转场包装。
 *
 * 配合 TransitionVeil(canvas 光晕面纱)使用:
 * - exit:页面轻微放大+模糊+淡出,被光晕覆盖
 * - enter:页面从轻微缩小+模糊+淡入,随光晕收缩揭示
 *
 * scale/blur 幅度刻意保持微小(1.5% / 6px),
 * 让切换"有呼吸感"但不晕眩。
 */
const EASE = [0.22, 1, 0.36, 1] as const

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.015, filter: 'blur(6px)' }}
      transition={{ duration: 0.35, ease: EASE }}
      style={{ willChange: 'opacity, transform, filter' }}
    >
      {children}
    </motion.div>
  )
}
