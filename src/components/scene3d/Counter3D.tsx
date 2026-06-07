import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Counter } from '@/types';

interface Props {
  counter: Counter;
}

export default function Counter3D({ counter }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const windowRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const isOverloaded = counter.queueCount >= 10;
  const color = isOverloaded ? '#ff4757' : counter.isBackup ? '#ffa502' : '#00d4ff';

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = counter.isActive ? 0 : -0.02;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      mat.opacity = isOverloaded ? pulse + 0.3 : counter.isActive ? 0.3 : 0.1;
    }
    if (windowRef.current && counter.isActive) {
      windowRef.current.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
    }
    if (windowRef.current && !counter.isActive && !counter.isBackup) {
      windowRef.current.position.y = THREE.MathUtils.lerp(windowRef.current.position.y, 0.3, 0.08);
    }
  });

  const people = useMemo(() => {
    const count = Math.min(counter.queueCount, 10);
    return Array.from({ length: count }, (_, i) => i);
  }, [counter.queueCount]);

  return (
    <group ref={groupRef} position={counter.position}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.8, 1]} />
        <meshStandardMaterial color="#2a3f5f" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.8, 0.1, 1]} />
        <meshStandardMaterial color="#1a2f4a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={windowRef} position={[0, 0.9, 0.45]}>
        <boxGeometry args={[1.4, 0.5, 0.05]} />
        <meshPhysicalMaterial
          color={counter.isActive ? color : '#555'}
          transparent
          opacity={0.6}
          emissive={color}
          emissiveIntensity={counter.isActive ? 0.8 : 0.1}
        />
      </mesh>
      <mesh ref={glowRef} position={[0, 1.55, 0]}>
        <planeGeometry args={[2, 0.8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <Html
        position={[0, 2, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          className={`font-orbitron px-3 py-1.5 rounded border backdrop-blur-md whitespace-nowrap ${
            isOverloaded
              ? 'bg-red-900/70 border-red-500 text-red-300 shadow-glow-red animate-pulse'
              : 'bg-cyan-900/60 border-cyan-400/60 text-cyan-200 shadow-glow-blue'
          }`}
        >
          <div className="text-[10px] opacity-80">{counter.isBackup ? '备用' : ''}{counter.number}号窗口</div>
          <div className="text-xl font-bold flex items-center gap-1">
            <span>{counter.queueCount}</span>
            <span className="text-[10px] opacity-70">人排队</span>
          </div>
        </div>
      </Html>
      {people.map((i) => (
        <group key={i} position={[(i % 2 === 0 ? -0.25 : 0.25), 0, 1.4 + Math.floor(i / 2) * 0.6]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.5, 8]} />
            <meshStandardMaterial color={isOverloaded ? '#ff6b7a' : '#88aacc'} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#ffd5b5" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
