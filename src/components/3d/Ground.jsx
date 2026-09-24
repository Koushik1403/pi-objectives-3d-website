import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Grid, Text } from '@react-three/drei';

export function Ground() {
  return (
    <group>
      {/* Physics Floor & Boundaries */}
      <RigidBody type="fixed" friction={1.2} restitution={0.1}>
        <CuboidCollider args={[100, 1, 100]} position={[0, -1, 0]} />
        {/* Invisible Boundary Colliders */}
        <CuboidCollider args={[1, 10, 100]} position={[-75, 5, 0]} />
        <CuboidCollider args={[1, 10, 100]} position={[75, 5, 0]} />
        <CuboidCollider args={[100, 10, 1]} position={[0, 5, -75]} />
        <CuboidCollider args={[100, 10, 1]} position={[0, 5, 75]} />
      </RigidBody>

      {/* Main Ground Mesh - Soothing Bright White Studio Floor */}
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Crisp Light Studio Grid Overlay */}
      <Grid
        position={[0, 0.008, 0]}
        args={[180, 180]}
        cellSize={2.5}
        cellThickness={0.7}
        cellColor="#e2e8f0"
        sectionSize={12}
        sectionThickness={1.2}
        sectionColor="#cbd5e1"
        fadeDistance={105}
        fadeStrength={1.2}
      />

      {/* ========================================================
          1. CENTRAL HUB: TEAM ABU LAUNCH ROUNDABOUT (WHITE THEME)
         ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Outer Checkered Kerb Ring (Rumble Strips) */}
        <KerbRing radius={11.5} width={0.9} count={28} />

        {/* Central Clean White Roundabout Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} receiveShadow>
          <circleGeometry args={[11, 48]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Concentric Vibrant Modern Rings */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
          <ringGeometry args={[10.3, 10.6, 48]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.019, 0]}>
          <ringGeometry args={[6.8, 7.1, 48]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[2.8, 3.0, 32]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Bold Painted Typography on Asphalt (High contrast dark text on white) */}
        <Text
          position={[0, 0.025, 0.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={1.3}
          color="#0f172a"
          fontWeight={900}
          anchorX="center"
          anchorY="middle"
        >
          START
        </Text>


        {/* Starting Grid Launch Box */}
        <group position={[0, 0.024, 0]}>
          {/* Grid Box Border */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.6, 4.4]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.15} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          2. HIGHWAY TO PI OBJECTIVES LAND (North-West)
         ======================================================== */}
      <group position={[-18, 0, -32]} rotation={[0, Math.PI / 4.8, 0]}>
        {/* Crisp Light-Gray Asphalt Road Ribbon */}
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6.5, 46]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        {/* Vibrant Blue Curb Strips */}
        <mesh position={[-3.3, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 46]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[3.3, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 46]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        {/* Dashed Center Dividing Lines */}
        <DashedRoadLine length={42} color="#ffffff" />
      </group>

      {/* ========================================================
          3. HIGHWAY TO OUR TEAM PLAZA (North-East, Symmetrical to Highway 2)
         ======================================================== */}
      <group position={[18, 0, -20]} rotation={[0, -Math.PI / 4.8, 0]}>
        {/* Crisp Light-Gray Asphalt Road Ribbon */}
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6.5, 36]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        {/* Vibrant Orange Curb Strips */}
        <mesh position={[-3.3, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 36]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
        <mesh position={[3.3, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 36]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
        {/* Dashed Center Dividing Lines */}
        <DashedRoadLine length={32} color="#ffffff" />
      </group>

      {/* ========================================================
          4. CROSS BOULEVARD CONNECTING PI OBJECTIVES AND TEAM LAND
         ======================================================== */}
      <group position={[1, 0, -30]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6.5, 32]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[-3.3, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 32]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[3.3, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 32]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
        <DashedRoadLine length={28} color="#ffffff" />
      </group>

      {/* ========================================================
          5. FUTURISTIC STREETLAMPS ALONG HIGHWAYS
         ======================================================== */}
      <StreetLamp position={[-8, 0, -8]} rotation={[0, Math.PI / 4, 0]} color="#0284c7" />
      <StreetLamp position={[-16, 0, -18]} rotation={[0, Math.PI / 4, 0]} color="#0284c7" />
      <StreetLamp position={[8, 0, -8]} rotation={[0, -Math.PI / 4, 0]} color="#f97316" />
      <StreetLamp position={[16, 0, -18]} rotation={[0, -Math.PI / 4, 0]} color="#f97316" />

      {/* ========================================================
          6. STADIUM PERIMETER BARRIER WALLS (CLEAN WHITE CONCRETE)
         ======================================================== */}
      <ArenaBarrierWall position={[-65, 0, 0]} rotation={[0, Math.PI / 2, 0]} length={130} />
      <ArenaBarrierWall position={[65, 0, 0]} rotation={[0, -Math.PI / 2, 0]} length={130} />
      <ArenaBarrierWall position={[0, 0, -65]} rotation={[0, 0, 0]} length={130} />
      <ArenaBarrierWall position={[0, 0, 65]} rotation={[0, Math.PI, 0]} length={130} />
    </group>
  );
}

// Dashed White Line Divider Component
function DashedRoadLine({ length = 30, color = '#ffffff' }) {
  const dashCount = Math.floor(length / 3);
  const dashes = Array.from({ length: dashCount }, (_, i) => i);

  return (
    <group position={[0, 0.024, 0]}>
      {dashes.map((i) => {
        const offset = -length / 2 + i * 3 + 1;
        return (
          <mesh key={i} position={[0, 0, offset]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.24, 1.6]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

// Checkered Racing Kerb / Rumble Strip Ring
function KerbRing({ radius = 11.5, width = 0.8, count = 32 }) {
  const items = Array.from({ length: count }, (_, i) => i);
  const angleStep = (Math.PI * 2) / count;

  return (
    <group position={[0, 0.015, 0]}>
      {items.map((i) => {
        const angle = i * angleStep;
        const isRed = i % 2 === 0;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <mesh
            key={i}
            position={[x, 0, z]}
            rotation={[-Math.PI / 2, 0, -angle]}
          >
            <planeGeometry args={[width, 1.4]} />
            <meshStandardMaterial
              color={isRed ? '#ef4444' : '#ffffff'}
              roughness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Cyber Streetlamp Component with Glowing Fixture & Light Pool
function StreetLamp({ position, rotation = [0, 0, 0], color = '#0284c7' }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Curved Pole (Clean Silver) */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 5.0, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Horizontal Arm */}
      <mesh position={[0.6, 4.8, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[1.4, 0.08, 0.08]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} />
      </mesh>
      {/* Light Head */}
      <mesh position={[1.2, 4.5, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.25]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Glowing Light Pool on Road */}
      <mesh position={[1.2, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// Stadium Perimeter Barrier Wall (Clean White Concrete with Hazard Striping)
function ArenaBarrierWall({ position, rotation = [0, 0, 0], length = 120 }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Concrete Barrier Base - Clean Bright White */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 1.2, 0.8]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Glowing Top Rail */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[length, 0.1, 0.15]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
      {/* Warning Hazard Base Stripe */}
      <mesh position={[0, 0.2, 0.42]}>
        <boxGeometry args={[length, 0.25, 0.05]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
}
