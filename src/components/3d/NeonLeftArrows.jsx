import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Curve waypoints from Start Box (0, 0, 0) bending left towards NW Highway (-18, 0, -32)
const GROUND_CHEVRONS = [
  { pos: [-0.6, 0.028, -2.6], angle: 0.22, scale: 1.1 },
  { pos: [-1.6, 0.028, -5.4], angle: 0.38, scale: 1.2 },
  { pos: [-3.2, 0.028, -8.6], angle: 0.52, scale: 1.3 },
  { pos: [-5.4, 0.028, -12.4], angle: 0.65, scale: 1.4 },
  { pos: [-8.2, 0.028, -16.8], angle: 0.68, scale: 1.45 },
  { pos: [-11.6, 0.028, -21.8], angle: 0.68, scale: 1.5 },
  { pos: [-15.4, 0.028, -27.2], angle: 0.68, scale: 1.55 },
  { pos: [-19.5, 0.028, -33.0], angle: 0.68, scale: 1.6 },
];

// Roadside vertical arcade neon turn signs along the outer bend shoulder
const ROADSIDE_SIGNS = [
  { pos: [3.2, 0, -4.5], rotY: -0.32 },
  { pos: [1.8, 0, -10.5], rotY: -0.52 },
  { pos: [-1.0, 0, -16.8], rotY: -0.68 },
  { pos: [-4.6, 0, -23.2], rotY: -0.68 },
  { pos: [-8.8, 0, -29.8], rotY: -0.68 },
];

export function NeonLeftArrows() {
  // Chevron 2D Shape definition (pointing along +Y in shape coordinates)
  const chevronShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Symmetric sharp arrow chevron
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
  const signChevronRefs = useRef([]);

  // High-speed sequential neon animation loop
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // 1. Sequential chase wave along ground chevrons (waves from start to highway)
    groundRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const wave = Math.sin(time * 7 - idx * 0.75);
      const intensity = wave > 0 ? 0.35 + 0.65 * wave : 0.18;
      if (ref.material) {
        ref.material.opacity = intensity;
      }
    });

    // 2. Roadside signs: 3 chevrons per sign flash in a rapid leftward sweep (0 -> 1 -> 2)
    signChevronRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const chevronIdx = idx % 3; // 0=right, 1=middle, 2=left
      const pulse = Math.sin(time * 10 - chevronIdx * 1.05);
      const alpha = pulse > 0.1 ? 0.95 : 0.25;
      if (ref.material) {
        ref.material.opacity = alpha;
      }
    });
  });

  return (
    <group name="neon-left-turn-arrows">
      {/* ========================================================
          1. ANIMATED GROUND NEON CHEVRONS ALONG TURN TRACK
         ======================================================== */}
      {GROUND_CHEVRONS.map((item, i) => (
        <group key={`ground-chevron-${i}`} position={item.pos}>
          {/* Subtle cyan puddle glow decal */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
            <circleGeometry args={[1.6 * item.scale, 24]} />
            <meshBasicMaterial
              color="#00f5ff"
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
              color="#00b4d8"
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
              color="#00ffff"
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          2. ROADSIDE ARCADE NEON TURN SIGNS (OUTER SHOULDER)
         ======================================================== */}
      {ROADSIDE_SIGNS.map((sign, signIdx) => (
        <group key={`roadside-sign-${signIdx}`} position={sign.pos} rotation={[0, sign.rotY, 0]}>
          {/* Neon Pointlight casting electric cyan ambient glow onto track */}
          <pointLight
            color="#00f5ff"
            intensity={2.8}
            distance={5.8}
            position={[0, 1.4, 0.4]}
          />

          {/* Dual sleek matte dark mounting stanchions */}
          <mesh position={[-1.2, 0.85, 0]} castShadow>
            <boxGeometry args={[0.07, 1.7, 0.07]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[1.2, 0.85, 0]} castShadow>
            <boxGeometry args={[0.07, 1.7, 0.07]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Neon Sign Board Chassis (Dark glossy backplate with neon trim) */}
          <group position={[0, 1.35, 0]}>
            {/* Dark glass board */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.7, 1.05, 0.06]} />
              <meshStandardMaterial
                color="#030712"
                roughness={0.2}
                metalness={0.85}
              />
            </mesh>

            {/* Glowing neon cyan outer edge frame */}
            <mesh position={[0, 0, 0.035]}>
              <planeGeometry args={[2.74, 1.09]} />
              <meshBasicMaterial
                color="#00f5ff"
                wireframe
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* 3 Animated Neon Left Chevrons: [Right(0), Middle(1), Left(2)] pointing LEFT (Math.PI / 2) */}
            {[
              { x: 0.75, idx: 0 },
              { x: 0.0, idx: 1 },
              { x: -0.75, idx: 2 },
            ].map((ch) => {
              const globalIdx = signIdx * 3 + ch.idx;
              return (
                <group key={`sign-ch-${ch.idx}`} position={[ch.x, 0, 0.045]}>
                  {/* Outer neon aura */}
                  <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.78, 0.78, 1]}>
                    <shapeGeometry args={[chevronShape]} />
                    <meshBasicMaterial
                      color="#00b4d8"
                      transparent
                      opacity={0.4}
                      blending={THREE.AdditiveBlending}
                    />
                  </mesh>

                  {/* Sharp bright neon chevron core */}
                  <mesh
                    ref={(el) => (signChevronRefs.current[globalIdx] = el)}
                    rotation={[0, 0, Math.PI / 2]}
                    scale={[0.62, 0.62, 1]}
                    position={[0, 0, 0.002]}
                  >
                    <shapeGeometry args={[chevronShape]} />
                    <meshBasicMaterial
                      color="#00ffff"
                      transparent
                      opacity={0.9}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      ))}

      {/* ========================================================
          3. FLOATING 3D HOLOGRAPHIC NEON ARROW OVERHEAD AT ENTRANCE
         ======================================================== */}
      <Float speed={2.5} rotationIntensity={0.12} floatIntensity={0.35}>
        <group position={[-2.4, 2.6, -4.5]} rotation={[0, -0.38, 0]}>
          {/* Subtle neon point light */}
          <pointLight color="#00ffff" intensity={3.2} distance={4.5} />

          {/* Floating Neon Disc Halo */}
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[1.35, 1.42, 36]} />
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.7} />
          </mesh>

          {/* Dual Large Floating Hologram Left Chevrons */}
          <group position={[0.3, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.9, 0.9, 1]}>
              <shapeGeometry args={[chevronShape]} />
              <meshBasicMaterial color="#00ffff" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} scale={[1.15, 1.15, 1]}>
              <shapeGeometry args={[chevronShape]} />
              <meshBasicMaterial
                color="#0284c7"
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>

          <group position={[-0.35, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.9, 0.9, 1]}>
              <shapeGeometry args={[chevronShape]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} scale={[1.15, 1.15, 1]}>
              <shapeGeometry args={[chevronShape]} />
              <meshBasicMaterial
                color="#00f5ff"
                transparent
                opacity={0.65}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  );
}
