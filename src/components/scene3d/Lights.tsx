import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBankStore } from '@/store/useBankStore';

export default function Lights() {
  const emergencyRef = useRef<THREE.PointLight>(null);
  const emergency = useBankStore((s) => s.emergency);

  useFrame((state) => {
    if (emergencyRef.current && emergency.active) {
      emergencyRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 6) * 1.5;
    }
    if (emergencyRef.current && !emergency.active) {
      emergencyRef.current.intensity = 0;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#a8c8ff" />
      <directionalLight
        position={[5, 12, 5]}
        intensity={0.8}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 8, -3]} intensity={0.3} color="#88bbff" />
      <pointLight position={[0, 4, 0]} intensity={0.6} color="#00d4ff" distance={15} />
      <pointLight position={[-6, 3, -2]} intensity={0.5} color="#ffffff" distance={8} />
      <pointLight position={[6, 3, -2]} intensity={0.5} color="#ffffff" distance={8} />
      <pointLight position={[-8, 3, 5]} intensity={0.4} color="#88ddff" distance={6} />
      <pointLight position={[10, 3, 5]} intensity={0.4} color="#88ddff" distance={6} />
      <pointLight position={[0, 3.5, 8]} intensity={0.6} color="#ffd700" distance={6} />
      <pointLight ref={emergencyRef} position={[0, 6, 0]} intensity={0} color="#ff4757" distance={30} />
    </>
  );
}
