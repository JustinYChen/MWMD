import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Question, Theme } from '@/types/question'
import type { CardLayout } from '@/three/layouts'
import { entryOrigin } from '@/three/layouts'
import { lerp, easeProgress } from '@/three/animations'
import { makeFrontTexture, makeBackTexture } from '@/three/textures'
import { audioEngine } from '@/lib/audioEngine'

interface TarotCardProps {
  question: Question
  layout: CardLayout
  index: number
  theme: Theme
  soundEnabled: boolean
  onReveal: (q: Question) => void
  /** 点击已翻开的牌时触发,用于查看详情 */
  onDetail?: (q: Question) => void
}

const EDGE_COLOR: Record<Theme, string> = {
  light: '#D4C5B0',
  dark: '#4A4238',
}

export function TarotCard({
  question,
  layout,
  index,
  theme,
  soundEnabled,
  onReveal,
  onDetail,
}: TarotCardProps) {
  const ref = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const entryStart = useRef<number | null>(null)
  const settled = useRef(false)

  // 纹理:牌面随问题与主题,牌背按主题缓存
  const frontTexture = useMemo(
    () => makeFrontTexture(question, theme),
    [question, theme]
  )
  const backTexture = useMemo(() => makeBackTexture(theme), [theme])
  const edgeColor = EDGE_COLOR[theme]

  // 入场起点
  const origin = useMemo(() => entryOrigin(index), [index])

  useEffect(() => {
    return () => {
      frontTexture.dispose()
    }
  }, [frontTexture])

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const d = Math.min(delta, 0.05)

    // ---- 入场动画(从天而降 + 旋转回正) ----
    if (!settled.current) {
      if (entryStart.current === null) entryStart.current = 0
      entryStart.current += d
      const dur = 0.9 + index * 0.12
      const p = easeProgress(entryStart.current, dur)
      mesh.position.x = lerp(origin.position[0], layout.position[0], p, 6)
      mesh.position.y = lerp(origin.position[1], layout.position[1], p, 6)
      mesh.position.z = lerp(origin.position[2], layout.position[2], p, 6)
      mesh.rotation.x = lerp(origin.rotation[0], 0, p, 6)
      mesh.rotation.y = lerp(origin.rotation[1] + Math.PI, layout.rotation[1], p, 6)
      mesh.rotation.z = lerp(origin.rotation[2], layout.rotation[2], p, 6)
      const s = THREE.MathUtils.lerp(0.6, 1, p)
      mesh.scale.setScalar(s)
      if (p >= 1) {
        settled.current = true
      }
      return
    }

    // ---- 稳态:悬停抬起 + 翻牌旋转 ----
    const targetY = layout.position[1] + (hovered ? 0.45 : 0)
    const targetZ = layout.position[2] + (hovered ? 0.25 : 0)
    const targetRotY = flipped ? layout.rotation[1] + Math.PI : layout.rotation[1]
    const targetScale = hovered ? 1.05 : 1

    mesh.position.x = lerp(mesh.position.x, layout.position[0], d, 8)
    mesh.position.y = lerp(mesh.position.y, targetY, d, 8)
    mesh.position.z = lerp(mesh.position.z, targetZ, d, 8)
    mesh.rotation.y = lerp(mesh.rotation.y, targetRotY, d, 9)
    mesh.rotation.z = lerp(mesh.rotation.z, layout.rotation[2], d, 8)
    mesh.scale.x = lerp(mesh.scale.x, targetScale, d, 10)
    mesh.scale.y = lerp(mesh.scale.y, targetScale, d, 10)
    mesh.scale.z = lerp(mesh.scale.z, targetScale, d, 10)
  })

  const handleOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (!settled.current) return
    setHovered(true)
    document.body.style.cursor = 'pointer'
    if (soundEnabled) audioEngine.playHover()
  }
  const handleOut = () => {
    setHovered(false)
    document.body.style.cursor = ''
  }
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (!settled.current) return
    // 已翻开的牌再次点击 -> 查看详情
    if (flipped) {
      onDetail?.(question)
      return
    }
    // 首次点击 -> 翻牌
    setFlipped(true)
    if (soundEnabled) {
      audioEngine.playFlip()
      setTimeout(() => audioEngine.playReveal(), 220)
    }
    onReveal(question)
  }

  return (
    <mesh
      ref={ref}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      <boxGeometry args={[1.4, 2.2, 0.03]} />
      {/* 6 面:0-3 侧面边色,4(+z 朝相机,初始朝外)=牌背,5(-z 翻后朝相机)=牌面 */}
      <meshStandardMaterial attach="material-0" color={edgeColor} roughness={0.8} />
      <meshStandardMaterial attach="material-1" color={edgeColor} roughness={0.8} />
      <meshStandardMaterial attach="material-2" color={edgeColor} roughness={0.8} />
      <meshStandardMaterial attach="material-3" color={edgeColor} roughness={0.8} />
      <meshStandardMaterial attach="material-4" map={backTexture} roughness={0.55} metalness={0.05} />
      <meshStandardMaterial attach="material-5" map={frontTexture} roughness={0.55} metalness={0.05} />
    </mesh>
  )
}
