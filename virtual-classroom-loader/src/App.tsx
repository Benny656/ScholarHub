import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type StudyItemKind =
  | "book"
  | "pencil"
  | "paper"
  | "calculator"
  | "cap"
  | "notebook"
  | "pen"
  | "table"
  | "chair"
  | "phone"
  | "ruler"
  | "globe";

type StudyItemData = {
  id: number;
  kind: StudyItemKind;
  label: string;
  color: string;
  accent: string;
  start: [number, number, number];
  speed: number;
  scale: number;
  orbitOffset: number;
};

const items: StudyItemData[] = [
  { id: 1, kind: "book", label: "History", color: "#f35f5f", accent: "#ffd166", start: [-6, 2.4, 0], speed: 0.42, scale: 0.8, orbitOffset: 0.1 },
  { id: 2, kind: "pencil", label: "Pencil", color: "#ffbf47", accent: "#23395b", start: [4.2, 1.3, -0.6], speed: 0.56, scale: 0.78, orbitOffset: 1.7 },
  { id: 3, kind: "paper", label: "Notes", color: "#ffffff", accent: "#59a5d8", start: [-2.2, -1.9, 0.2], speed: 0.35, scale: 0.72, orbitOffset: 3.1 },
  { id: 4, kind: "calculator", label: "Math", color: "#2f4858", accent: "#86bbd8", start: [5.7, -2.2, 0], speed: 0.48, scale: 0.7, orbitOffset: 4.2 },
  { id: 5, kind: "cap", label: "Class", color: "#4f6d7a", accent: "#e0ff4f", start: [-5.3, -0.2, -0.8], speed: 0.5, scale: 0.72, orbitOffset: 5.4 },
  { id: 6, kind: "notebook", label: "Lab", color: "#7bd389", accent: "#30343f", start: [1.5, 2.7, 0.1], speed: 0.38, scale: 0.8, orbitOffset: 2.5 },
  { id: 7, kind: "pen", label: "Pen", color: "#3f88c5", accent: "#f7f7ff", start: [-3.8, 1.1, 0.35], speed: 0.62, scale: 0.72, orbitOffset: 0.9 },
  { id: 8, kind: "table", label: "Desk", color: "#b8784e", accent: "#6c4f3d", start: [3.1, -0.7, -0.35], speed: 0.32, scale: 0.78, orbitOffset: 3.7 },
  { id: 9, kind: "chair", label: "Chair", color: "#59a5d8", accent: "#23395b", start: [-0.4, -2.55, -0.25], speed: 0.44, scale: 0.76, orbitOffset: 5.9 },
  { id: 10, kind: "phone", label: "Phone", color: "#30343f", accent: "#7bd389", start: [6.1, 2.45, 0.25], speed: 0.52, scale: 0.64, orbitOffset: 2.05 },
  { id: 11, kind: "ruler", label: "Ruler", color: "#ffd166", accent: "#23395b", start: [-6.2, -2.45, 0.15], speed: 0.58, scale: 0.72, orbitOffset: 4.85 },
  { id: 12, kind: "globe", label: "Globe", color: "#59a5d8", accent: "#21a67a", start: [0.75, 0.92, -0.55], speed: 0.36, scale: 0.62, orbitOffset: 1.25 },
];

function RoundedBox({ args, color }: { args: [number, number, number]; color: string }) {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
    </mesh>
  );
}

function StudyShape({ item }: { item: StudyItemData }) {
  if (item.kind === "book") {
    return (
      <group>
        <RoundedBox args={[1.05, 0.72, 0.16]} color={item.color} />
        <mesh position={[-0.38, 0, 0.09]}>
          <boxGeometry args={[0.06, 0.76, 0.04]} />
          <meshStandardMaterial color={item.accent} />
        </mesh>
        <mesh position={[0.15, 0.12, 0.11]}>
          <boxGeometry args={[0.45, 0.06, 0.035]} />
          <meshStandardMaterial color="#fff7dd" />
        </mesh>
      </group>
    );
  }

  if (item.kind === "pencil") {
    return (
      <group rotation={[0, 0, Math.PI / 10]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 1.4, 16]} />
          <meshStandardMaterial color={item.color} />
        </mesh>
        <mesh position={[0, 0.82, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.09, 0.22, 16]} />
          <meshStandardMaterial color="#ffe6b3" />
        </mesh>
        <mesh position={[0, -0.78, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.16, 16]} />
          <meshStandardMaterial color={item.accent} />
        </mesh>
      </group>
    );
  }

  if (item.kind === "pen") {
    return (
      <group rotation={[0, 0, -Math.PI / 8]}>
        <mesh>
          <cylinderGeometry args={[0.055, 0.055, 1.5, 18]} />
          <meshStandardMaterial color={item.color} />
        </mesh>
        <mesh position={[0, 0.66, 0]}>
          <cylinderGeometry args={[0.062, 0.062, 0.18, 18]} />
          <meshStandardMaterial color={item.accent} />
        </mesh>
        <mesh position={[0, -0.84, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.065, 0.18, 18]} />
          <meshStandardMaterial color="#252525" />
        </mesh>
      </group>
    );
  }

  if (item.kind === "paper") {
    return (
      <group>
        <RoundedBox args={[0.78, 1.0, 0.05]} color={item.color} />
        {[0.22, 0.02, -0.18].map((y) => (
          <mesh key={y} position={[0.02, y, 0.045]}>
            <boxGeometry args={[0.48, 0.025, 0.02]} />
            <meshStandardMaterial color={item.accent} />
          </mesh>
        ))}
      </group>
    );
  }

  if (item.kind === "calculator") {
    return (
      <group>
        <RoundedBox args={[0.75, 0.95, 0.18]} color={item.color} />
        <mesh position={[0, 0.25, 0.11]}>
          <boxGeometry args={[0.5, 0.18, 0.035]} />
          <meshStandardMaterial color={item.accent} />
        </mesh>
        {[-0.18, 0, 0.18].flatMap((x) =>
          [-0.05, -0.25].map((y) => (
            <mesh key={`${x}-${y}`} position={[x, y, 0.12]}>
              <boxGeometry args={[0.1, 0.1, 0.035]} />
              <meshStandardMaterial color="#f8f7f2" />
            </mesh>
          ))
        )}
      </group>
    );
  }

  if (item.kind === "table") {
    return (
      <group>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[1.35, 0.2, 0.42]} />
          <meshStandardMaterial color={item.color} roughness={0.5} />
        </mesh>
        {[-0.48, 0.48].flatMap((x) =>
          [-0.13, 0.13].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, -0.32, z]}>
              <boxGeometry args={[0.12, 0.9, 0.12]} />
              <meshStandardMaterial color={item.accent} roughness={0.58} />
            </mesh>
          ))
        )}
      </group>
    );
  }

  if (item.kind === "chair") {
    return (
      <group>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.78, 0.16, 0.58]} />
          <meshStandardMaterial color={item.color} roughness={0.52} />
        </mesh>
        <mesh position={[0, 0.45, -0.22]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[0.78, 0.82, 0.14]} />
          <meshStandardMaterial color={item.color} roughness={0.52} />
        </mesh>
        {[-0.26, 0.26].flatMap((x) =>
          [-0.18, 0.18].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, -0.48, z]}>
              <boxGeometry args={[0.09, 0.68, 0.09]} />
              <meshStandardMaterial color={item.accent} />
            </mesh>
          ))
        )}
      </group>
    );
  }

  if (item.kind === "phone") {
    return (
      <group rotation={[0, 0, 0.18]}>
        <RoundedBox args={[0.55, 0.95, 0.13]} color={item.color} />
        <mesh position={[0, 0.04, 0.085]}>
          <boxGeometry args={[0.42, 0.68, 0.025]} />
          <meshStandardMaterial color="#101828" />
        </mesh>
        <mesh position={[0, -0.38, 0.105]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 18]} />
          <meshStandardMaterial color={item.accent} />
        </mesh>
      </group>
    );
  }

  if (item.kind === "ruler") {
    return (
      <group rotation={[0, 0, Math.PI / 3]}>
        <RoundedBox args={[1.45, 0.2, 0.08]} color={item.color} />
        {[-0.48, -0.24, 0, 0.24, 0.48].map((x) => (
          <mesh key={x} position={[x, 0.055, 0.07]}>
            <boxGeometry args={[0.025, 0.09, 0.02]} />
            <meshStandardMaterial color={item.accent} />
          </mesh>
        ))}
      </group>
    );
  }

  if (item.kind === "globe") {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.46, 32, 18]} />
          <meshStandardMaterial color={item.color} roughness={0.36} metalness={0.05} />
        </mesh>
        <mesh rotation={[0.2, 0.4, -0.5]}>
          <torusGeometry args={[0.48, 0.018, 8, 42]} />
          <meshStandardMaterial color={item.accent} />
        </mesh>
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.18, 0.3, 0.16, 24]} />
          <meshStandardMaterial color="#4f6d7a" />
        </mesh>
      </group>
    );
  }

  if (item.kind === "cap") {
    return (
      <group>
        <mesh>
          <coneGeometry args={[0.62, 0.35, 4]} />
          <meshStandardMaterial color={item.color} roughness={0.48} />
        </mesh>
        <mesh position={[0.42, -0.08, 0]} rotation={[0, 0, -0.18]}>
          <boxGeometry args={[0.72, 0.12, 0.12]} />
          <meshStandardMaterial color={item.accent} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <RoundedBox args={[0.9, 1.05, 0.12]} color={item.color} />
      <mesh position={[-0.34, 0, 0.08]}>
        <boxGeometry args={[0.08, 1.1, 0.035]} />
        <meshStandardMaterial color={item.accent} />
      </mesh>
      {[-0.28, 0, 0.28].map((y) => (
        <mesh key={y} position={[0.12, y, 0.09]}>
          <boxGeometry args={[0.44, 0.035, 0.025]} />
          <meshStandardMaterial color="#f7fff6" />
        </mesh>
      ))}
    </group>
  );
}

function FlyingItem({ item, cursor, clickPulse }: { item: StudyItemData; cursor: THREE.Vector2; clickPulse: THREE.Vector3 | null }) {
  const group = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const base = useMemo(() => new THREE.Vector3(...item.start), [item.start]);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;

    const t = clock.elapsedTime;
    const driftX = base.x + Math.sin(t * item.speed + item.orbitOffset) * 1.1;
    const driftY = base.y + Math.cos(t * item.speed * 1.4 + item.orbitOffset) * 0.72;
    const target = new THREE.Vector3(driftX, driftY, base.z);
    const pointer = new THREE.Vector3(cursor.x * 4.5, cursor.y * 2.9, base.z);
    const away = target.clone().sub(pointer);
    const distance = Math.max(away.length(), 0.001);

    if (distance < 1.45) {
      away.normalize().multiplyScalar((1.45 - distance) * 3.6);
      velocity.current.add(away.multiplyScalar(delta));
    }

    if (clickPulse) {
      const clickAway = target.clone().sub(clickPulse);
      const clickDistance = Math.max(clickAway.length(), 0.001);
      if (clickDistance < 2.4) {
        clickAway.normalize().multiplyScalar((2.4 - clickDistance) * 4.2);
        velocity.current.add(clickAway.multiplyScalar(delta * 2.8));
      }
    }

    velocity.current.multiplyScalar(0.92);
    target.add(velocity.current);
    group.current.position.lerp(target, 0.08);
    group.current.rotation.x = Math.sin(t * 0.8 + item.id) * 0.18;
    group.current.rotation.y += delta * (0.5 + item.speed);
    group.current.rotation.z = Math.sin(t * item.speed + item.orbitOffset) * 0.35;
  });

  return (
    <group ref={group} scale={item.scale}>
      <StudyShape item={item} />
    </group>
  );
}

function ClassroomScene() {
  const { pointer } = useThree();
  const [clickPulse, setClickPulse] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    const clear = window.setTimeout(() => setClickPulse(null), 520);
    return () => window.clearTimeout(clear);
  }, [clickPulse]);

  return (
    <>
      <color attach="background" args={["#f6fbff"]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 5, 6]} intensity={1.7} castShadow />
      <pointLight position={[-3, -2, 4]} color="#59a5d8" intensity={3.5} />
      <group
        onClick={(event) => {
          const pulse = event.point.clone();
          pulse.z = 0;
          setClickPulse(pulse);
        }}
      >
        <mesh position={[0, 0, -1.2]} scale={[14, 8, 1]}>
          <planeGeometry />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {items.map((item) => (
          <FlyingItem key={item.id} item={item} cursor={pointer} clickPulse={clickPulse} />
        ))}
      </group>
      <mesh position={[0, -3.2, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.7, 64]} />
        <meshBasicMaterial color="#d9f0ff" transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0, -1.4]}>
        <ringGeometry args={[2.25, 2.32, 96]} />
        <meshBasicMaterial color="#4f6d7a" transparent opacity={0.12} />
      </mesh>
    </>
  );
}

function App() {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => (current >= 98 ? 18 : current + Math.round(Math.random() * 7 + 3)));
    }, 640);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="loader-shell">
      <section className="stage" aria-label="Interactive virtual classroom loading screen">
        <div className="scene-layer">
          <Canvas shadows camera={{ position: [0, 0, 7.5], fov: 48 }}>
            <ClassroomScene />
          </Canvas>
        </div>

        <div className="hud">
          <div className="brand-row">
            <span className="live-dot" />
            <span>Virtual Classroom</span>
          </div>
          <h1>Preparing your class</h1>
          <p>Move your cursor through the study tools or click anywhere to scatter them while your session gets ready.</p>
          <div className="progress-wrap" aria-label={`Loading ${progress}%`}>
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="status-row">
            <span>{progress}% loaded</span>
            <span>Opening whiteboard</span>
          </div>
        </div>

        <div className="classroom-panel">
          <div className="panel-top">
            <span />
            <span />
            <span />
          </div>
          <div className="lesson-lines">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
