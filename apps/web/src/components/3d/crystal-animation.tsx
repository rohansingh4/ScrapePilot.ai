"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Crystal() {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const materialRef = React.useRef<THREE.ShaderMaterial>(null);

  // Custom shader for gradient effect
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Pink to purple gradient based on position and time
      vec3 pink = vec3(0.925, 0.286, 0.6);
      vec3 purple = vec3(0.545, 0.361, 0.965);
      vec3 magenta = vec3(0.8, 0.2, 0.8);

      float mixFactor = sin(vPosition.y * 2.0 + uTime * 0.5) * 0.5 + 0.5;
      vec3 baseColor = mix(pink, purple, mixFactor);

      // Add some variation based on normal
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      baseColor = mix(baseColor, magenta, fresnel * 0.5);

      // Add glow effect
      float glow = pow(fresnel, 3.0) * 0.5;

      gl_FragColor = vec4(baseColor + glow, 1.0);
    }
  `;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  // Create spiky sphere geometry
  const geometry = React.useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.5, 1);
    const positions = geo.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const length = Math.sqrt(x * x + y * y + z * z);
      const scale = 1 + Math.random() * 0.8; // Random spikes

      positions.setXYZ(
        i,
        (x / length) * scale * 1.5,
        (y / length) * scale * 1.5,
        (z / length) * scale * 1.5
      );
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
        }}
      />
    </mesh>
  );
}

// Floating particles around the crystal
function Particles() {
  const particlesRef = React.useRef<THREE.Points>(null);
  const count = 50;

  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2 + Math.random() * 2;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color="#ec4899"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ec4899" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#8b5cf6" />
      <Crystal />
      <Particles />
    </>
  );
}

export function CrystalAnimation() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <CrystalFallback />;
  }

  return (
    <div className="relative w-full h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
      {/* Glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(236, 72, 153, 0.15) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

function CrystalFallback() {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <div
        className="w-48 h-48 rounded-full animate-pulse"
        style={{
          background:
            "radial-gradient(circle, #ec4899 0%, #8b5cf6 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
