import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type ElementType = 'book' | 'pencil' | 'laptop' | 'phone' | 'backpack' | 'cap';

interface FloatingObject {
  id: number;
  type: ElementType;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  speed: number;
  rotSpeed: THREE.Vector3;
  scale: number;
}

const ELEMENT_TYPES: ElementType[] = ['book', 'pencil', 'laptop', 'phone', 'backpack', 'cap'];

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const FloatingElement = ({ data, color }: { data: FloatingObject; color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    const handleVisibilityChange = () => setIsPaused(document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useFrame((state, delta) => {
    if (isPaused || !groupRef.current) return;
    
    // Ensure smooth, slow drift (60-90s across screen depending on speed)
    groupRef.current.position.x += data.speed * delta;
    groupRef.current.position.y += data.speed * delta;
    
    // Slow rotation
    groupRef.current.rotation.x += data.rotSpeed.x * delta;
    groupRef.current.rotation.y += data.rotSpeed.y * delta;
    groupRef.current.rotation.z += data.rotSpeed.z * delta;

    // Reset when moving past top-right boundary
    if (groupRef.current.position.x > 15 || groupRef.current.position.y > 15) {
      groupRef.current.position.x = randomRange(-15, -5);
      groupRef.current.position.y = randomRange(-15, -10);
    }
  });

  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  }), [color]);

  return (
    <group ref={groupRef} position={data.position} rotation={data.rotation} scale={data.scale}>
      {data.type === 'book' && (
        <mesh material={material}>
          <boxGeometry args={[2, 0.4, 1.5]} />
        </mesh>
      )}
      {data.type === 'pencil' && (
        <mesh material={material}>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        </mesh>
      )}
      {data.type === 'laptop' && (
        <group>
          <mesh material={material} position={[0, -0.05, 0]}>
            <boxGeometry args={[2.5, 0.1, 1.8]} />
          </mesh>
          <mesh material={material} position={[0, 0.8, -0.85]} rotation={[Math.PI / 8, 0, 0]}>
            <boxGeometry args={[2.5, 1.6, 0.1]} />
          </mesh>
        </group>
      )}
      {data.type === 'phone' && (
        <mesh material={material}>
          <boxGeometry args={[0.8, 1.6, 0.1]} />
        </mesh>
      )}
      {data.type === 'backpack' && (
        <group>
          <mesh material={material}>
            <boxGeometry args={[1.5, 2, 1]} />
          </mesh>
          <mesh material={material} position={[0, -0.2, 0.6]}>
            <boxGeometry args={[1.2, 1, 0.4]} />
          </mesh>
        </group>
      )}
      {data.type === 'cap' && (
        <group>
          <mesh material={material} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
          </mesh>
          <mesh material={material} position={[0, 0.25, 0]}>
            <boxGeometry args={[1.8, 0.05, 1.8]} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export function FloatingElements3D() {
  const [themeColor, setThemeColor] = useState('#d8bcea');

  useEffect(() => {
    const updateColor = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      let color = rootStyles.getPropertyValue('--color-primary').trim();
      if (!color) color = '#d8bcea'; 
      setThemeColor(color);
    };

    updateColor();
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  const elements = useMemo(() => {
    const items: FloatingObject[] = [];
    for (let i = 0; i < 12; i++) {
      items.push({
        id: i,
        type: ELEMENT_TYPES[Math.floor(Math.random() * ELEMENT_TYPES.length)],
        position: new THREE.Vector3(
          randomRange(-15, 10),
          randomRange(-15, 10),
          randomRange(-8, 2)
        ),
        rotation: new THREE.Euler(
          randomRange(0, Math.PI * 2),
          randomRange(0, Math.PI * 2),
          randomRange(0, Math.PI * 2)
        ),
        // Slow drift speed
        speed: randomRange(0.15, 0.35),
        rotSpeed: new THREE.Vector3(
          randomRange(-0.3, 0.3),
          randomRange(-0.3, 0.3),
          randomRange(-0.3, 0.3)
        ),
        scale: randomRange(0.6, 1.1),
      });
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        {elements.map((el) => (
          <FloatingElement key={el.id} data={el} color={themeColor} />
        ))}
      </Canvas>
    </div>
  );
}
