import { useState, useEffect } from 'react';
import { sounds } from '../audio/soundEffects';

// Central simple state management for portfolio interactions
// Uses a lightweight custom store with subscribe pattern for fast 60fps updates without extra bloat

const listeners = new Set();

const state = {
  // Navigation / Zones
  currentLand: 'Team Abu Hub',
  activeModal: null, // No opening card on website load; launches directly into 3D world
  
  // Checkpoint modal data & Waypoint navigation
  activeCheckpoint: null, // { index: 1-5, title: '', desc: '', keyResults: [] }
  targetCheckpointIndex: 1, // Target checkpoint for navigation directions (1 to 5, 6=completed)
  objectivesCompleted: false,
  
  // Business value commitment status
  isCommitted: true,

  // Car telemetry (for HUD & Mini-map radar)
  carSpeed: 0,
  carPosition: { x: 0, y: 0.5, z: 0 },
  carRotation: 0, // yaw in radians

  // Teleportation request
  teleportTarget: null, // { x, y, z, name }
  isTeleporting: false,

  // Audio mute/unmute
  audioEnabled: true,
};

export function getPortfolioState() {
  return state;
}

export function setPortfolioState(patch) {
  Object.assign(state, patch);
  listeners.forEach((listener) => listener(state));
}

// React hook for consuming state in UI components
export function usePortfolioStore(selector = (s) => s) {
  const [slice, setSlice] = useState(() => selector(state));

  useEffect(() => {
    const handleUpdate = () => {
      const nextSlice = selector(state);
      setSlice((prev) => {
        if (prev === nextSlice) return prev;
        if (typeof nextSlice === 'object' && nextSlice !== null) {
          return { ...nextSlice };
        }
        return nextSlice;
      });
    };

    listeners.add(handleUpdate);
    return () => listeners.delete(handleUpdate);
  }, [selector]);

  return slice;
}

let lastTelemetryTime = 0;

// Helper actions
const CHECKPOINT_ALIGNMENTS = {
  // Exiting CP1 -> Align straight towards CP2 [-48, 0, -30]
  2: { x: -33.5, y: 0.8, z: -38.5, heading: 2.10, name: 'PI Objective 2' },

  // Exiting CP2 -> Align straight towards CP3 [-30, 0, -14]
  3: { x: -45.0, y: 0.8, z: -27.0, heading: -2.29, name: 'PI Objective 3' },

  // Exiting CP3 -> Align straight towards CP4 [-12, 0, -30]
  4: { x: -27.0, y: 0.8, z: -17.0, heading: -0.86, name: 'PI Objective 4' },

  // Exiting CP4 -> Align straight West into CP5 Finish Gate [-30, 0, -30]
  5: { x: -16.0, y: 0.8, z: -30.0, heading: Math.PI / 2, name: 'PI Objective 5' },

  // Exiting CP5 -> Align straight East along Cross Boulevard towards Team Land [32, 0, -30]
  6: { x: -22.0, y: 0.8, z: -30.0, heading: -Math.PI / 2, name: 'Our Team Land' },
};

export const portfolioActions = {
  openWelcome: () => {
    setPortfolioState({ activeModal: 'welcome' });
  },
  openMap: () => {
    setPortfolioState({ activeModal: 'map' });
  },
  closeModal: () => {
    // If closing a checkpoint modal, advance to the next objective and align car straight towards it
    if (state.activeModal === 'checkpoint' && state.activeCheckpoint) {
      const curIdx = state.activeCheckpoint.index;
      const nextIdx = curIdx < 5 ? curIdx + 1 : 6;
      const alignment = CHECKPOINT_ALIGNMENTS[nextIdx];
      setPortfolioState({
        activeModal: null,
        activeCheckpoint: null,
        targetCheckpointIndex: nextIdx,
        objectivesCompleted: curIdx === 5 ? true : state.objectivesCompleted,
        teleportTarget: alignment,
        isTeleporting: true,
      });
    } else {
      setPortfolioState({ activeModal: null });
    }
  },
  completeCurrentAndAdvance: () => {
    const curIdx = state.activeCheckpoint ? state.activeCheckpoint.index : state.targetCheckpointIndex;
    const nextIdx = curIdx < 5 ? curIdx + 1 : 6;
    const alignment = CHECKPOINT_ALIGNMENTS[nextIdx];

    if (curIdx >= 5) {
      // Completed Objective 5! Play victory chime and lead to Team Land
      if (state.audioEnabled) sounds.celebration();
      setPortfolioState({
        activeModal: null,
        activeCheckpoint: null,
        targetCheckpointIndex: 6,
        objectivesCompleted: true,
        currentLand: 'Our Team Land',
        teleportTarget: alignment || { x: -22.0, y: 0.8, z: -30.0, heading: -Math.PI / 2, name: 'Our Team Land' },
        isTeleporting: true,
      });
    } else {
      if (state.audioEnabled) sounds.click();
      setPortfolioState({
        activeModal: null,
        activeCheckpoint: null,
        targetCheckpointIndex: nextIdx,
        teleportTarget: alignment,
        isTeleporting: true,
      });
    }
  },
  openCheckpoint: (cpData) => {
    // Keep activeCheckpoint while user is viewing it, without prematurely skipping
    setPortfolioState({
      activeModal: 'checkpoint',
      activeCheckpoint: cpData,
      targetCheckpointIndex: cpData.index,
      currentLand: 'PI Objectives Land',
    });
  },
  setTargetCheckpoint: (idx) => {
    setPortfolioState({ targetCheckpointIndex: idx });
  },
  openBusinessValue: () => {
    setPortfolioState({
      activeModal: 'business-value',
      currentLand: 'Business Value & Commitment Land',
    });
  },
  openTeam: () => {
    setPortfolioState({
      activeModal: 'team',
      currentLand: 'Our Team Land',
    });
  },
  toggleCommitment: () => {
    setPortfolioState({ isCommitted: !state.isCommitted });
  },
  teleportTo: (land) => {
    // If teleporting to PI Objectives, reset target waypoint to 1 and clear stale modal
    const patch = {
      teleportTarget: land,
      isTeleporting: true,
      activeModal: null, // close map upon teleporting
      currentLand: land.name,
    };
    if (land.id === 'pi-objectives') {
      patch.targetCheckpointIndex = 1;
      patch.activeCheckpoint = null;
    }
    setPortfolioState(patch);
  },
  finishTeleport: () => {
    setPortfolioState({
      teleportTarget: null,
      isTeleporting: false,
    });
  },
  updateTelemetry: (speed, pos, rot) => {
    const speedChanged = state.carSpeed !== speed;
    state.carSpeed = speed;
    state.carPosition = pos;
    state.carRotation = rot;

    const now = performance.now();
    // Broadcast updates at ~20-25fps (every 45ms) or whenever speed value changes
    if (now - lastTelemetryTime > 45 || speedChanged) {
      lastTelemetryTime = now;
      listeners.forEach((listener) => listener(state));
    }
  },
  notifyTelemetry: () => {
    listeners.forEach((listener) => listener(state));
  },
  toggleAudio: () => {
    setPortfolioState({ audioEnabled: !state.audioEnabled });
  },
};
