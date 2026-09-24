import React from 'react';
import { Map, Volume2, VolumeX, Navigation } from 'lucide-react';
import { usePortfolioStore, portfolioActions, getPortfolioState } from '../../store/usePortfolioStore';
import { sounds } from '../../audio/soundEffects';

export function HUD() {
  const currentLand = usePortfolioStore((s) => s.currentLand);
  const activeModal = usePortfolioStore((s) => s.activeModal);
  const carSpeed = usePortfolioStore((s) => s.carSpeed);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);
  const targetCheckpointIndex = usePortfolioStore((s) => s.targetCheckpointIndex);
  const activeObjectiveIndex = usePortfolioStore((s) => s.activeObjectiveIndex);
  const objectivesCompleted = usePortfolioStore((s) => s.objectivesCompleted);
  const teamPhotoOpened = usePortfolioStore((s) => s.teamPhotoOpened);

  const handleMapToggle = () => {
    if (audioEnabled) sounds.click();
    if (activeModal === 'map') {
      portfolioActions.closeModal();
    } else {
      portfolioActions.openMap();
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
        {!objectivesCompleted && targetCheckpointIndex <= 3 && (
          <div className="hud-group" style={{ pointerEvents: 'auto' }}>
            {targetCheckpointIndex === 1 ? (
              <div className="hud-guide-pill highlight">
                <Navigation size={15} color="#0284c7" />
                <span className="guide-text">TAKE LEFT ➔ PI OBJECTIVE 1</span>
                <span className="guide-progress">0/3</span>
              </div>
            ) : targetCheckpointIndex === 2 ? (
              <div className="hud-guide-pill highlight">
                <Navigation size={15} color="#0284c7" />
                <span className="guide-text">TURN RIGHT ➔ OBJECTIVE 2</span>
                <span className="guide-progress">1/3</span>
              </div>
            ) : (
              <div className="hud-guide-pill highlight" style={{ borderColor: '#f59e0b', background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)' }}>
                <Navigation size={15} color="#d97706" />
                <span className="guide-text">TURN LEFT ➔ FINAL OBJECTIVE 3</span>
                <span className="guide-progress" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                  2/3
                </span>
              </div>
            )}
          </div>
        )}

        {objectivesCompleted && (
          <div className="hud-group" style={{ pointerEvents: 'auto' }}>
            <div
              className="hud-guide-pill highlight"
              style={{
                borderColor: teamPhotoOpened ? '#10b981' : '#f97316',
                background: teamPhotoOpened
                  ? 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
              }}
            >
              <Navigation size={15} color={teamPhotoOpened ? '#059669' : '#ea580c'} />
              <span className="guide-text">
                {teamPhotoOpened
                  ? '🏆 TEAM ABU Q4 2026 UNLOCKED'
                  : 'DRIVE EAST ➔ OUR TEAM LAND & UNWRAP PHOTO'}
              </span>
              <span
                className="guide-progress"
                style={{
                  background: teamPhotoOpened ? 'rgba(16, 185, 129, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                  color: teamPhotoOpened ? '#059669' : '#ea580c',
                }}
              >
                {teamPhotoOpened ? '3/3' : '➔ 📸'}
              </span>
            </div>
          </div>
        )}

        {/* Right: Map Toggle Button */}
        <div className="hud-group">
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
      {/* Bottom Center: Interactive Auto-Drive to Next / Prev Objective Buttons */}
      {activeObjectiveIndex && (
        <div
          style={{
            position: 'absolute',
            bottom: '34px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {activeObjectiveIndex > 1 && (
            <button
              onClick={() => {
                const prevIdx = activeObjectiveIndex - 1;
                portfolioActions.goToPreviousObjective(prevIdx);
              }}
              style={{
                padding: '14px 22px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                color: '#f8fafc',
                border: '2px solid #94a3b8',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.45), 0 0 12px rgba(148, 163, 184, 0.3)',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '0.04em',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span>⬅️</span>
              <span>PREV ({activeObjectiveIndex - 1})</span>
            </button>
          )}

          <button
            onClick={() => {
              const nextIdx = activeObjectiveIndex < 3 ? activeObjectiveIndex + 1 : 4;
              portfolioActions.advanceToNextObjective(nextIdx);
            }}
            style={{
              padding: '14px 28px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '2px solid #fbbf24',
              boxShadow: '0 8px 30px rgba(2, 132, 199, 0.45), 0 0 16px rgba(251, 191, 36, 0.4)',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              letterSpacing: '0.04em',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🏎️</span>
            <span style={{ whiteSpace: 'nowrap' }}>
              {activeObjectiveIndex < 3
                ? `DRIVE TO OBJECTIVE ${activeObjectiveIndex + 1} ➔`
                : '🏆 ALL OBJECTIVES UNLOCKED! DRIVE TO TEAM LAND ➔ 🏎️'}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
