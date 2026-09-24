import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortfolioStore } from '../../store/usePortfolioStore';

// Waypoints for single unified type of arrow: Volumetric 3D Floating Neon Arrow Wedges
const STAGE_ROUTES = {
  // STAGE 1: Start Launch Box [0, 0, 0] -> NW Highway -> Approach Checkpoint 1 [-30, 0, -42]
  1: {
    color: '#00ffff',
    glowColor: '#0284c7',
    chevrons: [
      { pos: [-0.8, 0.22, -3.0], angle: 0.22, scale: 1.25 },
      { pos: [-2.2, 0.22, -6.5], angle: 0.42, scale: 1.3 },
      { pos: [-4.6, 0.22, -10.8], angle: 0.58, scale: 1.35 },
      { pos: [-7.8, 0.22, -15.8], angle: 0.65, scale: 1.4 },
      { pos: [-11.8, 0.22, -21.4], angle: 0.68, scale: 1.45 },
      { pos: [-16.0, 0.22, -27.2], angle: 0.68, scale: 1.45 },
      { pos: [-20.4, 0.22, -33.4], angle: 0.68, scale: 1.45 },
      { pos: [-25.0, 0.22, -39.8], angle: 0.72, scale: 1.45 },
      { pos: [-28.8, 0.22, -46.5], angle: 0.85, scale: 1.5 },
      { pos: [-30.0, 0.22, -52.5], angle: Math.PI, scale: 1.5 },
      { pos: [-30.0, 0.22, -47.0], angle: Math.PI, scale: 1.5 },
    ],
  },

  // STAGE 2: CP1 [-30, -42] -> CP2 [-48, -30] (Curving West / Right Turn around corner)
  2: {
    color: '#00ffff',
    glowColor: '#0284c7',
    chevrons: [
      { pos: [-31.8, 0.22, -39.5], angle: 0.68 * Math.PI, scale: 1.4 },
      { pos: [-35.5, 0.22, -36.5], angle: 0.75 * Math.PI, scale: 1.4 },
      { pos: [-39.5, 0.22, -34.0], angle: 0.80 * Math.PI, scale: 1.45 },
      { pos: [-43.5, 0.22, -32.0], angle: 0.85 * Math.PI, scale: 1.45 },
      { pos: [-46.8, 0.22, -30.5], angle: 0.90 * Math.PI, scale: 1.5 },
    ],
  },

  // STAGE 3: CP2 [-48, -30] -> CP3 [-30, -14] (Curving South-East / Left Turn)
  3: {
    color: '#00ffff',
    glowColor: '#0284c7',
    chevrons: [
      { pos: [-45.5, 0.22, -27.2], angle: -0.75 * Math.PI, scale: 1.4 },
      { pos: [-42.0, 0.22, -23.8], angle: -0.74 * Math.PI, scale: 1.4 },
      { pos: [-38.2, 0.22, -20.2], angle: -0.72 * Math.PI, scale: 1.45 },
      { pos: [-34.5, 0.22, -17.0], angle: -0.70 * Math.PI, scale: 1.45 },
      { pos: [-31.2, 0.22, -14.6], angle: -0.65 * Math.PI, scale: 1.5 },
    ],
  },

  // STAGE 4: CP3 [-30, -14] -> CP4 [-12, -30] (Curving North-East / Left Turn)
  4: {
    color: '#00ffff',
    glowColor: '#0284c7',
    chevrons: [
      { pos: [-27.5, 0.22, -16.5], angle: -0.20 * Math.PI, scale: 1.4 },
      { pos: [-24.0, 0.22, -19.5], angle: -0.24 * Math.PI, scale: 1.4 },
      { pos: [-20.0, 0.22, -23.0], angle: -0.26 * Math.PI, scale: 1.45 },
      { pos: [-16.5, 0.22, -26.5], angle: -0.28 * Math.PI, scale: 1.45 },
      { pos: [-13.5, 0.22, -29.0], angle: -0.30 * Math.PI, scale: 1.5 },
    ],
  },

  // STAGE 5: CP4 [-12, -30] -> CP5 [-30, -30] (Straight West into Center Finish Arch)
  5: {
    color: '#fbbf24', // Radiant Amber/Gold for the Grand Finale
    glowColor: '#f59e0b',
    chevrons: [
      { pos: [-15.0, 0.22, -30.0], angle: Math.PI / 2, scale: 1.45 },
      { pos: [-18.5, 0.22, -30.0], angle: Math.PI / 2, scale: 1.45 },
      { pos: [-22.0, 0.22, -30.0], angle: Math.PI / 2, scale: 1.5 },
      { pos: [-25.5, 0.22, -30.0], angle: Math.PI / 2, scale: 1.5 },
      { pos: [-28.5, 0.22, -30.0], angle: Math.PI / 2, scale: 1.5 },
    ],
  },

  // STAGE 6: Objectives Complete -> Cross Boulevard East directly into Our Team Land [32, 0, -30] (Side by Side!)
  6: {
    color: '#f97316', // Vibrant Orange for Team Plaza
    glowColor: '#ea580c',
    chevrons: [
      { pos: [-20.0, 0.22, -30.0], angle: -Math.PI / 2, scale: 1.4 },
      { pos: [-12.0, 0.22, -30.0], angle: -Math.PI / 2, scale: 1.4 },
      { pos: [-4.0, 0.22, -30.0], angle: -Math.PI / 2, scale: 1.45 },
      { pos: [4.0, 0.22, -30.0], angle: -Math.PI / 2, scale: 1.45 },
      { pos: [12.0, 0.22, -30.0], angle: -Math.PI / 2, scale: 1.45 },
      { pos: [20.0, 0.22, -30.0], angle: -Math.PI / 2, scale: 1.5 },
      { pos: [27.0, 0.22, -30.0], angle: -Math.PI / 2, scale: 1.5 },
    ],
  },
};

export function CircuitNeonDirections() {
  const targetCheckpointIndex = usePortfolioStore((s) => s.targetCheckpointIndex);
  const objectivesCompleted = usePortfolioStore((s) => s.objectivesCompleted);

  // Active stage (1 to 5, or 6 for Completed -> Team Land)
  const activeStage = objectivesCompleted || targetCheckpointIndex >= 6 ? 6 : targetCheckpointIndex;
  const config = STAGE_ROUTES[activeStage] || STAGE_ROUTES[1];

  // Symmetric, clean aerodynamic racing chevron 2D shape
  const chevronShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Points along +Y
    shape.moveTo(0, 0.62);
    shape.lineTo(0.92, -0.42);
    shape.lineTo(0.58, -0.42);
    shape.lineTo(0, 0.18);
    shape.lineTo(-0.58, -0.42);
    shape.lineTo(-0.92, -0.42);
    shape.closePath();
    return shape;
  }, []);

  // 3D Extruded geometry for volumetric floating arrow wedge with beveled edges
  const extrudeGeom = useMemo(() => {
    return new THREE.ExtrudeGeometry(chevronShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
  }, [chevronShape]);

  const arrowRefs = useRef([]);
  const coreMatRefs = useRef([]);

  // Smooth, synchronized forward light pulse animation along the driving line
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    arrowRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const initialY = config.chevrons[idx]?.pos[1] || 0.22;
      // Gentle floating bob
      ref.position.y = initialY + Math.sin(time * 5.0 - idx * 0.65) * 0.04;
    });

    coreMatRefs.current.forEach((mat, idx) => {
      if (!mat) return;
      // High-speed light chase pulse wave
      const wave = Math.sin(time * 7.0 - idx * 0.75);
      const intensity = wave > 0 ? 0.4 + 0.6 * wave : 0.25;
      mat.opacity = intensity;
    });
  });

  return (
    <group name={`unified-neon-directions-stage-${activeStage}`}>
      {config.chevrons.map((item, i) => (
        <group key={`3d-arrow-${activeStage}-${i}`} position={[item.pos[0], 0, item.pos[2]]}>
          {/* Ground Contact Shadow / Ambient Neon Footprint on Asphalt */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
            <circleGeometry args={[1.6 * item.scale, 20]} />
            <meshBasicMaterial
              color={config.color}
              transparent
              opacity={0.16}
              depthWrite={false}
            />
          </mesh>

          {/* Elevated Volumetric 3D Floating Arrow Wedge */}
          <group
            ref={(el) => (arrowRefs.current[i] = el)}
            position={[0, item.pos[1], 0]}
            rotation={[-Math.PI / 2, 0, item.angle]}
            scale={[item.scale, item.scale, item.scale]}
          >
            {/* 3D Dark Midnight-Slate Beveled Chassis (Gives maximum contrast on white floor) */}
            <mesh geometry={extrudeGeom} castShadow receiveShadow>
              <meshStandardMaterial
                color="#0f172a"
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Glowing Neon Cap on the Top Face (Pointing towards direction) */}
            <mesh position={[0, 0, 0.17]}>
              <shapeGeometry args={[chevronShape]} />
              <meshBasicMaterial
                ref={(el) => (coreMatRefs.current[i] = el)}
                color={config.color}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Subtle Outer Neon Rim Glow */}
            <mesh position={[0, 0, 0.168]} scale={[1.12, 1.12, 1]}>
              <shapeGeometry args={[chevronShape]} />
              <meshBasicMaterial
                color={config.glowColor}
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
