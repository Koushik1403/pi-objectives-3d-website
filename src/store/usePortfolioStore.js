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
export const portfolioActions = {
  openWelcome: () => {
    setPortfolioState({ activeModal: 'welcome' });
  },
  openMap: () => {
    setPortfolioState({ activeModal: 'map' });
  },
  closeModal: () => {
    // If closing a checkpoint modal, advance to the next objective
    if (state.activeModal === 'checkpoint' && state.activeCheckpoint) {
      const curIdx = state.activeCheckpoint.index;
      const nextIdx = curIdx < 5 ? curIdx + 1 : 6;
      setPortfolioState({
        activeModal: null,
        activeCheckpoint: null,
        targetCheckpointIndex: nextIdx,
        objectivesCompleted: curIdx === 5 ? true : state.objectivesCompleted,
      });
    } else {
      setPortfolioState({ activeModal: null });
    }
  },
  completeCurrentAndAdvance: () => {
    const curIdx = state.activeCheckpoint ? state.activeCheckpoint.index : state.targetCheckpointIndex;
    if (curIdx >= 5) {
      // Completed Objective 5! Play victory chime and lead to Team Land
      if (state.audioEnabled) sounds.celebration();
      setPortfolioState({
        activeModal: null,
        activeCheckpoint: null,
        targetCheckpointIndex: 6,
        objectivesCompleted: true,
        currentLand: 'Our Team Land',
        teleportTarget: { x: 0, y: 0.8, z: 24, heading: 0, name: 'Our Team Land' },
        isTeleporting: true,
      });
    } else {
      setPortfolioState({
        activeModal: null,
        activeCheckpoint: null,
        targetCheckpointIndex: curIdx + 1,
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
