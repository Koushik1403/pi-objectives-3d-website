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
  activeObjectiveIndex: null, // Index of currently opened 3D objective block (1-5), null when driving
  targetCheckpointIndex: 1, // Target checkpoint for navigation directions (1 to 5, 6=completed)
  openedObjectives: [], // Indices of opened gift box objectives in 3D land
  objectivesCompleted: false,
  teamPhotoOpened: false,
  
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

  // Exiting CP3 -> ALL 3 OBJECTIVES UNLOCKED! Align on the track exiting CP3 facing the highway towards Team Land!
  4: { x: -26.0, y: 0.8, z: -18.0, heading: -0.35 * Math.PI, name: 'Cross Boulevard to Team Land' },
};

// Alignment waypoints when navigating BACK to a previous objective:
// Places car on track segment leading into that objective, rotated facing straight at it!
const PREV_CHECKPOINT_ALIGNMENTS = {
  // Navigating back to Objective 1 [-30, 0, -42] -> Position north, facing South down track
  1: { x: -30.0, y: 0.8, z: -50.0, heading: Math.PI, name: 'PI Objective 1' },

  // Navigating back to Objective 2 [-48, 0, -30] -> Position on CP1-to-CP2 track, facing West-South-West
  2: { x: -36.0, y: 0.8, z: -38.0, heading: 2.15, name: 'PI Objective 2' },

  // Navigating back to Objective 3 [-30, 0, -14] -> Position on CP2-to-CP3 track, facing East-South-East
  3: { x: -42.0, y: 0.8, z: -24.0, heading: -2.27, name: 'PI Objective 3' },
};

// Straight-on presentation viewing alignments (centered directly in front of each 3D board):
// Positions car neatly parked in front of the board and zooms camera directly in front of the board face!
export const OBJECTIVE_VIEW_ALIGNMENTS = {
  // Objective 1 [-30, 0, -42], rotY: 0 (board faces South +Z)
  1: {
    x: -30.0,
    y: 0.8,
    z: -37.2,
    heading: 0,
    lookAtY: 3.65,
    lookAt: { x: -30.0, y: 3.65, z: -42.0 },
    camPos: { x: -30.0, y: 3.65, z: -33.8 },
    name: 'PI Objective 1 View',
  },

  // Objective 2 [-48, 0, -30], rotY: 3pi/4 (board faces East-North-East)
  2: {
    x: -44.60,
    y: 0.8,
    z: -33.40,
    heading: (3 * Math.PI) / 4,
    lookAtY: 3.65,
    lookAt: { x: -48.0, y: 3.65, z: -30.0 },
    camPos: { x: -42.20, y: 3.65, z: -35.80 },
    name: 'PI Objective 2 View',
  },

  // Objective 3 [-30, 0, -14], rotY: -3pi/4 (board faces West-South-West)
  3: {
    x: -33.40,
    y: 0.8,
    z: -17.40,
    heading: (-3 * Math.PI) / 4,
    lookAtY: 3.65,
    lookAt: { x: -30.0, y: 3.65, z: -14.0 },
    camPos: { x: -35.80, y: 3.65, z: -19.80 },
    name: 'PI Objective 3 View',
  },
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
      const nextIdx = curIdx < 3 ? curIdx + 1 : 4;
      const alignment = CHECKPOINT_ALIGNMENTS[nextIdx];
      setPortfolioState({
        activeModal: null,
        activeCheckpoint: null,
        targetCheckpointIndex: nextIdx,
        objectivesCompleted: curIdx === 3 ? true : state.objectivesCompleted,
        teleportTarget: alignment,
        isTeleporting: true,
      });
    } else {
      setPortfolioState({ activeModal: null });
    }
  },
  completeCurrentAndAdvance: () => {
    const curIdx = state.activeCheckpoint ? state.activeCheckpoint.index : state.targetCheckpointIndex;
    const nextIdx = curIdx < 3 ? curIdx + 1 : 4;
    const alignment = CHECKPOINT_ALIGNMENTS[nextIdx];

    if (curIdx >= 3) {
      // Completed Objective 3! Play victory chime and align car on track to drive to Team Land!
      if (state.audioEnabled) sounds.celebration();
      setPortfolioState({
        activeModal: null,
        activeCheckpoint: null,
        targetCheckpointIndex: 4,
        objectivesCompleted: true,
        currentLand: 'Cross Boulevard to Team Land',
        teleportTarget: alignment,
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
  openObjectiveBlock: (index) => {
    const currentOpened = state.openedObjectives || [];
    const nextOpened = currentOpened.includes(index) ? currentOpened : [...currentOpened, index];
    const viewAlign = OBJECTIVE_VIEW_ALIGNMENTS[index];

    setPortfolioState({
      activeObjectiveIndex: index,
      openedObjectives: nextOpened,
      currentLand: 'PI Objectives Land',
      // Automatically align car and camera straight on in front of the board
      teleportTarget: viewAlign,
      isTeleporting: true,
    });
  },
  advanceToNextObjective: (nextIdx) => {
    const alignment = CHECKPOINT_ALIGNMENTS[nextIdx];
    if (nextIdx > 3) {
      if (state.audioEnabled) sounds.celebration();
      setPortfolioState({
        activeObjectiveIndex: null,
        targetCheckpointIndex: 4,
        objectivesCompleted: true,
        currentLand: 'Cross Boulevard to Team Land',
        teleportTarget: CHECKPOINT_ALIGNMENTS[4],
        isTeleporting: true,
      });
    } else {
      if (state.audioEnabled) sounds.click();
      setPortfolioState({
        activeObjectiveIndex: null,
        targetCheckpointIndex: nextIdx,
        teleportTarget: alignment,
        isTeleporting: true,
      });
    }
  },
  openTeamPhoto: () => {
    if (state.audioEnabled) sounds.celebration();
    setPortfolioState({
      teamPhotoOpened: true,
      targetCheckpointIndex: 4,
      objectivesCompleted: true,
      currentLand: 'Our Team Land',
      teleportTarget: {
        x: 32.0,
        y: 0.8,
        z: -24.0,
        heading: 0,
        lookAtY: 4.6,
        lookAt: { x: 32.0, y: 4.6, z: -30.0 },
        camPos: { x: 32.0, y: 4.6, z: -18.2 },
        name: 'Team Photo View',
      },
      isTeleporting: true,
    });
  },
  goToPreviousObjective: (prevIdx) => {
    if (prevIdx < 1) return;
    if (state.audioEnabled) sounds.click();
    const alignment = PREV_CHECKPOINT_ALIGNMENTS[prevIdx] || CHECKPOINT_ALIGNMENTS[prevIdx];
    setPortfolioState({
      activeObjectiveIndex: null, // close the currently open objective so the user can re-approach & hit it
      targetCheckpointIndex: prevIdx,
      teleportTarget: alignment,
      isTeleporting: true,
      currentLand: 'PI Objectives Land',
    });
  },
  openCheckpoint: (cpData) => {
    // Keep activeCheckpoint while user is viewing it, without prematurely skipping
    setPortfolioState({
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
