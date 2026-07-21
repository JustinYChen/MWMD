import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { DrawMode } from '@/types/question'

/** 相机轨道:按模式平滑移动到合适视角 + 轻微呼吸 */
const CAMERA_TARGETS: Record<DrawMode, [number, number, number]> = {
  single: [0, 0.6, 6.2],
  triple: [0, 0.8, 7.6],
  cross: [0, 1.2, 9.2],
}

export function CameraRig({ mode }: { mode: DrawMode }) {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(...CAMERA_TARGETS[mode]))
  const lookAt = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05)
    const goal = CAMERA_TARGETS[mode]
    target.current.x = THREE.MathUtils.lerp(target.current.x, goal[0], 1 - Math.exp(-d * 3))
    target.current.y = THREE.MathUtils.lerp(target.current.y, goal[1], 1 - Math.exp(-d * 3))
    target.current.z = THREE.MathUtils.lerp(target.current.z, goal[2], 1 - Math.exp(-d * 3))
    // 呼吸:鼠标偏移产生轻微视差
    const mx = state.pointer.x * 0.4
    const my = state.pointer.y * 0.3
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.x + mx, 1 - Math.exp(-d * 4))
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, target.current.y + my, 1 - Math.exp(-d * 4))
    camera.position.z = target.current.z
    camera.lookAt(lookAt.current)
  })

  return null
}
