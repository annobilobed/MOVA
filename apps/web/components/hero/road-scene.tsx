"use client";

import { Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ---------- palette (the night-ride sky) ---------- */
const AMBER = "#ffb547";
const STUD = "#ffe3a3";
const EMBER = "#f0803c";
const INK = "#0e1330";
const WHITE = "#f4f5ff";
const GLASS = "#2c3570";

/* Sky keyframes over one cycle: dusk → night → dawn → dusk. */
const SKY = [
  { at: 0.0, top: "#2a1d4f", horizon: "#f0803c", fog: "#5b2e6b", light: 0.75, stars: 0.25 },
  { at: 0.3, top: "#0b1026", horizon: "#1c2a5e", fog: "#151b3d", light: 0.35, stars: 1.0 },
  { at: 0.55, top: "#0b1026", horizon: "#2a2f6e", fog: "#151b3d", light: 0.3, stars: 1.0 },
  { at: 0.8, top: "#3a2a63", horizon: "#ffc46b", fog: "#b4506a", light: 0.95, stars: 0.1 },
  { at: 1.0, top: "#2a1d4f", horizon: "#f0803c", fog: "#5b2e6b", light: 0.75, stars: 0.25 },
];
export const SKY_CYCLE_SECONDS = 90;

function skyAt(p: number) {
  let i = 0;
  while (i < SKY.length - 2 && p > SKY[i + 1].at) i++;
  const a = SKY[i], b = SKY[i + 1];
  const k = THREE.MathUtils.smoothstep(p, a.at, b.at);
  const c = (x: string, y: string) => new THREE.Color(x).lerp(new THREE.Color(y), k);
  return { top: c(a.top, b.top), horizon: c(a.horizon, b.horizon), fog: c(a.fog, b.fog), light: THREE.MathUtils.lerp(a.light, b.light, k), stars: THREE.MathUtils.lerp(a.stars, b.stars, k) };
}

/* ---------- shared motion state (scroll progress, speed) ---------- */
type Motion = { scroll: number; speed: number; animate: boolean; phase: number };

function Sky({ motion }: { motion: React.MutableRefObject<Motion> }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 top; uniform vec3 horizon; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.08,0.0,1.0); vec3 c = mix(horizon, top, pow(h,0.75)); gl_FragColor = vec4(c,1.0); }",
      }),
    [],
  );
  const { scene } = useThree();
  const starsRef = useRef<THREE.Points>(null);
  useFrame(() => {
    const s = skyAt(motion.current.phase);
    mat.uniforms.top.value.copy(s.top);
    mat.uniforms.horizon.value.copy(s.horizon);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(s.fog);
    const m = starsRef.current?.material as THREE.PointsMaterial | undefined;
    if (m) { m.transparent = true; m.opacity = s.stars; }
  });
  return (
    <>
      <mesh material={mat}>
        <sphereGeometry args={[180, 32, 16]} />
      </mesh>
      <Stars ref={starsRef as never} radius={120} depth={30} count={1400} factor={3.5} saturation={0} fade speed={0.4} />
    </>
  );
}

/* ---------- the coach ---------- */
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

function Wheel({ x, z, spin }: { x: number; z: number; spin: React.RefObject<THREE.Group[]> }) {
  const out = z > 0 ? 1 : -1;
  return (
    <group position={[x, 0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
      <group ref={(g) => { if (g && spin.current && !spin.current.includes(g)) spin.current.push(g); }}>
        <mesh>
          <cylinderGeometry args={[0.28, 0.28, 0.24, 28]} />
          <meshStandardMaterial color={INK} roughness={0.85} />
        </mesh>
        <mesh position={[0, out * 0.122, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.01, 28]} />
          <meshStandardMaterial color="#d9dcef" metalness={0.6} roughness={0.25} />
        </mesh>
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh key={k} position={[0, out * 0.127, 0]} rotation={[0, (k * Math.PI * 2) / 5, 0]}>
            <boxGeometry args={[0.03, 0.006, 0.3]} />
            <meshStandardMaterial color={AMBER} metalness={0.3} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Coach({ motion }: { motion: React.MutableRefObject<Motion> }) {
  const W = 1.05;
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(coachProfile(), { depth: W, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3, curveSegments: 12 });
    g.translate(0, 0, -W / 2);
    return g;
  }, []);
  const half = W / 2 + 0.052;
  const wheels = useRef<THREE.Group[]>([]);
  const root = useRef<THREE.Group>(null);
  const beamL = useRef<THREE.SpotLight>(null);
  const beamR = useRef<THREE.SpotLight>(null);
  const targetL = useMemo(() => new THREE.Object3D(), []);
  const targetR = useMemo(() => new THREE.Object3D(), []);
  const beamPool = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(40, 64, 4, 90, 64, 170);
    grad.addColorStop(0, "rgba(255,226,168,0.55)");
    grad.addColorStop(0.45, "rgba(255,200,120,0.22)");
    grad.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useFrame(({ clock }, dt) => {
    const m = motion.current;
    if (m.animate) for (const w of wheels.current) w.rotation.y -= dt * m.speed * 3.4;
    if (root.current && m.animate) {
      const t = clock.elapsedTime;
      root.current.position.y = 0.3 + Math.abs(Math.sin(t * 7)) * 0.008 * m.speed;
      root.current.rotation.z = Math.sin(t * 0.9) * 0.006;
    }
    if (beamL.current) beamL.current.target = targetL;
    if (beamR.current) beamR.current.target = targetR;
  });

  const windowXs = [-1.55, -1.02, -0.49, 0.04, 0.57];
  return (
    <group ref={root} position={[0, 0.3, 0]}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color={WHITE} roughness={0.28} clearcoat={0.7} clearcoatRoughness={0.15} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side} position={[0, 0, side * half]} rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
          {/* Livery: night skirt with an amber "headlight" stripe */}
          <mesh position={[-0.1, 0.2, 0]}>
            <boxGeometry args={[3.95, 0.36, 0.01]} />
            <meshStandardMaterial color="#151b3d" roughness={0.4} />
          </mesh>
          <mesh position={[-0.1, 0.42, 0.002]}>
            <boxGeometry args={[3.95, 0.07, 0.01]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.6} />
          </mesh>
          {windowXs.map((x) => (
            <mesh key={x} position={[side === 1 ? x : -x, 0.97, 0.004]}>
              <boxGeometry args={[0.47, 0.5, 0.01]} />
              {/* warm cabin light: people inside, riding home */}
              <meshStandardMaterial color={GLASS} emissive="#ffcf8a" emissiveIntensity={0.28} roughness={0.1} metalness={0.2} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[2.115, 0.95, 0]} rotation={[0, 0, -0.14]}>
        <boxGeometry args={[0.02, 0.58, 0.92]} />
        <meshStandardMaterial color={GLASS} emissive="#ffcf8a" emissiveIntensity={0.15} roughness={0.05} />
      </mesh>
      <mesh position={[2.03, 1.33, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.02, 0.1, 0.7]} />
        <meshStandardMaterial color={EMBER} emissive={EMBER} emissiveIntensity={1.2} />
      </mesh>
      {/* Headlights + beams */}
      {[0.33, -0.33].map((z, i) => (
        <group key={z} position={[2.16, 0.3, z]}>
          <mesh>
            <boxGeometry args={[0.02, 0.11, 0.22]} />
            <meshStandardMaterial color={STUD} emissive={STUD} emissiveIntensity={3} />
          </mesh>
          <spotLight ref={i === 0 ? beamL : beamR} color="#ffe2a8" intensity={40} distance={26} angle={0.42} penumbra={0.6} decay={1.4} />
          <primitive object={i === 0 ? targetL : targetR} position={[12, -0.6, 0]} />
          {/* soft visible cone */}
          <mesh position={[3.2, -0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[1.25, 6.4, 24, 1, true]} />
            <meshBasicMaterial color="#ffd89a" transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* light pool the headlights throw on the road ahead */}
      <mesh position={[6.2, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 3.4]} />
        <meshBasicMaterial map={beamPool} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {[0.38, -0.38].map((z) => (
        <mesh key={z} position={[-2.152, 0.42, z]}>
          <boxGeometry args={[0.02, 0.22, 0.1]} />
          <meshStandardMaterial color="#ff5a67" emissive="#ff5a67" emissiveIntensity={1.6} />
        </mesh>
      ))}
      <mesh position={[-0.25, 1.52, 0]}>
        <boxGeometry args={[3.1, 0.1, 0.86]} />
        <meshStandardMaterial color="#2a1d4f" roughness={0.4} />
      </mesh>
      {[1.3, -1.25].flatMap((x) => [W / 2 + 0.01, -W / 2 - 0.01].map((z) => <Wheel key={`${x}${z}`} x={x} z={z} spin={wheels} />))}
    </group>
  );
}

/* ---------- the road: everything streams toward the camera and wraps ---------- */
const ROAD_LEN = 150;
const START = -115; // horizon end
const NEAR = 32;    // behind the camera

function useStream(count: number, gap: number, place: (o: THREE.Object3D, i: number, z: number) => void, motion: React.MutableRefObject<Motion>, hideNear = false) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offset = useRef(0);
  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = motion.current;
    if (m.animate) offset.current = (offset.current + dt * m.speed * 9) % (count * gap);
    for (let i = 0; i < count; i++) {
      // The coach drives toward the camera, so the road streams away from it, into the distance.
      const z = NEAR - ((i * gap + offset.current) % (count * gap));
      dummy.position.set(0, 0, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      place(dummy, i, z);
      if (hideNear && z > 6) dummy.scale.set(0, 0, 0); // never let a pole or palm slice the camera
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return ref;
}

function Road({ motion }: { motion: React.MutableRefObject<Motion> }) {
  const DASHES = 36, STUDS = 60, LIGHTS = 12, PALMS = 26;
  const dashes = useStream(DASHES, 4, (o, _i, z) => { o.position.set(0, 0.011, z); }, motion);
  const studs = useStream(STUDS, 2.4, (o, i, z) => { o.position.set(i % 2 ? 3.15 : -3.15, 0.03, z); }, motion);
  const poles = useStream(LIGHTS, 12, (o, i, z) => { o.position.set(i % 2 ? 5.2 : -5.2, 2.2, z); }, motion, true);
  const lamps = useStream(LIGHTS, 12, (o, i, z) => { o.position.set(i % 2 ? 4.45 : -4.45, 4.3, z); }, motion, true);
  const glows = useStream(LIGHTS, 12, (o, i, z) => { o.position.set(i % 2 ? 4.45 : -4.45, 4.3, z); }, motion, true);
  const trunks = useStream(PALMS, 5.2, (o, i, z) => {
    const side = i % 2 ? 1 : -1;
    o.position.set(side * (7.6 + ((i * 37) % 5) * 0.9), 1.9, z + ((i * 13) % 3));
    o.rotation.z = side * -0.12;
    o.scale.setScalar(0.85 + ((i * 7) % 5) * 0.08);
  }, motion, true);
  const crowns = useStream(PALMS, 5.2, (o, i, z) => {
    const side = i % 2 ? 1 : -1;
    const s = 0.85 + ((i * 7) % 5) * 0.08;
    o.position.set(side * (7.6 + ((i * 37) % 5) * 0.9) - side * 0.45 * s, 3.85 * s, z + ((i * 13) % 3));
    o.rotation.y = i;
    o.scale.setScalar(s);
  }, motion, true);

  const crownGeo = useMemo(() => {
    // Six drooping fronds as flattened cones fanned around the top.
    const geos: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 6; k++) {
      const g = new THREE.ConeGeometry(0.22, 2.2, 4);
      g.scale(1, 1, 0.25);
      g.translate(0, 1.1, 0);
      g.rotateZ(Math.PI / 2 + 0.55);
      g.rotateY((k * Math.PI * 2) / 6);
      geos.push(g);
    }
    const merged = mergeGeometries(geos);
    return merged;
  }, []);

  return (
    <group>
      {/* asphalt and verges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (START + NEAR) / 2]}>
        <planeGeometry args={[7, ROAD_LEN]} />
        <meshStandardMaterial color="#1a1e33" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, (START + NEAR) / 2]}>
        <planeGeometry args={[120, ROAD_LEN]} />
        <meshStandardMaterial color="#0d1424" roughness={1} />
      </mesh>
      {/* edge lines */}
      {[-3.3, 3.3].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, (START + NEAR) / 2]}>
          <planeGeometry args={[0.1, ROAD_LEN]} />
          <meshStandardMaterial color="#d8dcef" roughness={0.6} />
        </mesh>
      ))}
      <instancedMesh ref={dashes} args={[undefined, undefined, DASHES]}>
        <boxGeometry args={[0.14, 0.01, 1.8]} />
        <meshStandardMaterial color="#f4f5ff" emissive="#f4f5ff" emissiveIntensity={0.12} />
      </instancedMesh>
      <instancedMesh ref={studs} args={[undefined, undefined, STUDS]}>
        <boxGeometry args={[0.12, 0.05, 0.12]} />
        <meshStandardMaterial color={STUD} emissive={AMBER} emissiveIntensity={2.4} />
      </instancedMesh>
      <instancedMesh ref={poles} args={[undefined, undefined, LIGHTS]}>
        <cylinderGeometry args={[0.06, 0.08, 4.4, 8]} />
        <meshStandardMaterial color="#2a2f4f" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={lamps} args={[undefined, undefined, LIGHTS]}>
        <boxGeometry args={[1.5, 0.08, 0.26]} />
        <meshStandardMaterial color="#ffd58a" emissive="#ffb547" emissiveIntensity={2.2} />
      </instancedMesh>
      <instancedMesh ref={glows} args={[undefined, undefined, LIGHTS]}>
        <sphereGeometry args={[0.42, 12, 8]} />
        <meshBasicMaterial color="#ffb547" transparent opacity={0.09} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, PALMS]}>
        <cylinderGeometry args={[0.1, 0.17, 3.8, 6]} />
        <meshStandardMaterial color="#141a2e" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[crownGeo, undefined, PALMS]}>
        <meshStandardMaterial color="#10182c" roughness={1} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

/* Small dependency-free merge (positions + normals only). */
function mergeGeometries(geos: THREE.BufferGeometry[]) {
  const parts = geos.map((g) => g.toNonIndexed());
  const total = parts.reduce((n, g) => n + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3);
  let o = 0;
  for (const g of parts) { pos.set(g.attributes.position.array as Float32Array, o); o += g.attributes.position.array.length; }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.computeVertexNormals();
  return out;
}

/* Distant town lights on the horizon. */
function TownLights() {
  const geo = useMemo(() => {
    const n = 260;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 140;
      p[i * 3 + 1] = Math.random() * 1.6;
      p[i * 3 + 2] = -95 - Math.random() * 20;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffcf8a" size={0.5} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

function Lights({ motion }: { motion: React.MutableRefObject<Motion> }) {
  const hemi = useRef<THREE.HemisphereLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    const s = skyAt(motion.current.phase);
    if (hemi.current) { hemi.current.intensity = 0.25 + s.light * 0.9; hemi.current.color.copy(s.horizon).lerp(new THREE.Color("#ffffff"), 0.5); }
    if (moon.current) moon.current.intensity = 0.25 + s.light * 0.8;
  });
  return (
    <>
      <ambientLight intensity={0.18} />
      <hemisphereLight ref={hemi} args={["#ffffff", "#0b1026", 0.6]} />
      <directionalLight ref={moon} position={[-8, 10, -6]} color="#c9d6ff" intensity={0.6} />
      {/* key light on the coach from the oncoming side (as if from a passing street light) */}
      <pointLight position={[2, 6, 8]} color="#ffd9a0" intensity={45} distance={22} decay={1.6} />
      <pointLight position={[-6, 3, 6]} color="#b8c4ff" intensity={18} distance={18} decay={1.6} />
    </>
  );
}

/* Camera: chase view in front of the oncoming coach → swings to the roadside as you scroll; the pointer nudges it. */
function Rig({ motion }: { motion: React.MutableRefObject<Motion> }) {
  const { camera, pointer, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const s = THREE.MathUtils.clamp(motion.current.scroll, 0, 1);
    if (size.width < size.height) {
      // Phones: a high view straight down the road, so the coach sits in the open band between the copy and the search.
      camera.position.lerp(new THREE.Vector3(-1.6 + pointer.x * 0.4 + s * 2, 4.6 - s * 1.5, 17 - s * 3), 0.06);
      look.lerp(new THREE.Vector3(-1.6, -0.5 + s, 3.5 - s), 0.08);
      camera.lookAt(look);
      return;
    }
    const a = THREE.MathUtils.lerp(0.62, 1.3, s); // angle around the bus
    const r = THREE.MathUtils.lerp(14, 10, s);
    const tx = -1.6 + Math.sin(a) * r + pointer.x * 0.9;
    const tz = 2 + Math.cos(a) * r;
    const ty = THREE.MathUtils.lerp(3.4, 2.4, s) + pointer.y * 0.5;
    camera.position.lerp(new THREE.Vector3(tx, ty, tz), 0.06);
    look.lerp(new THREE.Vector3(-11 + s * 7.5, 1.4, -4 + s * 4), 0.08);
    camera.lookAt(look);
  });
  return null;
}

function Phase({ motion, onReady }: { motion: React.MutableRefObject<Motion>; onReady?: () => void }) {
  const fired = useRef(false);
  useFrame(({ clock }) => {
    if (motion.current.animate) motion.current.phase = (clock.elapsedTime / SKY_CYCLE_SECONDS + 0.12) % 1;
    if (!fired.current) { fired.current = true; requestAnimationFrame(() => onReady?.()); }
  });
  return null;
}

export default function RoadScene({ animate = true, onReady }: { animate?: boolean; onReady?: () => void }) {
  const motion = useRef<Motion>({ scroll: 0, speed: 1, animate, phase: 0.12 });

  useEffect(() => {
    motion.current.animate = animate;
    const onScroll = () => {
      const s = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 0.9));
      motion.current.scroll = s;
      motion.current.speed = 1 + s * 1.6;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [animate]);

  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [3.2, 3.1, 12], fov: 40, near: 0.1, far: 400 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      frameloop={animate ? "always" : "demand"}
      onCreated={({ scene }) => { scene.fog = new THREE.Fog("#5b2e6b", 22, 105); }}
      aria-hidden
    >
      <Phase motion={motion} onReady={onReady} />
      <Sky motion={motion} />
      <Lights motion={motion} />
      <Rig motion={motion} />
      <TownLights />
      <Road motion={motion} />
      {/* The coach drives toward the camera (nose to +z). Ghana drives on the right, which for an oncoming vehicle is the viewer's left (x < 0). */}
      <group position={[-1.6, 0, 2]} rotation={[0, -Math.PI / 2, 0]}>
        <Coach motion={motion} />
      </group>
    </Canvas>
  );
}
