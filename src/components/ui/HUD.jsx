import React from 'react';
import { Map, Volume2, VolumeX, TrendingUp } from 'lucide-react';
import { usePortfolioStore, portfolioActions, getPortfolioState } from '../../store/usePortfolioStore';
import { sounds } from '../../audio/soundEffects';

export function HUD() {
  const currentLand = usePortfolioStore((s) => s.currentLand);
  const activeModal = usePortfolioStore((s) => s.activeModal);
  const carSpeed = usePortfolioStore((s) => s.carSpeed);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);
  const targetCheckpointIndex = usePortfolioStore((s) => s.targetCheckpointIndex);
  const objectivesCompleted = usePortfolioStore((s) => s.objectivesCompleted);

  const handleMapToggle = () => {
    if (audioEnabled) sounds.click();
    if (activeModal === 'map') {
      portfolioActions.closeModal();
    } else {
      portfolioActions.openMap();
    }
  };

  const handleBusinessValueToggle = () => {
    if (audioEnabled) sounds.click();
    if (activeModal === 'business-value') {
      portfolioActions.closeModal();
    } else {
      portfolioActions.openBusinessValue();
    }
  };

  const handleAudioToggle = () => {
    portfolioActions.toggleAudio();
  };

  // Real-time continuous 60fps speedometer sync loop
  React.useEffect(() => {
    let animId;
    const updateSpeed = () => {
      const state = getPortfolioState();
      const el = document.getElementById('hud-speed-num');
      const bar = document.getElementById('hud-speed-bar-fill');
      if (el && el.textContent !== String(state.carSpeed)) {
        el.textContent = String(state.carSpeed);
      }
      if (bar) {
        bar.style.width = `${Math.min(100, (state.carSpeed / 85) * 100)}%`;
      }
      animId = requestAnimationFrame(updateSpeed);
    };
    animId = requestAnimationFrame(updateSpeed);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <>
      {/* Top Navigation HUD - Ultra Clean & Minimal */}
      <div className="hud-top">
        {/* Left: Team Abu Branding, Zone & Sound */}
        <div className="hud-group">
          <div
            className="hud-badge team-badge"
            onClick={() => portfolioActions.openWelcome()}
            title="Click to view Team Abu Q4 2026 Overview"
          >
            <span className="brand-title">TEAM ABU</span>
            <span className="brand-tag">Q4 2026</span>
          </div>

          <div className="hud-badge zone-indicator">
            <span className="zone-dot" />
            <span className="zone-text">{currentLand}</span>
          </div>

          <button
            className="hud-icon-btn"
            onClick={handleAudioToggle}
            title={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {audioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </div>

        {/* Center: Real-Time Dynamic Guidance Indicator */}
        <div className="hud-group" style={{ pointerEvents: 'auto' }}>
          {objectivesCompleted || targetCheckpointIndex >= 6 ? (
            <div className="hud-guide-pill completed">
              <span className="guide-arrow">🏆</span>
              <span className="guide-text">ALL OBJECTIVES COMPLETED • VISIT TEAM ABU (SOUTH)</span>
              <span className="guide-progress" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                5/5
              </span>
            </div>
          ) : targetCheckpointIndex === 1 ? (
            <div className="hud-guide-pill highlight">
              <span className="guide-arrow">⮤</span>
              <span className="guide-text">TAKE LEFT ➔ PI OBJECTIVE 1</span>
              <span className="guide-progress">0/5</span>
            </div>
          ) : targetCheckpointIndex === 2 ? (
            <div className="hud-guide-pill highlight">
              <span className="guide-arrow">⮡</span>
              <span className="guide-text">TURN RIGHT ➔ OBJECTIVE 2</span>
              <span className="guide-progress">1/5</span>
            </div>
          ) : targetCheckpointIndex === 3 ? (
            <div className="hud-guide-pill highlight">
              <span className="guide-arrow">⮤</span>
              <span className="guide-text">TURN LEFT ➔ OBJECTIVE 3</span>
              <span className="guide-progress">2/5</span>
            </div>
          ) : targetCheckpointIndex === 4 ? (
            <div className="hud-guide-pill highlight">
              <span className="guide-arrow">⮤</span>
              <span className="guide-text">TURN LEFT ➔ OBJECTIVE 4</span>
              <span className="guide-progress">3/5</span>
            </div>
          ) : (
            <div className="hud-guide-pill highlight" style={{ borderColor: '#f59e0b', background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)' }}>
              <span className="guide-arrow" style={{ color: '#d97706' }}>⮤</span>
              <span className="guide-text">TURN LEFT ➔ FINAL OBJECTIVE 5</span>
              <span className="guide-progress" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                4/5
              </span>
            </div>
          )}
        </div>

        {/* Right: Business Value Card & Map Toggle Buttons */}
        <div className="hud-group">
          <button
            className={`hud-btn ${activeModal === 'business-value' ? 'active' : ''}`}
            onClick={handleBusinessValueToggle}
            title="View Business Value Metrics & PI Commitments"
          >
            <TrendingUp size={16} />
            <span>Business Value</span>
          </button>

          <button
            className={`hud-btn ${activeModal === 'map' ? 'active' : ''}`}
            onClick={handleMapToggle}
          >
            <Map size={17} />
            <span>Map [M]</span>
          </button>
        </div>
      </div>

      {/* Bottom Left: Minimalist Digital Speedometer */}
      <div className="hud-bottom-left">
        <div className="speed-meter">
          <div className="speed-display">
            <span id="hud-speed-num" className="speed-value">
              {carSpeed}
            </span>
            <span className="speed-unit">KM/H</span>
          </div>
          <div className="speed-bar-track">
            <div
              id="hud-speed-bar-fill"
              className="speed-bar-fill"
              style={{ width: `${Math.min(100, (carSpeed / 85) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Right: Sleek, Unobtrusive Controls Hint */}
      <div className="hud-bottom-right">
        <div className="controls-card">
          <div className="control-item">
            <div className="keys-row">
              <span className="key-badge">W</span>
              <span className="key-badge">A</span>
              <span className="key-badge">S</span>
              <span className="key-badge">D</span>
            </div>
            <span className="control-label">Drive</span>
          </div>
          <div className="control-divider" />
          <div className="control-item">
            <span className="key-badge">SPACE</span>
            <span className="control-label">Brake</span>
          </div>
          <div className="control-divider" />
          <div className="control-item">
            <span className="key-badge">MOUSE</span>
            <span className="control-label">Rotate</span>
          </div>
          <div className="control-divider" />
          <div className="control-item">
            <span className="key-badge">M</span>
            <span className="control-label">Map</span>
          </div>
        </div>
      </div>
    </>
  );
}
