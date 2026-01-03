"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface FloatingSphereProps {
  position: [number, number, number];
  size: number;
  speed: number;
  distort: number;
  color: string;
}

function FloatingSphere({
  position,
  size,
  speed,
  distort,
  color,
}: FloatingSphereProps) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const initialPosition = React.useRef(position);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y =
        initialPosition.current[1] + Math.sin(time * speed) * 0.5;
      meshRef.current.position.x =
        initialPosition.current[0] + Math.cos(time * speed * 0.5) * 0.3;
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.15;
    }
  });

  return (
    <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
      <MeshDistortMaterial
        color={color}
        roughness={0.1}
        metalness={0.9}
        distort={distort}
        speed={2}
        envMapIntensity={0.5}
      />
    </Sphere>
  );
}

const sphereConfigs: FloatingSphereProps[] = [
  { position: [-4, 2, -3], size: 1.2, speed: 0.3, distort: 0.2, color: "#1a1a1a" },
  { position: [4.5, -1, -4], size: 1.8, speed: 0.2, distort: 0.15, color: "#0f0f0f" },
  { position: [-3, -2, -5], size: 0.8, speed: 0.4, distort: 0.3, color: "#1f1f1f" },
  { position: [3, 3, -6], size: 1.5, speed: 0.25, distort: 0.2, color: "#141414" },
  { position: [-5, 0, -4], size: 0.6, speed: 0.35, distort: 0.25, color: "#1a1a1a" },
  { position: [5, 1, -5], size: 1.0, speed: 0.3, distort: 0.18, color: "#0f0f0f" },
  { position: [0, -3, -7], size: 2.0, speed: 0.15, distort: 0.1, color: "#0a0a0a" },
];

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#8b5cf6" />
      <pointLight position={[10, 10, 10]} intensity={0.2} color="#ec4899" />

      {sphereConfigs.map((config, i) => (
        <FloatingSphere key={i} {...config} />
      ))}
    </>
  );
}

export function FloatingSpheresBackground() {
  const [mounted, setMounted] = React.useState(false);
  const [isLowPerformance, setIsLowPerformance] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setIsLowPerformance(prefersReducedMotion);
  }, []);

  if (!mounted) {
    return <StaticBackground />;
  }

  if (isLowPerformance) {
    return <StaticBackground />;
  }

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
    </div>
  );
}

function StaticBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Static gradient spheres as fallback */}
      <div
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, #1a1a1a 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-40 -right-32 w-96 h-96 rounded-full opacity-15 animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, #0f0f0f 0%, transparent 70%)",
          animationDelay: "1s",
        }}
      />
      <div
        className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full opacity-20 animate-pulse-glow"
        style={{
          background:
            "radial-gradient(circle, #1f1f1f 0%, transparent 70%)",
          animationDelay: "2s",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
    </div>
  );
}

export { StaticBackground };
