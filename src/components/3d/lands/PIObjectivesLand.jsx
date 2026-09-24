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
    title: 'Xtra-Wallet go to alpha Hypercare',
    sentence: 'MVP Alpha release: Onboarding, Payment screens, Dynamic SDK ID, Switch device, Offboarding and maaltijdcheques, live for the Alpha users in the canteens.',
    sentence2: 'Hypercare: daily follow-up, incident fixes and weekly report',
    businessValue: 9,
    status: 'COMMITTED',
    wrapColor: '#0284c7', // Royal Sapphire
    ribbonColor: '#fbbf24', // Gold
  },
  {
    index: 2,
    position: [-48, 0, -30],
    rotation: [0, (3 * Math.PI) / 4, 0], 
    title: 'Xtra-Wallet go to beta Hypercare',
    sentence: 'Alpha fixes: bugs and issues from the Alpha resolved and included in the Beta release',
    sentence2: 'Hypercare: daily follow-up, incident fixes and weekly report',
    businessValue: 10,
    status: 'COMMITTED',
    wrapColor: '#059669', 
    ribbonColor: '#fde047',
  },
  {
    index: 3,
    position: [-30, 0, -14],
    rotation: [0, (-3 * Math.PI) / 4, 0], // Rotated to face West-South-West directly toward incoming car from CP2!
    title: 'Xtra-Wallet: Payment History',
    sentence: 'Show payment history of all the payments done by XTRA(Wallet + CG-SDD)',
    sentence2: '',
    businessValue: 7,
    status: 'COMMITTED',
    wrapColor: '#9333ea', 
    ribbonColor: '#00f5ff', 
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
            sentence2={obj.sentence2}
            businessValue={obj.businessValue}
            status={obj.status}
            wrapColor={obj.wrapColor}
            ribbonColor={obj.ribbonColor}
          />
        );
      })}
    </group>
  );
}
