import React from 'react';
import { Scene } from './components/3d/Scene';
import { HUD } from './components/ui/HUD';
import { MapOverlay } from './components/ui/MapOverlay';
import { CheckpointModal } from './components/ui/CheckpointModal';
import { BusinessValueModal } from './components/ui/BusinessValueModal';
import { TeamModal } from './components/ui/TeamModal';
import { WelcomeModal } from './components/ui/WelcomeModal';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { usePortfolioStore } from './store/usePortfolioStore';

export default function App() {
  const isTeleporting = usePortfolioStore((s) => s.isTeleporting);

  return (
    <ErrorBoundary>
      <div className="app-container">
        {/* 3D WebGL Canvas Layer */}
        <Scene />

        {/* 2D HTML/CSS UI Overlay Layer (Outside Canvas) */}
        <HUD />
        <WelcomeModal />
        <MapOverlay />
        <CheckpointModal />
        <BusinessValueModal />
        <TeamModal />

        {/* Cinematic Flash Effect when teleporting */}
        {isTeleporting && <div className="teleport-overlay" />}
      </div>
    </ErrorBoundary>
  );
}
