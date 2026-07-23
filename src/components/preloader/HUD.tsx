import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ringShader = {
  uniforms: {
    uTime: { value: 0 },
    uBuild: { value: 0 }, // 0 -> 1 reveal
    uColor: { value: new THREE.Color("#3ab7ff") },
    uDashes: { value: 64 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uBuild;
    uniform float uDashes;
    uniform vec3 uColor;

    void main() {
      // Build-in reveal sweeping around the ring
      float angle = vUv.x;
      float reveal = smoothstep(uBuild - 0.05, uBuild, 1.0 - angle);
      if (uBuild >= 0.999) reveal = 1.0;

      // Dashed segments rotating
      float dash = step(0.55, fract(angle * uDashes + uTime * 0.6));
      float radial = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
      float a = dash * radial * reveal;

      vec3 col = uColor * (1.4 + sin(uTime * 4.0 + angle * 40.0) * 0.2);
      gl_FragColor = vec4(col, a * 0.95);
    }
  `,
};

function Ring({
  radius,
  tube,
  rotationAxis,
  speed,
  dashes,
  buildDelay,
  tilt = 0,
}: {
  radius: number;
  tube: number;
  rotationAxis: "x" | "y" | "z";
  speed: number;
  dashes: number;
  buildDelay: number;
  tilt?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(() => THREE.UniformsUtils.clone(ringShader.uniforms), []);
  uniforms.uDashes.value = dashes;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;
    const build = Math.min(1, Math.max(0, (t - buildDelay) * 1.6));
    uniforms.uBuild.value = build;
    if (meshRef.current) {
      meshRef.current.rotation[rotationAxis] += delta * speed;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, tube, 8, 256]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={ringShader.vertexShader}
        fragmentShader={ringShader.fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function Ticks({ count, radius, length }: { count: number; radius: number; length: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useMemo(() => {
    // place on next frame in effect-like way handled via useFrame init
  }, []);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + t * 0.05;
      dummy.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      dummy.rotation.set(0, 0, a + Math.PI / 2);
      const s = 0.6 + Math.sin(t * 3 + i) * 0.4;
      dummy.scale.set(0.02, length * s, 1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={ref}
      args={[
        undefined as unknown as THREE.BufferGeometry,
        undefined as unknown as THREE.Material,
        count,
      ]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#7fd6ff"
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

function ScanSweep({ radius }: { radius: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s, d) => {
    if (ref.current) ref.current.rotation.z -= d * 2.2;
  });
  const geom = useMemo(() => {
    const g = new THREE.CircleGeometry(radius, 64, 0, Math.PI / 3);
    return g;
  }, [radius]);
  return (
    <mesh ref={ref} geometry={geom}>
      <meshBasicMaterial
        color="#3ab7ff"
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function HUD({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * 0.15;
    // subtle z push
    const t = state.clock.elapsedTime;
    groupRef.current.position.z = -1 + Math.min(1, t * 0.15);
    const scale = visible ? Math.min(1, t * 0.6) : Math.max(0, 1 - (t - 4.5) * 1.5);
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      <Ring radius={1.2} tube={0.005} rotationAxis="z" speed={0.8} dashes={48} buildDelay={0.3} />
      <Ring radius={1.5} tube={0.004} rotationAxis="z" speed={-1.2} dashes={120} buildDelay={0.4} />
      <Ring radius={1.8} tube={0.006} rotationAxis="z" speed={0.5} dashes={24} buildDelay={0.55} />
      <Ring radius={2.1} tube={0.003} rotationAxis="z" speed={-0.6} dashes={200} buildDelay={0.7} />
      <Ring radius={2.45} tube={0.008} rotationAxis="z" speed={0.3} dashes={12} buildDelay={0.9} />
      <Ring
        radius={1.65}
        tube={0.004}
        rotationAxis="x"
        speed={0.9}
        dashes={80}
        buildDelay={0.5}
        tilt={Math.PI / 2.2}
      />
      <Ring
        radius={1.95}
        tube={0.004}
        rotationAxis="y"
        speed={0.7}
        dashes={64}
        buildDelay={0.6}
        tilt={Math.PI / 2.5}
      />
      <Ticks count={64} radius={1.35} length={0.08} />
      <Ticks count={120} radius={2.25} length={0.12} />
      <ScanSweep radius={1.9} />
      {/* center dot */}
      <mesh>
        <circleGeometry args={[0.04, 32]} />
        <meshBasicMaterial color="#bfe7ff" />
      </mesh>
      {/* glow plane */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[0.6, 64]} />
        <meshBasicMaterial
          color="#1e6bff"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
