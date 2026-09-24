import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Award, Wallet as WalletIcon, Sparkles } from 'lucide-react';
import { usePortfolioStore, portfolioActions } from '../../store/usePortfolioStore';
import { sounds } from '../../audio/soundEffects';

const ALL_OBJECTIVES = [
  {
    index: 1,
    title: 'Xtra-Wallet go to alpha Hypercare',
    sentence: 'MVP Alpha release: Onboarding, Payment screens, Dynamic SDK ID, Switch device, Offboarding and maaltijdcheques, live for the Alpha users in the canteens.',
    sentence2: 'Hypercare: daily follow-up, incident fixes and weekly report',
    subtitle: 'Alpha Release ➔ Daily Incident Triage & Operational Stability',
    defaultBv: 9,
  },
  {
    index: 2,
    title: 'Xtra-Wallet go to beta Hypercare',
    sentence: 'Alpha fixes: bugs and issues from the Alpha resolved and included in the Beta release',
    sentence2: 'Hypercare: daily follow-up, incident fixes and weekly report',
    subtitle: 'Beta Promotion ➔ Resolved Alpha Issues & Continuous Monitoring',
    defaultBv: 8,
  },
  {
    index: 3,
    title: 'Xtra-Wallet: Payment History',
    sentence: 'Show payment history of all the payments done by XTRA(Wallet + CG-SDD)',
    subtitle: 'Full Ledger Analytics ➔ Complete Payment Audit & History',
    defaultBv: 9,
  },
];

export function CheckpointModal() {
  const activeModal = usePortfolioStore((s) => s.activeModal);
  const activeCheckpoint = usePortfolioStore((s) => s.activeCheckpoint);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);

  // Unconditional state hooks to guarantee zero React rules-of-hooks violations
  const [isOpen, setIsOpen] = useState(false);
  const [scores, setScores] = useState({ 1: 9, 2: 8, 3: 9 });

  // Trigger smooth wallet unfold animation & audio clasp whenever modal opens or checkpoint changes
  useEffect(() => {
    if (activeModal === 'checkpoint' && activeCheckpoint) {
      setIsOpen(false);
      const timer = setTimeout(() => {
        setIsOpen(true);
        if (audioEnabled) {
          sounds.walletOpen();
        }
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [activeModal, activeCheckpoint?.index, audioEnabled]);

  if (activeModal !== 'checkpoint' || !activeCheckpoint) return null;

  const currentIndex = activeCheckpoint.index;
  const currentObj = ALL_OBJECTIVES.find((o) => o.index === currentIndex) || ALL_OBJECTIVES[0];
  const currentBv = scores[currentIndex] ?? currentObj.defaultBv;

  const handleSelectBV = (val) => {
    if (audioEnabled) sounds.click();
    setScores((prev) => ({ ...prev, [currentIndex]: val }));
  };

  const navigateTo = (newIndex) => {
    if (audioEnabled) sounds.click();
    const target = ALL_OBJECTIVES.find((o) => o.index === newIndex);
    if (target) {
      portfolioActions.openCheckpoint({
        index: target.index,
        title: target.title,
        desc: target.sentence,
      });
    }
  };

  const handleNext = () => {
    if (audioEnabled) sounds.click();
    portfolioActions.completeCurrentAndAdvance();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => portfolioActions.closeModal()}
      style={{
        background: 'rgba(10, 15, 30, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Wallet Stage Wrapper with 3D Perspective */}
      <div
        style={{
          perspective: '1400px',
          width: '100%',
          maxWidth: '840px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={() => portfolioActions.closeModal()}
          title="Close (ESC)"
          style={{
            position: 'absolute',
            top: '-18px',
            right: '4px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
            backdropFilter: 'blur(6px)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <X size={18} />
        </button>

        {/* PHYSICAL LEATHER WALLET OBJECT (Unified Across All Objectives) */}
        <div
          className={`actual-wallet-object ${isOpen ? 'wallet-unfolded' : 'wallet-folded'}`}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #18181b 0%, #09090b 50%, #1c1917 100%)',
            borderRadius: '24px',
            border: '3px solid #27272a',
            boxShadow: isOpen
              ? '0 35px 80px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(245, 158, 11, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
              : '0 20px 40px rgba(0, 0, 0, 0.6)',
            padding: '28px 32px',
            position: 'relative',
            transition: 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isOpen ? 'rotateX(0deg) scale(1)' : 'rotateX(30deg) scale(0.92)',
            opacity: isOpen ? 1 : 0.4,
          }}
        >
          {/* Subtle Leather Perimeter Stitching (Gold thread) */}
          <div
            style={{
              position: 'absolute',
              inset: '10px',
              border: '1.5px dashed rgba(245, 158, 11, 0.45)',
              borderRadius: '16px',
              pointerEvents: 'none',
            }}
          />

          {/* Wallet Center Fold Seam */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              bottom: '18px',
              left: '60%',
              width: '2px',
              background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.15) 20%, rgba(255, 255, 255, 0.15) 80%, transparent)',
              boxShadow: '0 0 8px rgba(0, 0, 0, 0.8)',
              pointerEvents: 'none',
            }}
          />

          {/* INSIDE THE OPENED WALLET */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr',
              gap: '32px',
              alignItems: 'stretch',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* LEFT SIDE: OBJECTIVE IN ONE SENTENCE */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingRight: '12px',
              }}
            >
              <div>
                {/* Header Tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
                    }}
                  >
                    <WalletIcon size={16} color="#ffffff" />
                  </div>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#fbbf24',
                    }}
                  >
                    PI OBJECTIVE {currentIndex} OF 3
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    COMMITTED
                  </span>
                  {currentIndex === 1 && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                      }}
                    >
                      Core Wallet Live
                    </span>
                  )}
                </div>

                {/* Objective Title */}
                <h2
                  style={{
                    fontSize: '1.65rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: '0 0 14px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  {currentObj.title}
                </h2>

                {/* OBJECTIVE DESCRIPTION */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      lineHeight: 1.55,
                      color: '#e2e8f0',
                      margin: 0,
                    }}
                  >
                    "{currentObj.sentence}"
                  </p>
                  {currentObj.sentence2 && (
                    <p
                      style={{
                        fontSize: '0.98rem',
                        fontWeight: 600,
                        lineHeight: 1.5,
                        color: '#38bdf8',
                        margin: 0,
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      📌 {currentObj.sentence2}
                    </p>
                  )}
                </div>
              </div>

              {/* Context Footnote */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '20px',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                }}
              >
                <Sparkles size={14} color="#f59e0b" />
                <span>{currentObj.subtitle}</span>
              </div>
            </div>

            {/* RIGHT SIDE: BUSINESS VALUE (NUMBER ON 1-10 SCALE) */}
            <div
              style={{
                background: 'linear-gradient(145deg, rgba(24, 24, 27, 0.9) 0%, rgba(39, 39, 42, 0.6) 100%)',
                borderRadius: '18px',
                border: '1.5px solid rgba(245, 158, 11, 0.35)',
                padding: '22px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                position: 'relative',
              }}
            >
              {/* Header Label */}
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                }}
              >
                <Award size={16} color="#fbbf24" />
                <span>BUSINESS VALUE</span>
              </div>

              {/* Big Bold Business Value Number (1-10 scale) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: '6px',
                  margin: '8px 0',
                }}
              >
                <span
                  style={{
                    fontSize: '4.4rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 60%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 35px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  {currentBv}
                </span>
                <span
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#71717a',
                  }}
                >
                  / 10
                </span>
              </div>

              {/* 1 - 10 Scale Selector / Dots */}
              <div
                style={{
                  width: '100%',
                  marginTop: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.68rem',
                    color: '#a1a1aa',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Scale (1 – 10)
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '4px',
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = num === currentBv;
                    const isFilled = num <= currentBv;
                    return (
                      <button
                        key={num}
                        onClick={() => handleSelectBV(num)}
                        title={`Set Business Value to ${num}`}
                        style={{
                          flex: 1,
                          height: '24px',
                          borderRadius: '6px',
                          border: isSelected
                            ? '1.5px solid #fbbf24'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected
                            ? '#f59e0b'
                            : isFilled
                            ? 'rgba(245, 158, 11, 0.35)'
                            : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#000000' : isFilled ? '#fbbf24' : '#71717a',
                          fontWeight: 900,
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* WALLET BOTTOM ACTION BAR */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <button
              disabled={currentIndex === 1}
              onClick={() => navigateTo(currentIndex - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: currentIndex === 1 ? '#52525b' : '#f4f4f5',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: currentIndex === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} />
              <span>Prev Objective</span>
            </button>

            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.45)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>
                {currentIndex < 3
                  ? `Drive to Objective ${currentIndex + 1} ➔ 🏎️`
                  : 'Drive to Team Photo ➔ 📸'}
              </span>
              <ChevronRight size={17} />
            </button>

            <button
              disabled={currentIndex === 3}
              onClick={() => navigateTo(currentIndex + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: currentIndex === 3 ? '#52525b' : '#f4f4f5',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: currentIndex === 3 ? 'not-allowed' : 'pointer',
              }}
            >
              <span>Next Objective</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
