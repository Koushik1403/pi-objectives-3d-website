import React, { useRef, useState } from 'react';
import { Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPortfolioState, portfolioActions, usePortfolioStore } from '../../store/usePortfolioStore';
import { sounds } from '../../audio/soundEffects';

export function GiftBoxObjective({
  index,
  position,
  rotation = [0, 0, 0],
  title = '',
  sentence = '',
  businessValue = 9,
  wrapColor = '#0284c7',
  ribbonColor = '#fbbf24',
}) {
  const openProgress = useRef(0);
  const lidRef = useRef(null);
  const frontFlapRef = useRef(null);
  const backFlapRef = useRef(null);
  const leftFlapRef = useRef(null);
  const rightFlapRef = useRef(null);
  const cornerPillarsRef = useRef(null);
  const blockRef = useRef(null);
  const beaconRef = useRef(null);
  const isTriggeredRef = useRef(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const targetCheckpointIndex = usePortfolioStore((s) => s.targetCheckpointIndex);
  const activeObjectiveIndex = usePortfolioStore((s) => s.activeObjectiveIndex);

  const isTarget = targetCheckpointIndex === index;
  const isOpen = activeObjectiveIndex === index;

  // Frame update: Proximity detection with strict latch ref + 60fps opening animation
  useFrame((_, delta) => {
    const { carPosition } = getPortfolioState();

    if (carPosition) {
      const dx = carPosition.x - position[0];
      const dz = carPosition.z - position[2];
      const distSq = dx * dx + dz * dz;

      // Hit threshold (~4.8m radius) - triggers ONCE when car enters
      if (distSq < 24 && !isTriggeredRef.current && isTarget && !isOpen) {
        isTriggeredRef.current = true;
        if (getPortfolioState().audioEnabled) {
          sounds.celebration();
        }
        // Asynchronously update store outside R3F render traversal
        setTimeout(() => {
          portfolioActions.openObjectiveBlock(index);
        }, 0);
      } else if (distSq > 34) {
        isTriggeredRef.current = false;
      }
    }

    // Smooth opening interpolation
    const targetP = isOpen ? 1 : 0;
    openProgress.current = THREE.MathUtils.lerp(openProgress.current, targetP, delta * 3.8);
    const p = openProgress.current;

    // Animate Lid: lifts up high into the air and rotates backward
    if (lidRef.current) {
      lidRef.current.position.y = 3.0 + p * 4.6;
      lidRef.current.position.z = -p * 3.4;
      lidRef.current.rotation.x = -p * 1.6;
    }

    // Animate All 4 Box Walls: Fold down flat outwards 90 degrees (4-way unwrapping explosion box!)
    const foldAngle = p * (Math.PI / 2);

    // 1. Front Wall folds forward (+Z) flat onto ground
    if (frontFlapRef.current) {
      frontFlapRef.current.rotation.x = foldAngle;
    }
    // 2. Back Wall folds backward (-Z) flat onto ground
    if (backFlapRef.current) {
      backFlapRef.current.rotation.x = -foldAngle;
    }
    // 3. Left Wall folds outward to the left (-X) flat onto ground
    if (leftFlapRef.current) {
      leftFlapRef.current.rotation.z = foldAngle;
    }
    // 4. Right Wall folds outward to the right (+X) flat onto ground
    if (rightFlapRef.current) {
      rightFlapRef.current.rotation.z = -foldAngle;
    }

    // 5. Corner Pillars: Smoothly scale down into the ground as the walls fold open so they never occlude the board
    if (cornerPillarsRef.current) {
      const pillarScale = Math.max(0, 1 - p * 1.4);
      cornerPillarsRef.current.scale.set(1, pillarScale, 1);
      cornerPillarsRef.current.visible = pillarScale > 0.01;
    }

    // Animate 3D Objective Block: rises smoothly out of the tall box into the land
    if (blockRef.current) {
      blockRef.current.position.y = THREE.MathUtils.lerp(0.4, 3.8, p);
      const s = THREE.MathUtils.lerp(0.2, 1.0, p);
      blockRef.current.scale.set(s, s, s);
      // Clean visibility culling to prevent any internal occlusion when closed
      blockRef.current.visible = isOpen || p > 0.02;
    }

    // Skyward beacon rotation when waiting for car
    if (beaconRef.current) {
      beaconRef.current.rotation.y += 0.015;
    }
  });

  const handleNextClick = (e) => {
    e.stopPropagation();
    const nextIdx = index < 5 ? index + 1 : 6;
    portfolioActions.advanceToNextObjective(nextIdx);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* ========================================================
          1. SKYWARD BEACON & TARGET GROUND HALO (When active target)
         ======================================================== */}
      {isTarget && !isOpen && (
        <group ref={beaconRef} position={[0, 11, 0]}>
          <mesh>
            <cylinderGeometry args={[0.35, 1.1, 22, 16]} />
            <meshBasicMaterial color={wrapColor} transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -11 + 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 5.6, 32]} />
            <meshBasicMaterial color={ribbonColor} transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, -11 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[5.6, 5.9, 32]} />
            <meshBasicMaterial color={wrapColor} />
          </mesh>
        </group>
      )}

      {/* Floating Prompt Plaque above unopened box */}
      {!isOpen && (
        <Float speed={2.5} rotationIntensity={0.04} floatIntensity={0.25} position={[0, 4.9, 0]}>
          <group>
            {/* Plaque Background */}
            <mesh position={[0, 0, -0.02]}>
              <boxGeometry args={[4.8, 1.2, 0.08]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Gold Bezel Border */}
            <mesh position={[0, 0, -0.01]}>
              <boxGeometry args={[4.88, 1.28, 0.04]} />
              <meshBasicMaterial color={ribbonColor} />
            </mesh>
            <Text
              position={[0, 0.24, 0.06]}
              fontSize={0.34}
              color="#fbbf24"
              fontWeight={900}
              anchorX="center"
              anchorY="middle"
            >
              {`🎁 PI OBJECTIVE ${index}`}
            </Text>
            <Text
              position={[0, -0.22, 0.06]}
              fontSize={0.22}
              color="#ffffff"
              fontWeight={800}
              anchorX="center"
              anchorY="middle"
            >
              HIT WITH CAR TO UNWRAP! 🏎️
            </Text>
          </group>
        </Float>
      )}

      {/* ========================================================
          2. ✨ GRAND TALL & ATTRACTIVE 3D WRAPPED PRESENT BOX
          Height: 3.0m, Width: 4.8m, Depth: 3.6m (Big & Impressive!)
         ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Festive Box Base Floor */}
        <mesh position={[0, 0.06, 0]} receiveShadow>
          <boxGeometry args={[4.8, 0.12, 3.6]} />
          <meshStandardMaterial color={wrapColor} roughness={0.2} metalness={0.4} />
        </mesh>

        {/* 1. Back Wall (Hinged Flap: Folds backward flat onto ground) */}
        <group ref={backFlapRef} position={[0, 0.08, -1.74]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[4.8, 3.0, 0.14]} />
            <meshStandardMaterial color={wrapColor} roughness={0.2} metalness={0.4} />
          </mesh>
          <mesh position={[0, 1.5, -0.08]} castShadow>
            <boxGeometry args={[0.76, 3.02, 0.05]} />
            <meshStandardMaterial color={ribbonColor} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>

        {/* 2. Left Wall (Hinged Flap: Folds outward to left flat onto ground) */}
        <group ref={leftFlapRef} position={[-2.35, 0.08, 0]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[0.14, 3.0, 3.48]} />
            <meshStandardMaterial color={wrapColor} roughness={0.2} metalness={0.4} />
          </mesh>
          <mesh position={[-0.08, 1.5, 0]}>
            <boxGeometry args={[0.05, 3.02, 0.76]} />
            <meshStandardMaterial color={ribbonColor} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>

        {/* 3. Right Wall (Hinged Flap: Folds outward to right flat onto ground) */}
        <group ref={rightFlapRef} position={[2.35, 0.08, 0]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[0.14, 3.0, 3.48]} />
            <meshStandardMaterial color={wrapColor} roughness={0.2} metalness={0.4} />
          </mesh>
          <mesh position={[0.08, 1.5, 0]}>
            <boxGeometry args={[0.05, 3.02, 0.76]} />
            <meshStandardMaterial color={ribbonColor} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>

        {/* 4. Front Wall (Hinged Flap: Folds forward flat onto ground) */}
        <group ref={frontFlapRef} position={[0, 0.08, 1.74]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[4.8, 3.0, 0.14]} />
            <meshStandardMaterial color={wrapColor} roughness={0.2} metalness={0.4} />
          </mesh>
          <mesh position={[0, 1.5, 0.08]}>
            <boxGeometry args={[0.76, 3.02, 0.05]} />
            <meshStandardMaterial color={ribbonColor} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>

        {/* Gold Corner Edge Pillars on Box (contract smoothly into floor when unwrapping) */}
        <group ref={cornerPillarsRef}>
          {[
            [-2.35, 1.5, -1.74],
            [2.35, 1.5, -1.74],
            [-2.35, 1.5, 1.74],
            [2.35, 1.5, 1.74],
          ].map((cPos, idx) => (
            <mesh key={idx} position={cPos}>
              <boxGeometry args={[0.20, 3.04, 0.20]} />
              <meshStandardMaterial color={ribbonColor} metalness={0.92} roughness={0.15} />
            </mesh>
          ))}
        </group>

        {/* 3D Box Lid with Silk Ribbon Rosette Bow */}
        <group ref={lidRef} position={[0, 3.0, 0]}>
          {/* Main Lid Cap Plate */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[5.0, 0.44, 3.8]} />
            <meshStandardMaterial color={wrapColor} roughness={0.2} metalness={0.4} />
          </mesh>
          {/* Gold Lid Rim Trim */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[5.08, 0.08, 3.88]} />
            <meshStandardMaterial color={ribbonColor} metalness={0.92} roughness={0.15} />
          </mesh>

          {/* Lid Ribbon Cross Bands */}
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.78, 0.46, 3.86]} />
            <meshStandardMaterial color={ribbonColor} metalness={0.92} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[5.06, 0.46, 0.78]} />
            <meshStandardMaterial color={ribbonColor} metalness={0.92} roughness={0.15} />
          </mesh>

          {/* Large 3D Rosette Ribbon Bow */}
          <group position={[0, 0.56, 0]}>
            {/* Center Knot */}
            <mesh castShadow>
              <sphereGeometry args={[0.38, 16, 16]} />
              <meshStandardMaterial color={ribbonColor} metalness={0.95} roughness={0.1} />
            </mesh>
            {/* 6 Radiant Ribbon Loops */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i * Math.PI * 2) / 6;
              return (
                <group key={i} rotation={[0, angle, 0]}>
                  <mesh position={[0.48, 0.22, 0]} rotation={[0, 0, 0.38]}>
                    <torusGeometry args={[0.46, 0.12, 10, 24, Math.PI * 1.35]} />
                    <meshStandardMaterial color={ribbonColor} metalness={0.9} roughness={0.15} />
                  </mesh>
                </group>
              );
            })}
            {/* Cascading Ribbon Tails */}
            <mesh position={[-0.44, -0.24, 0.58]} rotation={[0.4, 0, -0.3]}>
              <boxGeometry args={[0.26, 0.85, 0.03]} />
              <meshStandardMaterial color={ribbonColor} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.44, -0.24, 0.58]} rotation={[0.4, 0, 0.3]}>
              <boxGeometry args={[0.26, 0.85, 0.03]} />
              <meshStandardMaterial color={ribbonColor} metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* Ambient Magic Sparkles Orbiting Unopened Box */}
        {!isOpen && (
          <group position={[0, 2.0, 0]}>
            {[
              [-2.8, 0.6, 2.0],
              [2.8, 1.0, -1.6],
              [-2.4, 1.6, -2.0],
              [2.5, 0.5, 1.8],
            ].map((sPos, i) => (
              <Float key={i} speed={2.5} rotationIntensity={0.4} floatIntensity={0.4} position={sPos}>
                <mesh>
                  <octahedronGeometry args={[0.18, 0]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? '#fbbf24' : '#38bdf8'}
                    emissive={i % 2 === 0 ? '#fbbf24' : '#38bdf8'}
                    emissiveIntensity={0.8}
                  />
                </mesh>
              </Float>
            ))}
          </group>
        )}
      </group>

      {/* ========================================================
          3. 🌟 GRAND SPACIOUS ZERO-BLINKING 3D PRESENTATION MONOLITH
          Width: 9.0m, Height: 5.6m (Extra wide & tall: ALL text fits with huge margins!)
          Generous discrete Z-offsets eradicate Z-fighting completely!
         ======================================================== */}
      <group ref={blockRef} position={[0, 0.4, 0]}>
        {/* Layer 1: Solid Monolith Structural Chassis (Z = 0) */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[9.0, 5.6, 0.20]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Layer 2: Glowing Outer Perimeter Frame (Offset forward at Z = 0.06) */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[9.10, 5.70, 0.06]} />
          <meshBasicMaterial color={wrapColor} />
        </mesh>

        {/* Layer 3: Presentation Front Glass Plate (Offset at Z = 0.12 - ZERO Z-FIGHTING) */}
        <mesh position={[0, 0, 0.12]}>
          <planeGeometry args={[8.6, 5.2]} />
          <meshStandardMaterial color="#111827" roughness={0.35} metalness={0.15} />
        </mesh>

        {/* Layer 4: Header Badge Backing Plate (Offset at Z = 0.15) */}
        {/* Outer Gold/Ribbon Accent Rim (8.08m wide - perfectly frames the heading) */}
        <mesh position={[0, 1.95, 0.148]}>
          <planeGeometry args={[8.08, 0.62]} />
          <meshBasicMaterial color={ribbonColor} />
        </mesh>
        {/* Full-coverage Header Background Color (8.0m wide - guarantees starting & ending letters are 100% covered) */}
        <mesh position={[0, 1.95, 0.152]}>
          <planeGeometry args={[8.0, 0.54]} />
          <meshBasicMaterial color={wrapColor} />
        </mesh>

        {/* Layer 5: Typography & Elements (Clear forward layer at Z = 0.18) */}
        {/* Category Header - Crisp Bold White on rich wrapColor background */}
        <Text
          position={[0, 1.95, 0.18]}
          fontSize={0.20}
          color="#ffffff"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
          maxWidth={7.6}
        >
          {`PI OBJECTIVE ${index} OF 5 • TEAM ABU Q4 2026`}
        </Text>

        {/* Main Bold Title (Cleanly fit with maxWidth 7.6) */}
        <Text
          position={[0, 1.30, 0.18]}
          fontSize={0.34}
          color="#ffffff"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
          maxWidth={7.6}
          textAlign="center"
        >
          {(title || '').toUpperCase()}
        </Text>

        {/* Glowing Decorative Divider Line */}
        <mesh position={[0, 0.80, 0.15]}>
          <planeGeometry args={[7.6, 0.03]} />
          <meshBasicMaterial color={ribbonColor} />
        </mesh>

        {/* One-Sentence Objective Description - Flows downward from +0.60 to avoid any collision */}
        <Text
          position={[0, 0.60, 0.18]}
          fontSize={0.21}
          color="#f1f5f9"
          fontWeight={600}
          anchorX="center"
          anchorY="top"
          maxWidth={7.4}
          textAlign="center"
          lineHeight={1.40}
        >
          {sentence}
        </Text>

        {/* Business Value Section - Cleanly Centered Horizontally around X = 0 */}
        <group position={[0, -0.55, 0.18]}>
          {/* Label positioned to the left of center */}
          <Text
            position={[-0.3, 0, 0]}
            fontSize={0.23}
            color="#fbbf24"
            fontWeight={900}
            anchorX="right"
            anchorY="middle"
          >
            {`BUSINESS VALUE: ${businessValue}/10`}
          </Text>

          {/* 10 Visual Segmented Rating Pips positioned to the right of center */}
          <group position={[0.0, 0, 0]}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => {
              const filled = num <= businessValue;
              return (
                <mesh key={i} position={[i * 0.22, 0, 0]}>
                  <boxGeometry args={[0.16, 0.24, 0.04]} />
                  {filled ? (
                    <meshStandardMaterial
                      color="#fbbf24"
                      emissive="#fbbf24"
                      emissiveIntensity={0.7}
                      metalness={0.5}
                      roughness={0.2}
                    />
                  ) : (
                    <meshStandardMaterial color="#334155" roughness={0.8} />
                  )}
                </mesh>
              );
            })}
          </group>
        </group>

        {/* Layer 6: Interactive In-Land Drive Button (Offset at Z = 0.22) */}
        <group
          position={[0, -1.65, 0.22]}
          onClick={handleNextClick}
          onPointerOver={() => setBtnHovered(true)}
          onPointerOut={() => setBtnHovered(false)}
        >
          <mesh>
            <boxGeometry args={[5.6, 0.68, 0.06]} />
            <meshStandardMaterial
              color={btnHovered ? '#0284c7' : '#0369a1'}
              metalness={0.6}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[5.68, 0.76, 0.04]} />
            <meshBasicMaterial color={btnHovered ? '#ffffff' : ribbonColor} />
          </mesh>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.24}
            color="#ffffff"
            fontWeight={900}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.04}
          >
            {index < 5
              ? `DRIVE TO OBJECTIVE ${index + 1} ➔ 🏎️`
              : '🏆 ALL OBJECTIVES UNLOCKED! DRIVE TO TEAM LAND ➔'}
          </Text>
        </group>
      </group>
    </group>
  );
}
