import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getPortfolioState } from '../../store/usePortfolioStore';

export function CameraController() {
  const { camera, gl } = useThree();
  const isTransitioning = useRef(false);
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 0));

  // Dynamic distance with zoom support
  const distanceTarget = useRef(12.0);
  const distanceCurrent = useRef(12.0);
  const baseHeight = 5.6;

  // Mouse drag orbit controls (High rotation degree, swift & responsive)
  const SENSITIVITY_X = 0.0052; // generous, fluid horizontal orbit degree
  const SENSITIVITY_Y = 0.0028; // fluid vertical pitch degree
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const orbitAngleTarget = useRef(0);
  const orbitAngle = useRef(0);
  const pitchTarget = useRef(0);
  const pitch = useRef(0);

  // Mouse & Touch event listeners for seamless click and drag camera rotation
  useEffect(() => {
    const handlePointerDown = (e) => {
      // Only track primary mouse button (left-click) or touch
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      // Filter out clicks on interactive UI elements (buttons, modals, hud pills, inputs)
      if (
        e.target &&
        e.target.closest &&
        e.target.closest(
          'button, .modal-content, .modal-backdrop, .hud-btn, .hud-icon-btn, .hud-badge, .speed-meter, .controls-card, input, a'
        )
      ) {
        return;
      }

      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      document.body.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e) => {
      if (!isDragging.current || isTransitioning.current) return;
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Update target angles smoothly with gentle sensitivity
      orbitAngleTarget.current -= deltaX * SENSITIVITY_X;
      pitchTarget.current = Math.max(
        -0.35, // prevent clipping into ground
        Math.min(0.75, pitchTarget.current + deltaY * SENSITIVITY_Y)
      );
    };

    const handlePointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
      }
    };

    // Mouse wheel zoom
    const handleWheel = (e) => {
      // Zoom in / out smoothly
      distanceTarget.current = Math.max(
        7.5,
        Math.min(22.0, distanceTarget.current + e.deltaY * 0.01)
      );
    };

    // Double click to reset camera back directly behind the car
    const handleDblClick = () => {
      orbitAngleTarget.current = 0;
      pitchTarget.current = 0;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('dblclick', handleDblClick);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('dblclick', handleDblClick);
      document.body.style.cursor = 'default';
    };
  }, []);

  // Listen for teleport events to perform cinematic camera swoops
  useEffect(() => {
    let checkInterval = setInterval(() => {
      const state = getPortfolioState();
      if (state.isTeleporting && state.teleportTarget && !isTransitioning.current) {
        animateTeleportCamera(state.teleportTarget);
      }
    }, 50);

    return () => clearInterval(checkInterval);
  }, []);

  const animateTeleportCamera = (target) => {
    isTransitioning.current = true;

    // Reset orbit angles on teleport so camera lines up right behind destination
    orbitAngleTarget.current = 0;
    orbitAngle.current = 0;
    pitchTarget.current = 0;
    pitch.current = 0;

    const startPos = camera.position.clone();
    const midPoint = new THREE.Vector3(
      (startPos.x + target.x) / 2,
      Math.max(startPos.y, 28), // swoop up high for bird's-eye view
      (startPos.z + target.z) / 2
    );

    const heading = target.heading !== undefined ? target.heading : 0;
    const dist = distanceCurrent.current || 10.5;
    const endPos = new THREE.Vector3(
      target.x + Math.sin(heading) * dist,
      target.y ? target.y + baseHeight : baseHeight,
      target.z + Math.cos(heading) * dist
    );

    const targetLookAt = new THREE.Vector3(target.x, 1.2, target.z);

    const animProxy = {
      progress: 0,
      lookAtX: currentLookAt.current.x,
      lookAtY: currentLookAt.current.y,
      lookAtZ: currentLookAt.current.z,
    };

    // Quadratic bezier curve interpolation for smooth high-altitude swoop
    gsap.to(animProxy, {
      progress: 1,
      lookAtX: targetLookAt.x,
      lookAtY: targetLookAt.y,
      lookAtZ: targetLookAt.z,
      duration: 1.4,
      ease: 'power3.inOut',
      onUpdate: () => {
        const t = animProxy.progress;
        // Bezier formula: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        const pX = (1 - t) * (1 - t) * startPos.x + 2 * (1 - t) * t * midPoint.x + t * t * endPos.x;
        const pY = (1 - t) * (1 - t) * startPos.y + 2 * (1 - t) * t * midPoint.y + t * t * endPos.y;
        const pZ = (1 - t) * (1 - t) * startPos.z + 2 * (1 - t) * t * midPoint.z + t * t * endPos.z;

        camera.position.set(pX, pY, pZ);
        currentLookAt.current.set(animProxy.lookAtX, animProxy.lookAtY, animProxy.lookAtZ);
        camera.lookAt(currentLookAt.current);
      },
      onComplete: () => {
        isTransitioning.current = false;
      },
    });
  };

  useFrame((_, delta) => {
    // If in mid-flight teleport animation, GSAP controls camera
    if (isTransitioning.current) return;

    const { carPosition, carRotation, carSpeed } = getPortfolioState();
    if (!carPosition) return;

    // Smoothly interpolate dynamic camera zoom distance
    distanceCurrent.current = THREE.MathUtils.lerp(
      distanceCurrent.current,
      distanceTarget.current,
      THREE.MathUtils.clamp(delta * 5.0, 0, 1)
    );

    // Smoothly interpolate mouse orbit angle and pitch
    const orbitDamp = THREE.MathUtils.clamp(delta * 6.0, 0, 1);
    orbitAngle.current = THREE.MathUtils.lerp(orbitAngle.current, orbitAngleTarget.current, orbitDamp);
    pitch.current = THREE.MathUtils.lerp(pitch.current, pitchTarget.current, orbitDamp);

    // Combine car heading with mouse orbit offset
    const totalAzimuth = carRotation + orbitAngle.current;

    // Calculate effective spherical offset
    const effDistance = distanceCurrent.current * Math.cos(pitch.current);
    const effHeight = baseHeight + distanceCurrent.current * Math.sin(pitch.current);

    const targetCamX = carPosition.x + Math.sin(totalAzimuth) * effDistance;
    const targetCamY = carPosition.y + Math.max(2.4, effHeight);
    const targetCamZ = carPosition.z + Math.cos(totalAzimuth) * effDistance;

    // Smoothly interpolate camera position
    const lerpSpeed = THREE.MathUtils.clamp(delta * 4.8, 0, 1);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, lerpSpeed);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, lerpSpeed);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, lerpSpeed);

    // Smoothly interpolate lookAt target
    const targetLookAt = new THREE.Vector3(carPosition.x, carPosition.y + 1.35, carPosition.z);
    currentLookAt.current.lerp(targetLookAt, lerpSpeed * 1.5);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
