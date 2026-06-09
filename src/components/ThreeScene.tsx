import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';

function FloatingTorus() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={[1.2, 0.6, -1]} castShadow>
        <torusKnotGeometry args={[0.45, 0.16, 128, 32]} />
        <meshStandardMaterial color="#f26b4d" metalness={0.6} roughness={0.2} />
      </mesh>
    </Float>
  );
}

function FloatingBox() {
  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh position={[-1.4, -0.2, -0.8]} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.6]} />
        <meshStandardMaterial color="#823023" metalness={0.4} roughness={0.25} />
      </mesh>
    </Float>
  );
}

export default function ThreeScene() {
  return (
    <div className="three-canvas-wrap" aria-hidden>
      <Canvas className="three-canvas" camera={{ position: [0, 0, 5], fov: 50 }} frameloop="demand">
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -3, -5]} intensity={0.5} />

        <FloatingTorus />
        <FloatingBox />

        <mesh position={[0, -1.2, -2]} rotation={[0.2, 0.6, 0]}>
          <sphereGeometry args={[1.1, 64, 64]} />
          <meshPhysicalMaterial color="#1a1a2e" metalness={0.2} roughness={0.4} clearcoat={0.6} />
        </mesh>

        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
