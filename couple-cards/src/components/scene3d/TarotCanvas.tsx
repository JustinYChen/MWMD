import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import type { Question, DrawMode } from '@/types/question'
import { CardSpread } from './CardSpread'
import { SceneLighting } from './SceneLighting'
import { CameraRig } from './CameraRig'
import { FloatingParticles } from './FloatingParticles'

interface TarotCanvasProps {
  cards: Question[]
  mode: DrawMode
  theme: 'light' | 'dark'
  soundEnabled: boolean
  onReveal: (q: Question) => void
  onDetail?: (q: Question) => void
}

/** R3F Canvas 容器:3D 塔罗牌阵主舞台 */
export function TarotCanvas({
  cards,
  mode,
  theme,
  soundEnabled,
  onReveal,
  onDetail,
}: TarotCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1, 7], fov: 42, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>
        <SceneLighting />
        <CardSpread
          cards={cards}
          mode={mode}
          theme={theme}
          soundEnabled={soundEnabled}
          onReveal={onReveal}
          onDetail={onDetail}
        />
        <FloatingParticles />
        <CameraRig mode={mode} />
      </Suspense>
    </Canvas>
  )
}
