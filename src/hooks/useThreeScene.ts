import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useThreeScene(containerId: string) {
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    const pointLight = new THREE.PointLight(0xd8bcea, 2, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // AI Core - Orb
    const geometry = new THREE.IcosahedronGeometry(1.5, 3);
    const material = new THREE.MeshPhongMaterial({
      color: 0xd8bcea,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // Core Inner Glow
    const innerGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xd8bcea });
    const core = new THREE.Mesh(innerGeo, innerMat);
    scene.add(core);

    // Floating Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0xd8bcea,
      transparent: true,
      opacity: 0.3,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 5;

    // Animation Loop
    const animationId = requestAnimationFrame(function animate() {
      requestAnimationFrame(animate);
      orb.rotation.y += 0.003;
      orb.rotation.x += 0.002;
      particlesMesh.rotation.y += 0.0005;

      const pulse = 1 + Math.sin(Date.now() * 0.002) * 0.1;
      core.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    });

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      container.removeChild(renderer.domElement);
    };
  }, [containerId]);

  return sceneRef;
}
