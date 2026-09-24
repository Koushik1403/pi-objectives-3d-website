import React from 'react';
import { GiftBoxObjective } from '../GiftBoxObjective';
import { CircuitNeonDirections } from '../CircuitNeonDirections';
import { usePortfolioStore } from '../../../store/usePortfolioStore';

// Five sequential PI objectives arranged along the racing circuit
// Orientations precisely aligned to open facing directly towards the incoming car & camera!
// Circuit: Start [-30, -54] ➔ CP1 [-30, -42] ➔ CP2 [-48, -30] ➔ CP3 [-30, -14] ➔ CP4 [-12, -30] ➔ CP5 [-30, -30] (Finish)
const OBJECTIVES_DATA = [
  {
    index: 1,
    position: [-30, 0, -42],
    rotation: [0, 0, 0], // Facing North (approaching car driving South)
    title: 'Wallet Transaction History',
    sentence: 'Developed core wallet and now delivering real-time transaction history with sub-50ms query speeds & instant status tracking.',
    businessValue: 9,
    wrapColor: '#0284c7', // Royal Sapphire
    ribbonColor: '#fbbf24', // Gold
  },
  {
    index: 2,
    position: [-48, 0, -30],
    rotation: [0, (3 * Math.PI) / 4, 0], // Rotated to face East-North-East directly toward incoming car from CP1!
    title: 'Autonomous AI Agent Pipeline',
    sentence: 'Deploying self-healing coding assistant agents and real-time LLM inference pipelines for automated regression triage.',
    businessValue: 8,
    wrapColor: '#059669', // Emerald Green
    ribbonColor: '#fde047', // Sunshine Gold
  },
  {
    index: 3,
    position: [-30, 0, -14],
    rotation: [0, (-3 * Math.PI) / 4, 0], // Rotated to face West-South-West directly toward incoming car from CP2!
    title: '60 FPS Interactive 3D Web Platform',
    sentence: 'Delivering real-time 3D web simulation with dynamic Rapier physics, low memory footprint, and stable 60 FPS.',
    businessValue: 9,
    wrapColor: '#9333ea', // Cyber Violet
    ribbonColor: '#00f5ff', // Neon Cyan
  },
  {
    index: 4,
    position: [-12, 0, -30],
    rotation: [0, -Math.PI / 4, 0], // Rotated to face South-West directly toward incoming car from CP3!
    title: 'Micro-Frontend Design System',
    sentence: 'Unifying 8 enterprise product dashboards into an accessible tokenized modular design system with WCAG AAA compliance.',
    businessValue: 7,
    wrapColor: '#ea580c', // Sunset Orange
    ribbonColor: '#ffffff', // Crisp White
  },
  {
    index: 5,
    position: [-30, 0, -30],
    rotation: [0, Math.PI / 2, 0], // Rotated to face East straight at incoming car from CP4!
    title: 'Zero-Downtime Deployment & Observability',
    sentence: 'Implementing progressive canary releases with automated Prometheus telemetry rollback triggers and zero downtime.',
    businessValue: 10,
    wrapColor: '#d97706', // Championship Gold
    ribbonColor: '#dc2626', // Royal Ruby
  },
];

export function PIObjectivesLand() {
  const targetCheckpointIndex = usePortfolioStore((s) => s.targetCheckpointIndex);
  const activeObjectiveIndex = usePortfolioStore((s) => s.activeObjectiveIndex);

  return (
    <group position={[0, 0, 0]}>
      {/* Land Zone Base - Crisp Light Circuit Arena */}
      <mesh position={[-30, 0.012, -30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[26, 48]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Decorative Outer Border */}
      <mesh position={[-30, 0.016, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[25.5, 26.2, 48]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>

      {/* Main Light Asphalt Race Track loop */}
      {/* Segment 1: Start to Checkpoint 1 */}
      <mesh position={[-30, 0.018, -48]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5, 18]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      {/* Segment 2: CP1 to CP2 (Corner West) */}
      <mesh position={[-39, 0.018, -36]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <planeGeometry args={[6.5, 20]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      {/* Segment 3: CP2 to CP3 (Corner South) */}
      <mesh position={[-39, 0.018, -22]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
        <planeGeometry args={[6.5, 20]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      {/* Segment 4: CP3 to CP4 (Corner East) */}
      <mesh position={[-21, 0.018, -22]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <planeGeometry args={[6.5, 20]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      {/* Segment 5: CP4 into Center Finish (CP5) */}
      <mesh position={[-21, 0.018, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 6.5]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>

      {/* START LINE GANTRY & ROAD MARKINGS */}
      <group position={[-30, 0.02, -56]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.5, 1.4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* DYNAMIC NEON LIGHTING ARROWS FOR EVERY OBJECTIVE & ROUTE */}
      <CircuitNeonDirections />

      {/* ========================================================
          3D WRAPPED GIFT BOX OBJECTIVES ALONG THE TRACK
          Each opens facing directly towards the incoming car camera!
         ======================================================== */}
      {OBJECTIVES_DATA.map((obj) => {
        // Strictly show only the active target checkpoint or currently active opened objective
        if (obj.index !== targetCheckpointIndex && obj.index !== activeObjectiveIndex) {
          return null;
        }

        return (
          <GiftBoxObjective
            key={obj.index}
            index={obj.index}
            position={obj.position}
            rotation={obj.rotation}
            title={obj.title}
            sentence={obj.sentence}
            businessValue={obj.businessValue}
            wrapColor={obj.wrapColor}
            ribbonColor={obj.ribbonColor}
          />
        );
      })}
    </group>
  );
}
