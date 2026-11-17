"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const ELECTRIC = "#493BFF";
const VIOLET = "#8655FF";
const AQUA = "#12D6C5";
const CORAL = "#FF6B79";
const SUN = "#FFD166";
const INK = "#171936";
const WHITE = "#F7F7FF";

/** Side profile of a coach, extruded across its width. Units: metres-ish, nose at +x. */
function coachProfile() {
  const s = new THREE.Shape();
  const L = 4.2, H = 1.45, r = 0.22;
  s.moveTo(-L / 2 + r, 0);
  s.lineTo(L / 2 - 0.25, 0);
  s.quadraticCurveTo(L / 2, 0, L / 2, 0.25);
  s.lineTo(L / 2 - 0.02, H - 0.55);
  s.quadraticCurveTo(L / 2 - 0.12, H - 0.05, L / 2 - 0.45, H);
  s.lineTo(-L / 2 + r, H);
  s.quadraticCurveTo(-L / 2, H, -L / 2, H - r);
  s.lineTo(-L / 2, r);
  s.quadraticCurveTo(-L / 2, 0, -L / 2 + r, 0);
  return s;
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.22, 28]} />
        <meshStandardMaterial color={INK} roughness={0.8} />
      </mesh>
      <mesh position={[0, z > 0 ? 0.115 : -0.115, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
        <meshStandardMaterial color="#C9CBE0" metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Coach() {
  const W = 1.05;
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(coachProfile(), { depth: W, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 16 });
    g.translate(0, 0, -W / 2);
    return g;
  }, []);

  const windowXs = [-1.55, -1.0, -0.45, 0.1, 0.65, 1.2];

  return (
    <group position={[0, 0.27, 0]}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshStandardMaterial color={WHITE} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Livery: electric skirt, violet roof cap, aqua route stripe */}
      {[1, -1].map((side) => (
        <group key={side} position={[0, 0, side * (W / 2 + 0.056)]}>
          <mesh position={[-0.12, 0.2, 0]}>
            <boxGeometry args={[3.9, 0.36, 0.01]} />
            <meshStandardMaterial color={ELECTRIC} roughness={0.4} />
          </mesh>
          <mesh position={[-0.12, 0.42, 0]}>
            <boxGeometry args={[3.9, 0.07, 0.012]} />
            <meshStandardMaterial color={AQUA} emissive={AQUA} emissiveIntensity={0.25} roughness={0.3} />
          </mesh>
          {/* Window band */}
          {windowXs.map((x) => (
            <mesh key={x} position={[x, 0.95, 0]}>
              <boxGeometry args={[0.48, 0.5, 0.012]} />
              <meshStandardMaterial color="#232659" roughness={0.12} metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Windscreen */}
      <mesh position={[2.08, 0.92, 0]} rotation={[0, 0, -0.12]}>
        <boxGeometry args={[0.02, 0.62, 0.96]} />
        <meshStandardMaterial color="#232659" roughness={0.1} metalness={0.5} />
      </mesh>
      {/* Roof cap */}
      <mesh position={[-0.2, 1.52, 0]} castShadow>
        <boxGeometry args={[3.2, 0.1, 0.9]} />
        <meshStandardMaterial color={VIOLET} roughness={0.4} />
      </mesh>
      {/* Headlights */}
      {[0.3, -0.3].map((z) => (
        <mesh key={z} position={[2.12, 0.32, z]}>
          <boxGeometry args={[0.04, 0.1, 0.22]} />
          <meshStandardMaterial color={SUN} emissive={SUN} emissiveIntensity={0.9} />
        </mesh>
      ))}
      {[1.3, -1.25].flatMap((x) => [W / 2 + 0.02, -W / 2 - 0.02].map((z) => <Wheel key={`${x}${z}`} x={x} z={z} />))}
    </group>
  );
}

/** Floating route ribbon: a flat band following a gentle S-curve, with a dashed centre line. */
function RouteRibbon() {
  const { ribbon, dashes } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5.5, 0, 1.6),
      new THREE.Vector3(-2.5, 0, 0.2),
      new THREE.Vector3(0.5, 0, 0),
      new THREE.Vector3(3.2, 0, -0.9),
      new THREE.Vector3(6, 0, -2.6),
    ]);
    const points = curve.getSpacedPoints(160);
    const width = 1.9;
    const pos: number[] = [];
    const idx: number[] = [];
    points.forEach((p, i) => {
      const t = curve.getTangentAt(i / 160);
      const n = new THREE.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(width / 2);
      pos.push(p.x + n.x, 0, p.z + n.z, p.x - n.x, 0, p.z - n.z);
      if (i < points.length - 1) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const ribbon = new THREE.BufferGeometry();
    ribbon.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    ribbon.setIndex(idx);
    ribbon.computeVertexNormals();
    const dashes = points.filter((_, i) => i % 8 === 0).map((p, i) => ({ p, angle: Math.atan2(-curve.getTangentAt((i * 8) / 160).z, curve.getTangentAt((i * 8) / 160).x) }));
    return { ribbon, dashes };
  }, []);

  return (
    <group>
      <mesh geometry={ribbon} receiveShadow>
        <meshStandardMaterial color="#2A1F9E" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {dashes.map(({ p, angle }, i) => (
        <mesh key={i} position={[p.x, 0.012, p.z]} rotation={[-Math.PI / 2, 0, angle]}>
          <planeGeometry args={[0.32, 0.06]} />
          <meshBasicMaterial color={AQUA} />
        </mesh>
      ))}
    </group>
  );
}

function Pin({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.8 + delay) * 0.08;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 0.45, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0.2]}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
    </group>
  );
}

function Scene({ animate }: { animate: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const bus = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }) => {
    if (!animate || !rig.current || !bus.current) return;
    const t = clock.elapsedTime;
    rig.current.position.y = Math.sin(t * (Math.PI * 2) / 9) * 0.12; // 9s float loop
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, -0.55 + pointer.x * 0.08, 0.04);
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, 0.02 - pointer.y * 0.04, 0.04);
    bus.current.position.y = Math.abs(Math.sin(t * 2.2)) * 0.015;
  });
  return (
    <group ref={rig} rotation={[0.02, -0.55, 0]}>
      <RouteRibbon />
      <group ref={bus} position={[0.4, 0, 0.05]} rotation={[0, 0.18, 0]}>
        <Coach />
      </group>
      <Pin position={[-3.4, 0, 0.9]} color={AQUA} />
      <Pin position={[3.9, 0, -1.5]} color={CORAL} delay={1.4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.18} />
      </mesh>
    </group>
  );
}

export default function BusScene({ animate = true }: { animate?: boolean }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 4.2, 9], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      aria-hidden
    >
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#ffffff", "#3a2df0", 0.7]} />
      <directionalLight position={[4, 8, 5]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} color={VIOLET} />
      <group position={[0, -0.6, 0]}>
        <Scene animate={animate} />
      </group>
    </Canvas>
  );
}
