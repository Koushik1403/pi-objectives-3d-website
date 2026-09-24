import React, { useRef, useEffect, useState } from 'react';
import { Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { usePortfolioStore, portfolioActions, getPortfolioState } from '../../../store/usePortfolioStore';
import { sounds } from '../../../audio/soundEffects';

// ========================================================
// 📸 TEAM GROUP PHOTO CONFIGURATION
// Place your real group photo file at: public/team-photo.png (or .svg / .jpg)
// ========================================================
export const TEAM_PHOTO_URL = '/team-photo.jpeg';

// Placed on the East / Right side: Perfectly SIDE BY SIDE with PI Objectives Land [-30, 0, -30]
const LAND_CENTER = [32, 0, -30];

export function TeamLand() {
  const [texture, setTexture] = useState(null);
  const teamPhotoOpened = usePortfolioStore((s) => s.teamPhotoOpened);

  const openProgress = useRef(teamPhotoOpened ? 1 : 0);
  const lidRef = useRef(null);
  const frontFlapRef = useRef(null);
  const backFlapRef = useRef(null);
  const leftFlapRef = useRef(null);
  const rightFlapRef = useRef(null);
  const cornerPillarsRef = useRef(null);
  const stageRef = useRef(null);
  const beaconRef = useRef(null);
  const isTriggeredRef = useRef(false);

  // Load team group photo texture with pristine bright procedural canvas fallback
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      TEAM_PHOTO_URL,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTex);
      },
      undefined,
      () => {
        // Fallback procedural canvas texture if file is not found (Bright Studio Theme - NO BLACK)
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 900;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 1600, 900);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.6, '#f0f9ff');
          grad.addColorStop(1, '#e0f2fe');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1600, 900);

          // Top Header
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TEAM ABU • Q4 2026', 800, 140);

          ctx.fillStyle = '#0f172a';
          ctx.font = '900 56px sans-serif';
          ctx.fillText('AGILE PI PLANNING CREW', 800, 220);

          ctx.fillStyle = '#64748b';
          ctx.font = '600 24px sans-serif';
          ctx.fillText('Official Engineering & Product Squad Showcase', 800, 270);

          // 6 Avatar Cards
          const names = ['Alex Rivera', 'Marcus Thorne', 'Abu Bakr', 'Sarah Patel', 'Elena Chen', 'Devon Kim'];
          const roles = ['Cloud Architect', 'AI Agent Lead', 'Team Abu Lead', 'Product Owner', '3D WebGL Dev', 'Scrum Master'];
          const colors = ['#0284c7', '#10b981', '#f59e0b', '#0284c7', '#8b5cf6', '#06b6d4'];
          const initials = ['AR', 'MT', 'AB', 'SP', 'EC', 'DK'];
          const startX = 260;
          const spacing = 215;

          names.forEach((name, i) => {
            const cx = startX + i * spacing;
            const cy = 520;
            // Card background
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(2, 132, 199, 0.15)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 6;
            ctx.beginPath();
            ctx.roundRect(cx - 85, cy - 130, 170, 260, 20);
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Avatar Circle
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(cx, cy - 50, 44, 0, Math.PI * 2);
            ctx.fill();

            // Initials
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 26px sans-serif';
            ctx.fillText(initials[i], cx, cy - 41);

            // Name
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText(name, cx, cy + 45);

            // Role
            ctx.fillStyle = colors[i];
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(roles[i], cx, cy + 70);
          });

          // Bottom caption
          ctx.fillStyle = '#475569';
          ctx.font = '600 18px sans-serif';
          ctx.fillText('📸 Replace mock photo in public/team-photo.png', 800, 830);

          const fallbackTex = new THREE.CanvasTexture(canvas);
          fallbackTex.colorSpace = THREE.SRGBColorSpace;
          setTexture(fallbackTex);
        }
      }
    );
  }, []);

  const handleHit = () => {
    if (isTriggeredRef.current || teamPhotoOpened) return;
    isTriggeredRef.current = true;
    if (getPortfolioState().audioEnabled) {
      sounds.celebration();
    }
    // Transition store state to unlocked and align car facing the photo
    setTimeout(() => {
      portfolioActions.openTeamPhoto();
    }, 0);
  };

  // 60 FPS animation loop: handles proximity hit detection + smooth box unwrap & photo rise from down to up!
  useFrame((_, delta) => {
    const { carPosition } = getPortfolioState();

    // Proximity hit detection backup (world pos [32, 0, -36])
    if (carPosition) {
      const dx = carPosition.x - 32;
      const dz = carPosition.z - (-36);
      const distSq = dx * dx + dz * dz;

      if (distSq < 48 && !isTriggeredRef.current && !teamPhotoOpened) {
        handleHit();
      } else if (distSq > 64) {
        isTriggeredRef.current = false;
      }
    }

    // Smooth unwrap interpolation (lerps between 0 and 1)
    const targetP = teamPhotoOpened ? 1 : 0;
    openProgress.current = THREE.MathUtils.lerp(openProgress.current, targetP, delta * 3.2);
    const p = openProgress.current;

    // 1. Animate Lid: lifts up high and tilts back
    if (lidRef.current) {
      lidRef.current.position.y = 4.0 + p * 6.2;
      lidRef.current.position.z = -6.0 - p * 4.6;
      lidRef.current.rotation.x = -p * 1.6;
    }

    // 2. Animate 4 Walls: Hinge open and fold flat 90 degrees onto the ground
    const foldAngle = p * (Math.PI / 2);
    if (frontFlapRef.current) frontFlapRef.current.rotation.x = foldAngle;
    if (backFlapRef.current) backFlapRef.current.rotation.x = -foldAngle;
    if (leftFlapRef.current) leftFlapRef.current.rotation.z = foldAngle;
    if (rightFlapRef.current) rightFlapRef.current.rotation.z = -foldAngle;

    // 3. Corner Pillars: Contract into floor
    if (cornerPillarsRef.current) {
      const pillarScale = Math.max(0, 1 - p * 1.4);
      cornerPillarsRef.current.scale.set(1, pillarScale, 1);
      cornerPillarsRef.current.visible = pillarScale > 0.01;
    }

    // 4. THE TEAM PHOTO GALLERY STAGE: RISES FROM DOWN TO UP!
    if (stageRef.current) {
      // Starts recessed down at y = 0.2 inside the present box, elevates smoothly to 4.6 display height
      stageRef.current.position.y = THREE.MathUtils.lerp(0.2, 4.6, p);
      const s = THREE.MathUtils.lerp(0.2, 1.0, p);
      stageRef.current.scale.set(s, s, s);
      stageRef.current.visible = teamPhotoOpened || p > 0.02;
    }

    // 5. Skyward beacon rotation
    if (beaconRef.current) {
      beaconRef.current.rotation.y += 0.015;
    }
  });

  return (
    <>
      {/* Physical Collider when unopened: Solid obstacle so the car physically HITS the present box! */}
      {!teamPhotoOpened && (
        <RigidBody
          type="fixed"
          colliders={false}
          position={[32, 0, -36]}
          onCollisionEnter={() => handleHit()}
        >
          <CuboidCollider args={[7.8, 2.2, 2.0]} position={[0, 2.2, 0]} />
        </RigidBody>
      )}

      <group position={LAND_CENTER}>
        {/* Land Circular Zone Floor Base - Clean Bright White Studio Pad */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
          <circleGeometry args={[20, 48]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.05} />
        </mesh>

        {/* Decorative Outer Rings */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
          <ringGeometry args={[19.2, 19.8, 48]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
          <ringGeometry args={[13.5, 13.8, 36]} />
          <meshBasicMaterial color="#ffb300" />
        </mesh>

        {/* Elevated Stage Pedestal */}
        <mesh position={[0, 0.1, -6]} receiveShadow>
          <boxGeometry args={[16.0, 0.2, 5.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* ========================================================
            🎁 GRAND FINALE GIFT BOX (WRAPS THE TEAM PHOTO)
           ======================================================== */}
        {/* Skyward Beacon Beam when waiting for player */}
        {!teamPhotoOpened && (
          <group ref={beaconRef} position={[0, 12, -6]}>
            <mesh>
              <cylinderGeometry args={[0.5, 2.0, 24, 16]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.25} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -12 + 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[4.0, 8.0, 32]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
            </mesh>
          </group>
        )}

        {/* Floating Prompt Plaque above unopened box */}
        {!teamPhotoOpened && (
          <Float speed={2.5} rotationIntensity={0.03} floatIntensity={0.25} position={[0, 5.6, -6]}>
            <group>
              <mesh position={[0, 0, -0.02]}>
                <boxGeometry args={[7.2, 1.4, 0.08]} />
                <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
              </mesh>
              <mesh position={[0, 0, -0.01]}>
                <boxGeometry args={[7.28, 1.48, 0.04]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
              <Text
                position={[0, 0.30, 0.06]}
                fontSize={0.40}
                color="#fbbf24"
                fontWeight={900}
                anchorX="center"
                anchorY="middle"
              >
                🎁 TEAM ABU Q4 2026
              </Text>
              <Text
                position={[0, -0.26, 0.06]}
                fontSize={0.26}
                color="#ffffff"
                fontWeight={800}
                anchorX="center"
                anchorY="middle"
              >
                HIT WITH CAR TO UNWRAP TEAM PHOTO! 🏎️📸
              </Text>
            </group>
          </Float>
        )}

        {/* 1. FRONT FLAP (Hinges at bottom front [0, 0, -4.2], folds forward +Z onto ground) */}
        <group position={[0, 0, -4.2]}>
          <group ref={frontFlapRef}>
            <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
              <boxGeometry args={[15.2, 4.0, 0.12]} />
              <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.4} />
            </mesh>
            {/* Gold Ribbon Cross Band */}
            <mesh position={[0, 2.0, 0.07]}>
              <boxGeometry args={[1.4, 4.02, 0.04]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
            </mesh>
          </group>
        </group>

        {/* 2. BACK FLAP (Hinges at bottom back [0, 0, -7.8], folds backward -Z onto ground) */}
        <group position={[0, 0, -7.8]}>
          <group ref={backFlapRef}>
            <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
              <boxGeometry args={[15.2, 4.0, 0.12]} />
              <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.4} />
            </mesh>
            <mesh position={[0, 2.0, -0.07]}>
              <boxGeometry args={[1.4, 4.02, 0.04]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
            </mesh>
          </group>
        </group>

        {/* 3. LEFT FLAP (Hinges at bottom left [-7.6, 0, -6.0], folds left -X onto ground) */}
        <group position={[-7.6, 0, -6.0]}>
          <group ref={leftFlapRef}>
            <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 4.0, 3.6]} />
              <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.4} />
            </mesh>
            <mesh position={[-0.07, 2.0, 0]}>
              <boxGeometry args={[0.04, 4.02, 1.4]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
            </mesh>
          </group>
        </group>

        {/* 4. RIGHT FLAP (Hinges at bottom right [7.6, 0, -6.0], folds right +X onto ground) */}
        <group position={[7.6, 0, -6.0]}>
          <group ref={rightFlapRef}>
            <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 4.0, 3.6]} />
              <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.4} />
            </mesh>
            <mesh position={[0.07, 2.0, 0]}>
              <boxGeometry args={[0.04, 4.02, 1.4]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
            </mesh>
          </group>
        </group>

        {/* 5. CORNER PILLARS (Dissolve into ground on open) */}
        <group ref={cornerPillarsRef}>
          {[-7.6, 7.6].map((x, xi) =>
            [-7.8, -4.2].map((z, zi) => (
              <mesh key={`cp-${xi}-${zi}`} position={[x, 2.0, z]}>
                <boxGeometry args={[0.24, 4.0, 0.24]} />
                <meshStandardMaterial color="#ea580c" roughness={0.4} metalness={0.5} />
              </mesh>
            ))
          )}
        </group>

        {/* 6. GIFT BOX LID (Lifts high into air and tilts backward) */}
        <group ref={lidRef} position={[0, 4.0, -6.0]}>
          <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
            <boxGeometry args={[15.4, 0.32, 3.8]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Gold Ribbons across Lid */}
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[1.4, 0.34, 3.82]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[15.42, 0.34, 1.4]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
          </mesh>

          {/* Grand Rosette Bow on top of the Lid */}
          <group position={[0, 0.60, 0]}>
            <mesh>
              <sphereGeometry args={[0.60, 16, 16]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.8} />
            </mesh>
            {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, i) => (
              <group key={i} rotation={[0, ang, 0]}>
                <mesh position={[0, 0.22, 0.65]} rotation={[0.4, 0, 0]}>
                  <torusGeometry args={[0.55, 0.14, 12, 24]} />
                  <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.22, -0.65]} rotation={[-0.4, 0, 0]}>
                  <torusGeometry args={[0.55, 0.14, 12, 24]} />
                  <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.8} />
                </mesh>
              </group>
            ))}
          </group>
        </group>

        {/* ========================================================
            📸 GRAND 3D TEAM GROUP PHOTO GALLERY STAGE
            RISES SMOOTHLY FROM DOWN TO UP OUT OF THE OPENED BOX!
           ======================================================== */}
        <group ref={stageRef} position={[0, 0.2, -6]} visible={teamPhotoOpened}>
          {/* Heavy Architectural White Gallery Frame */}
          <mesh position={[0, 0, -0.18]} castShadow>
            <boxGeometry args={[14.4, 8.6, 0.24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
          </mesh>

          {/* Crisp Cyan Ambient Bezel Trim */}
          <mesh position={[0, 0, -0.04]}>
            <boxGeometry args={[14.0, 8.2, 0.04]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>

          {/* Inner White Matte Mounting Surface */}
          <mesh position={[0, 0, 0.0]}>
            <planeGeometry args={[13.6, 7.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.05} />
          </mesh>

          {/* Team Group Photo Surface */}
          {texture && (
            <mesh position={[0, 0, 0.04]}>
              <planeGeometry args={[13.4, 7.6]} />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
          )}

          {/* Sleek Chrome Rear Support Columns */}
          <mesh position={[-5.6, -2.4, -0.42]}>
            <boxGeometry args={[0.55, 6.2, 0.35]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.8} />
          </mesh>
          <mesh position={[5.6, -2.4, -0.42]}>
            <boxGeometry args={[0.55, 6.2, 0.35]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.8} />
          </mesh>

          {/* Solid Chrome Floor Anchor Pedestal Feet */}
          <mesh position={[-5.6, -4.5, -0.42]}>
            <boxGeometry args={[1.4, 0.24, 1.6]} />
            <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[5.6, -4.5, -0.42]}>
            <boxGeometry args={[1.4, 0.24, 1.6]} />
            <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.9} />
          </mesh>

          {/* Floating Top 3D Header: Pure Clean Dark Navy on White */}
          <group position={[0, 4.9, 0.15]}>
            <Text
              fontSize={0.85}
              color="#0f172a"
              fontWeight={900}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.06}
            >
              TEAM ABU • Q4 2026
            </Text>
          </group>

          {/* Celebratory Unwrapped Banner above stage */}
          <Float speed={2.5} rotationIntensity={0.02} floatIntensity={0.2} position={[0, 5.8, 0.3]}>
            <Text
              fontSize={0.38}
              color="#f59e0b"
              fontWeight={900}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.05}
            >
              🏆 MISSION ACCOMPLISHED • ALL OBJECTIVES UNLOCKED! 🚀
            </Text>
          </Float>
        </group>
      </group>
    </>
  );
}
