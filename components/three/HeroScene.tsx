"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Grid, Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { Vector2 } from "three";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { THEMES } from "@/lib/themes";

/* -------------------- camera parallax + scroll fly-through ----------------- */
function CameraRig() {
  const { camera, pointer } = useThree();
  const scroll = useRef(0); // 0 at top → 1 after one viewport of scrolling

  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight || 1;
      scroll.current = Math.min(1, Math.max(0, window.scrollY / h));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame(() => {
    const s = scroll.current;
    // As the visitor scrolls into the missions, the camera pulls back, lifts,
    // and tilts — a subtle dolly-out "fly-through" that hands off to the page.
    const targetX = pointer.x * 1.8 * (1 - s);
    const targetY = pointer.y * 1.0 + 1.6 + s * 2.2;
    const targetZ = 7 + s * 4.5;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(0, 0.6 - s * 0.4, 0);
  });
  return null;
}

/* ------------------------------ floating core ----------------------------- */
function CommandCore({ color, accent }: { color: string; accent: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.25;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <group ref={group} position={[0, 0.9, 0]}>
        {/* central monolith / terminal */}
        <mesh castShadow>
          <icosahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.55}
            wireframe
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.8}
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ----------------------------- holo panels -------------------------------- */
function HoloPanels({ color }: { color: string }) {
  const positions = useMemo(
    () =>
      [
        [-2.4, 1.4, -1.2, -0.4],
        [2.4, 1.1, -0.8, 0.4],
        [-2.0, 0.2, 0.6, -0.25],
        [2.1, 0.4, 0.8, 0.3],
      ] as [number, number, number, number][],
    []
  );
  return (
    <>
      {positions.map(([x, y, z, ry], i) => (
        <Float key={i} speed={1 + i * 0.2} floatIntensity={1.2} rotationIntensity={0.2}>
          <mesh position={[x, y, z]} rotation={[0, ry, 0]}>
            <planeGeometry args={[1.1, 0.7]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[x, y, z]} rotation={[0, ry, 0]}>
            <planeGeometry args={[1.1, 0.7]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.45} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* --------------------------- floating code dust --------------------------- */
function CodeParticles({ color, count = 900 }: { color: string; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = Math.random() * 8 - 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color={color}
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

/* ------------------------------ skill orbs -------------------------------- */
function SkillOrbs({ accent }: { accent: string }) {
  const group = useRef<THREE.Group>(null);
  const orbs = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        angle: (i / 6) * Math.PI * 2,
        r: 2.8,
        y: Math.sin(i) * 0.4 + 0.8,
      })),
    []
  );
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y -= dt * 0.15;
  });
  return (
    <group ref={group}>
      {orbs.map((o, i) => (
        <Float key={i} speed={2} floatIntensity={0.6}>
          <mesh position={[Math.cos(o.angle) * o.r, o.y, Math.sin(o.angle) * o.r]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.9}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function SceneContents() {
  const theme = useGameStore((s) => s.theme);
  const lowPower = useGameStore((s) => s.lowPower);
  const c = THEMES[theme].three;

  return (
    <>
      <color attach="background" args={["#04070a"]} />
      <fog attach="fog" args={["#04070a", 6, 18]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 4, 3]} intensity={40} color={c.neon} />
      <pointLight position={[-4, 2, -2]} intensity={25} color={c.accent} />

      <CameraRig />
      <CommandCore color={c.neon} accent={c.accent} />
      <HoloPanels color={c.neon2} />
      <SkillOrbs accent={c.neon2} />
      <CodeParticles color={c.neon} count={lowPower ? 350 : 900} />

      <Grid
        position={[0, -1.4, 0]}
        args={[30, 30]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor={c.neon}
        sectionSize={3}
        sectionThickness={1.2}
        sectionColor={c.accent}
        fadeDistance={22}
        fadeStrength={1.5}
        infiniteGrid
      />

      {!lowPower && (
        <EffectComposer>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration offset={new Vector2(0.0006, 0.0009)} radialModulation={false} modulationOffset={0} />
        </EffectComposer>
      )}
    </>
  );
}

export default function HeroScene() {
  const lowPower = useGameStore((s) => s.lowPower);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering the canvas once the hero scrolls off-screen → big perf win.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0" aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={lowPower ? [1, 1] : [1, 1.8]}
        camera={{ position: [0, 1.6, 7], fov: 50 }}
        gl={{ antialias: !lowPower, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
    </div>
  );
}
