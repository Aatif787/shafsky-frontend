import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ───────────────────────────────────────────────────────────────────────────
 * CommercialAircraft — Procedural commercial airliner built from Three.js
 * primitives. Three distinct silhouettes (A350, 787, A321neo inspired).
 * Receives animation values as props; internally animates engine fans,
 * beacon blink, and vibration via useFrame.
 * ─────────────────────────────────────────────────────────────────────────── */

export type AircraftVariant = "wide-a" | "wide-b" | "narrow";

export interface AnimValues {
  engineRPM: number; // 0–1
  gearExtension: number; // 0–1 (1 = down)
  vibration: number; // amplitude
  landingLightsOn: boolean;
  taxiLightsOn: boolean;
  beaconActive: boolean;
}

/* ── Variant geometry config ────────────────────────────────────────────── */
interface VCfg {
  fl: number;
  fr: number; // fuselage length / radius
  ws: number;
  wc: number;
  sw: number; // half-wingspan / chord / sweep
  er: number;
  eo: number;
  el: number; // engine radius / Z-offset / length
  col: string;
  belly: string;
  accent: string;
}

const V: Record<AircraftVariant, VCfg> = {
  "wide-a": {
    fl: 6.0,
    fr: 0.3,
    ws: 2.8,
    wc: 1.15,
    sw: 0.28,
    er: 0.2,
    eo: 1.6,
    el: 0.7,
    col: "#f0f0f0",
    belly: "#d0d0c8",
    accent: "#1a5276",
  },
  "wide-b": {
    fl: 5.6,
    fr: 0.28,
    ws: 2.65,
    wc: 1.08,
    sw: 0.32,
    er: 0.22,
    eo: 1.5,
    el: 0.72,
    col: "#eeeee8",
    belly: "#ccccc4",
    accent: "#1e8449",
  },
  narrow: {
    fl: 4.6,
    fr: 0.21,
    ws: 2.05,
    wc: 0.82,
    sw: 0.25,
    er: 0.15,
    eo: 1.2,
    el: 0.55,
    col: "#f4f4f4",
    belly: "#d4d4cc",
    accent: "#c0392b",
  },
};

/* ── Component ──────────────────────────────────────────────────────────── */
interface Props {
  variant: AircraftVariant;
  anim: AnimValues;
}

export function CommercialAircraft({ variant, anim }: Props) {
  const c = V[variant];

  /* refs */
  const fanL = useRef<THREE.Group>(null!);
  const fanR = useRef<THREE.Group>(null!);
  const beaconLight = useRef<THREE.PointLight>(null!);
  const strobeL = useRef<THREE.PointLight>(null!);
  const strobeR = useRef<THREE.PointLight>(null!);
  const vibGrp = useRef<THREE.Group>(null!);

  /* shared materials — memoised per variant */
  const mBody = useMemo(
    () => new THREE.MeshStandardMaterial({ color: c.col, metalness: 0.35, roughness: 0.45 }),
    [c.col],
  );
  const mAccent = useMemo(
    () => new THREE.MeshStandardMaterial({ color: c.accent, metalness: 0.4, roughness: 0.4 }),
    [c.accent],
  );
  const mDark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2a3038", metalness: 0.5, roughness: 0.3 }),
    [],
  );
  const mEngine = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#a0a8b0", metalness: 0.7, roughness: 0.25 }),
    [],
  );
  const mFan = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c0c8d0",
        metalness: 0.6,
        roughness: 0.3,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const mStrut = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#808890", metalness: 0.6, roughness: 0.3 }),
    [],
  );
  const mWheel = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1a1a1a", metalness: 0.2, roughness: 0.8 }),
    [],
  );

  /* per-frame animation (fans, beacon, strobe, vibration) */
  useFrame((state, delta) => {
    const spd = anim.engineRPM * 55;
    if (fanL.current) fanL.current.rotation.x += delta * spd;
    if (fanR.current) fanR.current.rotation.x += delta * spd;

    const t = state.clock.elapsedTime;

    // beacon — 1 Hz flash
    if (beaconLight.current) {
      beaconLight.current.intensity = anim.beaconActive
        ? Math.sin(t * Math.PI * 2) > 0.3
          ? 5
          : 0
        : 0;
    }

    // strobe — double flash every 1.2 s
    if (strobeL.current && strobeR.current) {
      const cycle = t % 1.2;
      const on = cycle < 0.05 || (cycle > 0.1 && cycle < 0.15) ? 6 : 0;
      strobeL.current.intensity = anim.beaconActive ? on : 0;
      strobeR.current.intensity = anim.beaconActive ? on : 0;
    }

    // vibration
    if (vibGrp.current) {
      const v = anim.vibration;
      vibGrp.current.position.y = (Math.random() - 0.5) * v;
      vibGrp.current.position.x = (Math.random() - 0.5) * v * 0.5;
    }
  });

  const ge = anim.gearExtension;
  const wy = -c.fr * 0.15; // wing Y
  const gyBase = -c.fr - 0.15; // gear Y when fully extended

  return (
    <group ref={vibGrp}>
      {/* ═══════════ FUSELAGE ═══════════ */}
      {/* Main barrel */}
      <mesh rotation={[0, 0, -Math.PI / 2]} material={mBody}>
        <cylinderGeometry args={[c.fr, c.fr, c.fl * 0.65, 24]} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[c.fl * 0.42, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={mBody}>
        <coneGeometry args={[c.fr, c.fl * 0.22, 24]} />
      </mesh>
      {/* Tail taper */}
      <mesh
        position={[-c.fl * 0.38, c.fr * 0.12, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={mBody}
      >
        <coneGeometry args={[c.fr * 0.25, c.fl * 0.18, 16]} />
      </mesh>
      {/* Cockpit windows (dark band) */}
      <mesh
        position={[c.fl * 0.38, c.fr * 0.25, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        material={mDark}
      >
        <coneGeometry args={[c.fr * 0.32, c.fl * 0.05, 12]} />
      </mesh>
      {/* Passenger windows — subtle stripe */}
      <mesh position={[0, c.fr * 0.15, 0]} material={mDark}>
        <boxGeometry args={[c.fl * 0.55, 0.012, c.fr * 0.04]} />
      </mesh>
      <mesh position={[0, c.fr * 0.15, 0]} rotation={[0, Math.PI, 0]} material={mDark}>
        <boxGeometry args={[c.fl * 0.55, 0.012, c.fr * 0.04]} />
      </mesh>
      {/* Accent stripe (belly) */}
      <mesh position={[0, -c.fr * 0.7, 0]} material={mAccent}>
        <boxGeometry args={[c.fl * 0.6, c.fr * 0.12, 0.01]} />
      </mesh>

      {/* ═══════════ WINGS ═══════════ */}
      {[1, -1].map((s) => (
        <group key={`w${s}`} position={[-c.fl * 0.05, wy, s * c.fr * 0.4]}>
          <group rotation={[0, -s * c.sw, s * 0.008]}>
            {/* Main wing surface */}
            <mesh position={[0, 0, s * c.ws * 0.5]} material={mBody}>
              <boxGeometry args={[c.wc, 0.022, c.ws]} />
            </mesh>
            {/* Winglet */}
            <mesh
              position={[-c.wc * 0.12, 0.1, s * (c.ws + 0.01)]}
              rotation={[0, 0, -s * 0.45]}
              material={mBody}
            >
              <boxGeometry args={[c.wc * 0.3, 0.2, 0.012]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ═══════════ ENGINES ═══════════ */}
      {[1, -1].map((s) => (
        <group key={`e${s}`} position={[-c.fl * 0.08, wy - c.fr * 0.55, s * c.eo]}>
          {/* Pylon */}
          <mesh position={[0, c.fr * 0.22, 0]} material={mBody}>
            <boxGeometry args={[c.el * 0.45, c.fr * 0.3, 0.028]} />
          </mesh>
          {/* Nacelle */}
          <mesh rotation={[0, 0, -Math.PI / 2]} material={mEngine}>
            <cylinderGeometry args={[c.er, c.er * 0.92, c.el, 20]} />
          </mesh>
          {/* Fan group (rotates around X — engine axis) */}
          <group ref={s === 1 ? fanR : fanL} position={[c.el * 0.48, 0, 0]}>
            <mesh rotation={[0, Math.PI / 2, 0]} material={mFan}>
              <circleGeometry args={[c.er * 0.85, 24]} />
            </mesh>
            {/* Hub */}
            <mesh rotation={[0, Math.PI / 2, 0]} material={mDark}>
              <circleGeometry args={[c.er * 0.18, 12]} />
            </mesh>
          </group>
          {/* Exhaust cone */}
          <mesh position={[-c.el * 0.48, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={mDark}>
            <cylinderGeometry args={[c.er * 0.55, c.er * 0.7, 0.08, 16]} />
          </mesh>
          {/* Engine glow */}
          <pointLight
            position={[-c.el * 0.5, 0, 0]}
            color="#ffeedd"
            intensity={anim.engineRPM * 3}
            distance={4}
          />
        </group>
      ))}

      {/* ═══════════ TAIL ═══════════ */}
      {/* Vertical stabiliser */}
      <mesh position={[-c.fl * 0.35, c.fr + 0.32, 0]} rotation={[0, 0, 0.12]} material={mBody}>
        <boxGeometry args={[c.fl * 0.11, 0.68, 0.018]} />
      </mesh>
      {/* Accent on fin */}
      <mesh
        position={[-c.fl * 0.35, c.fr + 0.32, 0.011]}
        rotation={[0, 0, 0.12]}
        material={mAccent}
      >
        <boxGeometry args={[c.fl * 0.09, 0.42, 0.005]} />
      </mesh>
      {/* Horizontal stabilisers */}
      {[1, -1].map((s) => (
        <mesh
          key={`hs${s}`}
          position={[-c.fl * 0.37, c.fr * 0.35, s * 0.5]}
          rotation={[0, -s * 0.14, 0]}
          material={mBody}
        >
          <boxGeometry args={[0.45, 0.016, 0.82]} />
        </mesh>
      ))}

      {/* ═══════════ LANDING GEAR ═══════════ */}
      {ge > 0.05 && (
        <>
          {/* Nose gear */}
          <group position={[c.fl * 0.28, gyBase * ge, 0]} scale={[1, Math.max(0.01, ge), 1]}>
            <mesh material={mStrut}>
              <boxGeometry args={[0.018, 0.28, 0.018]} />
            </mesh>
            <mesh position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]} material={mWheel}>
              <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
            </mesh>
          </group>
          {/* Main gear */}
          {[1, -1].map((s) => (
            <group
              key={`mg${s}`}
              position={[-c.fl * 0.08, gyBase * ge, s * c.fr * 1.1]}
              scale={[1, Math.max(0.01, ge), 1]}
            >
              <mesh material={mStrut}>
                <boxGeometry args={[0.022, 0.32, 0.022]} />
              </mesh>
              <mesh position={[0, -0.16, 0.025]} rotation={[Math.PI / 2, 0, 0]} material={mWheel}>
                <cylinderGeometry args={[0.058, 0.058, 0.035, 12]} />
              </mesh>
              <mesh position={[0, -0.16, -0.025]} rotation={[Math.PI / 2, 0, 0]} material={mWheel}>
                <cylinderGeometry args={[0.058, 0.058, 0.035, 12]} />
              </mesh>
            </group>
          ))}
        </>
      )}

      {/* ═══════════ LIGHTS ═══════════ */}
      {/* Nav — red port (−Z), green starboard (+Z) */}
      <pointLight
        position={[-c.wc * 0.3 - c.fl * 0.05, wy, -(c.ws + c.fr * 0.5)]}
        color="#ff2020"
        intensity={2}
        distance={4}
      />
      <mesh position={[-c.wc * 0.3 - c.fl * 0.05, wy, -(c.ws + c.fr * 0.5)]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ff2020" />
      </mesh>

      <pointLight
        position={[-c.wc * 0.3 - c.fl * 0.05, wy, c.ws + c.fr * 0.5]}
        color="#20ff20"
        intensity={2}
        distance={4}
      />
      <mesh position={[-c.wc * 0.3 - c.fl * 0.05, wy, c.ws + c.fr * 0.5]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#20ff20" />
      </mesh>

      {/* Strobe — white flash on each wingtip */}
      <pointLight
        ref={strobeL}
        position={[-c.wc * 0.3 - c.fl * 0.05, wy + 0.01, -(c.ws + c.fr * 0.5)]}
        color="#ffffff"
        intensity={0}
        distance={8}
      />
      <pointLight
        ref={strobeR}
        position={[-c.wc * 0.3 - c.fl * 0.05, wy + 0.01, c.ws + c.fr * 0.5]}
        color="#ffffff"
        intensity={0}
        distance={8}
      />

      {/* Beacon — flashing red on top of fuselage */}
      <pointLight
        ref={beaconLight}
        position={[0, c.fr + 0.04, 0]}
        color="#ff3030"
        intensity={0}
        distance={6}
      />
      <mesh position={[0, c.fr + 0.04, 0]}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshBasicMaterial color="#ff3030" />
      </mesh>

      {/* Landing lights (white, nose area) */}
      {anim.landingLightsOn && (
        <>
          <pointLight
            position={[c.fl * 0.35, -c.fr * 0.3, 0.12]}
            color="#fffbe6"
            intensity={5}
            distance={14}
          />
          <pointLight
            position={[c.fl * 0.35, -c.fr * 0.3, -0.12]}
            color="#fffbe6"
            intensity={5}
            distance={14}
          />
        </>
      )}

      {/* Taxi lights */}
      {anim.taxiLightsOn && (
        <pointLight
          position={[c.fl * 0.28, gyBase, 0]}
          color="#fff5d6"
          intensity={3}
          distance={10}
        />
      )}
    </group>
  );
}
