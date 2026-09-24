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
  const isTriggered = useRef(false);

  // Check if this arch is the current target destination
  const targetCheckpointIndex = usePortfolioStore((s) => s.targetCheckpointIndex);
  const isTarget = targetCheckpointIndex === index;

  // Strict sequential visibility: Only the current active objective is visible!
  // Future/remaining objectives are completely hidden and cannot be seen or triggered.
  if (targetCheckpointIndex !== index) {
    return null;
  }

  // Per-frame distance check for seamless, reliable proximity detection
  useFrame(() => {
    const { carPosition, activeCheckpoint, activeModal, audioEnabled } = getPortfolioState();
    if (!carPosition) return;

    // 2D distance on XZ plane
    const dx = carPosition.x - position[0];
    const dz = carPosition.z - position[2];
    const distSq = dx * dx + dz * dz;

    // Trigger threshold (radius ~ 4.2m)
    if (distSq < 18) {
      if (!isTriggered.current) {
        isTriggered.current = true;
        // Only trigger sound & modal update if not already this checkpoint
        if (!activeCheckpoint || activeCheckpoint.index !== index) {
          if (audioEnabled) sounds.checkpoint();
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

    // Animate glowing ring pulse
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
    }
    if (beaconRef.current) {
      beaconRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* High Vertical Beacon Column for Active Target */}
      {isTarget && (
        <group ref={beaconRef} position={[0, 9, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.6, 18, 16]} />
            <meshBasicMaterial
              color="#00e5ff"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, -9 + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 4.5, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.25} />
          </mesh>
        </group>
      )}

      {/* Ground Glowing Activation Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.5, 3.2, 32]} />
        <meshBasicMaterial
          color={isTarget ? '#ffb300' : '#00e5ff'}
          transparent
          opacity={isTarget ? 0.6 : 0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating Rotating Inner Ring */}
      <group position={[0, 0.1, 0]}>
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 2.7, 16]} />
          <meshBasicMaterial color={isTarget ? '#ffb300' : '#38bdf8'} />
        </mesh>
      </group>

      {/* 3D Arch Gateway Columns */}
      {/* Left Column */}
      <mesh position={[-2.4, 2.2, 0]} castShadow>
        <boxGeometry args={[0.5, 4.4, 0.5]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Left Neon Stripe */}
      <mesh position={[-2.12, 2.2, 0]}>
        <boxGeometry args={[0.08, 4.2, 0.3]} />
        <meshBasicMaterial color={isTarget ? '#ffb300' : '#00e5ff'} />
      </mesh>

      {/* Right Column */}
      <mesh position={[2.4, 2.2, 0]} castShadow>
        <boxGeometry args={[0.5, 4.4, 0.5]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Right Neon Stripe */}
      <mesh position={[2.12, 2.2, 0]}>
        <boxGeometry args={[0.08, 4.2, 0.3]} />
        <meshBasicMaterial color={isTarget ? '#ffb300' : '#00e5ff'} />
      </mesh>

      {/* Arch Header Beam */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <boxGeometry args={[5.3, 0.6, 0.6]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 4.5, 0.32]}>
        <boxGeometry args={[4.8, 0.12, 0.05]} />
        <meshBasicMaterial color={isTarget ? '#ffb300' : '#00e5ff'} />
      </mesh>

      {/* Floating 3D Checkpoint Number Badge (Double-sided) */}
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.4} position={[0, 5.8, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.22, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color={isTarget ? '#ffb300' : '#0284c7'}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>
        <Text
          position={[0, 0, 0.14]}
          fontSize={0.9}
          color="#ffffff"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
        >
          {index}
        </Text>
        <Text
          position={[0, 0, -0.14]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.9}
          color="#ffffff"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
        >
          {index}
        </Text>
      </Float>

      {/* Prominent Arch Text Header: "OBJECTIVE X" (Double-sided) */}
      <Text
        position={[0, 4.5, 0.35]}
        fontSize={0.34}
        color="#ffffff"
        fontWeight={800}
        anchorX="center"
        anchorY="middle"
      >
        {`OBJECTIVE ${index}`}
      </Text>
      <Text
        position={[0, 4.5, -0.35]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.34}
        color="#ffffff"
        fontWeight={800}
        anchorX="center"
        anchorY="middle"
      >
        {`OBJECTIVE ${index}`}
      </Text>

    </group>
  );
}
