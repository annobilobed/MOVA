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
const GLASS = "#1d2150";

/** Side profile of a coach, extruded across its width. Nose at +x. */
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

/** Soft radial texture for contact shadows and glows. */
function radialTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Glass({ position, size, rotation }: { position: [number, number, number]; size: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={size} />
        <meshPhysicalMaterial color={GLASS} roughness={0.08} metalness={0.2} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {/* diagonal sky reflection */}
      <mesh position={[size[0] > size[2] ? -size[0] * 0.18 : 0, size[1] * 0.12, size[0] > size[2] ? size[2] / 2 + 0.002 : 0]} rotation={[0, size[0] > size[2] ? 0 : Math.PI / 2, -0.6]}>
        <planeGeometry args={[Math.max(size[0], size[2]) * 0.18, size[1] * 1.1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  const out = z > 0 ? 1 : -1;
  return (
    <group position={[x, 0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.24, 32]} />
        <meshStandardMaterial color={INK} roughness={0.85} />
      </mesh>
      <mesh position={[0, out * 0.122, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.01, 32]} />
        <meshStandardMaterial color="#e9eaf6" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, out * 0.128, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.012, 20]} />
        <meshStandardMaterial color={ELECTRIC} metalness={0.3} roughness={0.3} />
      </mesh>
      {/* spokes */}
      {[0, 1, 2, 3, 4].map((k) => (
        <mesh key={k} position={[0, out * 0.126, 0]} rotation={[0, (k * Math.PI * 2) / 5, 0]}>
          <boxGeometry args={[0.025, 0.006, 0.3]} />
          <meshStandardMaterial color="#b9bbd6" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
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
  const half = W / 2 + 0.052;
  const windowXs = [-1.55, -1.02, -0.49, 0.04, 0.57];

  return (
    <group position={[0, 0.3, 0]}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color={WHITE} roughness={0.3} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side} position={[0, 0, side * half]} rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
          {/* Livery: electric skirt and aqua route stripe */}
          <mesh position={[-0.1, 0.2, 0]}>
            <boxGeometry args={[3.95, 0.36, 0.01]} />
            <meshStandardMaterial color={ELECTRIC} roughness={0.35} />
          </mesh>
          <mesh position={[-0.1, 0.42, 0.002]}>
            <boxGeometry args={[3.95, 0.07, 0.01]} />
            <meshStandardMaterial color={AQUA} emissive={AQUA} emissiveIntensity={0.35} roughness={0.3} />
          </mesh>
          {windowXs.map((x) => (
            <Glass key={x} position={[side === 1 ? x : -x, 0.97, 0.004]} size={[0.47, 0.5, 0.01]} />
          ))}
          {/* MOVA lettering on the skirt, as a simple light bar mark */}
          <mesh position={[side === 1 ? -1.1 : 1.1, 0.2, 0.008]}>
            <boxGeometry args={[0.7, 0.07, 0.004]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
      {/* Door, front-right (passenger side faces the camera) */}
      <group position={[1.45, 0.62, half + 0.006]}>
        <mesh>
          <boxGeometry args={[0.44, 1.02, 0.01]} />
          <meshPhysicalMaterial color={GLASS} roughness={0.1} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0, 0.007]}>
          <boxGeometry args={[0.02, 1.0, 0.004]} />
          <meshStandardMaterial color="#c9cbe0" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      {/* Windscreen, sitting proud of the nose */}
      <Glass position={[2.115, 0.95, 0]} size={[0.02, 0.58, 0.92]} rotation={[0, 0, -0.14]} />
      {/* Destination board above the windscreen */}
      <mesh position={[2.03, 1.33, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.02, 0.1, 0.7]} />
        <meshStandardMaterial color={AQUA} emissive={AQUA} emissiveIntensity={0.6} />
      </mesh>
      {/* Headlights and grille */}
      {[0.33, -0.33].map((z) => (
        <mesh key={z} position={[2.152, 0.3, z]}>
          <boxGeometry args={[0.02, 0.1, 0.22]} />
          <meshStandardMaterial color={SUN} emissive={SUN} emissiveIntensity={1.2} />
        </mesh>
      ))}
      <mesh position={[2.152, 0.3, 0]}>
        <boxGeometry args={[0.015, 0.08, 0.3]} />
        <meshStandardMaterial color={INK} roughness={0.6} />
      </mesh>
      {/* Mirrors */}
      {[1, -1].map((s) => (
        <group key={s} position={[2.0, 1.05, s * (W / 2 + 0.16)]}>
          <mesh position={[0, 0.08, -s * 0.06]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.04, 0.03, 0.14]} />
            <meshStandardMaterial color={INK} />
          </mesh>
          <mesh position={[0.02, -0.04, 0]}>
            <boxGeometry args={[0.05, 0.2, 0.08]} />
            <meshStandardMaterial color={INK} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Roof cap */}
      <mesh position={[-0.25, 1.52, 0]} castShadow>
        <boxGeometry args={[3.1, 0.1, 0.86]} />
        <meshStandardMaterial color={VIOLET} roughness={0.4} />
      </mesh>
      {/* Tail lights */}
      {[0.38, -0.38].map((z) => (
        <mesh key={z} position={[-2.152, 0.42, z]}>
          <boxGeometry args={[0.02, 0.22, 0.1]} />
          <meshStandardMaterial color={CORAL} emissive={CORAL} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {[1.3, -1.25].flatMap((x) => [W / 2 + 0.01, -W / 2 - 0.01].map((z) => <Wheel key={`${x}${z}`} x={x} z={z} />))}
    </group>
  );
}

const ROUTE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-3.7, 0, 1.0),
  new THREE.Vector3(-2.2, 0, 0.25),
  new THREE.Vector3(0.4, 0, 0),
  new THREE.Vector3(2.6, 0, -0.55),
  new THREE.Vector3(3.7, 0, -1.25),
]);

/** Floating aqua route ribbon: a lifted band with thickness and a bright edge, ending at a stop at each side. */
function RouteRibbon() {
  const { top, side, dashes } = useMemo(() => {
    const N = 160;
    const points = ROUTE.getSpacedPoints(N);
    const width = 1.7;
    const thick = 0.14;
    const topPos: number[] = [];
    const sidePos: number[] = [];
    const idx: number[] = [];
    const sideIdx: number[] = [];
    points.forEach((p, i) => {
      const t = ROUTE.getTangentAt(i / N);
      const n = new THREE.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(width / 2);
      // taper the ends so the ribbon closes inside the frame
      const k = Math.min(1, Math.min(i, N - i) / 10) ** 0.6;
      const nx = n.x * k, nz = n.z * k;
      topPos.push(p.x + nx, 0, p.z + nz, p.x - nx, 0, p.z - nz);
      sidePos.push(p.x + nx, 0, p.z + nz, p.x + nx, -thick, p.z + nz, p.x - nx, 0, p.z - nz, p.x - nx, -thick, p.z - nz);
      if (i < N) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        const b = i * 4;
        sideIdx.push(b, b + 4, b + 1, b + 1, b + 4, b + 5, b + 2, b + 3, b + 6, b + 3, b + 7, b + 6);
      }
    });
    const top = new THREE.BufferGeometry();
    top.setAttribute("position", new THREE.Float32BufferAttribute(topPos, 3));
    top.setIndex(idx);
    top.computeVertexNormals();
    const side = new THREE.BufferGeometry();
    side.setAttribute("position", new THREE.Float32BufferAttribute(sidePos, 3));
    side.setIndex(sideIdx);
    side.computeVertexNormals();
    const dashes = Array.from({ length: Math.floor(N / 8) - 1 }, (_, j) => {
      const u = ((j + 1) * 8) / N;
      const p = ROUTE.getPointAt(u);
      const t = ROUTE.getTangentAt(u);
      return { p, angle: Math.atan2(-t.z, t.x) };
    });
    return { top, side, dashes };
  }, []);

  return (
    <group position={[0, 0.16, 0]}>
      <mesh geometry={top} receiveShadow>
        <meshStandardMaterial color={AQUA} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={side}>
        <meshStandardMaterial color="#0a9c90" emissive={AQUA} emissiveIntensity={0.25} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {dashes.map(({ p, angle }, i) => (
        <mesh key={i} position={[p.x, 0.006, p.z]} rotation={[-Math.PI / 2, 0, angle]}>
          <planeGeometry args={[0.3, 0.055]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
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
      <mesh position={[0, 0.62, 0]} castShadow>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.21, 0.48, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.62, 0.22]}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
    </group>
  );
}

function Scene({ animate }: { animate: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const bus = useRef<THREE.Group>(null);
  const shadowTex = useMemo(() => radialTexture("rgba(23,25,54,0.55)", "rgba(23,25,54,0)"), []);
  const start = ROUTE.getPointAt(0);
  const end = ROUTE.getPointAt(1);
  useFrame(({ clock, pointer }) => {
    if (!animate || !rig.current || !bus.current) return;
    const t = clock.elapsedTime;
    rig.current.position.y = Math.sin((t * Math.PI * 2) / 9) * 0.12; // 9s float loop
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, -0.5 + pointer.x * 0.08, 0.04);
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, 0.02 - pointer.y * 0.04, 0.04);
    bus.current.position.y = 0.16 + Math.abs(Math.sin(t * 2.2)) * 0.012;
  });
  return (
    <group ref={rig} rotation={[0.02, -0.5, 0]}>
      <RouteRibbon />
      <group ref={bus} position={[0.35, 0.16, 0.02]} rotation={[0, 0.12, 0]}>
        {/* contact shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <planeGeometry args={[5, 1.9]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
        </mesh>
        <Coach />
      </group>
      <Pin position={[start.x + 0.1, 0.16, start.z]} color={VIOLET} />
      <Pin position={[end.x - 0.1, 0.16, end.z]} color={CORAL} delay={1.4} />
      {/* soft shadow of the floating ribbon on the "air" below */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
        <planeGeometry args={[11, 5]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function BusScene({ animate = true, onReady }: { animate?: boolean; onReady?: () => void }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 4.4, 9.6], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      aria-hidden
      onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))}
    >
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#ffffff", "#3a2df0", 0.75]} />
      <directionalLight position={[4, 8, 5]} intensity={1.7} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <directionalLight position={[-6, 3, -4]} intensity={0.6} color={VIOLET} />
      <directionalLight position={[6, 2, 6]} intensity={0.35} color={AQUA} />
      <group position={[0, -0.7, 0]}>
        <Scene animate={animate} />
      </group>
    </Canvas>
  );
}
