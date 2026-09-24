import React from 'react';
import { X, TrendingUp, DollarSign, Clock, Award, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { usePortfolioStore, portfolioActions } from '../../store/usePortfolioStore';
import { sounds } from '../../audio/soundEffects';

export function BusinessValueModal() {
  const activeModal = usePortfolioStore((s) => s.activeModal);
  const isCommitted = usePortfolioStore((s) => s.isCommitted);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);

  if (activeModal !== 'business-value') return null;

  const handleToggle = () => {
    if (audioEnabled) sounds.click();
    portfolioActions.toggleCommitment();
  };

  return (
    <div className="modal-backdrop" onClick={() => portfolioActions.closeModal()}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={() => portfolioActions.closeModal()}
          title="Close (ESC)"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <TrendingUp size={24} color="#0284c7" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Business Value Metrics & PI Commitments
          </h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          Real-time enterprise impact indicators, portfolio business outcomes, and predictability scoring.
        </p>

        {/* Metric Cards Grid */}
        <div className="bv-metric-grid">
          <div className="bv-metric-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
              <DollarSign size={20} color="#0284c7" />
            </div>
            <div className="bv-metric-number">$1.8M</div>
            <div className="bv-metric-label">Projected Annual ROI</div>
          </div>

          <div className="bv-metric-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
              <Clock size={20} color="#0284c7" />
            </div>
            <div className="bv-metric-number">-42%</div>
            <div className="bv-metric-label">Deployment Lead Time</div>
          </div>

          <div className="bv-metric-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
              <Award size={20} color="#0284c7" />
            </div>
            <div className="bv-metric-number">98%</div>
            <div className="bv-metric-label">Delivery Predictability</div>
          </div>
        </div>

        {/* Commitment Status Box (Requirement 3B) */}
        <div
          className={`commitment-status-box ${
            isCommitted ? 'committed' : 'not-committed'
          }`}
        >
          <div className="status-indicator">
            <div className={`status-dot ${isCommitted ? 'green' : 'yellow'}`} />
            <div>
              <div
                className="status-text"
                style={{ color: isCommitted ? '#059669' : '#d97706' }}
              >
                {isCommitted ? 'COMMITTED (HIGH CONFIDENCE)' : 'NOT COMMITTED (IN DISCOVERY)'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                {isCommitted
                  ? 'All scope items, milestones, and dependencies locked for this Program Increment.'
                  : 'Scope items pending final stakeholder sign-off and architecture review.'}
              </div>
            </div>
          </div>

          <button
            className="status-toggle-btn"
            onClick={handleToggle}
            title="Toggle React commitment state"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} />
              <span>Toggle Status</span>
            </div>
          </button>
        </div>

        {/* Explanatory bullet points */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <CheckCircle2 size={16} color="#00e676" />
            <span>High-velocity delivery rhythm with 2-week iterations and automated integration gates.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <CheckCircle2 size={16} color="#00e676" />
            <span>Customer-centric telemetry directly mapped to business OKRs and customer retention.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
