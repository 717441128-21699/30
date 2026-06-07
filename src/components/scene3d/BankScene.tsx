import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Lights from './Lights';
import Counter3D from './Counter3D';
import ATM3D from './ATM3D';
import Vault3D from './Vault3D';
import VIPLounge3D from './VIPLounge3D';
import PathGuide from './PathGuide';
import { useBankStore } from '@/store/useBankStore';
import { useUserStore } from '@/store/useUserStore';

export default function BankScene() {
  const counters = useBankStore((s) => s.counters);
  const atms = useBankStore((s) => s.atms);
  const vips = useBankStore((s) => s.vipCustomers);
  const emergency = useBankStore((s) => s.emergency);
  const emergencyOverlayRef = useRef<THREE.Mesh>(null);
  const doorsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (emergencyOverlayRef.current) {
      const mat = emergencyOverlayRef.current.material as THREE.MeshBasicMaterial;
      if (emergency.active) {
        mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      } else {
        mat.opacity = 0;
      }
    }
    if (doorsRef.current) {
      doorsRef.current.children.forEach((child, i) => {
        const target = emergency.doorsLocked ? 0 : (i % 2 === 0 ? -0.9 : 0.9);
        (child as THREE.Mesh).position.x = THREE.MathUtils.lerp((child as THREE.Mesh).position.x, target, 0.06);
      });
    }
  });

  const refillPaths = useMemo(
    () =>
      atms
        .filter((a) => a.refillTask && (a.refillTask.status === 'approved' || a.refillTask.status === 'refilling'))
        .map((a) => ({ id: a.id, path: a.refillTask!.path })),
    [atms]
  );

  const vipPaths = useMemo(
    () =>
      vips
        .filter((v) => v.status === 'guided')
        .map((v) => ({ id: v.id, path: v.guidePath })),
    [vips]
  );

  return (
    <>
      <color attach="background" args={[emergency.active ? '#1a0508' : '#050a15']} />
      <fog attach="fog" args={[emergency.active ? '#2a0508' : '#050a15', 15, 45]} />
      <Lights />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#1a2840" metalness={0.4} roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.03} />
      </mesh>

      <mesh position={[0, 2.5, -10]}>
        <boxGeometry args={[30, 5, 0.3]} />
        <meshStandardMaterial color="#0f1a2e" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.5, 10]}>
        <boxGeometry args={[30, 5, 0.3]} />
        <meshStandardMaterial color="#0f1a2e" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[-15, 2.5, 0]}>
        <boxGeometry args={[0.3, 5, 20]} />
        <meshStandardMaterial color="#0f1a2e" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[15, 2.5, 0]}>
        <boxGeometry args={[0.3, 5, 20]} />
        <meshStandardMaterial color="#0f1a2e" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[30, 0.2, 20]} />
        <meshStandardMaterial color="#162035" metalness={0.8} roughness={0.3} />
      </mesh>

      {[-5, -2.5, 0, 2.5, 5].map((x, i) => (
        <mesh key={i} position={[x, 4.9, -8]}>
          <cylinderGeometry args={[0.3, 0.35, 0.15, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff5dd" emissiveIntensity={1.5} />
        </mesh>
      ))}

      <group position={[-10, 0, 5.5]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[4, 2.4, 0.1]} />
          <meshStandardMaterial color="#0a1525" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.3, 0.06]}>
          <boxGeometry args={[3.6, 0.6, 0.02]} />
          <meshStandardMaterial color="#1a2540" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      <group position={[12, 0, 5.5]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[4, 2.4, 0.1]} />
          <meshStandardMaterial color="#0a1525" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      <group position={[-6, 0, 8]}>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[5, 2.8, 0.15]} />
          <meshStandardMaterial color="#0d1830" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[-1.5, 1.6, 0.1]}>
          <boxGeometry args={[1.8, 1, 0.02]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} />
        </mesh>
        <mesh position={[1.5, 1.6, 0.1]}>
          <boxGeometry args={[1.8, 1, 0.02]} />
          <meshBasicMaterial color="#2ed573" transparent opacity={0.5} />
        </mesh>
      </group>

      <group ref={doorsRef} position={[0, 0, -9.8]}>
        {[-0.9, 0.9].map((x, i) => (
          <mesh key={i} position={[x, 1.2, 0]} castShadow>
            <boxGeometry args={[0.85, 2.4, 0.1]} />
            <meshStandardMaterial color={emergency.doorsLocked ? '#5a1a20' : '#2a4060'} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 2.55, 0]}>
          <boxGeometry args={[3.5, 0.3, 0.15]} />
          <meshStandardMaterial color={emergency.doorsLocked ? '#ff4757' : '#00d4ff'} emissive={emergency.doorsLocked ? '#ff4757' : '#00d4ff'} emissiveIntensity={0.8} />
        </mesh>
      </group>

      {counters.map((c) => (
        <Counter3D key={c.id} counter={c} />
      ))}

      {atms.map((a) => (
        <ATM3D key={a.id} atm={a} />
      ))}

      <Vault3D />
      <VIPLounge3D />

      {refillPaths.map((rp) => (
        <PathGuide key={rp.id} points={rp.path} color="#00d4ff" opacity={0.9} width={0.06} />
      ))}
      {vipPaths.map((vp) => (
        <PathGuide key={vp.id} points={vp.path} color="#2ed573" opacity={0.85} width={0.07} />
      ))}
      {emergency.active && (
        <>
          <PathGuide points={emergency.evacuationPath} color="#ffd93d" opacity={0.95} width={0.1} />
          <PathGuide points={emergency.policePath} color="#0066ff" opacity={0.95} width={0.08} />
        </>
      )}

      <mesh ref={emergencyOverlayRef} position={[0, 3, 0]}>
        <boxGeometry args={[40, 6, 25]} />
        <meshBasicMaterial color="#ff4757" transparent opacity={0} side={THREE.BackSide} />
      </mesh>

      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1, 2]}
      />
    </>
  );
}
