import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ATM } from '@/types';
import { formatCurrency } from '@/utils';

interface Props {
  atm: ATM;
}

export default function ATM3D({ atm }: Props) {
  const screenRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const percent = atm.cashBalance / atm.maxCapacity;
  const isLow = atm.status === 'low';
  const isRefilling = atm.status === 'refilling';

  useFrame((state) => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshBasicMaterial;
      if (isLow) {
        mat.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      } else if (isRefilling) {
        mat.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      } else {
        mat.opacity = 0.5;
      }
    }
    if (groupRef.current && isRefilling) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  const screenColor = isLow ? '#ff4757' : isRefilling ? '#00d4ff' : '#2ed573';

  return (
    <group ref={groupRef} position={atm.position}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.2, 2, 0.9]} />
        <meshStandardMaterial color="#1c2e4a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.6, 0.46]}>
        <boxGeometry args={[0.9, 0.6, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh ref={screenRef} position={[0, 1.6, 0.47]}>
        <planeGeometry args={[0.82, 0.52]} />
        <meshBasicMaterial color={screenColor} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.95, 0.46]}>
        <boxGeometry args={[0.3, 0.15, 0.08]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.7, 0.46]}>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, percent * 1.2, 8]} />
        <meshStandardMaterial color={screenColor} emissive={screenColor} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.25, 8]} />
        <meshStandardMaterial color="#1a2a3f" transparent opacity={0.4} />
      </mesh>
      <Html
        position={[0, 2.4, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          className={`font-orbitron px-3 py-1.5 rounded border backdrop-blur-md whitespace-nowrap ${
            isLow
              ? 'bg-red-900/70 border-red-500 text-red-200 shadow-glow-red animate-pulse'
              : isRefilling
              ? 'bg-blue-900/70 border-blue-400 text-blue-200 shadow-glow-blue'
              : 'bg-emerald-900/60 border-emerald-400/60 text-emerald-200'
          }`}
        >
          <div className="text-[10px] opacity-80">{atm.name}</div>
          <div className="text-sm font-bold">{formatCurrency(atm.cashBalance)}</div>
          <div className="text-[9px] opacity-70">
            {isRefilling ? '加钞中...' : isLow ? '余额不足' : '正常'}
          </div>
        </div>
      </Html>
    </group>
  );
}
