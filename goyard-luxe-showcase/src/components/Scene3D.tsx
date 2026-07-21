import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function LuxuryBox() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.3) * 0.3 + state.clock.elapsedTime * 0.05;
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#C4A265"),
        metalness: 0.1,
        roughness: 0.4,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
      }),
    []
  );

  const trimMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#3D3229"),
        metalness: 0.05,
        roughness: 0.6,
      }),
    []
  );

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef}>
        <mesh material={material} position={[0, 0, 0]}>
          <boxGeometry args={[2.4, 1.6, 1.2]} />
        </mesh>
        <mesh material={trimMaterial} position={[0, 0.82, 0]}>
          <boxGeometry args={[2.42, 0.04, 1.22]} />
        </mesh>
        <mesh material={trimMaterial} position={[0, -0.82, 0]}>
          <boxGeometry args={[2.42, 0.04, 1.22]} />
        </mesh>
        <mesh material={trimMaterial} position={[1.22, 0, 0]}>
          <boxGeometry args={[0.04, 1.62, 1.22]} />
        </mesh>
        <mesh material={trimMaterial} position={[-1.22, 0, 0]}>
          <boxGeometry args={[0.04, 1.62, 1.22]} />
        </mesh>
        <mesh position={[0, 0.85, 0]} material={trimMaterial}>
          <torusGeometry args={[0.15, 0.03, 16, 32]} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        color="#FFF8E7"
      />
      <directionalLight
        position={[-3, 3, -3]}
        intensity={0.5}
        color="#E8D5B7"
      />
      <directionalLight
        position={[0, -3, 2]}
        intensity={0.3}
        color="#C4A265"
      />
      <pointLight position={[2, 2, 4]} intensity={0.4} color="#FFF8E7" />
      <pointLight position={[-2, 1, 3]} intensity={0.2} color="#E8D5B7" />
      <LuxuryBox />
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={4}
      />
    </>
  );
}

export default function Scene3D() {
  return (
    <section className="py-30 md:py-40 bg-charcoal relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(196,162,101,0.1) 35px, rgba(196,162,101,0.1) 36px)",
          }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-[10px] font-sans tracking-[0.5em] uppercase text-gold/60 mb-6">
              Savoir-Faire
            </span>
            <h2 className="font-serif text-display-md md:text-display-lg text-cream mb-8">
              工艺之美
            </h2>
            <p className="font-sans text-cream/50 text-base leading-relaxed max-w-md mb-6">
              在三维空间中探索 Goyard 的经典箱包。每一处细节都凝聚着匠人的心血与智慧，旋转、缩放，感受工艺的温度。
            </p>
            <p className="font-sans text-cream/30 text-sm leading-relaxed max-w-md">
              拖拽旋转 · 滚轮缩放 · 感受匠心
            </p>
          </div>

          <div className="h-[400px] md:h-[500px] lg:h-[600px]">
            <Canvas
              camera={{ position: [0, 1, 5], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
            >
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  );
}
