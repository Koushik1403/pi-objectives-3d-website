import React from 'react';
import { X, CheckCircle, Flag, ChevronRight, ChevronLeft } from 'lucide-react';
import { usePortfolioStore, portfolioActions } from '../../store/usePortfolioStore';

const ALL_OBJECTIVES = [
  {
    index: 1,
    title: 'Cloud-Native Architecture & Resiliency',
    desc: 'Establish multi-region Kubernetes infrastructure with automatic failover, sub-50ms latency, and automated horizontal pod autoscaling.',
    keyResults: [
      'Achieve 99.99% service level objective (SLO)',
      'Migrate database cluster to distributed serverless Aurora',
      'Reduce p99 API response time below 45ms',
    ],
  },
  {
    index: 2,
    title: 'Autonomous AI Agent Pipeline',
    desc: 'Deploy self-healing coding assistant agents and real-time LLM inference pipelines with smart caching and evaluation benchmarks.',
    keyResults: [
      'Automate 60% of regression bug triage and reproduction',
      'Integrate streaming vector search with sub-100ms retrieval',
      'Zero hallucinations in policy compliance auditing',
    ],
  },
  {
    index: 3,
    title: '60 FPS Interactive 3D Web Platform',
    desc: 'Deliver a browser-based real-time 3D simulation with dynamic Rapier physics, low memory footprint, and instant initial load.',
    keyResults: [
      'Maintain stable 60 FPS across mobile and desktop devices',
      'Bundle size compressed under 450 KB with tree-shaking',
      'GPU draw calls reduced by 40% via mesh batching',
    ],
  },
  {
    index: 4,
    title: 'Micro-Frontend Design System',
    desc: 'Unify 8 enterprise product dashboards into a tokenized modular design system with WCAG AAA accessibility compliance.',
    keyResults: [
      '100% component library coverage with Storybook',
      'Eliminate duplicate CSS stylesheets across micro-apps',
      'Accelerate feature release velocity by 3.5x',
    ],
  },
  {
    index: 5,
    title: 'Zero-Downtime Deployment & Observability',
    desc: 'Implement progressive canary releases with automated rollback triggers based on Prometheus telemetry and OpenTelemetry tracing.',
    keyResults: [
      'Deploy 25+ times per day with zero downtime',
      'Mean time to recovery (MTTR) dropped to under 3 minutes',
      'Full distributed tracing across 120+ microservices',
    ],
  },
];

export function CheckpointModal() {
  const activeModal = usePortfolioStore((s) => s.activeModal);
  const activeCheckpoint = usePortfolioStore((s) => s.activeCheckpoint);

  if (activeModal !== 'checkpoint' || !activeCheckpoint) return null;

  const currentIndex = activeCheckpoint.index;

  const navigateTo = (newIndex) => {
    const target = ALL_OBJECTIVES.find((o) => o.index === newIndex);
    if (target) {
      portfolioActions.openCheckpoint(target);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => portfolioActions.closeModal()}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={() => portfolioActions.closeModal()}
          title="Close (ESC)"
        >
          <X size={18} />
        </button>

        {/* Checkpoint Header Pill */}
        <div className="cp-badge">
          <Flag size={14} />
          <span>CHECKPOINT {currentIndex} OF 5</span>
        </div>

        {/* Progress Bar 1..5 */}
        <div className="cp-progress-bar">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`cp-progress-step ${
                step === currentIndex ? 'active' : step < currentIndex ? 'done' : ''
              }`}
            />
          ))}
        </div>

        {/* Main Title & Description */}
        <h2 className="cp-objective-title">
          PI Objective {currentIndex}: {activeCheckpoint.title}
        </h2>
        <p className="cp-objective-desc">
          {activeCheckpoint.desc}
        </p>

        {/* Key Results */}
        {activeCheckpoint.keyResults && activeCheckpoint.keyResults.length > 0 && (
          <div className="cp-key-results">
            <h4 style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700 }}>
              Target Key Results (KRs)
            </h4>
            {activeCheckpoint.keyResults.map((kr, i) => (
              <div key={i} className="cp-kr-item">
                <CheckCircle size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{kr}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            disabled={currentIndex === 1}
            onClick={() => navigateTo(currentIndex - 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              color: currentIndex === 1 ? '#94a3b8' : '#0f172a',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: currentIndex === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={16} />
            <span>Prev Objective</span>
          </button>

          <button
            onClick={() => portfolioActions.completeCurrentAndAdvance()}
            style={{
              padding: '11px 24px',
              borderRadius: '10px',
              background: currentIndex === 5
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: currentIndex === 5
                ? '0 3px 14px rgba(16, 185, 129, 0.4)'
                : '0 2px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            {currentIndex < 5 ? `Drive to Objective ${currentIndex + 1} ➔ 🏎️` : 'Complete PI Tour & Meet Team Abu ➔ 🏆'}
          </button>

          <button
            disabled={currentIndex === 5}
            onClick={() => navigateTo(currentIndex + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              color: currentIndex === 5 ? '#94a3b8' : '#0f172a',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: currentIndex === 5 ? 'not-allowed' : 'pointer',
            }}
          >
            <span>Next Objective</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
