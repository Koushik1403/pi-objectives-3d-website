# 🏎️ 3D Arcade Car Portfolio (Bruno Simon Inspired)

A high-performance, interactive 3D portfolio website built with **React**, **React Three Fiber (R3F)**, **@react-three/rapier** (rigid-body physics engine), and **GSAP** (for cinematic camera choreography).

---

## 🚀 Features

### 1. Arcade Car Controller & Physics
- **RigidBody vehicle simulation** via `@react-three/rapier`:
  - Snappy arcade acceleration, reverse, and braking.
  - Angular lock on X & Z axes to prevent unwanted flips while preserving full 360° steering.
  - Dynamic lateral drift resistance and tire damping.
  - Interactive steering: front wheels steer with keypress, and all wheels rotate with ground speed.
- **Controls:**
  - `W` / `Up Arrow`: Drive forward
  - `S` / `Down Arrow`: Reverse
  - `A` / `Left Arrow`: Steer left
  - `D` / `Right Arrow`: Steer right
  - `Space`: Handbrake
  - `R`: Reset car position to center
  - `M`: Toggle 2D Mini-Map

### 2. Tactical Mini-Map & Instant Teleportation
- Persistent HUD **Map button [M]** opening a 2D cyber-radar overlay.
- Real-time car blip with rotating heading arrow.
- 3 interactive land nodes:
  - **PI Objectives Land** (`[-30, 0, -30]`)
  - **Business Value & Commitment Land** (`[30, 0, -30]`)
  - **Our Team Land** (`[0, 0, 40]`)
- **Safe Teleportation Sequence:**
  - Smooth GSAP interpolation of car position.
  - Updates Rapier physics via `rigidBodyRef.current.setTranslation(...)` on each tick.
  - Resets linear and angular velocities to `0` at destination to prevent physics explosion/bouncing.
  - High-altitude camera swoop curve framing the new zone on arrival.

### 3. The Three Interactive Lands & Proximity Sensors
- **Region A: PI Objectives Land:**
  - 5 sequential glowing checkpoint arches with numbered badges.
  - Proximity detection triggers 2D HTML popup modal for Objective 1 through 5 in sequence with target Key Results (KRs) and navigation buttons.
- **Region B: Business Value & Commitment Land:**
  - 3D bar chart pillars and rotating commitment core.
  - Enters zone -> displays 2D HTML card with ROI metrics ($1.8M ARR, -42% lead time, 98% velocity).
  - Status indicator: **"Committed" (Green)** or **"Not Committed" (Yellow)** backed by dynamic React state with a toggle button.
- **Region C: Our Team Land:**
  - 4 avatar pedestals with floating monogram frames.
  - Proximity detection displays team profile layout with roles, skill tags, and descriptions.

---

## 🛠️ Getting Started

```bash
# 1. Navigate to the project directory
cd r3f-arcade-portfolio

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## 📁 Project Structure

```
r3f-arcade-portfolio/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   └── index.css                 # Glassmorphic cyber/arcade theme & animations
│   ├── store/
│   │   └── usePortfolioStore.js      # Global state & telemetry store
│   ├── audio/
│   │   └── soundEffects.js           # Web Audio API arcade sound synthesizer
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── Scene.jsx             # Canvas, studio lighting, physics provider
│   │   │   ├── Car.jsx               # Arcade car with Rapier physics & steerable wheels
│   │   │   ├── CameraController.jsx  # Smooth follow & GSAP cinematic transition controller
│   │   │   ├── Ground.jsx            # Stylized grid floor, road paths, boundary colliders
│   │   │   ├── EnvironmentDecor.jsx  # Low-poly trees, reactive cones, road signposts
│   │   │   ├── CheckpointArch.jsx    # Glowing arch with number badge & proximity trigger
│   │   │   └── lands/
│   │   │       ├── PIObjectivesLand.jsx       # 5 sequential checkpoint arches
│   │   │       ├── BusinessCommitmentLand.jsx # 3D metrics podium & commitment crystal
│   │   │       └── TeamLand.jsx               # 3D avatar pedestals
│   │   └── ui/
│   │       ├── HUD.jsx               # Top bar, speedometer, persistent Map toggle button
│   │       ├── MapOverlay.jsx        # 2D stylized mini-map modal with radar blip
│   │       ├── CheckpointModal.jsx   # Objective popup (1-5) with progress steps
│   │       ├── BusinessValueModal.jsx# Business metrics card with reactive Committed toggle
│   │       └── TeamModal.jsx         # Core team profile cards layout
```
