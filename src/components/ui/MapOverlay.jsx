import React, { useEffect } from 'react';
import { X, Navigation, Compass, MapPin, TrendingUp } from 'lucide-react';
import { usePortfolioStore, portfolioActions } from '../../store/usePortfolioStore';
import { sounds } from '../../audio/soundEffects';

const DESTINATIONS = [
  {
    id: 'pi-objectives',
    name: 'PI Objectives Land',
    x: -30,
    y: 0.8,
    z: -56, // Spawns directly before Checkpoint 1 start line
    heading: Math.PI, // Facing South straight towards Checkpoint 1!
    badgeColor: '#0284c7',
    badgeText: '01',
    description: 'Start at Checkpoint 1, then follow the numbered track 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5.',
    isModal: false,
  },
  {
    id: 'business-value',
    name: 'Business Value & Commitments',
    x: 30,
    y: 0.8,
    z: -18,
    heading: Math.PI,
    badgeColor: '#10b981',
    badgeText: '02',
    description: 'Instant card modal showing projected ROI, sprint metrics, and PI commitment.',
    isModal: true,
  },
  {
    id: 'team-land',
    name: 'Our Team Land',
    x: 0,
    y: 0.8,
    z: 28,
    heading: 0,
    badgeColor: '#f97316',
    badgeText: '03',
    description: 'Visit Team Abu 3D group photo stage, spotlights, and engineering roster.',
    isModal: false,
  },
];

export function MapOverlay() {
  const activeModal = usePortfolioStore((s) => s.activeModal);
  const carPosition = usePortfolioStore((s) => s.carPosition);
  const carRotation = usePortfolioStore((s) => s.carRotation);
  const audioEnabled = usePortfolioStore((s) => s.audioEnabled);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModal === 'map') {
        portfolioActions.closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  if (activeModal !== 'map') return null;

  // Convert 3D world coordinates (X, Z) in range [-65, 65] to radar screen percentage (0% to 100%)
  const worldToRadarPercent = (x, z) => {
    const minCoord = -60;
    const maxCoord = 60;
    const left = ((x - minCoord) / (maxCoord - minCoord)) * 100;
    const top = ((z - minCoord) / (maxCoord - minCoord)) * 100;
    return {
      left: `${Math.max(4, Math.min(96, left))}%`,
      top: `${Math.max(6, Math.min(94, top))}%`,
    };
  };

  const carCoords = worldToRadarPercent(carPosition.x, carPosition.z);

  const handleDestinationAction = (dest) => {
    if (audioEnabled) sounds.click();
    if (dest.isModal) {
      portfolioActions.openBusinessValue();
    } else {
      portfolioActions.teleportTo(dest);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => portfolioActions.closeModal()}>
      <div
        className="modal-content map-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={24} color="#0284c7" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Interactive World Navigation Map
            </h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => portfolioActions.closeModal()}
            title="Close Map (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
          Click any destination below to teleport your car and camera instantly across the map.
        </p>

        {/* 2D Stylized Mini-Map Radar Container */}
        <div className="map-radar-container">
          {/* Radar background grid & concentric circles */}
          <div className="radar-grid" />
          <div className="radar-crosshair">
            <div className="radar-circle c1" />
            <div className="radar-circle c2" />
            <div className="radar-circle c3" />
            {/* Center Origin Pin */}
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }} />
          </div>

          {/* Real-time Player Car Indicator Blip */}
          <div
            className="map-car-blip"
            style={{
              left: carCoords.left,
              top: carCoords.top,
            }}
            title="Your Current Location"
          >
            <div
              className="car-blip-arrow"
              style={{
                transform: `rotate(${-(carRotation * (180 / Math.PI)) + 180}deg)`,
              }}
            />
          </div>

          {/* 3 Clickable Destination Points */}
          {DESTINATIONS.map((dest) => {
            const pos = worldToRadarPercent(dest.x, dest.z);
            return (
              <button
                key={dest.id}
                className="map-point-btn"
                style={{
                  left: pos.left,
                  top: pos.top,
                  color: dest.badgeColor,
                }}
                onClick={() => handleDestinationAction(dest)}
                title={dest.isModal ? `Click to view ${dest.name}` : `Click to teleport to ${dest.name}`}
              >
                <div
                  className="point-beacon"
                  style={{
                    backgroundColor: dest.badgeColor,
                  }}
                >
                  {dest.isModal ? <TrendingUp size={16} color="#ffffff" /> : <MapPin size={16} color="#ffffff" />}
                </div>
                <div className="point-label">
                  <span>{dest.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Destination Quick-Teleport Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              onClick={() => handleDestinationAction(dest)}
              style={{
                background: '#f8fafc',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = dest.badgeColor;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: dest.badgeColor,
                  }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  {dest.name}
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: '1.4' }}>
                {dest.description}
              </p>
              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  color: dest.badgeColor,
                  fontWeight: 700,
                }}
              >
                {dest.isModal ? <TrendingUp size={12} /> : <Navigation size={12} />}
                <span>{dest.isModal ? 'Open Card Modal ➔' : 'Teleport Now ➔'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
