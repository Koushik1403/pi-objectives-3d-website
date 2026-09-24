import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { getPortfolioState, OBJECTIVE_VIEW_ALIGNMENTS } from '../../store/usePortfolioStore';

export function CameraController() {
  const { camera } = useThree();
  const isTransitioning = useRef(false);
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 0));

  // Dynamic distance with zoom support
  const distanceTarget = useRef(11.5);
  const distanceCurrent = useRef(11.5);
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
        5.0,
        Math.min(22.0, distanceTarget.current + e.deltaY * 0.01)
      );
    };

    // Double click to reset camera back directly behind target
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

    // Reset orbit angles on teleport so camera lines up squarely
    orbitAngleTarget.current = 0;
    orbitAngle.current = 0;
    pitchTarget.current = 0;
    pitch.current = 0;

    const startPos = camera.position.clone();
    const isZoomToBoard = Boolean(target.camPos && target.lookAt);

    let endPos;
    let targetLookAt;

    if (isZoomToBoard) {
      endPos = new THREE.Vector3(target.camPos.x, target.camPos.y, target.camPos.z);
      targetLookAt = new THREE.Vector3(target.lookAt.x, target.lookAt.y, target.lookAt.z);
      distanceTarget.current = Math.hypot(endPos.x - targetLookAt.x, endPos.z - targetLookAt.z);
      distanceCurrent.current = distanceTarget.current;
    } else {
      const heading = target.heading !== undefined ? target.heading : 0;
      const dist = target.camDist || 11.5;
      const h = target.camHeight || baseHeight;
      endPos = new THREE.Vector3(
        target.x + Math.sin(heading) * dist,
        target.y ? target.y + h : h,
        target.z + Math.cos(heading) * dist
      );
      targetLookAt = new THREE.Vector3(
        target.x,
        target.lookAtY !== undefined ? target.lookAtY : 1.35,
        target.z
      );
      distanceTarget.current = 11.5;
      distanceCurrent.current = 11.5;
    }

    const travelDist = Math.hypot(endPos.x - startPos.x, endPos.z - startPos.z);
    const isShortSwoop = travelDist < 25;

    // Direct, cinematic trajectory
    const midPoint = new THREE.Vector3(
      (startPos.x + endPos.x) / 2,
      isZoomToBoard
        ? THREE.MathUtils.lerp(startPos.y, endPos.y, 0.5) + 0.3
        : (isShortSwoop ? Math.max(startPos.y, endPos.y) + 1.2 : Math.max(startPos.y, 28)),
      (startPos.z + endPos.z) / 2
    );

    const animProxy = {
      progress: 0,
      lookAtX: currentLookAt.current.x,
      lookAtY: currentLookAt.current.y,
      lookAtZ: currentLookAt.current.z,
    };

    // Fast, responsive zoom in to board (0.85s) or smooth zoom out to driving track (1.0s)
    gsap.to(animProxy, {
      progress: 1,
      lookAtX: targetLookAt.x,
      lookAtY: targetLookAt.y,
      lookAtZ: targetLookAt.z,
      duration: isZoomToBoard ? 0.85 : (isShortSwoop ? 1.0 : 1.4),
      ease: isZoomToBoard ? 'power2.out' : (isShortSwoop ? 'power2.inOut' : 'power3.inOut'),
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
        camera.position.copy(endPos);
        currentLookAt.current.copy(targetLookAt);
        camera.lookAt(currentLookAt.current);
      },
    });
  };

  useFrame((_, delta) => {
    // If in mid-flight GSAP animation, do not override
    if (isTransitioning.current) return;

    const state = getPortfolioState();
    const activeIdx = state.activeObjectiveIndex;

    // 1. Zoomed-In Board Mode: Hold camera squarely focused on the active objective board
    if (activeIdx && OBJECTIVE_VIEW_ALIGNMENTS[activeIdx]) {
      const boardAlign = OBJECTIVE_VIEW_ALIGNMENTS[activeIdx];
      const bx = boardAlign.lookAt.x;
      const by = boardAlign.lookAt.y;
      const bz = boardAlign.lookAt.z;

      const orbitDamp = THREE.MathUtils.clamp(delta * 6.0, 0, 1);
      orbitAngle.current = THREE.MathUtils.lerp(orbitAngle.current, orbitAngleTarget.current, orbitDamp);
      pitch.current = THREE.MathUtils.lerp(pitch.current, pitchTarget.current, orbitDamp);

      distanceCurrent.current = THREE.MathUtils.lerp(
        distanceCurrent.current,
        distanceTarget.current,
        THREE.MathUtils.clamp(delta * 5.0, 0, 1)
      );

      const zoomDist = distanceCurrent.current || 8.2;
      const baseHeading = boardAlign.heading !== undefined ? boardAlign.heading : 0;
      const totalAzimuth = baseHeading + orbitAngle.current;

      const effDist = zoomDist * Math.cos(pitch.current);
      const effHeight = by + zoomDist * Math.sin(pitch.current);

      const targetCamX = bx + Math.sin(totalAzimuth) * effDist;
      const targetCamY = Math.max(1.6, effHeight);
      const targetCamZ = bz + Math.cos(totalAzimuth) * effDist;

      const lerpSpeed = THREE.MathUtils.clamp(delta * 6.0, 0, 1);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, lerpSpeed);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, lerpSpeed);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, lerpSpeed);

      currentLookAt.current.lerp(new THREE.Vector3(bx, by, bz), lerpSpeed * 1.5);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // 2. Team Photo View Mode (Grand Finale in Our Team Land)
    if (state.teamPhotoOpened && !activeIdx) {
      const bx = 32.0;
      const by = 4.6;
      const bz = -30.0;

      const orbitDamp = THREE.MathUtils.clamp(delta * 6.0, 0, 1);
      orbitAngle.current = THREE.MathUtils.lerp(orbitAngle.current, orbitAngleTarget.current, orbitDamp);
      pitch.current = THREE.MathUtils.lerp(pitch.current, pitchTarget.current, orbitDamp);

      const zoomDist = distanceCurrent.current || 11.8;
      const effDist = zoomDist * Math.cos(pitch.current);
      const effHeight = by + zoomDist * Math.sin(pitch.current);

      const targetCamX = bx + Math.sin(orbitAngle.current) * effDist;
      const targetCamY = Math.max(1.8, effHeight);
      const targetCamZ = bz + Math.cos(orbitAngle.current) * effDist;

      const lerpSpeed = THREE.MathUtils.clamp(delta * 6.0, 0, 1);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, lerpSpeed);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, lerpSpeed);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, lerpSpeed);

      currentLookAt.current.lerp(new THREE.Vector3(bx, by, bz), lerpSpeed * 1.5);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // 3. Normal Driving Mode: Follow car smoothly from behind at driving height & distance
    const { carPosition, carRotation } = state;
    if (!carPosition) return;

    // Ensure driving distance target is set
    if (distanceTarget.current < 9.5) {
      distanceTarget.current = 11.5;
    }

    distanceCurrent.current = THREE.MathUtils.lerp(
      distanceCurrent.current,
      distanceTarget.current,
      THREE.MathUtils.clamp(delta * 5.0, 0, 1)
    );

    const orbitDamp = THREE.MathUtils.clamp(delta * 6.0, 0, 1);
    orbitAngle.current = THREE.MathUtils.lerp(orbitAngle.current, orbitAngleTarget.current, orbitDamp);
    pitch.current = THREE.MathUtils.lerp(pitch.current, pitchTarget.current, orbitDamp);

    const totalAzimuth = carRotation + orbitAngle.current;
    const effDistance = distanceCurrent.current * Math.cos(pitch.current);
    const effHeight = baseHeight + distanceCurrent.current * Math.sin(pitch.current);

    const targetCamX = carPosition.x + Math.sin(totalAzimuth) * effDistance;
    const targetCamY = carPosition.y + Math.max(2.4, effHeight);
    const targetCamZ = carPosition.z + Math.cos(totalAzimuth) * effDistance;

    const lerpSpeed = THREE.MathUtils.clamp(delta * 4.8, 0, 1);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, lerpSpeed);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, lerpSpeed);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, lerpSpeed);

    const targetLookAt = new THREE.Vector3(carPosition.x, carPosition.y + 1.35, carPosition.z);
    currentLookAt.current.lerp(targetLookAt, lerpSpeed * 1.5);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
