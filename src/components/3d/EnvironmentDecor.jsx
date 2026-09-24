import React from 'react';
import { Text, Float } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export function EnvironmentDecor() {
  return (
    <group>

      {/* Decorative Low-poly Trees scattered around the world */}
      <Tree position={[-12, 0, 8]} scale={1.2} />
      <Tree position={[14, 0, 10]} scale={1.1} />
      <Tree position={[-18, 0, -8]} scale={1.3} />
      <Tree position={[18, 0, -10]} scale={1.2} />
      <Tree position={[-42, 0, -15]} scale={1.4} />
      <Tree position={[-18, 0, -45]} scale={1.2} />
      <Tree position={[45, 0, -18]} scale={1.3} />
      <Tree position={[18, 0, -45]} scale={1.4} />
      <Tree position={[-15, 0, 35]} scale={1.2} />
      <Tree position={[15, 0, 38]} scale={1.3} />
      <Tree position={[0, 0, 58]} scale={1.5} />

      {/* Interactive low-poly traffic cones / obstacles that react to car bumps */}
      <ConeObstacle position={[-4, 0.3, 3]} />
      <ConeObstacle position={[-5, 0.3, 3.8]} />
      <ConeObstacle position={[4, 0.3, 3]} />
      <ConeObstacle position={[5, 0.3, 3.8]} />

      {/* ========================================================
          GRAND SKY TITLE: TEAM ABU Q4 2026 (STANDING IN THE SKY AHEAD)
          Moved away from directly above car to open horizon sky
         ======================================================== */}
      <Float
        speed={1.2}
        rotationIntensity={0.02}
        floatIntensity={0.3}
        position={[0, 7.2, -22]}
        rotation={[0.08, 0, 0]}
      >
        {/* Frosted Translucent Sky Plaque for perfect contrast & readability */}
        <mesh position={[0, -0.5, -0.05]}>
          <planeGeometry args={[18.5, 4.4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.82} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.5, -0.06]}>
          <planeGeometry args={[18.8, 4.7]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>

        {/* Main Heading */}
        <Text
          fontSize={1.8}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
          fontWeight={900}
          letterSpacing={0.05}
          position={[0,0.5,0]}
        >
          TEAM ABU Q4 2026
        </Text>

        {/* Subtitle */}
        <Text
          position={[0, -1.0, 0.02]}
          fontSize={0.65}
          color="#0284c7"
          anchorX="center"
          anchorY="middle"
          fontWeight={800}
          letterSpacing={0.06}
        >
          PI PLANNING PRESENTATION
        </Text>

        {/* Related Action Guidance Text */}
        {/* <Text
          position={[0, -1.65, 0.02]}
          fontSize={0.38}
          color="#475569"
          anchorX="center"
          anchorY="middle"
          fontWeight={600}
          letterSpacing={0.04}
        >
          DRIVE [WASD] • 3 INTERACTIVE LANDS • OPEN MAP [M]
        </Text> */}
      </Float>
    </group>
  );
}

// Low-poly Tree Component
function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 2.0, 6]} />
        <meshStandardMaterial color="#854d0e" roughness={0.9} />
      </mesh>
      {/* Foliage Layers */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[1.5, 1.8, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[1.2, 1.5, 6]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4.0, 0]} castShadow>
        <coneGeometry args={[0.8, 1.2, 6]} />
        <meshStandardMaterial color="#22c55e" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Dynamic Traffic Cone with Rapier physics
function ConeObstacle({ position }) {
  return (
    <RigidBody position={position} mass={5} friction={0.6}>
      <mesh castShadow position={[0, 0, 0]}>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color="#f97316" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
    </RigidBody>
  );
}
