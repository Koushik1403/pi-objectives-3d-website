import React, { useRef, useEffect, useState } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// ========================================================
// 📸 TEAM GROUP PHOTO CONFIGURATION
// Place your real group photo file at: public/team-photo.png (or .svg / .jpg)
// ========================================================
export const TEAM_PHOTO_URL = '/team-photo.svg';

// Placed on the East / Right side: Perfectly SIDE BY SIDE with PI Objectives Land [-30, 0, -30]
const LAND_CENTER = [32, 0, -30];

export function TeamLand() {
  const [texture, setTexture] = useState(null);

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
          GRAND 3D TEAM GROUP PHOTO GALLERY STAGE (CLEAN WHITE STUDIO DESIGN)
          Facing South towards incoming visitors driving from Central Roundabout & PI Objectives
         ======================================================== */}
      <group position={[0, 4.6, -6]} rotation={[0, 0, 0]}>
        {/* Architectural White & Acrylic Gallery Frame (ZERO BLACK BOARD) */}
        <mesh position={[0, 0, -0.22]} castShadow>
          <boxGeometry args={[14.4, 8.6, 0.35]} />
          <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />
        </mesh>

        {/* Glowing Electric Cyan Ambient Bezel Trim */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[14.0, 8.2, 0.06]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Inner White Matte Mounting Surface */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[13.6, 7.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.05} />
        </mesh>

        {/* Team Group Photo Surface */}
        {texture && (
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[13.4, 7.6]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
        )}

        {/* Sleek Polished Silver / White Pillar Pedestals */}
        <mesh position={[-5.8, -3.2, -0.2]} castShadow>
          <boxGeometry args={[0.5, 5.0, 0.5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[5.8, -3.2, -0.2]} castShadow>
          <boxGeometry args={[0.5, 5.0, 0.5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Floating Top 3D Header: Pure Clean Dark Navy on White */}
        <group position={[0, 4.9, 0.2]}>
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

        {/* Warm Stage Spotlights */}
        <pointLight position={[-4, 4, 3]} intensity={2.2} distance={14} color="#ffffff" />
        <pointLight position={[4, 4, 3]} intensity={2.2} distance={14} color="#ffffff" />
        <pointLight position={[0, 1, 4]} intensity={2.5} distance={16} color="#38bdf8" />
      </group>
    </group>
  );
}
