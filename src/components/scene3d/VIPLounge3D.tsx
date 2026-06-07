import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useBankStore } from '@/store/useBankStore';

export default function VIPLounge3D() {
  const groupRef = useRef<THREE.Group>(null);
  const vips = useBankStore((s) => s.vipCustomers);
  const activeCount = vips.filter((v) => v.status === 'guided' || v.status === 'serving').length;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = 0;
    }
  });

  return (
    <group ref={groupRef} position={[6, 0, 5]}>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[4, 0.02, 4]} />
        <meshStandardMaterial color="#2a1f3f" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[-2, 1.2, 0]}>
        <boxGeometry args={[0.1, 2.4, 4]} />
        <meshStandardMaterial color="#3a2f5a" metalness={0.5} roughness={0.5} transparent opacity={0.6} />
      </mesh>
      <mesh position={[2, 1.2, 0]}>
        <boxGeometry args={[0.1, 2.4, 4]} />
        <meshStandardMaterial color="#3a2f5a" metalness={0.5} roughness={0.5} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 1.2, -2]}>
        <boxGeometry args={[4, 2.4, 0.1]} />
        <meshStandardMaterial color="#3a2f5a" metalness={0.5} roughness={0.5} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 1.2, 2]}>
        <boxGeometry args={[4.02, 2.4, 0.05]} />
        <meshPhysicalMaterial
          color="#88bbff"
          transparent
          opacity={0.25}
          metalness={0.2}
          roughness={0.1}
          transmission={0.8}
          thickness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.8, 24]} />
        <meshStandardMaterial color="#4a3060" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.08, 24]} />
        <meshStandardMaterial color="#2ed573" emissive="#2ed573" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-1.2, 0.45, -1]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.6, 0.9, 0.6]} />
        <meshStandardMaterial color="#3a2550" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[1.2, 0.45, -1]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.6, 0.9, 0.6]} />
        <meshStandardMaterial color="#3a2550" metalness={0.5} roughness={0.4} />
      </mesh>
      <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#2ed573" distance={5} />
      <Html
        position={[0, 2.8, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className="font-orbitron px-4 py-1.5 rounded border-2 border-emerald-400/60 bg-emerald-950/70 text-emerald-200 backdrop-blur-md whitespace-nowrap shadow-glow-green">
          <div className="text-[10px] opacity-80 text-center tracking-widest">VIP 贵宾室</div>
          <div className="text-sm font-bold text-center">
            服务中: {activeCount} 位
          </div>
        </div>
      </Html>
      {vips.filter((v) => v.status === 'serving').slice(0, 2).map((v, i) => (
        <group key={v.id} position={[(i === 0 ? -1 : 1) * 1.1, 0, 0.5]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.5, 8]} />
            <meshStandardMaterial color="#c9a876" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#ffd5b5" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
