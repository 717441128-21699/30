import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  points: [number, number, number][];
  color: string;
  opacity?: number;
  width?: number;
}

export default function PathGuide({ points, color, opacity = 0.9, width = 0.08 }: Props) {
  const lineRef = useRef<THREE.Line>(null);
  const dotsRef = useRef<THREE.Points>(null);

  const { curve, geometry, dotPositions, lineObj, coneMesh } = useMemo(() => {
    const pts = points.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3);
    const curvePts = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePts);
    const dotPositions = new Float32Array(curvePts.length * 3);
    curvePts.forEach((p, i) => {
      dotPositions[i * 3] = p.x;
      dotPositions[i * 3 + 1] = p.y;
      dotPositions[i * 3 + 2] = p.z;
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    });
    const lineObj = new THREE.Line(geometry, lineMaterial);

    const coneGeo = new THREE.ConeGeometry(width * 3, width * 6, 4);
    const coneMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.rotation.x = Math.PI;
    const lastPt = points[points.length - 1];
    coneMesh.position.set(lastPt[0], lastPt[1], lastPt[2]);

    return { curve, geometry, dotPositions, lineObj, coneMesh };
  }, [points, color, opacity, width]);

  useFrame((state) => {
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = opacity * (0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.3);
    }
    if (dotsRef.current) {
      const geo = dotsRef.current.geometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const offset = (state.clock.elapsedTime * 15) % 100;
      for (let i = 0; i < pos.count; i++) {
        const show = (i + Math.floor(offset)) % 8 === 0;
        (pos.array as Float32Array)[i * 3 + 1] = points[0][1] + (show ? 0.05 : -10);
      }
      pos.needsUpdate = true;
    }
  });

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 80, width, 6, false);
  }, [curve, width]);

  return (
    <group>
      <mesh>
        <primitive object={tubeGeometry} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.3} />
      </mesh>
      <primitive ref={lineRef} object={lineObj} />
      <points ref={dotsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={dotPositions.length / 3} array={dotPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.18} transparent opacity={1} sizeAttenuation />
      </points>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[width * 1.8, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
      <primitive object={coneMesh} />
    </group>
  );
}
