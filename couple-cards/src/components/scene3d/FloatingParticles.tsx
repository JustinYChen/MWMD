import { Sparkles } from '@react-three/drei'

/** 漂浮光尘氛围 */
export function FloatingParticles() {
  return (
    <Sparkles
      count={60}
      scale={[12, 8, 6]}
      position={[0, 1, 0]}
      size={3}
      speed={0.3}
      opacity={0.6}
      color="#C9A86A"
    />
  )
}
