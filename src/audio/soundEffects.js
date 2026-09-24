// Self-contained Web Audio API synthesizer for arcade sound effects
// Does not require external audio files!

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const sounds = {
  // Opening wallet clasp and fintech harmonic chime
  walletOpen: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Mechanical leather magnetic clasp click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(140, now);
      clickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.04);
      clickGain.gain.setValueAtTime(0.25, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.06);

      // 2. Rising modern fintech ripple chime (C5 -> E5 -> G5 -> C6)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.05 + i * 0.05);
        gain.gain.setValueAtTime(0.001, now + 0.05 + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05 + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05 + i * 0.05 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.05 + i * 0.05);
        osc.stop(now + 0.05 + i * 0.05 + 0.45);
      });
    } catch {
      // AudioContext policy fallback
    }
  },

  // Checkpoint bell chime
  checkpoint: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Dual harmonic tones for a magical chime
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.001, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.65);
      });
    } catch {
      // AudioContext policy fallback
    }
  },

  // Teleportation futuristic whoosh / riser
  teleport: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);
      osc.frequency.exponentialRampToValueAtTime(220, now + 1.4);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.45);
    } catch {
      // AudioContext policy fallback
    }
  },

  // Click / Button sound
  click: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext policy fallback
    }
  },

  // PI Objectives 5 Completion Fanfare
  celebration: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Victory arpeggio: C5 -> E5 -> G5 -> C6
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.001, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.85);
      });
    } catch {
      // Fallback
    }
  },

  // Dynamic Real-Time Sports Car Engine Synthesizer
  updateEngine: (speed, isAccelerating, isBraking, isReversing, audioEnabled = true) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Initialize persistent engine audio nodes on first call
      if (!engineState.initialized) {
        engineState.osc1 = ctx.createOscillator();
        engineState.osc2 = ctx.createOscillator();
        engineState.filter = ctx.createBiquadFilter();
        engineState.gain = ctx.createGain();

        engineState.osc1.type = 'sawtooth';
        engineState.osc2.type = 'triangle';

        engineState.filter.type = 'lowpass';
        engineState.filter.frequency.setValueAtTime(320, ctx.currentTime);
        engineState.filter.Q.setValueAtTime(3.0, ctx.currentTime);

        engineState.gain.gain.setValueAtTime(0.0001, ctx.currentTime);

        engineState.osc1.connect(engineState.filter);
        engineState.osc2.connect(engineState.filter);
        engineState.filter.connect(engineState.gain);
        engineState.gain.connect(ctx.destination);

        engineState.osc1.start();
        engineState.osc2.start();
        engineState.initialized = true;
      }

      const now = ctx.currentTime;

      if (!audioEnabled) {
        engineState.gain.gain.setTargetAtTime(0.0001, now, 0.08);
        return;
      }

      const speedAbs = Math.abs(speed);

      // Pitch calculations: Idle ~45Hz, scaling with speed & throttle up to ~220Hz
      let targetFreq = 48 + speedAbs * 5.2;
      if (isAccelerating) {
        targetFreq += 35; // Throttle rev boost
      } else if (isReversing) {
        targetFreq += 18;
      }

      // Smoothly ramp frequency
      engineState.osc1.frequency.setTargetAtTime(targetFreq, now, 0.06);
      engineState.osc2.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.06); // Sub-bass growl

      // Filter cutoff opens up when revving for rich sports car exhaust tone
      const targetFilter = 280 + speedAbs * 24 + (isAccelerating ? 350 : 0);
      engineState.filter.frequency.setTargetAtTime(targetFilter, now, 0.08);

      // Volume envelope: subtle rumble at idle, roaring when full throttle
      let targetVolume = 0.04; // Idle purr
      if (isAccelerating) {
        targetVolume = 0.15;
      } else if (speedAbs > 1.0) {
        targetVolume = 0.08 + Math.min(speedAbs / 30, 1) * 0.06;
      }
      engineState.gain.gain.setTargetAtTime(targetVolume, now, 0.08);

      // Tire screech sound on hard braking at speed
      if (isBraking && speedAbs > 4.5 && now - engineState.lastScreechTime > 0.45) {
        engineState.lastScreechTime = now;
        sounds.screech(ctx, now);
      }
    } catch {
      // AudioContext policy
    }
  },

  // Tyre brake screech sound
  screech: (ctx, now) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(450, now + 0.22);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.Q.setValueAtTime(5.0, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Fallback
    }
  },
};

// Internal engine node cache
const engineState = {
  initialized: false,
  osc1: null,
  osc2: null,
  filter: null,
  gain: null,
  lastScreechTime: 0,
};
