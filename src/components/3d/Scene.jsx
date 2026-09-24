import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Ground } from './Ground';
import { EnvironmentDecor } from './EnvironmentDecor';
import { PIObjectivesLand } from './lands/PIObjectivesLand';
import { TeamLand } from './lands/TeamLand';
import { Car } from './Car';
import { CameraController } from './CameraController';

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 12], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      className="canvas-wrapper"
    >
      {/* Background Color - Crisp Bright White Studio Sky */}
      <color attach="background" args={['#f8fafc']} />

      {/* Atmospheric Soft White Mist */}
      <fog attach="fog" args={['#f8fafc', 60, 180]} />

      {/* Bright Studio Lighting */}
      <ambientLight intensity={1.1} />
      <directionalLight
        position={[35, 60, 30]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={180}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={75}
        shadow-camera-bottom={-75}
        shadow-bias={-0.0004}
      />
      <hemisphereLight skyColor="#ffffff" groundColor="#e2e8f0" intensity={0.8} />

      {/* Physics Simulation Container */}
      <Suspense fallback={null}>
        <Physics gravity={[0, -24, 0]}>
          <Ground />
          <EnvironmentDecor />
          <PIObjectivesLand />
          <TeamLand />
          <Car />
        </Physics>
      </Suspense>

      {/* Smooth Arcade Camera Follow & GSAP Teleportation Director */}
      <CameraController />
    </Canvas>
  );
}
