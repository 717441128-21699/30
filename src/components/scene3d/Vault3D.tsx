import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useBankStore } from '@/store/useBankStore';

export default function Vault3D() {
  const groupRef = useRef<THREE.Group>(null);
  const doorRef = useRef<THREE.Mesh>(null);
  const alertLightRef = useRef<THREE.PointLight>(null);
  const vault = useBankStore((s) => s.vault);

  useFrame((state) => {
    if (alertLightRef.current) {
      alertLightRef.current.intensity = vault.alertActive
        ? 2 + Math.sin(state.clock.elapsedTime * 8) * 1.5
        : 0;
    }
    if (doorRef.current) {
      const targetY = vault.isLocked ? 0 : 1.2;
      doorRef.current.position.y = THREE.MathUtils.lerp(doorRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={vault.position}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[4, 2.4, 3]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.2, -1.4]}>
        <boxGeometry args={[3.6, 2, 0.1]} />
        <meshStandardMaterial color="#1a1a28" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh ref={doorRef} position={[0, 1, 1.51]}>
        <boxGeometry args={[1.6, 2, 0.12]} />
        <meshStandardMaterial color="#4a5060" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0.5, 1, 1.6]}>
        <torusGeometry args={[0.2, 0.04, 12, 24]} />
        <meshStandardMaterial color="#c0a060" metalness={0.95} roughness={0.15} emissive="#8a6a30" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.5, 1, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 20]} />
        <meshStandardMaterial color="#e0c080" metalness={0.95} roughness={0.1} />
      </mesh>
      <pointLight ref={alertLightRef} position={[0, 2.5, 0]} intensity={0} color="#ff4757" distance={8} />
      <Html
        position={[0, 2.8, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          className={`font-orbitron px-4 py-1.5 rounded border backdrop-blur-md whitespace-nowrap ${
            vault.alertActive
              ? 'bg-red-900/80 border-red-400 text-red-200 shadow-glow-red animate-pulse'
              : vault.isLocked
              ? 'bg-slate-900/70 border-cyan-500/60 text-cyan-200'
              : 'bg-emerald-900/70 border-emerald-400 text-emerald-200'
          }`}
        >
          <div className="text-[10px] opacity-80 text-center">金 库</div>
          <div className="text-sm font-bold text-center">
            {vault.alertActive ? '⚠ 警报:非授权' : vault.isLocked ? '已锁定' : '已开启'}
          </div>
        </div>
      </Html>
      <mesh position={[-0.3, 1.8, 1.6]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={vault.alertActive ? '#ff4757' : '#2ed573'} />
      </mesh>
    </group>
  );
}
