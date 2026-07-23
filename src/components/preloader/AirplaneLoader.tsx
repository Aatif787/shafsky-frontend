import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Procedural airplane built from Three.js primitives.
 * Rotates gently and bobs up/down as a cinematic loading indicator,
 * replacing the old Iron-Man-style HUD rings.
 */

function Fuselage() {
  return (
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.12, 0.08, 2.4, 16]} />
      <meshStandardMaterial color="#c0d8e8" metalness={0.7} roughness={0.25} />
    </mesh>
  );
}

function NoseCone() {
  return (
    <mesh position={[1.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.12, 0.5, 16]} />
      <meshStandardMaterial color="#a8c8dd" metalness={0.7} roughness={0.25} />
    </mesh>
  );
}

function TailCone() {
  return (
    <mesh position={[-1.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <coneGeometry args={[0.08, 0.35, 12]} />
      <meshStandardMaterial color="#a8c8dd" metalness={0.7} roughness={0.25} />
    </mesh>
  );
}

function Wing({ side }: { side: 1 | -1 }) {
  return (
    <mesh position={[0.1, 0, side * 0.9]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.7, 0.03, 1.6]} />
      <meshStandardMaterial color="#b0d0e0" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

function TailWing({ side }: { side: 1 | -1 }) {
  return (
    <mesh position={[-1.1, 0, side * 0.35]} rotation={[0, 0, 0]}>
      <boxGeometry args={[0.35, 0.02, 0.55]} />
      <meshStandardMaterial color="#b0d0e0" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

function VerticalStabilizer() {
  return (
    <mesh position={[-1.1, 0.28, 0]} rotation={[0, 0, 0.15]}>
      <boxGeometry args={[0.45, 0.45, 0.02]} />
      <meshStandardMaterial color="#b0d0e0" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

function EngineNacelle({ side }: { side: 1 | -1 }) {
  return (
    <group position={[-0.05, -0.08, side * 0.65]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
        <meshStandardMaterial color="#8ab0c5" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function EngineGlow({ side }: { side: 1 | -1 }) {
  return (
    <pointLight position={[-0.25, -0.08, side * 0.65]} color="#3ab7ff" intensity={2} distance={3} />
  );
}

function Cockpit() {
  return (
    <mesh position={[1.0, 0.08, 0]}>
      <sphereGeometry args={[0.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial
        color="#4ec8ff"
        metalness={0.3}
        roughness={0.1}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/** Glowing ring around the airplane — subtle orbital ring */
function OrbitalRing() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = t * 0.4;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.15;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[2.2, 0.008, 8, 128]} />
      <meshBasicMaterial
        color="#3ab7ff"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Second ring at different tilt */
function OrbitalRing2() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = -t * 0.25;
    ref.current.rotation.y = Math.cos(t * 0.2) * 0.2;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[2.6, 0.005, 8, 128]} />
      <meshBasicMaterial
        color="#3ab7ff"
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Trail particles behind the airplane */
function TrailParticles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 120;
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const ages = useMemo(() => new Float32Array(count).fill(99), []);
  const head = useRef(0);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    // Emit new particles
    for (let n = 0; n < 2; n++) {
      const i = head.current;
      positions[i * 3] = -1.5 + (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      ages[i] = 0;
      head.current = (head.current + 1) % count;
    }
    // Update particles
    for (let i = 0; i < count; i++) {
      ages[i] += delta;
      positions[i * 3] -= delta * 1.2;
      positions[i * 3 + 1] += (Math.random() - 0.5) * delta * 0.3;
      positions[i * 3 + 2] += (Math.random() - 0.5) * delta * 0.3;
    }
    const geo = ref.current.geometry;
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#7fd6ff"
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export function AirplaneLoader({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle banking rotation
    groupRef.current.rotation.y = t * 0.3;
    // Subtle pitch oscillation
    groupRef.current.rotation.x = Math.sin(t * 0.8) * 0.08;
    // Gentle roll
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    // Bob up and down
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.15;

    // Scale in/out
    const scale = visible ? Math.min(1, t * 0.6) : Math.max(0, 1 - (t - 4.5) * 1.5);
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      {/* The airplane model */}
      <Fuselage />
      <NoseCone />
      <TailCone />
      <Wing side={1} />
      <Wing side={-1} />
      <TailWing side={1} />
      <TailWing side={-1} />
      <VerticalStabilizer />
      <EngineNacelle side={1} />
      <EngineNacelle side={-1} />
      <EngineGlow side={1} />
      <EngineGlow side={-1} />
      <Cockpit />
      <TrailParticles />

      {/* Orbital decorative rings */}
      <OrbitalRing />
      <OrbitalRing2 />
    </group>
  );
}
