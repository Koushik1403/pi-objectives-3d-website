import React, { useRef } from 'react';
import { Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPortfolioState, portfolioActions, usePortfolioStore } from '../../store/usePortfolioStore';
import { sounds } from '../../audio/soundEffects';

export function CheckpointArch({
  index,
  position,
  rotation = [0, 0, 0],
  title,
  desc,
  keyResults,
  nextSignAngle = 0,
}) {
  const ringRef = useRef(null);
  const beaconRef = useRef(null);
  const curtainRef = useRef(null);
  const orbitRef = useRef(null);
  const isTriggered = useRef(false);

  // Check if this arch is the current target destination
  const targetCheckpointIndex = usePortfolioStore((s) => s.targetCheckpointIndex);
  const isTarget = targetCheckpointIndex === index;

  // Strict sequential visibility: Only the current active objective is visible!
  if (targetCheckpointIndex !== index) {
    return null;
  }

  // Per-frame distance check for seamless proximity detection & animations
  useFrame(({ clock }) => {
    const { carPosition, activeCheckpoint, activeModal, audioEnabled } = getPortfolioState();
    if (!carPosition) return;

    // 2D distance on XZ plane
    const dx = carPosition.x - position[0];
    const dz = carPosition.z - position[2];
    const distSq = dx * dx + dz * dz;

    // Proximity trigger threshold (radius ~ 4.2m)
    if (distSq < 18) {
      if (!isTriggered.current) {
        isTriggered.current = true;
        if (!activeCheckpoint || activeCheckpoint.index !== index) {
          if (audioEnabled) {
            sounds.walletOpen();
          }
          portfolioActions.openCheckpoint({
            index,
            title,
            desc,
            keyResults,
          });
        }
      }
    } else if (distSq > 28) {
      isTriggered.current = false;
    }

    const t = clock.getElapsedTime();

    // Animate glowing ring pulse & beacon
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
    }
    if (beaconRef.current) {
      beaconRef.current.rotation.y += 0.01;
    }

    // Animate orbiting rings around checkpoint number
    if (orbitRef.current) {
      orbitRef.current.rotation.y = t * 1.5;
      orbitRef.current.rotation.x = Math.sin(t * 1.2) * 0.4;
    }

    // Gentle breathing pulse on the holographic laser energy curtain
    if (curtainRef.current) {
      curtainRef.current.material.opacity = 0.16 + Math.sin(t * 3.5) * 0.08;
    }
  });

  const neonColor = isTarget ? '#00f5ff' : '#38bdf8';
  const accentColor = isTarget ? '#fbbf24' : '#0284c7';

  return (
    <group position={position} rotation={rotation}>
      {/* ========================================================
          1. SKYWARD BEACON & ION EMISSION (When Active Target)
         ======================================================== */}
      {isTarget && (
        <group ref={beaconRef} position={[0, 10, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.7, 20, 16]} />
            <meshBasicMaterial
              color="#00f5ff"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, -10 + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 5.0, 32]} />
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.2} />
          </mesh>
        </group>
      )}

      {/* ========================================================
          2. GROUND SPEED STRIPE & CYBERNETIC ACTIVATION PORTAL
         ======================================================== */}
      {/* Checkered Finish Stripe Under Gate */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.8, 1.2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.017, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.8, 0.1]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>
      <mesh position={[0, 0.017, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.8, 0.1]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>

      {/* Outer Ground Activation Halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.8, 3.4, 32]} />
        <meshBasicMaterial
          color={neonColor}
          transparent
          opacity={isTarget ? 0.55 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Rotating Energy Ring */}
      <group position={[0, 0.08, 0]}>
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.7, 2.95, 24]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>

      {/* ========================================================
          3. HOLOGRAPHIC LASER ENERGY CURTAIN (SPEED PORTAL)
         ======================================================== */}
      <mesh ref={curtainRef} position={[0, 2.3, 0]}>
        <planeGeometry args={[5.4, 4.4]} />
        <meshBasicMaterial
          color={neonColor}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ========================================================
          4. ARCHITECTURAL PYLONS (LEFT & RIGHT AERODYNAMIC TOWERS)
         ======================================================== */}
      {/* LEFT PYLON TOWER */}
      <group position={[-3.1, 0, 0]}>
        {/* Heavy Pedestal Base Boot */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[1.1, 0.56, 1.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.28, 0.56]}>
          <boxGeometry args={[0.9, 0.18, 0.04]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>

        {/* Inner Main Vertical Upright Column */}
        <mesh position={[0.25, 2.7, 0]} castShadow>
          <boxGeometry args={[0.5, 4.8, 0.6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.85} />
        </mesh>
        {/* Inner Glowing Vertical Neon Channel */}
        <mesh position={[0.52, 2.7, 0]}>
          <boxGeometry args={[0.06, 4.6, 0.35]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>

        {/* Outer Aerodynamic Stabilizer Buttress (Angled Wing) */}
        <group position={[-0.45, 2.2, 0]} rotation={[0, 0, -0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 4.2, 0.45]} />
            <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.7} />
          </mesh>
          {/* Hydraulic Chrome Joint Collar */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.35, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.95} />
          </mesh>
          <mesh position={[0, -1.0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.35, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.95} />
          </mesh>
          {/* Outer Neon Trim Strip */}
          <mesh position={[-0.16, 0, 0]}>
            <boxGeometry args={[0.04, 3.8, 0.2]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>

        {/* Skyward Ion Emitter Spire (Left Tower Summit) */}
        <group position={[0.25, 5.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.18, 0.6, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={neonColor} />
          </mesh>
        </group>
      </group>

      {/* RIGHT PYLON TOWER */}
      <group position={[3.1, 0, 0]}>
        {/* Heavy Pedestal Base Boot */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[1.1, 0.56, 1.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.28, 0.56]}>
          <boxGeometry args={[0.9, 0.18, 0.04]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>

        {/* Inner Main Vertical Upright Column */}
        <mesh position={[-0.25, 2.7, 0]} castShadow>
          <boxGeometry args={[0.5, 4.8, 0.6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.85} />
        </mesh>
        {/* Inner Glowing Vertical Neon Channel */}
        <mesh position={[-0.52, 2.7, 0]}>
          <boxGeometry args={[0.06, 4.6, 0.35]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>

        {/* Outer Aerodynamic Stabilizer Buttress (Angled Wing) */}
        <group position={[0.45, 2.2, 0]} rotation={[0, 0, 0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 4.2, 0.45]} />
            <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.7} />
          </mesh>
          {/* Hydraulic Chrome Joint Collar */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.35, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.95} />
          </mesh>
          <mesh position={[0, -1.0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.35, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.95} />
          </mesh>
          {/* Outer Neon Trim Strip */}
          <mesh position={[0.16, 0, 0]}>
            <boxGeometry args={[0.04, 3.8, 0.2]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>

        {/* Skyward Ion Emitter Spire (Right Tower Summit) */}
        <group position={[-0.25, 5.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.18, 0.6, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={neonColor} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          5. GRAND OVERHEAD RACE GANTRY & DIGITAL LED CONSOLE
         ======================================================== */}
      {/* Main Structural Crossbeam Span */}
      <mesh position={[0, 4.7, 0]} castShadow>
        <boxGeometry args={[6.8, 0.75, 0.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.85} />
      </mesh>

      {/* Lower Neon Energy Ribbon Under Crossbeam */}
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[5.8, 0.08, 0.45]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>

      {/* Upper Aerodynamic Arch Bridge Truss */}
      <mesh position={[0, 5.15, 0]}>
        <boxGeometry args={[6.0, 0.16, 0.65]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Front Digital LED Race Banner */}
      <group position={[0, 4.7, 0.42]}>
        <mesh>
          <planeGeometry args={[5.6, 0.65]} />
          <meshBasicMaterial color="#0b1120" />
        </mesh>
        <mesh position={[0, 0.31, 0.01]}>
          <planeGeometry args={[5.6, 0.04]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
        {/* Micro Header */}
        <Text
          position={[0, 0.18, 0.02]}
          fontSize={0.14}
          color="#38bdf8"
          fontWeight={800}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          {`PI OBJECTIVE ${index} OF 5 • TEAM ABU Q4 2026`}
        </Text>
        {/* Main Title Banner */}
        <Text
          position={[0, -0.08, 0.02]}
          fontSize={0.24}
          color="#ffffff"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
        >
          {title ? title.toUpperCase() : `OBJECTIVE ${index}`}
        </Text>
      </group>

      {/* Rear Digital LED Race Banner (For Car Passing Through) */}
      <group position={[0, 4.7, -0.42]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[5.6, 0.65]} />
          <meshBasicMaterial color="#0b1120" />
        </mesh>
        <mesh position={[0, 0.31, 0.01]}>
          <planeGeometry args={[5.6, 0.04]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
        <Text
          position={[0, 0.18, 0.02]}
          fontSize={0.14}
          color="#38bdf8"
          fontWeight={800}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          {`PI OBJECTIVE ${index} OF 5 • TEAM ABU Q4 2026`}
        </Text>
        <Text
          position={[0, -0.08, 0.02]}
          fontSize={0.24}
          color="#ffffff"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
        >
          {title ? title.toUpperCase() : `OBJECTIVE ${index}`}
        </Text>
      </group>

      {/* ========================================================
          6. FLOATING CHECKPOINT NUMBER SUMMIT & ORBITAL RINGS
         ======================================================== */}
      <Float speed={2.5} rotationIntensity={0.15} floatIntensity={0.3} position={[0, 6.0, 0]}>
        {/* Metallic Emblem Badge Sphere */}
        <mesh castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.24, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color={accentColor}
            metalness={0.8}
            roughness={0.15}
          />
        </mesh>

        {/* Double-sided Number Display */}
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.85}
          color="#000000"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
        >
          {index}
        </Text>
        <Text
          position={[0, 0, -0.15]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.85}
          color="#000000"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
        >
          {index}
        </Text>

        {/* Orbiting Cyber Energy Ring */}
        <group ref={orbitRef}>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.25, 0.04, 16, 32]} />
            <meshBasicMaterial color={neonColor} />
          </mesh>
        </group>
      </Float>

      {/* ========================================================
          7. FLOATING 3D HOLOGRAPHIC WALLET (SIGNATURE FEATURE)
         ======================================================== */}
      <Float speed={2.8} rotationIntensity={0.2} floatIntensity={0.35} position={[0, 7.6, 0]}>
        <group>
          {/* Wallet Left Flap */}
          <mesh position={[-0.55, 0, 0]} rotation={[0, 0.25, 0]}>
            <boxGeometry args={[1.0, 0.75, 0.12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Wallet Right Flap */}
          <mesh position={[0.55, 0, 0]} rotation={[0, -0.25, 0]}>
            <boxGeometry args={[1.0, 0.75, 0.12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Golden Spine / Clasp */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.22, 0.78, 0.14]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Golden Titanium Card protruding from card slot */}
          <mesh position={[-0.5, 0.32, 0.04]} rotation={[0, 0.25, 0.12]}>
            <boxGeometry args={[0.75, 0.48, 0.03]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0284c7"
              emissiveIntensity={0.4}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Glowing Neon Receipt Slip protruding from billfold */}
          <mesh position={[0.5, 0.42, 0.04]} rotation={[0, -0.25, -0.1]}>
            <boxGeometry args={[0.65, 0.65, 0.02]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.5}
              roughness={0.3}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}
