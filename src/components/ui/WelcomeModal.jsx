import React from 'react';
import { X, Play, Map, Flag, TrendingUp, Users, Sparkles } from 'lucide-react';
import { usePortfolioStore, portfolioActions } from '../../store/usePortfolioStore';
import { sounds } from '../../audio/soundEffects';

export function WelcomeModal() {
  const activeModal = usePortfolioStore((s) => s.activeModal);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);

  if (activeModal !== 'welcome') return null;

  const handleStart = () => {
    if (audioEnabled) sounds.click();
    portfolioActions.closeModal();
  };

  const handleOpenMap = () => {
    if (audioEnabled) sounds.click();
    portfolioActions.openMap();
  };

  return (
    <div className="modal-backdrop" onClick={handleStart}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', padding: '36px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={handleStart}
          title="Start Presentation (ESC)"
        >
          <X size={18} />
        </button>

        {/* Top Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'linear-gradient(135deg, rgba(255, 179, 0, 0.2), rgba(0, 229, 255, 0.15))',
              border: '1px solid rgba(255, 179, 0, 0.5)',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#ffb300',
              letterSpacing: '0.04em',
            }}
          >
            <Sparkles size={14} color="#00e5ff" />
            <span>AGILE PI PLANNING SHOWCASE</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
            Q4 2026 ITERATION
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, marginBottom: '10px' }}>
          Team Abu Q4 2026
        </h1>
        <p style={{ color: '#334155', fontSize: '1.02rem', lineHeight: 1.6, marginBottom: '24px' }}>
          Welcome to our interactive 3D PI Planning presentation! Take the wheel of the custom <strong>ABU</strong> racer to explore our Program Increment deliverables.
        </p>

        {/* Features 3-Col Tour Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Flag size={18} color="#0284c7" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>5 PI Objectives</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
              Drive through the numbered circuit from Checkpoint 1 to 5 to review architecture and deliverables.
            </p>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <TrendingUp size={18} color="#10b981" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Business Value</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
              Real-time ROI indicators ($1.8M ARR, -42% lead time) with live commitment tracking.
            </p>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Users size={18} color="#f59e0b" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Team Abu</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
              Meet the architects, engineers, and product strategists making Q4 deliverables happen.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <button
            onClick={handleStart}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(2, 132, 199, 0.35)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Play size={18} fill="#ffffff" />
            <span>Start Driving (ABU Racer) 🏎️</span>
          </button>

          <button
            onClick={handleOpenMap}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 22px',
              background: '#f8fafc',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: '12px',
              color: '#0f172a',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Map size={18} color="#0284c7" />
            <span>Open Map [M]</span>
          </button>
        </div>

        {/* Footer controls tip */}
        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.8rem', color: '#64748b' }}>
          Use <strong style={{ color: '#0f172a' }}>WASD</strong> to drive • <strong style={{ color: '#0f172a' }}>SPACE</strong> to brake • <strong style={{ color: '#0f172a' }}>Drag Mouse</strong> to rotate view • <strong style={{ color: '#0f172a' }}>M</strong> for Map
        </div>
      </div>
    </div>
  );
}
