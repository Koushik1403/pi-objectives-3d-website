import React from 'react';
import { CheckpointArch } from '../CheckpointArch';
import { CircuitNeonDirections } from '../CircuitNeonDirections';
import { usePortfolioStore } from '../../../store/usePortfolioStore';

// Five sequential checkpoints arranged in a clear clockwise racing circuit
// Circuit: Start [-30, -54] ➔ CP1 [-30, -42] ➔ CP2 [-48, -30] ➔ CP3 [-30, -14] ➔ CP4 [-12, -30] ➔ CP5 [-30, -30] (Finish)
const CHECKPOINTS_DATA = [
  {
    index: 1,
    position: [-30, 0, -42],
    rotation: [0, 0, 0], // Spans East-West across North-South road (car driving South +Z)
    nextSignAngle: -Math.PI / 4, // Points towards Checkpoint 2 (West-South-West)
    title: 'Wallet Transaction History',
    desc: 'Having developed and launched our core Wallet, Team Abu is now delivering real-time Transaction History with sub-50ms query speeds, smart categorization, and streaming telemetry.',
    keyResults: [
      'Sub-50ms p99 query latency across 10M+ transaction history records',
      'Real-time streaming event ingestion via Kafka & instant push alerts',
      'AI-driven automatic transaction categorization (98%+ precision)',
      '1-Click ISO 20022 compliant statements & audit history exports',
    ],
  },
  {
    index: 2,
    position: [-48, 0, -30],
    rotation: [0, -Math.PI / 4, 0], // Spans perpendicular to NW-SE road
    nextSignAngle: Math.PI / 4, // Points towards Checkpoint 3 (South-East)
    title: 'Autonomous AI Agent Pipeline',
    desc: 'Deploy self-healing coding assistant agents and real-time LLM inference pipelines with smart caching and evaluation benchmarks.',
    keyResults: [
      'Automate 60% of regression bug triage and reproduction',
      'Integrate streaming vector search with sub-100ms retrieval',
      'Zero hallucinations in policy compliance auditing',
    ],
  },
  {
    index: 3,
    position: [-30, 0, -14],
    rotation: [0, Math.PI / 4, 0], // Spans perpendicular to SW-NE road
    nextSignAngle: (3 * Math.PI) / 4, // Points towards Checkpoint 4 (East)
    title: '60 FPS Interactive 3D Web Platform',
    desc: 'Deliver a browser-based real-time 3D simulation with dynamic Rapier physics, low memory footprint, and instant initial load.',
    keyResults: [
      'Maintain stable 60 FPS across mobile and desktop devices',
      'Bundle size compressed under 450 KB with tree-shaking',
      'GPU draw calls reduced by 40% via mesh batching',
    ],
  },
  {
    index: 4,
    position: [-12, 0, -30],
    rotation: [0, (3 * Math.PI) / 4, 0], // Spans perpendicular to incoming road from CP3
    nextSignAngle: Math.PI, // Points straight West into Center Finish Line (CP5)
    title: 'Micro-Frontend Design System',
    desc: 'Unify 8 enterprise product dashboards into a tokenized modular design system with WCAG AAA accessibility compliance.',
    keyResults: [
      '100% component library coverage with Storybook',
      'Eliminate duplicate CSS stylesheets across micro-apps',
      'Accelerate feature release velocity by 3.5x',
    ],
  },
  {
    index: 5,
    position: [-30, 0, -30],
    rotation: [0, -Math.PI / 2, 0], // Center Finish Arch facing East (incoming car from CP4)
    nextSignAngle: 0,
    title: 'Zero-Downtime Deployment & Observability',
    desc: 'Implement progressive canary releases with automated rollback triggers based on Prometheus telemetry and OpenTelemetry tracing.',
    keyResults: [
      'Deploy 25+ times per day with zero downtime',
      'Mean time to recovery (MTTR) dropped to under 3 minutes',
      'Full distributed tracing across 120+ microservices',
    ],
  },
];

export function PIObjectivesLand() {
  const targetCheckpointIndex = usePortfolioStore((s) => s.targetCheckpointIndex);
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

      {/* START LINE GANTRY & ROAD MARKINGS (Upright for approaching driver) */}
      <group position={[-30, 0.02, -56]}>
        {/* Checkered Start Stripe */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.5, 1.4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* DYNAMIC NEON LIGHTING ARROWS FOR EVERY OBJECTIVE & ROUTE */}
      <CircuitNeonDirections />


      {/* Sequence of Checkpoint Arches - Strictly render ONLY the active target checkpoint */}
      {CHECKPOINTS_DATA.map((cp) => {
        if (cp.index !== targetCheckpointIndex) return null;
        return (
          <CheckpointArch
            key={cp.index}
            index={cp.index}
            position={cp.position}
            rotation={cp.rotation}
            nextSignAngle={cp.nextSignAngle}
            title={cp.title}
            desc={cp.desc}
            keyResults={cp.keyResults}
          />
        );
      })}
    </group>
  );
}
