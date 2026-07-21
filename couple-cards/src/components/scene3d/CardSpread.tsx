import { useMemo } from 'react'
import type { Question } from '@/types/question'
import type { DrawMode } from '@/types/question'
import { SPREAD_LAYOUTS } from '@/three/layouts'
import { TarotCard } from './TarotCard'

interface CardSpreadProps {
  cards: Question[]
  mode: DrawMode
  theme: 'light' | 'dark'
  soundEnabled: boolean
  onReveal: (q: Question) => void
  onDetail?: (q: Question) => void
}

/** 牌阵布局容器:按模式定位每张牌 */
export function CardSpread({
  cards,
  mode,
  theme,
  soundEnabled,
  onReveal,
  onDetail,
}: CardSpreadProps) {
  const layouts = useMemo(() => SPREAD_LAYOUTS[mode], [mode])

  return (
    <group>
      {cards.map((q, i) => (
        <TarotCard
          key={q.id}
          question={q}
          layout={layouts[i] ?? layouts[0]}
          index={i}
          theme={theme}
          soundEnabled={soundEnabled}
          onReveal={onReveal}
          onDetail={onDetail}
        />
      ))}
    </group>
  )
}
