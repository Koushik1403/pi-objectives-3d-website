import React, { useRef } from 'react';
import { Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { getPortfolioState, portfolioActions, usePortfolioStore } from '../../../store/usePortfolioStore';
import { sounds } from '../../../audio/soundEffects';

const LAND_CENTER = [30, 0, -30];
const TRIGGER_RADIUS_SQ = 144; // 12m radius squared

export function BusinessCommitmentLand() {
  const isCommitted = usePortfolioStore((s) => s.isCommitted);
  const isInside = useRef(false);
  const crystalRef = useRef(null);

  useFrame(() => {
    const { carPosition, activeModal, audioEnabled } = getPortfolioState();
    if (!carPosition) return;

    const dx = carPosition.x - LAND_CENTER[0];
    const dz = carPosition.z - LAND_CENTER[2];
    const distSq = dx * dx + dz * dz;

    if (distSq < TRIGGER_RADIUS_SQ) {
      if (!isInside.current) {
        isInside.current = true;
        if (activeModal !== 'business-value') {
          if (audioEnabled) sounds.checkpoint();
          portfolioActions.openBusinessValue();
        }
      }
    } else if (distSq > TRIGGER_RADIUS_SQ + 30) {
      isInside.current = false;
    }

    if (crystalRef.current) {
      crystalRef.current.rotation.y += 0.015;
      crystalRef.current.rotation.x += 0.008;
    }
  });

  return (
    <group position={LAND_CENTER}>
      {/* Land Circular Zone Floor Base - Clean Bright White Studio Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[18, 48]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Decorative Outer Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[17.5, 18.2, 48]} />
        <meshBasicMaterial color={isCommitted ? '#10b981' : '#f59e0b'} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[12.5, 12.8, 36]} />
        <meshBasicMaterial color={isCommitted ? '#10b981' : '#f59e0b'} />
      </mesh>

      {/* Floating 3D Title Billboard (Clean White Studio Billboard) */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.4} position={[0, 8.5, 0]}>
        <mesh>
          <boxGeometry args={[12, 2.0, 0.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.22]}>
          <boxGeometry args={[11.6, 0.08, 0.05]} />
          <meshBasicMaterial color={isCommitted ? '#10b981' : '#f59e0b'} />
        </mesh>
        <Text
          position={[0, 0.35, 0.25]}
          fontSize={0.72}
          color="#0f172a"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
        >
          BUSINESS VALUE & COMMITMENTS
        </Text>
        <Text
          position={[0, -0.4, 0.25]}
          fontSize={0.34}
          color={isCommitted ? '#059669' : '#d97706'}
          fontWeight={800}
          anchorX="center"
          anchorY="middle"
        >
          STATUS: {isCommitted ? '● COMMITTED (TARGET 100%)' : '▲ NOT COMMITTED (IN REVIEW)'}
        </Text>
      </Float>

      {/* Central Rotating Commitment 3D Crystal / Core */}
      <group position={[0, 2.8, 0]}>
        {/* Crystal Pedestal - Clean Light Studio Marble */}
        <mesh position={[0, -1.6, 0]} castShadow>
          <cylinderGeometry args={[1.5, 2.0, 2.4, 16]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.1} roughness={0.4} />
        </mesh>
        {/* Floating Rotating Crystal */}
        <mesh ref={crystalRef} castShadow>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial
            color={isCommitted ? '#00e676' : '#ffb300'}
            roughness={0.1}
            metalness={0.7}
            emissive={isCommitted ? '#00e676' : '#ffb300'}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* 3D Bar Chart Columns demonstrating delivery metrics */}
      <group position={[0, 0, -6]}>
        {/* Q1 Pillar */}
        <mesh position={[-4.5, 1.2, 0]} castShadow>
          <boxGeometry args={[1.5, 2.4, 1.5]} />
          <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.4} />
        </mesh>
        <Text position={[-4.5, 2.8, 0]} fontSize={0.4} color="#0f172a" fontWeight={700}>
          Q1: $450K
        </Text>

        {/* Q2 Pillar */}
        <mesh position={[-1.5, 1.8, 0]} castShadow>
          <boxGeometry args={[1.5, 3.6, 1.5]} />
          <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.4} />
        </mesh>
        <Text position={[-1.5, 4.0, 0]} fontSize={0.4} color="#0f172a" fontWeight={700}>
          Q2: $850K
        </Text>

        {/* Q3 Pillar */}
        <mesh position={[1.5, 2.4, 0]} castShadow>
          <boxGeometry args={[1.5, 4.8, 1.5]} />
          <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.4} />
        </mesh>
        <Text position={[1.5, 5.2, 0]} fontSize={0.4} color="#0f172a" fontWeight={700}>
          Q3: $1.3M
        </Text>

        {/* Q4 Pillar (Highlight) */}
        <mesh position={[4.5, 3.2, 0]} castShadow>
          <boxGeometry args={[1.5, 6.4, 1.5]} />
          <meshStandardMaterial
            color={isCommitted ? '#059669' : '#d97706'}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <Text position={[4.5, 6.8, 0]} fontSize={0.4} color="#0f172a" fontWeight={800}>
          Q4: $1.8M
        </Text>
      </group>
    </group>
  );
}
