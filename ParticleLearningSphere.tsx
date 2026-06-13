"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";

const COLORS = {
  primary: "#6D5DFC",
  deep: "#4F46E5",
  background: "#0B1020",
};

const MATERIALS = [
  { label: "Book", icon: "📚", phi: 0.55, theta: 0.15 },
  { label: "AI Tutor", icon: "🤖", phi: 1.05, theta: 1.15 },
  { label: "Quiz", icon: "📝", phi: 1.65, theta: 2.15 },
  { label: "Code", icon: "💻", phi: 1.95, theta: 3.25 },
  { label: "Degree", icon: "🎓", phi: 1.35, theta: 4.2 },
  { label: "Labs", icon: "⚛️", phi: 0.85, theta: 5.05 },
  { label: "Notes", icon: "✍️", phi: 2.25, theta: 5.75 },
];

type ParticleLearningSphereProps = {
  className?: string;
  particleCount?: number;
};

type SpinVelocity = {
  x: number;
  y: number;
};

type ParticleCloudProps = {
  count: number;
  performanceRef: React.MutableRefObject<number>;
};

type InertiaRigProps = {
  children: React.ReactNode;
  draggingRef: React.MutableRefObject<boolean>;
  velocityRef: React.MutableRefObject<SpinVelocity>;
};

function makeSphereShell(count: number) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const radius = 1.72;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * goldenAngle;
    const pulseOffset = Math.sin(i * 12.9898) * 43758.5453;

    positions[i * 3] = Math.cos(theta) * radial * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * radial * radius;
    phases[i] = pulseOffset - Math.floor(pulseOffset);
  }

  return { positions, phases };
}

function ParticleCloud({ count, performanceRef }: ParticleCloudProps) {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null);

  const geometry = React.useMemo(() => {
    const shell = makeSphereShell(count);
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(shell.positions, 3));
    buffer.setAttribute("phase", new THREE.BufferAttribute(shell.phases, 1));
    return buffer;
  }, [count]);

  React.useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uPerformance.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uPerformance.value,
      performanceRef.current,
      0.08,
    );
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uPerformance: { value: 1 },
          uPrimary: { value: new THREE.Color(COLORS.primary) },
          uDeep: { value: new THREE.Color(COLORS.deep) },
        }}
        vertexShader={`
          attribute float phase;
          varying float vPulse;
          uniform float uTime;
          uniform float uPerformance;

          void main() {
            vPulse = 0.58 + 0.42 * sin(uTime * 1.85 + phase * 6.2831853);
            vec3 animatedPosition = position * (1.0 + vPulse * 0.028);
            vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
            gl_PointSize = (3.2 + vPulse * 4.4) * uPerformance * (1.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying float vPulse;
          uniform float uPerformance;
          uniform vec3 uPrimary;
          uniform vec3 uDeep;

          void main() {
            vec2 point = gl_PointCoord - vec2(0.5);
            float falloff = 1.0 - smoothstep(0.08, 0.5, length(point));
            vec3 color = mix(uDeep, uPrimary, vPulse);
            gl_FragColor = vec4(color, falloff * (0.42 + vPulse * 0.58) * uPerformance);
          }
        `}
      />
    </points>
  );
}

function OrbitLabels() {
  return (
    <group>
      {MATERIALS.map((item) => {
        const orbitRadius = 2.78;
        const x = orbitRadius * Math.sin(item.phi) * Math.cos(item.theta);
        const y = orbitRadius * Math.cos(item.phi);
        const z = orbitRadius * Math.sin(item.phi) * Math.sin(item.theta);

        return (
          <group key={item.label} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshBasicMaterial color={COLORS.primary} toneMapped={false} />
            </mesh>
            <Html center distanceFactor={8} transform sprite zIndexRange={[20, 0]}>
              <div className="pointer-events-none select-none whitespace-nowrap rounded-full border border-white/15 bg-[#0B1020]/80 px-3 py-1.5 text-[11px] font-semibold tracking-normal text-white shadow-[0_10px_35px_rgba(79,70,229,0.36)] backdrop-blur-md sm:text-xs">
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function InertiaRig({ children, draggingRef, velocityRef }: InertiaRigProps) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    group.rotation.y += velocityRef.current.y * delta * 60;
    group.rotation.x += velocityRef.current.x * delta * 60;
    group.rotation.x = THREE.MathUtils.clamp(group.rotation.x, -0.82, 0.82);

    if (!draggingRef.current) {
      velocityRef.current.x *= 0.965;
      velocityRef.current.y *= 0.965;
      if (Math.abs(velocityRef.current.x) < 0.00005) velocityRef.current.x = 0;
      if (Math.abs(velocityRef.current.y) < 0.00005) velocityRef.current.y = 0;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function PerformanceLighting({
  performanceRef,
}: {
  performanceRef: React.MutableRefObject<number>;
}) {
  const ambientRef = React.useRef<THREE.AmbientLight>(null);
  const fpsAverage = React.useRef(60);
  const isMobile = React.useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px), (pointer: coarse)").matches,
    [],
  );

  useFrame((_, delta) => {
    const fps = 1 / Math.max(delta, 0.001);
    fpsAverage.current = THREE.MathUtils.lerp(fpsAverage.current, fps, 0.05);
    performanceRef.current = isMobile && fpsAverage.current < 45 ? 0.56 : 1;

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        performanceRef.current < 0.8 ? 0.18 : 0.42,
        0.05,
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.42} color="#C9C4FF" />
      <pointLight position={[3.8, 3.2, 4.5]} intensity={2.25} color={COLORS.primary} />
      <pointLight position={[-4.2, -2.6, -3.4]} intensity={1.15} color={COLORS.deep} />
    </>
  );
}

function Scene({
  particleCount,
  draggingRef,
  velocityRef,
}: {
  particleCount: number;
  draggingRef: React.MutableRefObject<boolean>;
  velocityRef: React.MutableRefObject<SpinVelocity>;
}) {
  const performanceRef = React.useRef(1);

  return (
    <>
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.background, 5.5, 9.5]} />
      <PerformanceLighting performanceRef={performanceRef} />
      <InertiaRig draggingRef={draggingRef} velocityRef={velocityRef}>
        <ParticleCloud count={particleCount} performanceRef={performanceRef} />
        <OrbitLabels />
      </InertiaRig>
    </>
  );
}

export default function ParticleLearningSphere({
  className = "",
  particleCount = 1500,
}: ParticleLearningSphereProps) {
  const [dpr, setDpr] = React.useState(() =>
    typeof window === "undefined" ? 1 : Math.min(2, window.devicePixelRatio || 1),
  );
  const draggingRef = React.useRef(false);
  const lastPointerRef = React.useRef({ x: 0, y: 0 });
  const velocityRef = React.useRef<SpinVelocity>({ x: 0.0016, y: 0.0028 });
  const activePointerIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setDpr(Math.min(2, window.devicePixelRatio || 1));
  }, []);

  const stopMomentum = React.useCallback(() => {
    velocityRef.current.x = 0;
    velocityRef.current.y = 0;
  }, []);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (Math.hypot(velocityRef.current.x, velocityRef.current.y) > 0.002) {
        stopMomentum();
      }

      draggingRef.current = true;
      activePointerIdRef.current = event.pointerId;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [stopMomentum],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || activePointerIdRef.current !== event.pointerId) return;

      const deltaX = event.clientX - lastPointerRef.current.x;
      const deltaY = event.clientY - lastPointerRef.current.y;
      velocityRef.current.y = deltaX * 0.0052;
      velocityRef.current.x = deltaY * 0.0038;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
    },
    [],
  );

  const handlePointerEnd = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    activePointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <div
      className={`relative isolate min-h-[420px] w-full max-w-full overflow-hidden rounded-2xl bg-[#0B1020] shadow-[0_35px_90px_rgba(79,70,229,0.28)] sm:min-h-[520px] ${className}`}
      style={{ touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(109,93,252,0.28),rgba(11,16,32,0)_48%)]" />
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 6.4], fov: 42, near: 0.1, far: 100 }}
        gl={{
          alpha: false,
          antialias: dpr <= 1,
          powerPreference: "high-performance",
        }}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "inherit",
          display: "block",
          touchAction: "pan-y",
        }}
      >
        <Scene
          particleCount={particleCount}
          draggingRef={draggingRef}
          velocityRef={velocityRef}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-6 bottom-5 h-px bg-gradient-to-r from-transparent via-[#6D5DFC]/70 to-transparent" />
    </div>
  );
}
