import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, vec3 } from '@react-three/rapier';
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

  // Separate steering knuckle refs (swivels Y) and wheel spin refs (rolls X)
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
    const proxy = {
      x: currentPos.x,
      y: currentPos.y + 0.5,
      z: currentPos.z,
    };

    // Kill existing momentum
    rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

    // Calculate heading toward land center or use explicit target heading
    const targetHeading = target.heading !== undefined ? target.heading : Math.atan2(-target.x, -target.z);
    const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetHeading);

    // Smoothly animate car translation using GSAP
    gsap.to(proxy, {
      x: target.x,
      y: target.y || 0.8,
      z: target.z,
      duration: 1.4,
      ease: 'power3.inOut',
      onUpdate: () => {
        if (rigidBodyRef.current) {
          rigidBodyRef.current.setTranslation({ x: proxy.x, y: proxy.y, z: proxy.z }, true);
          rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
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

    const rb = rigidBodyRef.current;
    const translation = rb.translation();
    const rotation = rb.rotation();
    const linvel = rb.linvel();

    // Calculate car forward vector from current quaternion
    const carQuat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(carQuat);
    const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(carQuat);

    // Current forward speed (scalar projection)
    const currentVelocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z);
    let speed = forwardVec.dot(currentVelocity);

    // 1. Snappy Arcade Acceleration, Reversing & Braking
    if (keys.current.forward) {
      // Increased acceleration: quick, punchy launch
      speed += 38.0 * delta;
      if (speed > MAX_SPEED) speed = MAX_SPEED;
    } else if (keys.current.backward) {
      if (speed > 0.2) {
        // Instant strong footbrake when moving forward
        speed -= 55.0 * delta;
        if (speed < 0) speed = 0;
      } else {
        // High-speed, fast reverse acceleration
        speed -= 32.0 * delta;
        if (speed < -24.0) speed = -24.0;
      }
    } else {
      // Smooth coasting deceleration
      speed = THREE.MathUtils.lerp(speed, 0, delta * 2.4);
      if (Math.abs(speed) < 0.05) speed = 0;
    }

    // Handbrake (Spacebar)
    if (keys.current.brake) {
      speed = THREE.MathUtils.lerp(speed, 0, delta * 10.0);
      if (Math.abs(speed) < 0.1) speed = 0;
    }

    // 2. Smooth Agile Steering (Slightly reduced for natural control)
    let targetSteer = 0;
    if (keys.current.left) targetSteer += 0.58;
    if (keys.current.right) targetSteer -= 0.58;

    // Smooth front wheel steering angle with natural response
    steerAngle.current = THREE.MathUtils.lerp(steerAngle.current, targetSteer, delta * 13);

    // Dynamic Turn Rate: Gently reduced for balanced, smooth cornering
    const speedAbs = Math.abs(speed);
    const motionFactor = Math.min(speedAbs * 0.24 + 0.60, 1.15);
    const reverseFactor = speed < -0.2 ? -1 : 1;
    const steerDirection = keys.current.left ? 1 : (keys.current.right ? -1 : 0);
    const targetTurnRate = steerDirection * 2.55 * motionFactor * reverseFactor;

    // Smooth direct angular velocity control
    const currentAngvel = rb.angvel();
    const nextAngvelY = THREE.MathUtils.lerp(
      currentAngvel.y,
      targetTurnRate,
      THREE.MathUtils.clamp(delta * 12.0, 0, 1)
    );
    rb.setAngvel({ x: 0, y: nextAngvelY, z: 0 }, true);

    // 3. Direct Velocity Application (Car moves along its heading with full power and arcade grip)
    const newHorizVel = forwardVec.clone().multiplyScalar(speed);
    rb.setLinvel({
      x: newHorizVel.x,
      y: linvel.y, // preserve vertical physics gravity
      z: newHorizVel.z,
    }, true);

    // Keep car grounded and upright
    if (translation.y > 2.0) {
      rb.applyImpulse({ x: 0, y: -3.0, z: 0 }, true);
    }

    // 5. Realistic Physical Wheel Animation
    // True rolling without slip: angular velocity omega = v / r
    const effectiveRadius = 0.46;
    wheelSpin.current += (speed / effectiveRadius) * delta;

    // Front wheels: swivel Y axis ONLY on the steering knuckle (no wobbling or gimbal lock)
    if (frontLeftSteerRef.current && frontRightSteerRef.current) {
      frontLeftSteerRef.current.rotation.y = steerAngle.current;
      frontRightSteerRef.current.rotation.y = steerAngle.current;
    }

    // All 4 wheels: spin on X axis ONLY (car forward is -Z, so -wheelSpin rotates from +Y to -Z forward)
    if (frontLeftSpinRef.current) frontLeftSpinRef.current.rotation.x = -wheelSpin.current;
    if (frontRightSpinRef.current) frontRightSpinRef.current.rotation.x = -wheelSpin.current;
    if (rearLeftSpinRef.current) rearLeftSpinRef.current.rotation.x = -wheelSpin.current;
    if (rearRightSpinRef.current) rearRightSpinRef.current.rotation.x = -wheelSpin.current;

    const horizontalSpeed = Math.abs(speed);
    const kmh = Math.round(horizontalSpeed * 3.6);

    // Direct DOM update for zero-latency 60fps speedometer
    const speedEl = document.getElementById('hud-speed-num');
    if (speedEl && speedEl.textContent !== String(kmh)) {
      speedEl.textContent = String(kmh);
    }
    const speedBarEl = document.getElementById('hud-speed-bar-fill');
    if (speedBarEl) {
      speedBarEl.style.width = `${Math.min(100, (kmh / 85) * 100)}%`;
    }

    // Update Telemetry for HUD & Radar
    const euler = new THREE.Euler().setFromQuaternion(carQuat, 'YXZ');
    portfolioActions.updateTelemetry(
      kmh,
      { x: translation.x, y: translation.y, z: translation.z },
      euler.y
    );

    // Update real-time dynamic arcade engine sound (pitch & roar scales with speed & acceleration)
    const { audioEnabled } = getPortfolioState();
    const isBraking = keys.current.brake || (keys.current.backward && speed > 0.5);
    const isReversing = speed < -0.2;
    sounds.updateEngine(speed, keys.current.forward, isBraking, isReversing, audioEnabled);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      position={[0, 0.9, 0]}
      mass={240}
      linearDamping={0.8}
      angularDamping={0.5}
      enabledRotations={[false, true, false]} // Lock roll and pitch for pure arcade car stability
      name="player-car"
    >
      {/* Scaled Physics Box Collider with ground clearance for wheels */}
      <CuboidCollider args={[1.15, 0.50, 2.05]} position={[0, 0.62, 0]} />

      {/* Visual Car Mesh - Team Abu Racing Livery */}
      <group ref={visualGroupRef} position={[0, 0.05, 0]}>
        {/* Neon Underglow Lighting */}
        <pointLight color="#00e5ff" intensity={3.5} distance={4.2} position={[0, 0.18, 0]} />

        {/* Main Body Chassis - Sleek Midnight Slate */}
        <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 0.58, 4.2]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.2}
            metalness={0.7}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Clean Aerodynamic Side Skirts (Electric Cyan Accent) */}
        <mesh position={[-1.18, 0.48, 0]} castShadow>
          <boxGeometry args={[0.08, 0.36, 3.6]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[1.18, 0.48, 0]} castShadow>
          <boxGeometry args={[0.08, 0.36, 3.6]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Front Aero Splitter */}
        <mesh position={[0, 0.18, -2.12]} castShadow>
          <boxGeometry args={[2.50, 0.05, 0.42]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Central Racing Stripe on Hood */}
        <mesh position={[0, 0.86, -0.75]} castShadow>
          <boxGeometry args={[0.70, 0.03, 1.8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Cockpit Canopy */}
        <mesh position={[0, 1.10, 0.2]} castShadow>
          <boxGeometry args={[1.82, 0.60, 1.95]} />
          <meshStandardMaterial
            color="#090d16"
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* ========================================================
            THE SINGLE "ABU" EMBLEM ON THE ROOF (CLEAN & PROMINENT)
           ======================================================== */}
        <group position={[0, 1.42, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text
            fontSize={0.46}
            color="#ffffff"
            fontWeight={900}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            ABU
          </Text>
        </group>

        {/* Front Windshield Tint */}
        <mesh position={[0, 1.14, -0.80]} rotation={[0.42, 0, 0]}>
          <planeGeometry args={[1.70, 0.64]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* Rear Window Tint */}
        <mesh position={[0, 1.12, 1.20]} rotation={[-0.42, 0, 0]}>
          <planeGeometry args={[1.60, 0.54]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* Rear Aerodynamic Wing */}
        <group position={[0, 1.25, 1.88]}>
          {/* Spoiler Wing Blade */}
          <mesh castShadow>
            <boxGeometry args={[2.50, 0.08, 0.46]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Left Stanchion */}
          <mesh position={[-0.85, -0.28, 0]} castShadow>
            <boxGeometry args={[0.08, 0.50, 0.16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          {/* Right Stanchion */}
          <mesh position={[0.85, -0.28, 0]} castShadow>
            <boxGeometry args={[0.08, 0.50, 0.16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
        </group>

        {/* Rear Diffuser Trim & Dual Exhaust */}
        <mesh position={[0, 0.26, 2.12]}>
          <boxGeometry args={[2.10, 0.16, 0.05]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.45, 0.26, 2.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.45, 0.26, 2.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Crisp White LED Headlights */}
        <mesh position={[-0.85, 0.56, -2.12]}>
          <boxGeometry args={[0.42, 0.14, 0.05]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
        <mesh position={[0.85, 0.56, -2.12]}>
          <boxGeometry args={[0.42, 0.14, 0.05]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>

        {/* Minimalist Taillight Strip (Continuous Red Line) */}
        <mesh position={[0, 0.60, 2.12]}>
          <boxGeometry args={[2.15, 0.11, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* ========================================================
            WHEELS ASSEMBLY: INDEPENDENT STEER KNUCKLE + ROLLING AXLE
           ======================================================== */}
        {/* Front Left Wheel */}
        <WheelAssembly
          steerRef={frontLeftSteerRef}
          spinRef={frontLeftSpinRef}
          position={[-1.28, 0.44, -1.30]}
          isRight={false}
          isRear={false}
        />
        {/* Front Right Wheel */}
        <WheelAssembly
          steerRef={frontRightSteerRef}
          spinRef={frontRightSpinRef}
          position={[1.28, 0.44, -1.30]}
          isRight={true}
          isRear={false}
        />
        {/* Rear Left Wheel */}
        <WheelAssembly
          spinRef={rearLeftSpinRef}
          position={[-1.28, 0.48, 1.30]}
          isRight={false}
          isRear={true}
        />
        {/* Rear Right Wheel */}
        <WheelAssembly
          spinRef={rearRightSpinRef}
          position={[1.28, 0.48, 1.30]}
          isRight={true}
          isRear={true}
        />
      </group>
    </RigidBody>
  );
}

// High-Detail Sports Performance Wheel Component
function WheelAssembly({
  steerRef,
  spinRef,
  position,
  isRight = false,
  isRear = false,
}) {
  const radius = isRear ? 0.48 : 0.44;
  const width = 0.34;
  const rimRadius = radius * 0.66;
  const sideSign = isRight ? 1 : -1; // -1 for left wheel (outwards -X), +1 for right wheel (outwards +X)

  return (
    <group position={position}>
      {/* Steering Knuckle Group (Swivels with front steering on Y axis) */}
      <group ref={steerRef}>
        {/* Stationary Performance Brake Caliper (Mounts to knuckle, DOES NOT spin with wheel) */}
        <group position={[sideSign * 0.08, radius * 0.44, -0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.07, radius * 0.34, 0.18]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.25} />
          </mesh>
          {/* Cyan Performance Caliper Accent */}
          <mesh position={[sideSign * 0.038, 0, 0]}>
            <boxGeometry args={[0.012, radius * 0.22, 0.10]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Wheel Hub & Tire Spin Group (Rotates on X axis around axle) */}
        <group ref={spinRef}>
          {/* 1. Main Rubber Tire (32-segment smooth geometry) */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[radius, radius, width * 0.80, 32]} />
            <meshStandardMaterial color="#111827" roughness={0.92} metalness={0.05} />
          </mesh>

          {/* Outer Tire Rounded Shoulder */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[sideSign * width * 0.44, 0, 0]}>
            <cylinderGeometry
              args={[
                isRight ? radius * 0.94 : radius,
                isRight ? radius : radius * 0.94,
                width * 0.12,
                32,
              ]}
            />
            <meshStandardMaterial color="#111827" roughness={0.92} metalness={0.05} />
          </mesh>

          {/* Inner Tire Rounded Shoulder */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-sideSign * width * 0.44, 0, 0]}>
            <cylinderGeometry
              args={[
                isRight ? radius : radius * 0.94,
                isRight ? radius * 0.94 : radius,
                width * 0.12,
                32,
              ]}
            />
            <meshStandardMaterial color="#111827" roughness={0.92} metalness={0.05} />
          </mesh>

          {/* Sidewall Detail Ring */}
          <mesh
            rotation={[0, isRight ? Math.PI / 2 : -Math.PI / 2, 0]}
            position={[sideSign * width * 0.505, 0, 0]}
          >
            <ringGeometry args={[rimRadius * 1.02, radius * 0.94, 32]} />
            <meshStandardMaterial color="#1f2937" roughness={0.88} />
          </mesh>

          {/* 2. Deep-Dish Alloy Rim Barrel */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[sideSign * -0.01, 0, 0]}>
            <cylinderGeometry args={[rimRadius, rimRadius * 0.92, width * 0.86, 32]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* Chrome Polished Outer Rim Lip */}
          <mesh
            rotation={[0, isRight ? Math.PI / 2 : -Math.PI / 2, 0]}
            position={[sideSign * width * 0.48, 0, 0]}
          >
            <ringGeometry args={[rimRadius * 0.94, rimRadius * 1.03, 32]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* 3. Steel Brake Rotor Disc (Spins with wheel) */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[sideSign * 0.07, 0, 0]}>
            <cylinderGeometry args={[radius * 0.58, radius * 0.58, 0.02, 32]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.22} />
          </mesh>
          <mesh
            rotation={[0, isRight ? Math.PI / 2 : -Math.PI / 2, 0]}
            position={[sideSign * 0.082, 0, 0]}
          >
            <ringGeometry args={[radius * 0.28, radius * 0.57, 32]} />
            <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.25} />
          </mesh>

          {/* 4. Sculpted 5-Spoke Dual-Blade Alloy Rim Face */}
          <group
            position={[sideSign * width * 0.44, 0, 0]}
            rotation={[0, isRight ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            {[0, 1, 2, 3, 4].map((i) => {
              const angle = (i * Math.PI * 2) / 5;
              return (
                <group key={i} rotation={[0, 0, angle]}>
                  {/* Left Blade */}
                  <mesh position={[-0.022, rimRadius * 0.52, 0]} rotation={[0, 0, 0.08]}>
                    <boxGeometry args={[0.032, rimRadius * 0.78, 0.035]} />
                    <meshStandardMaterial color="#f1f5f9" metalness={0.92} roughness={0.15} />
                  </mesh>
                  {/* Right Blade */}
                  <mesh position={[0.022, rimRadius * 0.52, 0]} rotation={[0, 0, -0.08]}>
                    <boxGeometry args={[0.032, rimRadius * 0.78, 0.035]} />
                    <meshStandardMaterial color="#f1f5f9" metalness={0.92} roughness={0.15} />
                  </mesh>
                </group>
              );
            })}

            {/* Center Wheel Hub */}
            <mesh position={[0, 0, -0.015]}>
              <cylinderGeometry
                args={[rimRadius * 0.28, rimRadius * 0.28, 0.05, 24]}
                rotation={[Math.PI / 2, 0, 0]}
              />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Center Cap with Electric Cyan Ring */}
            <mesh position={[0, 0, 0.02]}>
              <cylinderGeometry
                args={[rimRadius * 0.16, rimRadius * 0.16, 0.025, 16]}
                rotation={[Math.PI / 2, 0, 0]}
              />
              <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* 5 Precision Chrome Hex Lug Nuts */}
            {[0, 1, 2, 3, 4].map((i) => {
              const angle = (i * Math.PI * 2) / 5;
              const dist = rimRadius * 0.22;
              return (
                <mesh
                  key={i}
                  position={[Math.sin(angle) * dist, Math.cos(angle) * dist, 0.02]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.016, 0.016, 0.03, 6]} />
                  <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.1} />
                </mesh>
              );
            })}
          </group>
        </group>
      </group>
    </group>
  );
}
