# Phase 0 Research: Modern Pixel-Art Tic-Tac-Toe Website

**Feature**: 001-pixel-art  
**Date**: 2026-01-29  
**Status**: Complete

## Research Overview

All technical decisions and unknowns from the implementation plan have been researched and resolved. This document captures the findings and rationale for technology and architecture choices.

---

## 1. Framework & Technology Stack

### Decision: Next.js 14+ with React 18+

**Research Question**: What web framework best supports pixel-art aesthetic with smooth animations and responsive design while maintaining offline capability?

**Rationale**:

- **Next.js** provides modern build tooling and component structure without forcing server-side rendering
- **React 18+** enables declarative UI composition for game board cells and animations
- **CSS Modules** allow scoped pixel-art styling without global namespace conflicts
- **Static export** (next export) produces a standard HTML/CSS/JS bundle deployable anywhere
- **localStorage API** (native browser) handles game state persistence offline

**Alternatives Considered**:

1. **Vanilla JavaScript** - Constitution-compliant but complex animations harder to maintain long-term
2. **Vite + Vanilla JS** - Lighter build, but fewer built-in optimizations
3. **Svelte** - Lightweight framework, but smaller ecosystem for animation libraries

**Risk Mitigation**: Use `next export` to generate static HTML - maintains deployment simplicity while leveraging React for component management.

---

## 2. Animation Implementation

### Decision: CSS Animations + Transitions (no animation library)

**Research Question**: How to achieve smooth 200-300ms animations without external libraries?

**Rationale**:

- **CSS Animations**: Native browser support, 60fps capable, zero runtime overhead
- **CSS Transitions**: Perfect for state changes (move appearance, turn switch)
- **transform + opacity**: Use hardware-accelerated properties for best performance
- **@keyframes**: Define pixelated "pop-in" and "fade" effects

**Performance Target**: 200-300ms animations meet the success criteria (SC-008)

**Implementation Pattern**:

```css
@keyframes popIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.symbol {
  animation: popIn 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

---

## 3. Pixel-Art Aesthetic Approach

### Decision: CSS-based pixelation using image-rendering and border-radius

**Research Question**: How to create authentic pixel-art visuals without bitmap assets?

**Rationale**:

- **image-rendering: pixelated** - CSS property for crisp pixel rendering
- **CSS Grid** - Naturally creates grid aesthetic for tic-tac-toe board
- **SVG or CSS shapes** - Create X and O symbols as vectors, then style with pixelated effect
- **Limited palette** - Define 4-6 CSS variables for entire color scheme (High contrast with subtle accents)

**Color Palette** (≤6 colors per SC-005):

- Background: `#1a1a1a` (dark)
- Grid: `#ffffff` (white, high contrast)
- X: `#ff6b6b` (red)
- O: `#4ecdc4` (cyan)
- Accent: `#ffd93d` (yellow - for highlights)
- Text: `#ffffff` (white)

**Contrast Verification**: All combinations meet 4.5:1 minimum per WCAG AA

---

## 4. Responsive Design Strategy

### Decision: CSS Grid with clamp() + media queries

**Research Question**: How to maintain pixel-perfect appearance across 320px-2560px?

**Rationale**:

- **CSS Grid**: 3x3 board naturally scales with container width
- **clamp()** function: Ensures smooth scaling between breakpoints
- **aspect-ratio**: Maintain square cells regardless of viewport
- **Touch targets**: Minimum 44x44px guaranteed via CSS (SC-003)

**Viewport Breakpoints**:

- Mobile: 320px-479px (single column layout, full-width board)
- Tablet: 480px-1024px (centered, medium board)
- Desktop: 1025px+ (centered, appropriate padding)

**Grid Sizing Pattern**:

```css
.gameBoard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: clamp(280px, 90vw, 600px);
  aspect-ratio: 1;
  gap: clamp(2px, 2vw, 20px);
}

.cell {
  min-height: 44px; /* Touch target minimum */
  aspect-ratio: 1;
}
```

---

## 5. Game State Management

### Decision: React Hook (useGameState) + localStorage

**Research Question**: How to manage game state simply without external libraries?

**Rationale**:

- **React hooks** (useState) - Perfect for local component state
- **useEffect** - Save to localStorage on every state change
- **Custom hook** - Encapsulate all game logic (win detection, move validation)
- **localStorage API** - Native browser persistence, no setup needed

**State Structure**:

```javascript
{
  board: [null, null, null, null, null, null, null, null, null], // 9 cells
  currentPlayer: 'X', // or 'O'
  gameStatus: 'playing', // 'playing', 'x-wins', 'o-wins', 'draw'
  moveHistory: [] // For future features (undo, replay)
}
```

**No External Dependencies**:

- Game logic fits in ~100 lines of JavaScript
- Win detection: Check 8 possible winning combinations
- Move validation: Check if cell empty and within bounds

---

## 6. Typography Approach

### Decision: System font stack + optional web font for accent

**Research Question**: How to achieve "crisp typography" with pixel-art feel without overloading?

**Rationale**:

- **System fonts** (primary): -apple-system, BlinkMacSystemFont, "Segoe UI" (fast, familiar)
- **Optional pixel font** (accent): "Press Start 2P" from Google Fonts for retro feel (used sparingly for title only)
- **Font sizing**: Responsive with clamp() to maintain readability across viewports
- **Font weight**: Bold (600-700) for game status messages, regular for secondary text

**Implementation**:

```css
/* Primary - crisp modern */
body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: clamp(14px, 2vw, 18px);
}

/* Accent - pixel-art, minimal usage */
.title {
  font-family: "Press Start 2P", cursive;
  font-size: clamp(16px, 4vw, 32px);
  letter-spacing: 0.1em;
}
```

---

## 7. Browser Support & Performance

### Decision: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)

**Research Question**: What baseline browser features are required?

**Required Features**:

- CSS Grid & Flexbox (widely supported)
- CSS Animations & Transitions (IE 10+, but targeting modern only)
- localStorage API (IE 8+)
- ES6 JavaScript (via Next.js transpilation)

**Performance Targets**:

- **Page load**: <2s on 4G (SC-007)
  - Next.js output: ~150KB gzipped HTML/CSS/JS total
  - Achievable with proper code splitting
- **Interaction response**: 100ms (SC-002)
  - All DOM updates use CSS (instant)
  - Game logic runs in <10ms (simple array operations)
- **Animation smoothness**: 60fps (SC-008)
  - CSS animations hardware-accelerated
  - No JavaScript blocking animations

---

## 8. Offline Capability

### Decision: Static export + Service Worker (optional, Phase 2)

**Research Question**: How to ensure offline gameplay after first visit?

**Rationale**:

- **next export**: Generates static HTML/CSS/JS, no server needed
- **localStorage**: All game state persists in browser
- **Service Worker** (optional future): Cache assets for true offline-first
- **No external APIs**: Game is purely client-side

**MVP Implementation**: Automatic offline support via static export. Service Worker deferred to Phase 2 if needed.

---

## 9. Testing Strategy

### Decision: Jest + React Testing Library + Manual testing

**Research Question**: How to test game logic and UI components effectively?

**Test Pyramid**:

1. **Unit Tests** (~70% coverage)
   - Game logic: win detection, move validation, draw detection
   - Hooks: useGameState state transitions
2. **Component Tests** (~20% coverage)
   - Cell click interactions
   - Board rendering
   - Status message updates
3. **Manual Tests** (~10% coverage)
   - Visual regression (pixel-art appearance)
   - Animation smoothness
   - Responsive behavior across devices

**Testing Tools**:

- **Jest**: Test runner (built into Next.js)
- **React Testing Library**: Component interaction testing
- **Manual**: Screenshots + device testing for pixel-art accuracy

---

## 10. Deployment & Build Process

### Decision: next export for static output + standard hosting

**Research Question**: Where and how to deploy the built application?

**Deployment Process**:

1. Run `npm run build` (Next.js builds and optimizes)
2. Run `npm run export` (generates static HTML in `out/` directory)
3. Deploy `out/` folder to static hosting (Vercel, GitHub Pages, Netlify, or simple file server)

**No Server Required**: Completely static, can be hosted anywhere

**Build Artifacts**:

- `out/index.html` - Main game page
- `out/_next/static/` - Optimized JS/CSS
- Total size: ~200-300KB (uncompressed), ~80-100KB (gzipped)

---

## Summary of All Decisions

| Item            | Decision                         | Rationale                               |
| --------------- | -------------------------------- | --------------------------------------- |
| Framework       | Next.js 14+                      | Modern, static-capable, component-based |
| Styling         | CSS Modules                      | Scoped, pixelated styling               |
| Animations      | CSS Animations                   | 60fps, no library overhead              |
| State Mgmt      | React hooks + localStorage       | Simple, native browser                  |
| Palette         | 6 colors max                     | Constraint compliance, high contrast    |
| Typography      | System fonts + accent pixel font | Crisp modern + retro feel               |
| Responsive      | CSS Grid + clamp()               | Scales 320px-2560px smoothly            |
| Browser Support | Modern (last 2 versions)         | Performance + feature support           |
| Offline         | Static export + localStorage     | Works without internet after load       |
| Testing         | Jest + RTL + manual              | Balanced coverage                       |
| Deployment      | Static export to any host        | No server needed                        |

---

## Constitution Re-Check (Post-Research)

**Status**: APPROVED WITH AMENDMENT

All technical decisions support the constitution's spirit (offline-capable, responsive, no backend) while using modern web standards. The Next.js framework amendment is justified and documented in plan.md Complexity Tracking section.

---

**Next Phase**: Phase 1 - Design & Contracts (data-model.md, contracts/, quickstart.md)
