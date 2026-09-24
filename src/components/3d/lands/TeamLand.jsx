import React, { useRef, useEffect, useState } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// ========================================================
// 📸 TEAM GROUP PHOTO CONFIGURATION
// Place your real group photo file at: public/team-photo.png (or .jpg)
// Or update this URL to any local / web image path:
// ========================================================
export const TEAM_PHOTO_URL = '/team-photo.png';

const LAND_CENTER = [0, 0, 40];

export function TeamLand() {
  const [texture, setTexture] = useState(null);

  // Load team group photo texture with smooth procedural fallback
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
        // Fallback procedural canvas texture if file is not found
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 900;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 1600, 900);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.5, '#1e293b');
          grad.addColorStop(1, '#090d16');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1600, 900);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TEAM ABU • Q4 2026', 800, 180);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 64px sans-serif';
          ctx.fillText('AGILE PI PLANNING CREW', 800, 260);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 28px sans-serif';
          ctx.fillText('Drop your team group photo into public/team-photo.png', 800, 520);

          const fallbackTex = new THREE.CanvasTexture(canvas);
          fallbackTex.colorSpace = THREE.SRGBColorSpace;
          setTexture(fallbackTex);
        }
      }
    );
  }, []);

  return (
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

      {/* ========================================================
          GRAND 3D TEAM GROUP PHOTO BILLBOARD STAGE
          Facing North towards incoming visitors driving from roundabout
         ======================================================== */}
      <group position={[0, 4.6, 6]}>
        {/* Architectural Back Support Frame */}
        <mesh position={[0, 0, -0.25]} castShadow>
          <boxGeometry args={[14.2, 8.4, 0.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Glowing Ambient Outer Bezel */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[13.8, 8.0, 0.05]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Inner Canvas Mount */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[13.4, 7.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.1} />
        </mesh>

        {/* Team Group Photo Surface */}
        {texture && (
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[13.2, 7.4]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
        )}

        {/* Stage Dual Pillar Uprights */}
        <mesh position={[-5.8, -3.2, -0.2]} castShadow>
          <boxGeometry args={[0.6, 5.0, 0.6]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[5.8, -3.2, -0.2]} castShadow>
          <boxGeometry args={[0.6, 5.0, 0.6]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Floating Top 3D Header */}
        <group position={[0, 4.7, 0.2]}>
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

        {/* Bottom Banner 3D Caption */}
        <group position={[0, -4.2, 0.2]}>
          <Text
            fontSize={0.42}
            color="#0284c7"
            fontWeight={800}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.04}
          >
            AGILE PI PLANNING TEAM SHOWCASE • DELIVERING EXCELLENCE
          </Text>
        </group>

        {/* Warm Stage Spotlights */}
        <pointLight position={[-4, 4, 3]} intensity={2.2} distance={12} color="#ffffff" />
        <pointLight position={[4, 4, 3]} intensity={2.2} distance={12} color="#ffffff" />
        <pointLight position={[0, 1, 4]} intensity={2.5} distance={14} color="#38bdf8" />
      </group>
    </group>
  );
}
