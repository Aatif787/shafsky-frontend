import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CommercialAircraft, type AircraftVariant, type AnimValues } from "./CommercialAircraft";

/* ───────────────────────────────────────────────────────────────────────────
 * AircraftStage — lives inside the R3F Canvas.
 *
 * Responsibilities
 * ────────────────
 * 1. Animation state machine  (ENTERING → IDLE → STARTUP → … → EXIT)
 * 2. Infinite cycle management (3 variants, auto-timer + hover)
 * 3. Two-slot transition       (seamless crossfade)
 * 4. Visual effects            (exhaust particles, ground shadow)
 * 5. Camera                    (static 3/4 cinematic view)
 * ─────────────────────────────────────────────────────────────────────────── */

/* ── Types ──────────────────────────────────────────────────────────────── */
type Phase = "ENTERING" | "IDLE" | "STARTUP" | "TAXI" | "TAKEOFF" | "CLIMB" | "EXIT" | "DONE";

const VARIANTS: AircraftVariant[] = ["wide-a", "wide-b", "narrow"];
const AUTO_DELAY = 7; // seconds

/* ── Easing helpers ─────────────────────────────────────────────────────── */
function eOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function eInCubic(t: number) {
  return t * t * t;
}
function eInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function eOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}
function eInQuad(t: number) {
  return t * t;
}

/* ── Per-slot state (tracked in refs, NOT React state) ──────────────── */
interface Slot {
  variant: AircraftVariant;
  phase: Phase;
  pt: number; // phase elapsed time

  /* derived values — recalculated each frame */
  posX: number;
  posY: number;
  pitch: number;
  roll: number;
  scl: number;
  opa: number;
  rpm: number;
  gear: number;
  vib: number;
  landL: boolean;
  taxiL: boolean;
  beacon: boolean;
  vis: boolean;
}

const PHASE_DUR: Record<Phase, number> = {
  ENTERING: 2.2,
  IDLE: Infinity,
  STARTUP: 2.5,
  TAXI: 2.5,
  TAKEOFF: 2.2,
  CLIMB: 2.2,
  EXIT: 2.0,
  DONE: Infinity,
};

function freshSlot(variant: AircraftVariant, entering: boolean): Slot {
  return {
    variant,
    phase: entering ? "ENTERING" : "IDLE",
    pt: 0,
    posX: entering ? -14 : 0,
    posY: 0,
    pitch: 0,
    roll: 0,
    scl: 1,
    opa: 1,
    rpm: 0.1,
    gear: 1,
    vib: 0.002,
    landL: false,
    taxiL: false,
    beacon: true,
    vis: true,
  };
}

/** Advance a slot by `dt` seconds, mutating in place. Returns true if phase transitioned. */
function tickSlot(s: Slot, dt: number): boolean {
  s.pt += dt;
  const dur = PHASE_DUR[s.phase];
  const t = Math.min(1, s.pt / dur); // 0–1 progress

  switch (s.phase) {
    /* ──────── ENTERING ──────── */
    case "ENTERING": {
      const e = eOutCubic(t);
      s.posX = THREE.MathUtils.lerp(-14, 0, e);
      s.posY = 0;
      s.rpm = 0.1;
      s.gear = 1;
      s.vib = 0.002;
      s.beacon = true;
      s.landL = false;
      s.taxiL = false;
      if (t >= 1) {
        s.phase = "IDLE";
        s.pt = 0;
        return true;
      }
      break;
    }

    /* ──────── IDLE ──────── */
    case "IDLE": {
      s.posX = 0;
      s.posY = Math.sin(s.pt * 0.5) * 0.003;
      s.rpm = 0.1 + Math.sin(s.pt * 1.2) * 0.008;
      s.pitch = Math.sin(s.pt * 0.3) * 0.002;
      s.roll = Math.sin(s.pt * 0.4) * 0.002;
      s.gear = 1;
      s.vib = 0.002;
      s.beacon = true;
      s.landL = false;
      s.taxiL = false;
      break;
    }

    /* ──────── STARTUP ──────── */
    case "STARTUP": {
      const e = eInOutCubic(t);
      s.posX = 0;
      s.posY = 0;
      s.rpm = THREE.MathUtils.lerp(0.1, 0.55, e);
      s.vib = THREE.MathUtils.lerp(0.002, 0.009, e);
      s.landL = t > 0.3;
      s.taxiL = t > 0.5;
      s.beacon = true;
      if (t >= 1) {
        s.phase = "TAXI";
        s.pt = 0;
        return true;
      }
      break;
    }

    /* ──────── TAXI ──────── */
    case "TAXI": {
      const e = eInOutCubic(t);
      s.posX = THREE.MathUtils.lerp(0, 4, e);
      s.posY = 0;
      s.rpm = THREE.MathUtils.lerp(0.55, 0.65, e);
      s.roll = Math.sin(s.pt * 2) * 0.005;
      s.vib = 0.006;
      if (t >= 1) {
        s.phase = "TAKEOFF";
        s.pt = 0;
        return true;
      }
      break;
    }

    /* ──────── TAKEOFF ──────── */
    case "TAKEOFF": {
      const e = eInQuad(t); // accelerating feel
      s.posX = THREE.MathUtils.lerp(4, 18, e);
      s.rpm = THREE.MathUtils.lerp(0.65, 1.0, eOutCubic(t));
      s.vib = THREE.MathUtils.lerp(0.006, 0.014, t);
      // Rotation — nose lifts in last 35 %
      if (t > 0.65) {
        const rt = (t - 0.65) / 0.35;
        s.pitch = THREE.MathUtils.lerp(0, 0.14, eOutCubic(rt));
        s.posY = THREE.MathUtils.lerp(0, 0.35, eOutCubic(rt));
      } else {
        s.pitch = 0;
        s.posY = 0;
      }
      if (t >= 1) {
        s.phase = "CLIMB";
        s.pt = 0;
        return true;
      }
      break;
    }

    /* ──────── CLIMB ──────── */
    case "CLIMB": {
      const e = eInOutCubic(t);
      s.posX = THREE.MathUtils.lerp(18, 26, e);
      s.posY = THREE.MathUtils.lerp(0.35, 7, eInCubic(t));
      s.pitch = THREE.MathUtils.lerp(0.14, 0.2, e);
      s.gear = THREE.MathUtils.lerp(1, 0, eOutCubic(Math.min(1, t * 2)));
      s.rpm = 1.0;
      s.vib = THREE.MathUtils.lerp(0.014, 0.002, t);
      if (t >= 1) {
        s.phase = "EXIT";
        s.pt = 0;
        return true;
      }
      break;
    }

    /* ──────── EXIT ──────── */
    case "EXIT": {
      const e = eInCubic(t);
      s.posX = THREE.MathUtils.lerp(26, 45, e);
      s.posY = THREE.MathUtils.lerp(7, 20, e);
      s.pitch = THREE.MathUtils.lerp(0.2, 0.24, e);
      s.scl = THREE.MathUtils.lerp(1, 0.25, e);
      s.opa = t > 0.55 ? THREE.MathUtils.lerp(1, 0, (t - 0.55) / 0.45) : 1;
      s.rpm = 1.0;
      s.gear = 0;
      if (t >= 1) {
        s.phase = "DONE";
        s.pt = 0;
        s.vis = false;
        return true;
      }
      break;
    }

    default:
      break;
  }

  return false;
}

/* ── Exhaust Particles ──────────────────────────────────────────────────── */
function ExhaustSystem({
  rpm,
  enginePositions,
}: {
  rpm: number;
  enginePositions: [number, number, number][];
}) {
  const ref = useRef<THREE.Points>(null!);
  const count = 200;
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const alphas = useMemo(() => new Float32Array(count).fill(0), []);
  const head = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const rate = Math.floor(rpm * 8);
    // Emit from each engine
    for (const ep of enginePositions) {
      for (let n = 0; n < rate; n++) {
        const i = head.current;
        positions[i * 3] = ep[0] + (Math.random() - 0.5) * 0.08;
        positions[i * 3 + 1] = ep[1] + (Math.random() - 0.5) * 0.08;
        positions[i * 3 + 2] = ep[2] + (Math.random() - 0.5) * 0.08;
        alphas[i] = 1;
        head.current = (head.current + 1) % count;
      }
    }
    // Age
    for (let i = 0; i < count; i++) {
      alphas[i] -= dt * 1.4;
      if (alphas[i] < 0) alphas[i] = 0;
      positions[i * 3] -= dt * (1.0 + rpm * 2.5);
      positions[i * 3 + 1] += (Math.random() - 0.5) * dt * 0.4;
      positions[i * 3 + 2] += (Math.random() - 0.5) * dt * 0.4;
    }
    (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#e8dcd0"
        transparent
        opacity={0.35 * rpm}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Ground Shadow ──────────────────────────────────────────────────────── */
function GroundShadow({ posX, posY, scale }: { posX: number; posY: number; scale: number }) {
  // Shadow fades as aircraft lifts off
  const opacity = Math.max(0, 0.25 - posY * 0.035) * scale;
  return (
    <mesh position={[posX, -0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.5, 32]} />
      <meshBasicMaterial color="#0d2a36" transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/* ── Ground Plane ───────────────────────────────────────────────────────── */
function TarmacGround() {
  return (
    <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 40]} />
      <meshStandardMaterial color="#c8c0b4" metalness={0.05} roughness={0.9} />
    </mesh>
  );
}

/* ── Single rendered aircraft with animation values applied ─────────── */
function RenderedAircraft({ slot }: { slot: Slot }) {
  const grpRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!grpRef.current) return;
    grpRef.current.position.set(slot.posX, slot.posY, 0);
    grpRef.current.rotation.set(slot.pitch, 0, slot.roll);
    grpRef.current.scale.setScalar(slot.scl);
    // opacity via material traversal (only when fading)
    if (slot.opa < 0.99) {
      grpRef.current.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          const mat = mesh.material as THREE.Material;
          mat.transparent = true;
          mat.opacity = slot.opa;
        }
      });
    }
  });

  const anim: AnimValues = {
    engineRPM: slot.rpm,
    gearExtension: slot.gear,
    vibration: slot.vib,
    landingLightsOn: slot.landL,
    taxiLightsOn: slot.taxiL,
    beaconActive: slot.beacon,
  };

  if (!slot.vis) return null;

  return (
    <group ref={grpRef}>
      <CommercialAircraft variant={slot.variant} anim={anim} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */
export function AircraftStage({ reducedMotion }: { reducedMotion: boolean }) {
  /* ── Variant cycling ─────────────────────────────────────────────────── */
  const varIdx = useRef(0);
  const nextIdx = useCallback(() => {
    varIdx.current = (varIdx.current + 1) % VARIANTS.length;
    return VARIANTS[varIdx.current];
  }, []);

  /* ── Two slot refs ───────────────────────────────────────────────────── */
  const primary = useRef<Slot>(freshSlot(VARIANTS[0], true));
  const secondary = useRef<Slot | null>(null);
  const autoTimer = useRef(0);
  const departing = useRef(false);

  /* ── Force re-render triggers (minimal — only on swap) ───────────── */
  const [tick, setTick] = useState(0);

  /* ── Trigger departure ───────────────────────────────────────────────── */
  const triggerDeparture = useCallback(() => {
    if (departing.current) return;
    const p = primary.current;
    if (p.phase !== "IDLE") return;
    departing.current = true;
    autoTimer.current = 0;
    p.phase = "STARTUP";
    p.pt = 0;
  }, []);

  /* ── Hover handler (passed to aircraft pointer event) ────────────── */
  const onHover = useCallback(() => {
    if (!reducedMotion) triggerDeparture();
  }, [reducedMotion, triggerDeparture]);

  /* ── Main frame loop ─────────────────────────────────────────────────── */
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05); // clamp for tab-away
    const p = primary.current;

    // --- Tick primary ---
    const pTransitioned = tickSlot(p, dt);

    // When primary enters CLIMB, spawn secondary
    if (p.phase === "CLIMB" && !secondary.current) {
      const nv = nextIdx();
      secondary.current = freshSlot(nv, true);
      setTick((x) => x + 1);
    }

    // When primary is DONE, swap
    if (p.phase === "DONE" && secondary.current) {
      primary.current = secondary.current;
      secondary.current = null;
      departing.current = false;
      autoTimer.current = 0;
      setTick((x) => x + 1);
    }

    // --- Tick secondary if exists ---
    if (secondary.current) {
      tickSlot(secondary.current, dt);
    }

    // --- Auto timer ---
    if (p.phase === "IDLE" && !reducedMotion) {
      autoTimer.current += dt;
      if (autoTimer.current >= AUTO_DELAY) {
        triggerDeparture();
      }
    }
  });

  /* ── Camera ──────────────────────────────────────────────────────────── */
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(6, 3.5, 9);
    camera.lookAt(0, 0.5, 0);
    (camera as THREE.PerspectiveCamera).fov = 32;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera]);

  /* ── Engine exhaust positions (approximate, relative to slot posX) ── */
  const p = primary.current;
  const pEngines: [number, number, number][] = [
    [p.posX - 0.8, -p.posY - 0.25, -1.5],
    [p.posX - 0.8, -p.posY - 0.25, 1.5],
  ];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-8, 8, -6]} intensity={0.3} color="#d0e0f0" />

      {/* Ground */}
      <TarmacGround />

      {/* Primary aircraft */}
      <group onPointerEnter={onHover} key={`p-${tick}`}>
        <RenderedAircraft slot={primary.current} />
        <GroundShadow posX={p.posX} posY={p.posY} scale={p.scl} />
        <ExhaustSystem rpm={p.rpm} enginePositions={pEngines} />
      </group>

      {/* Secondary aircraft (during transition) */}
      {secondary.current && (
        <group key={`s-${tick}`}>
          <RenderedAircraft slot={secondary.current} />
          <GroundShadow
            posX={secondary.current.posX}
            posY={secondary.current.posY}
            scale={secondary.current.scl}
          />
        </group>
      )}
    </>
  );
}
