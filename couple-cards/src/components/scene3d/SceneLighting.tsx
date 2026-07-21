import { ContactShadows } from '@react-three/drei'

/**
 * 场景灯光:环境光 + 主方向光 + 暖色补光 + 接触阴影。
 * 不使用 drei <Environment preset>,因其需在线下载 HDR 文件,
 * 在 GitHub Pages 部署或离线环境下会失败。改用纯灯光营造氛围。
 */
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[-5, 2, 4]} intensity={22} color="#D88C7A" distance={22} />
      <pointLight position={[5, -2, 5]} intensity={12} color="#C9A86A" distance={22} />
      <pointLight position={[0, 6, -4]} intensity={10} color="#F5EFE6" distance={20} />
      <ContactShadows
        position={[0, -2.6, 0]}
        opacity={0.35}
        scale={16}
        blur={2.6}
        far={6}
      />
    </>
  )
}
