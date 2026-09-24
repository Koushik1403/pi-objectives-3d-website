import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { getPortfolioState, portfolioActions } from '../../store/usePortfolioStore';
import { sounds } from '../../audio/soundEffects';

// Arcade Car Physics Constants
const ACCELERATION = 38.0;
const REVERSE_ACCEL = 32.0;
const MAX_SPEED = 30.0;
const STEER_SPEED = 2.55; // Responsive, crisp, agile steering
const BRAKE_DECEL = 0.88;

export function Car() {
  const rigidBodyRef = useRef(null);
  const visualGroupRef = useRef(null);

  // Steering knuckle refs (swivels Y) and wheel spin refs (rolls X)
  const frontLeftSteerRef = useRef(null);
  const frontRightSteerRef = useRef(null);
  const frontLeftSpinRef = useRef(null);
  const frontRightSpinRef = useRef(null);
  const rearLeftSpinRef = useRef(null);
  const rearRightSpinRef = useRef(null);

  // Keyboard input state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  // Smooth steering angle for front wheels
  const steerAngle = useRef(0);
  const wheelSpin = useRef(0);

  // Teleportation active flag to prevent input conflict
  const isTeleportingAnim = useRef(false);

  // Register keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture inputs if user is typing in any input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const st = getPortfolioState();
      // If viewing an objective board and pressing forward/space, smoothly advance & zoom out
      if (st.activeObjectiveIndex && (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space')) {
        const nextIdx = st.activeObjectiveIndex < 3 ? st.activeObjectiveIndex + 1 : 4;
        portfolioActions.advanceToNextObjective(nextIdx);
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'Space':
          keys.current.brake = true;
          break;
        case 'KeyR':
          // Reset car position
          resetCar();
          break;
        case 'KeyM':
          // Toggle map
          {
            const st = getPortfolioState();
            if (st.activeModal === 'map') {
              portfolioActions.closeModal();
            } else {
              portfolioActions.openMap();
              if (st.audioEnabled) sounds.click();
            }
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'Space':
          keys.current.brake = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetCar = (x = 0, y = 1.0, z = 0) => {
    if (!rigidBodyRef.current) return;
    rigidBodyRef.current.setTranslation({ x, y, z }, true);
    rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    const initialRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
    rigidBodyRef.current.setRotation(initialRot, true);
  };

  // Teleportation listener
  useEffect(() => {
    let checkInterval = setInterval(() => {
      const state = getPortfolioState();
      if (state.isTeleporting && state.teleportTarget && !isTeleportingAnim.current) {
        executeTeleport(state.teleportTarget);
      }
    }, 50);

    return () => clearInterval(checkInterval);
  }, []);

  const executeTeleport = (target) => {
    if (!rigidBodyRef.current) return;
    isTeleportingAnim.current = true;

    if (getPortfolioState().audioEnabled) {
      sounds.teleport();
    }

    const currentPos = rigidBodyRef.current.translation();
    const currentRot = rigidBodyRef.current.rotation();
    const startQuat = new THREE.Quaternion(
      currentRot.x,
      currentRot.y,
      currentRot.z,
      currentRot.w
    );

    const animProxy = {
      x: currentPos.x,
      y: currentPos.y + 0.5,
      z: currentPos.z,
      progress: 0,
    };

    // Kill existing momentum
    rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

    // Calculate heading toward land center or use explicit target heading
    const targetHeading = target.heading !== undefined ? target.heading : Math.atan2(-target.x, -target.z);
    const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetHeading);

    // Smoothly animate car translation and continuous rotation slerp using GSAP
    gsap.to(animProxy, {
      x: target.x,
      y: target.y || 0.8,
      z: target.z,
      progress: 1,
      duration: 1.3,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (rigidBodyRef.current) {
          rigidBodyRef.current.setTranslation(
            { x: animProxy.x, y: animProxy.y, z: animProxy.z },
            true
          );
          // Continuous smooth rotation slerp: car turns fluidly towards the destination
          const curQuat = startQuat.clone().slerp(targetQuat, animProxy.progress);
          rigidBodyRef.current.setRotation(curQuat, true);
          rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
      },
      onComplete: () => {
        if (rigidBodyRef.current) {
          rigidBodyRef.current.setTranslation({ x: target.x, y: 0.8, z: target.z }, true);
          rigidBodyRef.current.setRotation(targetQuat, true);
          rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
        isTeleportingAnim.current = false;
        portfolioActions.finishTeleport();
      },
    });
  };

  // Per-frame physics update & wheel animation
  useFrame((_, delta) => {
    if (!rigidBodyRef.current || isTeleportingAnim.current) return;

    const { activeObjectiveIndex } = getPortfolioState();
    // When viewing an objective board, park car solidly in place
    if (activeObjectiveIndex) {
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const rb = rigidBodyRef.current;
    const translation = rb.translation();
    const rotation = rb.rotation();
    const linvel = rb.linvel();

    // Calculate car forward vector from current quaternion
    const carQuat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(carQuat);

    // Current forward speed (scalar projection)
    const currentVelocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z);
    let speed = forwardVec.dot(currentVelocity);

    // 1. Snappy Arcade Acceleration, Reversing & Braking
    if (keys.current.forward) {
      speed += 38.0 * delta;
      if (speed > MAX_SPEED) speed = MAX_SPEED;
    } else if (keys.current.backward) {
      if (speed > 0.2) {
        speed -= 55.0 * delta;
        if (speed < 0) speed = 0;
      } else {
        speed -= 32.0 * delta;
        if (speed < -24.0) speed = -24.0;
      }
    } else {
      speed = THREE.MathUtils.lerp(speed, 0, delta * 2.4);
      if (Math.abs(speed) < 0.05) speed = 0;
    }

    // Handbrake (Spacebar)
    if (keys.current.brake) {
      speed = THREE.MathUtils.lerp(speed, 0, delta * 10.0);
      if (Math.abs(speed) < 0.1) speed = 0;
    }

    // 2. Smooth Agile Steering
    let targetSteer = 0;
    if (keys.current.left) targetSteer += 0.58;
    if (keys.current.right) targetSteer -= 0.58;

    steerAngle.current = THREE.MathUtils.lerp(steerAngle.current, targetSteer, delta * 13);

    const speedAbs = Math.abs(speed);
    const motionFactor = Math.min(speedAbs * 0.24 + 0.60, 1.15);
    const reverseFactor = speed < -0.2 ? -1 : 1;
    const steerDirection = keys.current.left ? 1 : (keys.current.right ? -1 : 0);
    const targetTurnRate = steerDirection * 2.55 * motionFactor * reverseFactor;

    const currentAngvel = rb.angvel();
    const nextAngvelY = THREE.MathUtils.lerp(
      currentAngvel.y,
      targetTurnRate,
      THREE.MathUtils.clamp(delta * 12.0, 0, 1)
    );
    rb.setAngvel({ x: 0, y: nextAngvelY, z: 0 }, true);

    // 3. Direct Velocity Application
    const newHorizVel = forwardVec.clone().multiplyScalar(speed);
    rb.setLinvel({
      x: newHorizVel.x,
      y: linvel.y,
      z: newHorizVel.z,
    }, true);

    // Keep car grounded and upright
    if (translation.y > 2.2) {
      rb.applyImpulse({ x: 0, y: -3.0, z: 0 }, true);
    }

    // 4. Wheel Rolling Animation
    const effectiveRadius = 0.54;
    wheelSpin.current += (speed / effectiveRadius) * delta;

    // Front wheels steer on Y
    if (frontLeftSteerRef.current && frontRightSteerRef.current) {
      frontLeftSteerRef.current.rotation.y = steerAngle.current;
      frontRightSteerRef.current.rotation.y = steerAngle.current;
    }

    // All 4 wheels spin on X
    if (frontLeftSpinRef.current) frontLeftSpinRef.current.rotation.x = -wheelSpin.current;
    if (frontRightSpinRef.current) frontRightSpinRef.current.rotation.x = -wheelSpin.current;
    if (rearLeftSpinRef.current) rearLeftSpinRef.current.rotation.x = -wheelSpin.current;
    if (rearRightSpinRef.current) rearRightSpinRef.current.rotation.x = -wheelSpin.current;

    const horizontalSpeed = Math.abs(speed);
    const kmh = Math.round(horizontalSpeed * 3.6);

    const speedEl = document.getElementById('hud-speed-num');
    if (speedEl && speedEl.textContent !== String(kmh)) {
      speedEl.textContent = String(kmh);
    }
    const speedBarEl = document.getElementById('hud-speed-bar-fill');
    if (speedBarEl) {
      speedBarEl.style.width = `${Math.min(100, (kmh / 85) * 100)}%`;
    }

    const euler = new THREE.Euler().setFromQuaternion(carQuat, 'YXZ');
    portfolioActions.updateTelemetry(
      kmh,
      { x: translation.x, y: translation.y, z: translation.z },
      euler.y
    );

    const { audioEnabled } = getPortfolioState();
    const isBraking = keys.current.brake || (keys.current.backward && speed > 0.5);
    const isReversing = speed < -0.2;
    sounds.updateEngine(speed, keys.current.forward, isBraking, isReversing, audioEnabled);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      position={[0, 1.05, 0]}
      mass={260}
      linearDamping={0.8}
      angularDamping={0.5}
      enabledRotations={[false, true, false]}
      name="player-car"
    >
      {/* Scaled Physics Box Collider for lifted monster truck chassis */}
      <CuboidCollider args={[1.25, 0.58, 2.1]} position={[0, 0.72, 0]} />

      {/* ========================================================
          CYBER RED TROPHY OFF-ROADER / MONSTER 4X4
          Modeled accurately after the user reference image
         ======================================================== */}
      <group ref={visualGroupRef} position={[0, 0.05, 0]}>
        {/* Glowing Magenta / Purple Cockpit & Chassis Underglow */}
        <pointLight color="#d946ef" intensity={4.5} distance={5.0} position={[0, 1.1, -0.1]} />
        <pointLight color="#e11d48" intensity={2.8} distance={4.5} position={[0, 0.25, 0]} />

        {/* 1. LOWER FRAME / LIFTED CHASSIS BASE (Dark Charcoal) */}
        <mesh position={[0, 0.44, 0]} castShadow>
          <boxGeometry args={[1.72, 0.24, 3.4]} />
          <meshStandardMaterial color="#18181b" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Front & Rear Heavy Crossmembers / Skid Plates */}
        <mesh position={[0, 0.38, -1.65]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[1.5, 0.12, 0.5]} />
          <meshStandardMaterial color="#27272a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.40, 1.65]} rotation={[-0.25, 0, 0]}>
          <boxGeometry args={[1.5, 0.12, 0.5]} />
          <meshStandardMaterial color="#27272a" roughness={0.8} />
        </mesh>

        {/* 2. CHUNKY FRONT BUMPER WITH VERTICAL SLOTTED GRILLE */}
        <group position={[0, 0.52, -1.82]}>
          {/* Main Front Bumper Bar */}
          <mesh castShadow>
            <boxGeometry args={[2.08, 0.38, 0.36]} />
            <meshStandardMaterial color="#18181b" roughness={0.75} metalness={0.2} />
          </mesh>

          {/* Lower Grille Cutout Frame */}
          <mesh position={[0, -0.06, 0.14]}>
            <boxGeometry args={[1.22, 0.24, 0.12]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>

          {/* 7 Vertical Grille Slats (from reference image) */}
          {[-0.45, -0.30, -0.15, 0, 0.15, 0.30, 0.45].map((xOffset, i) => (
            <mesh key={i} position={[xOffset, -0.06, 0.18]}>
              <cylinderGeometry args={[0.024, 0.024, 0.22, 8]} />
              <meshStandardMaterial color="#3f3f46" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}

          {/* Amber / Orange Rectangular Corner Marker Lights */}
          <mesh position={[-0.88, 0.06, 0.18]}>
            <boxGeometry args={[0.18, 0.10, 0.04]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
          <mesh position={[0.88, 0.06, 0.18]}>
            <boxGeometry args={[0.18, 0.10, 0.04]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>

        {/* 3. VIBRANT CRIMSON RED HOOD & FRONT NOSE */}
        <group position={[0, 0.88, -1.22]}>
          {/* Main Slanted Red Hood Slab */}
          <mesh rotation={[0.22, 0, 0]} castShadow>
            <boxGeometry args={[1.82, 0.32, 1.25]} />
            <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.3} />
          </mesh>

          {/* Dark Charcoal Hood Side Chamfers */}
          <mesh position={[-0.92, 0, 0]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[0.12, 0.28, 1.22]} />
            <meshStandardMaterial color="#18181b" roughness={0.7} />
          </mesh>
          <mesh position={[0.92, 0, 0]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[0.12, 0.28, 1.22]} />
            <meshStandardMaterial color="#18181b" roughness={0.7} />
          </mesh>

          {/* Hood Center Cowl Accent */}
          <mesh position={[0, 0.17, -0.05]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[0.65, 0.06, 0.85]} />
            <meshStandardMaterial color="#18181b" roughness={0.6} />
          </mesh>
        </group>

        {/* 4. HEAVY ANGULAR WHEEL ARCH FLARES (Front & Rear Fenders) */}
        {/* Front Left Fender */}
        <mesh position={[-1.12, 0.74, -1.25]} castShadow>
          <boxGeometry args={[0.38, 0.44, 0.98]} />
          <meshStandardMaterial color="#18181b" roughness={0.75} />
        </mesh>
        {/* Front Right Fender */}
        <mesh position={[1.12, 0.74, -1.25]} castShadow>
          <boxGeometry args={[0.38, 0.44, 0.98]} />
          <meshStandardMaterial color="#18181b" roughness={0.75} />
        </mesh>
        {/* Rear Left Fender */}
        <mesh position={[-1.12, 0.82, 1.25]} castShadow>
          <boxGeometry args={[0.38, 0.52, 1.15]} />
          <meshStandardMaterial color="#18181b" roughness={0.75} />
        </mesh>
        {/* Rear Right Fender */}
        <mesh position={[1.12, 0.82, 1.25]} castShadow>
          <boxGeometry args={[0.38, 0.52, 1.15]} />
          <meshStandardMaterial color="#18181b" roughness={0.75} />
        </mesh>

        {/* 5. OPEN COCKPIT & ANGULAR ROLL CAGE PILLARS */}
        {/* Dark Interior Floor / Cockpit Tub */}
        <mesh position={[0, 0.76, 0]}>
          <boxGeometry args={[1.72, 0.28, 2.0]} />
          <meshStandardMaterial color="#09090b" roughness={0.9} />
        </mesh>

        {/* A-Pillars (Angled Front Roll Cage Struts) */}
        <mesh position={[-0.82, 1.34, -0.74]} rotation={[0.38, 0, -0.08]} castShadow>
          <boxGeometry args={[0.12, 0.95, 0.12]} />
          <meshStandardMaterial color="#18181b" roughness={0.6} metalness={0.7} />
        </mesh>
        <mesh position={[0.82, 1.34, -0.74]} rotation={[0.38, 0, 0.08]} castShadow>
          <boxGeometry args={[0.12, 0.95, 0.12]} />
          <meshStandardMaterial color="#18181b" roughness={0.6} metalness={0.7} />
        </mesh>

        {/* Top Brow Crossbar & Red LED Visor Light Strip */}
        <mesh position={[0, 1.70, -0.56]}>
          <boxGeometry args={[1.74, 0.14, 0.14]} />
          <meshStandardMaterial color="#18181b" roughness={0.6} metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.68, -0.48]}>
          <boxGeometry args={[1.42, 0.04, 0.03]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>

        {/* Windshield Glass (Slightly Tinted Transparent) */}
        <mesh position={[0, 1.32, -0.72]} rotation={[0.38, 0, 0]}>
          <planeGeometry args={[1.56, 0.82]} />
          <meshStandardMaterial
            color="#3b0764"
            roughness={0.1}
            metalness={0.3}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* ========================================================
            6. 🔮 THREE GLOWING PURPLE TRIANGULAR ENERGY PRISMS
            Inside the cockpit, exactly matching the user's image!
           ======================================================== */}
        {/* Front-Left Glowing Triangular Prism */}
        <GlowingTriangularPrism position={[-0.45, 1.08, -0.28]} rotation={[0, 0.15, 0]} />

        {/* Front-Right Glowing Triangular Prism */}
        <GlowingTriangularPrism position={[0.45, 1.08, -0.28]} rotation={[0, -0.15, 0]} />

        {/* Center-Rear Glowing Triangular Prism */}
        <GlowingTriangularPrism position={[0, 1.16, 0.22]} rotation={[0, Math.PI, 0]} scale={1.12} />

        {/* 7. ARMORED RED DOORS WITH DUAL VERTICAL RECESSED WINDOW SLITS */}
        {/* Left Side Door Panel */}
        <group position={[-0.92, 1.25, 0.32]}>
          {/* Main Red Door Armor */}
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.88, 1.48]} />
            <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.3} />
          </mesh>
          {/* Recessed Window Slit 1 (Front) */}
          <mesh position={[-0.07, 0.12, -0.32]}>
            <boxGeometry args={[0.04, 0.44, 0.24]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          <mesh position={[-0.08, 0.12, -0.32]}>
            <planeGeometry args={[0.22, 0.42]} rotation={[0, -Math.PI / 2, 0]} />
            <meshBasicMaterial color="#09090b" />
          </mesh>
          {/* Recessed Window Slit 2 (Rear) */}
          <mesh position={[-0.07, 0.12, 0.32]}>
            <boxGeometry args={[0.04, 0.44, 0.24]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          <mesh position={[-0.08, 0.12, 0.32]}>
            <planeGeometry args={[0.22, 0.42]} rotation={[0, -Math.PI / 2, 0]} />
            <meshBasicMaterial color="#09090b" />
          </mesh>
        </group>

        {/* Right Side Door Panel */}
        <group position={[0.92, 1.25, 0.32]}>
          {/* Main Red Door Armor */}
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.88, 1.48]} />
            <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.3} />
          </mesh>
          {/* Recessed Window Slit 1 (Front) */}
          <mesh position={[0.07, 0.12, -0.32]}>
            <boxGeometry args={[0.04, 0.44, 0.24]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          <mesh position={[0.08, 0.12, -0.32]}>
            <planeGeometry args={[0.22, 0.42]} rotation={[0, Math.PI / 2, 0]} />
            <meshBasicMaterial color="#09090b" />
          </mesh>
          {/* Recessed Window Slit 2 (Rear) */}
          <mesh position={[0.07, 0.12, 0.32]}>
            <boxGeometry args={[0.04, 0.44, 0.24]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          <mesh position={[0.08, 0.12, 0.32]}>
            <planeGeometry args={[0.22, 0.42]} rotation={[0, Math.PI / 2, 0]} />
            <meshBasicMaterial color="#09090b" />
          </mesh>
        </group>

        {/* 8. CRIMSON RED ROOF & 4 SQUARE ROOF LIGHT PODS */}
        <group position={[0, 1.76, 0.35]}>
          {/* Main Red Roof Plate */}
          <mesh castShadow>
            <boxGeometry args={[1.74, 0.12, 1.82]} />
            <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.3} />
          </mesh>
          {/* Black Inset Sunroof Panel */}
          <mesh position={[0, 0.07, -0.1]}>
            <boxGeometry args={[1.28, 0.03, 1.15]} />
            <meshStandardMaterial color="#18181b" roughness={0.7} />
          </mesh>

          {/* Transverse Crossbar for Roof Lights */}
          <mesh position={[0, 0.12, -0.86]}>
            <boxGeometry args={[1.68, 0.08, 0.12]} />
            <meshStandardMaterial color="#18181b" roughness={0.6} metalness={0.8} />
          </mesh>

          {/* 4 Square Dark Light Pods / Roof Scoops (from image) */}
          {[-0.54, -0.18, 0.18, 0.54].map((xOffset, i) => (
            <group key={i} position={[xOffset, 0.24, -0.86]} rotation={[-0.15, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.24, 0.22, 0.24]} />
                <meshStandardMaterial color="#18181b" roughness={0.65} metalness={0.4} />
              </mesh>
              {/* Front Dark Bevel Lens */}
              <mesh position={[0, 0, -0.125]}>
                <boxGeometry args={[0.18, 0.16, 0.02]} />
                <meshStandardMaterial color="#27272a" roughness={0.3} />
              </mesh>
            </group>
          ))}

          {/* Rear Roof Spare / Cowl Accent */}
          <mesh position={[0, 0.15, 0.72]}>
            <cylinderGeometry args={[0.42, 0.42, 0.16, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
        </group>

        {/* 9. REAR SECTION & HIGH-CLEARANCE TAILGATE */}
        <group position={[0, 1.10, 1.35]}>
          {/* Red Rear Tailgate Body */}
          <mesh castShadow>
            <boxGeometry args={[1.82, 0.72, 0.45]} />
            <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.3} />
          </mesh>
          {/* Dark Rear Bumper */}
          <mesh position={[0, -0.42, 0.12]}>
            <boxGeometry args={[2.04, 0.28, 0.32]} />
            <meshStandardMaterial color="#18181b" roughness={0.75} />
          </mesh>
          {/* Red LED Taillight Strips */}
          <mesh position={[-0.72, -0.22, 0.24]}>
            <boxGeometry args={[0.28, 0.10, 0.03]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.72, -0.22, 0.24]}>
            <boxGeometry args={[0.28, 0.10, 0.03]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>

        {/* ========================================================
            10. MASSIVE ALL-TERRAIN MONSTER WHEELS ASSEMBLY
            Huge knobby monster tires with deep tread & red rims
           ======================================================== */}
        {/* Front Left Wheel */}
        <MonsterWheelAssembly
          steerRef={frontLeftSteerRef}
          spinRef={frontLeftSpinRef}
          position={[-1.38, 0.54, -1.30]}
          isRight={false}
        />
        {/* Front Right Wheel */}
        <MonsterWheelAssembly
          steerRef={frontRightSteerRef}
          spinRef={frontRightSpinRef}
          position={[1.38, 0.54, -1.30]}
          isRight={true}
        />
        {/* Rear Left Wheel */}
        <MonsterWheelAssembly
          spinRef={rearLeftSpinRef}
          position={[-1.38, 0.54, 1.30]}
          isRight={false}
        />
        {/* Rear Right Wheel */}
        <MonsterWheelAssembly
          spinRef={rearRightSpinRef}
          position={[1.38, 0.54, 1.30]}
          isRight={true}
        />
      </group>
    </RigidBody>
  );
}

// ========================================================
// 🔮 GLOWING TRIANGULAR ENERGY PRISM MODULE
// Exact 3D representation of the glowing violet prisms in the cockpit
// ========================================================
function GlowingTriangularPrism({ position, rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Outer Glowing Triangular Prism Faces */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.32, 3]} />
        <meshBasicMaterial color="#f0abfc" />
      </mesh>

      {/* Triangular Glowing Border Outline Rim */}
      <mesh position={[0, 0.165, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.02, 3]} />
        <meshStandardMaterial color="#c084fc" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.165, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.02, 3]} />
        <meshStandardMaterial color="#c084fc" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Brilliant White-Violet Core Glow */}
      <mesh>
        <cylinderGeometry args={[0.10, 0.10, 0.28, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Localized Radiant Violet Point Light */}
      <pointLight color="#d946ef" intensity={2.5} distance={2.5} />
    </group>
  );
}

// ========================================================
// 🛞 CHUNKY ALL-TERRAIN MONSTER TIRE & RED CONCAVE RIM
// True to the user reference: Wide monster stance, deep tread lugs, red rim
// ========================================================
function MonsterWheelAssembly({
  steerRef,
  spinRef,
  position,
  isRight = false,
}) {
  const radius = 0.54;
  const width = 0.48;
  const rimRadius = radius * 0.58;
  const sideSign = isRight ? 1 : -1;

  return (
    <group position={position}>
      {/* Steering Knuckle Group (Swivels Y) */}
      <group ref={steerRef}>
        {/* Heavy-Duty Suspension Spindle Arm */}
        <mesh position={[-sideSign * 0.08, 0, 0]}>
          <boxGeometry args={[0.14, 0.22, 0.18]} />
          <meshStandardMaterial color="#18181b" roughness={0.7} metalness={0.6} />
        </mesh>

        {/* Wheel Hub & Tire Spin Group (Rotates X) */}
        <group ref={spinRef}>
          {/* 1. Main Mud/Desert All-Terrain Monster Rubber Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[radius, radius, width * 0.88, 24]} />
            <meshStandardMaterial color="#292524" roughness={0.92} metalness={0.05} />
          </mesh>

          {/* Deep Knobby Off-Road Tread Lugs Arrayed around the Tire */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const angle = (i * Math.PI * 2) / 12;
            return (
              <group key={i} rotation={[angle, 0, 0]}>
                <mesh position={[0, radius * 0.98, 0]} rotation={[0, 0, (i % 2 === 0 ? 0.15 : -0.15)]} castShadow>
                  <boxGeometry args={[width * 0.82, 0.08, 0.14]} />
                  <meshStandardMaterial color="#1c1917" roughness={0.95} />
                </mesh>
              </group>
            );
          })}

          {/* Outer Rounded Sidewall Ring */}
          <mesh
            rotation={[0, isRight ? Math.PI / 2 : -Math.PI / 2, 0]}
            position={[sideSign * width * 0.44, 0, 0]}
          >
            <ringGeometry args={[rimRadius * 0.98, radius * 0.96, 24]} />
            <meshStandardMaterial color="#292524" roughness={0.9} />
          </mesh>

          {/* 2. BRIGHT CRIMSON RED DEEP-DISH CONCAVE RIM (Matching Car Body) */}
          <mesh
            rotation={[0, isRight ? Math.PI / 2 : -Math.PI / 2, 0]}
            position={[sideSign * width * 0.38, 0, 0]}
          >
            <ringGeometry args={[rimRadius * 0.32, rimRadius * 1.02, 24]} />
            <meshStandardMaterial color="#dc2626" metalness={0.5} roughness={0.25} />
          </mesh>

          {/* Outer Red Lip Chamfer */}
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            position={[sideSign * width * 0.40, 0, 0]}
          >
            <cylinderGeometry args={[rimRadius * 1.02, rimRadius * 0.96, 0.06, 24]} />
            <meshStandardMaterial color="#dc2626" metalness={0.5} roughness={0.25} />
          </mesh>

          {/* Dark Charcoal Center Hub Cap */}
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            position={[sideSign * width * 0.42, 0, 0]}
          >
            <cylinderGeometry args={[rimRadius * 0.32, rimRadius * 0.32, 0.08, 16]} />
            <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Chrome Center Nut */}
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            position={[sideSign * width * 0.47, 0, 0]}
          >
            <cylinderGeometry args={[0.06, 0.06, 0.04, 6]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
