import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { usePortfolioStore } from '../../store/usePortfolioStore';

// Waypoints and signage for each circuit segment
const SEGMENT_CONFIGS = {
  // SEGMENT 1: Approach to Objective 1 (North-South straight line)
  1: {
    color: '#00ffff',
    accentColor: '#00b4d8',
    ground: [
      { pos: [-30, 0.028, -54], angle: Math.PI, scale: 1.35 },
      { pos: [-30, 0.028, -50], angle: Math.PI, scale: 1.4 },
      { pos: [-30, 0.028, -46], angle: Math.PI, scale: 1.45 },
    ],
    signs: [
      { pos: [-26.2, 0, -52], rotY: Math.PI / 2, arrowDirection: 'left' },
      { pos: [-33.8, 0, -48], rotY: -Math.PI / 2, arrowDirection: 'right' },
    ],
    floatSign: { pos: [-30, 3.2, -50], rotY: 0, arrowDirection: 'straight' },
  },

  // SEGMENT 2: CP1 [-30, -42] -> CP2 [-48, -30] (Curving West / Right Turn from South)
  2: {
    color: '#00ffff',
    accentColor: '#0284c7',
    ground: [
      { pos: [-32.5, 0.028, -39.5], angle: 0.68 * Math.PI, scale: 1.3 },
      { pos: [-36.2, 0.028, -36.5], angle: 0.75 * Math.PI, scale: 1.35 },
      { pos: [-40.0, 0.028, -34.0], angle: 0.82 * Math.PI, scale: 1.4 },
      { pos: [-44.0, 0.028, -31.8], angle: 0.88 * Math.PI, scale: 1.45 },
    ],
    signs: [
      { pos: [-30.0, 0, -34.0], rotY: 0, arrowDirection: 'right' },
      { pos: [-35.0, 0, -31.0], rotY: 0.35, arrowDirection: 'right' },
      { pos: [-41.0, 0, -28.0], rotY: 0.7, arrowDirection: 'right' },
    ],
    floatSign: { pos: [-37, 3.2, -35], rotY: 0.75, arrowDirection: 'right' },
  },

  // SEGMENT 3: CP2 [-48, -30] -> CP3 [-30, -14] (Curving South-East / Left Turn)
  3: {
    color: '#00ffff',
    accentColor: '#0284c7',
    ground: [
      { pos: [-45.0, 0.028, -26.5], angle: 0.32 * Math.PI, scale: 1.3 },
      { pos: [-41.2, 0.028, -23.5], angle: 0.26 * Math.PI, scale: 1.35 },
      { pos: [-37.5, 0.028, -20.0], angle: 0.22 * Math.PI, scale: 1.4 },
      { pos: [-33.5, 0.028, -16.5], angle: 0.18 * Math.PI, scale: 1.45 },
    ],
    signs: [
      { pos: [-52.5, 0, -28.5], rotY: -Math.PI / 2, arrowDirection: 'left' },
      { pos: [-49.0, 0, -22.5], rotY: -Math.PI / 3, arrowDirection: 'left' },
      { pos: [-44.0, 0, -16.5], rotY: -Math.PI / 6, arrowDirection: 'left' },
    ],
    floatSign: { pos: [-39, 3.2, -22], rotY: -0.85, arrowDirection: 'left' },
  },

  // SEGMENT 4: CP3 [-30, -14] -> CP4 [-12, -30] (Curving North-East / Left Turn)
  4: {
    color: '#00ffff',
    accentColor: '#0284c7',
    ground: [
      { pos: [-27.0, 0.028, -17.5], angle: -0.22 * Math.PI, scale: 1.3 },
      { pos: [-23.0, 0.028, -20.5], angle: -0.25 * Math.PI, scale: 1.35 },
      { pos: [-19.0, 0.028, -24.0], angle: -0.26 * Math.PI, scale: 1.4 },
      { pos: [-15.0, 0.028, -27.5], angle: -0.28 * Math.PI, scale: 1.45 },
    ],
    signs: [
      { pos: [-28.5, 0, -9.5], rotY: Math.PI, arrowDirection: 'left' },
      { pos: [-22.5, 0, -12.5], rotY: (3 * Math.PI) / 4, arrowDirection: 'left' },
      { pos: [-16.5, 0, -17.5], rotY: Math.PI / 2, arrowDirection: 'left' },
    ],
    floatSign: { pos: [-21, 3.2, -22], rotY: 0.85, arrowDirection: 'left' },
  },

  // SEGMENT 5: CP4 [-12, -30] -> CP5 [-30, -30] (Straight West into Center Finish Arch)
  5: {
    color: '#fbbf24', // Radiant Amber/Gold for Grand Finish
    accentColor: '#f59e0b',
    ground: [
      { pos: [-15.5, 0.028, -30], angle: Math.PI / 2, scale: 1.4 },
      { pos: [-19.5, 0.028, -30], angle: Math.PI / 2, scale: 1.45 },
      { pos: [-23.5, 0.028, -30], angle: Math.PI / 2, scale: 1.5 },
      { pos: [-27.5, 0.028, -30], angle: Math.PI / 2, scale: 1.55 },
    ],
    signs: [
      { pos: [-7.5, 0, -30], rotY: -Math.PI / 2, arrowDirection: 'left' },
      { pos: [-18.0, 0, -33.8], rotY: 0, arrowDirection: 'left' },
      { pos: [-24.0, 0, -26.2], rotY: Math.PI, arrowDirection: 'right' },
    ],
    floatSign: { pos: [-21, 3.4, -30], rotY: -Math.PI / 2, arrowDirection: 'straight' },
  },

  // SEGMENT 6: From CP5 / Arena back to Central Roundabout & South Highway to Our Team Plaza
  6: {
    color: '#f97316', // Vibrant Orange for Team Plaza
    accentColor: '#ea580c',
    ground: [
      { pos: [-20, 0.028, -20], angle: -0.25 * Math.PI, scale: 1.3 },
      { pos: [-12, 0.028, -12], angle: -0.25 * Math.PI, scale: 1.35 },
      { pos: [-5, 0.028, -5], angle: -0.25 * Math.PI, scale: 1.4 },
      { pos: [0, 0.028, 5], angle: Math.PI, scale: 1.45 },
      { pos: [0, 0.028, 14], angle: Math.PI, scale: 1.5 },
      { pos: [0, 0.028, 22], angle: Math.PI, scale: 1.55 },
    ],
    signs: [
      { pos: [-2, 0, 10], rotY: Math.PI / 2, arrowDirection: 'straight' },
      { pos: [4.5, 0, 18], rotY: -Math.PI / 2, arrowDirection: 'straight' },
    ],
    floatSign: { pos: [0, 3.2, 16], rotY: 0, arrowDirection: 'straight' },
  },
};

export function CircuitNeonDirections() {
  const targetCheckpointIndex = usePortfolioStore((s) => s.targetCheckpointIndex);
  const objectivesCompleted = usePortfolioStore((s) => s.objectivesCompleted);

  // Active segment (1 to 5, or 6 for Completed -> Team Land)
  const activeSegmentKey = objectivesCompleted || targetCheckpointIndex >= 6 ? 6 : targetCheckpointIndex;
  const config = SEGMENT_CONFIGS[activeSegmentKey] || SEGMENT_CONFIGS[1];

  // Symmetric sharp chevron shape
  const chevronShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.42);
    shape.lineTo(0.72, -0.32);
    shape.lineTo(0.48, -0.32);
    shape.lineTo(0, 0.12);
    shape.lineTo(-0.48, -0.32);
    shape.lineTo(-0.72, -0.32);
    shape.closePath();
    return shape;
  }, []);

  const groundRefs = useRef([]);
  const signRefs = useRef([]);

  // High-speed synchronized neon chase animation
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // 1. Ground Chevrons Wave
    groundRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const wave = Math.sin(time * 7.5 - idx * 0.85);
      const intensity = wave > 0 ? 0.35 + 0.65 * wave : 0.18;
      if (ref.material) {
        ref.material.opacity = intensity;
      }
    });

    // 2. Roadside Sign Chevrons Flash Sequence
    signRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const chIdx = idx % 3;
      const pulse = Math.sin(time * 11 - chIdx * 1.1);
      const alpha = pulse > 0.1 ? 0.95 : 0.22;
      if (ref.material) {
        ref.material.opacity = alpha;
      }
    });
  });

  // Calculate local chevron rotation based on direction ('left', 'right', 'straight')
  const getSignChevronRotZ = (dir, chIdx) => {
    if (dir === 'left') return Math.PI / 2;
    if (dir === 'right') return -Math.PI / 2;
    return 0; // straight up
  };

  return (
    <group name={`circuit-neon-directions-stage-${activeSegmentKey}`}>
      {/* ========================================================
          1. ANIMATED GROUND NEON CHEVRONS FOR ACTIVE SEGMENT
         ======================================================== */}
      {config.ground.map((item, i) => (
        <group key={`circuit-ground-${activeSegmentKey}-${i}`} position={item.pos}>
          {/* Neon ground decal puddle glow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
            <circleGeometry args={[1.5 * item.scale, 20]} />
            <meshBasicMaterial
              color={config.color}
              transparent
              opacity={0.08}
              depthWrite={false}
            />
          </mesh>

          {/* Outer glowing neon chevron border (Additive glow) */}
          <mesh
            rotation={[-Math.PI / 2, 0, item.angle]}
            scale={[item.scale * 1.25, item.scale * 1.25, 1]}
            position={[0, 0.001, 0]}
          >
            <shapeGeometry args={[chevronShape]} />
            <meshBasicMaterial
              color={config.accentColor}
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Core bright neon chevron with animated opacity */}
          <mesh
            ref={(el) => (groundRefs.current[i] = el)}
            rotation={[-Math.PI / 2, 0, item.angle]}
            scale={[item.scale, item.scale, 1]}
            position={[0, 0.003, 0]}
          >
            <shapeGeometry args={[chevronShape]} />
            <meshBasicMaterial
              color={config.color}
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          2. ROADSIDE ARCADE NEON SIGNBOARDS ON CORNERS
         ======================================================== */}
      {config.signs.map((sign, signIdx) => (
        <group
          key={`circuit-sign-${activeSegmentKey}-${signIdx}`}
          position={sign.pos}
          rotation={[0, sign.rotY, 0]}
        >
          {/* Real-time neon ambient light */}
          <pointLight
            color={config.color}
            intensity={2.6}
            distance={5.5}
            position={[0, 1.4, 0.4]}
          />

          {/* Matte dark mounting stanchions */}
          <mesh position={[-1.15, 0.85, 0]} castShadow>
            <boxGeometry args={[0.07, 1.7, 0.07]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[1.15, 0.85, 0]} castShadow>
            <boxGeometry args={[0.07, 1.7, 0.07]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Sign board frame */}
          <group position={[0, 1.35, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.6, 1.0, 0.06]} />
              <meshStandardMaterial color="#030712" roughness={0.2} metalness={0.85} />
            </mesh>

            {/* Neon glowing wireframe border */}
            <mesh position={[0, 0, 0.035]}>
              <planeGeometry args={[2.64, 1.04]} />
              <meshBasicMaterial color={config.color} wireframe transparent opacity={0.85} />
            </mesh>

            {/* 3 Animated Neon Chevrons: [0, 1, 2] */}
            {[
              { x: -0.72, idx: 0 },
              { x: 0.0, idx: 1 },
              { x: 0.72, idx: 2 },
            ].map((ch) => {
              const globalIdx = signIdx * 3 + ch.idx;
              const rotZ = getSignChevronRotZ(sign.arrowDirection, ch.idx);
              return (
                <group key={`sign-ch-${ch.idx}`} position={[ch.x, 0, 0.045]}>
                  {/* Outer aura */}
                  <mesh rotation={[0, 0, rotZ]} scale={[0.75, 0.75, 1]}>
                    <shapeGeometry args={[chevronShape]} />
                    <meshBasicMaterial
                      color={config.accentColor}
                      transparent
                      opacity={0.4}
                      blending={THREE.AdditiveBlending}
                    />
                  </mesh>

                  {/* Core neon chevron */}
                  <mesh
                    ref={(el) => (signRefs.current[globalIdx] = el)}
                    rotation={[0, 0, rotZ]}
                    scale={[0.6, 0.6, 1]}
                    position={[0, 0, 0.002]}
                  >
                    <shapeGeometry args={[chevronShape]} />
                    <meshBasicMaterial color={config.color} transparent opacity={0.9} />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      ))}

      {/* ========================================================
          3. FLOATING 3D HOLOGRAPHIC NEON GUIDE ARROW
         ======================================================== */}
      {config.floatSign && (
        <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <group position={config.floatSign.pos} rotation={[0, config.floatSign.rotY, 0]}>
            <pointLight color={config.color} intensity={2.8} distance={4.2} />

            {/* Neon Disc Halo */}
            <mesh>
              <ringGeometry args={[1.25, 1.32, 32]} />
              <meshBasicMaterial color={config.color} transparent opacity={0.7} />
            </mesh>

            {/* Floating Left/Right/Straight Neon Chevron pair */}
            {[-0.3, 0.3].map((offsetX, k) => (
              <group key={`float-ch-${k}`} position={[offsetX, 0, 0]}>
                <mesh
                  rotation={[0, 0, getSignChevronRotZ(config.floatSign.arrowDirection)]}
                  scale={[0.85, 0.85, 1]}
                >
                  <shapeGeometry args={[chevronShape]} />
                  <meshBasicMaterial color={k === 1 ? '#ffffff' : config.color} />
                </mesh>
                <mesh
                  rotation={[0, 0, getSignChevronRotZ(config.floatSign.arrowDirection)]}
                  scale={[1.1, 1.1, 1]}
                >
                  <shapeGeometry args={[chevronShape]} />
                  <meshBasicMaterial
                    color={config.accentColor}
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
              </group>
            ))}
          </group>
        </Float>
      )}
    </group>
  );
}
