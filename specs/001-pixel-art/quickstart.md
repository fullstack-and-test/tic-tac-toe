# Quickstart Guide: Modern Pixel-Art Tic-Tac-Toe Website

**Feature**: 001-pixel-art  
**Date**: 2026-01-29  
**Status**: Complete

---

## Project Overview

This is a modern, responsive tic-tac-toe website with a pixel-art aesthetic. Built with Next.js, React, and CSS Modules. No backend server or database required—all state stored in browser localStorage.

**Tech Stack**:

- **Framework**: Next.js 14+
- **UI**: React 18+
- **Styling**: CSS Modules + CSS animations
- **State**: React hooks + localStorage
- **Testing**: Jest + React Testing Library
- **Deployment**: Static HTML/CSS/JS (next export)

---

## Prerequisites

- Node.js 18+ (or use `nvm use` if `.nvmrc` present)
- npm or yarn
- Modern browser (Chrome, Firefox, Safari, Edge - last 2 versions)

---

## Initial Setup

### 1. Create Next.js Project

```bash
cd /path/to/tic-tac-toe

# Create Next.js app in current directory (or follow Next.js setup wizard)
npx create-next-app@latest . --typescript --tailwind=no --eslint
```

**Key choices** (recommended):

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: No (use CSS Modules instead)
- src/ directory: Yes
- App Router: Yes (default in Next.js 14+)

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

**No additional packages needed** for MVP. Game logic is vanilla JavaScript.

### 3. Verify Installation

```bash
npm run dev
# or
yarn dev
```

Navigate to `http://localhost:3000`. Should see default Next.js page.

---

## Project Structure

```
tic-tac-toe/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main game page
│   └── globals.css          # Global styles (imports module styles)
├── components/
│   ├── GameBoard.tsx        # 3x3 grid
│   ├── Cell.tsx             # Single cell
│   ├── GameStatus.tsx       # Turn/winner display
│   └── ResetButton.tsx      # Reset button
├── hooks/
│   └── useGameState.ts      # Game logic hook
├── styles/
│   ├── board.module.css     # Board & cell styling
│   ├── animations.module.css # Animations (pop-in, fade)
│   └── responsive.module.css # Media queries
├── __tests__/
│   ├── useGameState.test.ts # Game logic tests
│   └── components/          # Component tests
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Core Implementation Steps

### Step 1: Create useGameState Hook

**File**: `hooks/useGameState.ts`

This hook encapsulates all game logic (move validation, win detection, state persistence).

```typescript
// hooks/useGameState.ts
import { useState, useEffect } from "react";

export type GameStatus = "playing" | "x-wins" | "o-wins" | "draw";

export interface GameState {
  board: (string | null)[];
  currentPlayer: "X" | "O";
  status: GameStatus;
  winner: string | null;
  moveCount: number;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    status: "playing",
    winner: null,
    moveCount: 0,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tictactoe-game-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
      } catch (e) {
        console.error("Failed to load saved game:", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("tictactoe-game-state", JSON.stringify(gameState));
  }, [gameState]);

  // Win detection
  const checkWin = (board: (string | null)[], player: string): boolean => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    return lines.some((line) => line.every((i) => board[i] === player));
  };

  const makeMove = (
    cellIndex: number,
  ): { success: boolean; error?: string } => {
    if (gameState.status !== "playing") {
      return { success: false, error: "Game not in progress" };
    }
    if (cellIndex < 0 || cellIndex > 8) {
      return { success: false, error: "Invalid cell index" };
    }
    if (gameState.board[cellIndex] !== null) {
      return { success: false, error: "Cell already occupied" };
    }

    const newBoard = [...gameState.board];
    newBoard[cellIndex] = gameState.currentPlayer;
    const newMoveCount = gameState.moveCount + 1;

    let newStatus: GameStatus = "playing";
    let newWinner: string | null = null;

    if (checkWin(newBoard, gameState.currentPlayer)) {
      newStatus = gameState.currentPlayer === "X" ? "x-wins" : "o-wins";
      newWinner = gameState.currentPlayer;
    } else if (newMoveCount === 9) {
      newStatus = "draw";
    }

    const nextPlayer = gameState.currentPlayer === "X" ? "O" : "X";

    setGameState({
      board: newBoard,
      currentPlayer: nextPlayer,
      status: newStatus,
      winner: newWinner,
      moveCount: newMoveCount,
    });

    return { success: true };
  };

  const resetGame = () => {
    setGameState({
      board: Array(9).fill(null),
      currentPlayer: "X",
      status: "playing",
      winner: null,
      moveCount: 0,
    });
  };

  return {
    gameState,
    makeMove,
    resetGame,
  };
}
```

---

### Step 2: Create Cell Component

**File**: `components/Cell.tsx`

```typescript
// components/Cell.tsx
import styles from '@/styles/board.module.css'

interface CellProps {
  value: string | null
  index: number
  onClick: () => void
  disabled?: boolean
  isAnimating?: boolean
}

export function Cell({ value, index, onClick, disabled, isAnimating }: CellProps) {
  return (
    <button
      className={`${styles.cell} ${isAnimating && value ? styles.animate : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Cell ${index}: ${value || 'empty'}`}
      style={{ animation: isAnimating && value ? 'popIn 0.25s ease-out' : 'none' }}
    >
      <span className={styles.symbol}>{value}</span>
    </button>
  )
}
```

---

### Step 3: Create GameBoard Component

**File**: `components/GameBoard.tsx`

```typescript
// components/GameBoard.tsx
import { Cell } from './Cell'
import styles from '@/styles/board.module.css'

interface GameBoardProps {
  board: (string | null)[]
  onCellClick: (index: number) => void
  disabled?: boolean
  animatingIndex?: number
}

export function GameBoard({
  board,
  onCellClick,
  disabled,
  animatingIndex,
}: GameBoardProps) {
  return (
    <div className={styles.gameBoard}>
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          index={index}
          onClick={() => onCellClick(index)}
          disabled={disabled || value !== null}
          isAnimating={index === animatingIndex}
        />
      ))}
    </div>
  )
}
```

---

### Step 4: Create GameStatus Component

**File**: `components/GameStatus.tsx`

```typescript
// components/GameStatus.tsx
import styles from '@/styles/board.module.css'

interface GameStatusProps {
  currentPlayer: string
  status: string
  winner: string | null
}

export function GameStatus({ currentPlayer, status, winner }: GameStatusProps) {
  let message = ''

  if (status === 'playing') {
    message = `${currentPlayer}'s Turn`
  } else if (status === 'x-wins') {
    message = 'X Wins!'
  } else if (status === 'o-wins') {
    message = 'O Wins!'
  } else if (status === 'draw') {
    message = 'Draw!'
  }

  return <div className={styles.gameStatus}>{message}</div>
}
```

---

### Step 5: Create ResetButton Component

**File**: `components/ResetButton.tsx`

```typescript
// components/ResetButton.tsx
import styles from '@/styles/board.module.css'

interface ResetButtonProps {
  onClick: () => void
  label?: string
}

export function ResetButton({ onClick, label = 'Reset' }: ResetButtonProps) {
  return (
    <button className={styles.resetButton} onClick={onClick}>
      {label}
    </button>
  )
}
```

---

### Step 6: Create Styling

**File**: `styles/board.module.css`

```css
/* Pixel-art grid and cells */
.gameBoard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: clamp(280px, 90vw, 600px);
  aspect-ratio: 1;
  gap: clamp(2px, 2vw, 20px);
  margin: 0 auto;
  padding: clamp(1rem, 5vw, 2rem);
  background: #1a1a1a;
  border-radius: 4px;
}

.cell {
  width: 100%;
  aspect-ratio: 1;
  background: #2d2d2d;
  border: 2px solid #ffffff;
  cursor: pointer;
  font-size: clamp(2rem, 15vw, 4rem);
  font-weight: bold;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  transition: all 0.2s ease;
  image-rendering: pixelated;
}

.cell:hover:not(:disabled) {
  background: #3a3a3a;
  box-shadow: inset 0 0 0 2px #ffd93d;
}

.cell:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cell.animate {
  animation: popIn 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

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
  display: block;
}

.symbol:nth-child(1):before {
  content: attr(data-player);
}

.gameStatus {
  text-align: center;
  font-size: clamp(1rem, 4vw, 1.5rem);
  font-weight: 700;
  margin: 1rem 0;
  color: #ffffff;
  letter-spacing: 0.1em;
}

.resetButton {
  display: block;
  margin: 1.5rem auto 0;
  padding: 0.75rem 2rem;
  min-height: 44px;
  min-width: 120px;
  background: #ff6b6b;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resetButton:hover {
  background: #ff5252;
  transform: scale(1.05);
}

.resetButton:active {
  transform: scale(0.98);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .gameBoard {
    gap: 4px;
    padding: 1rem;
  }

  .cell {
    font-size: 2rem;
  }
}

/* Tablet */
@media (min-width: 481px) and (max-width: 1024px) {
  .gameBoard {
    gap: 8px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .gameBoard {
    gap: 12px;
  }
}
```

---

### Step 7: Create Main Page

**File**: `app/page.tsx`

```typescript
// app/page.tsx
'use client'

import { useState } from 'react'
import { GameBoard } from '@/components/GameBoard'
import { GameStatus } from '@/components/GameStatus'
import { ResetButton } from '@/components/ResetButton'
import { useGameState } from '@/hooks/useGameState'
import styles from '@/styles/board.module.css'

export default function Home() {
  const { gameState, makeMove, resetGame } = useGameState()
  const [animatingIndex, setAnimatingIndex] = useState<number | undefined>()

  const handleCellClick = (index: number) => {
    const result = makeMove(index)
    if (result.success) {
      setAnimatingIndex(index)
      setTimeout(() => setAnimatingIndex(undefined), 300)
    }
  }

  return (
    <main>
      <h1>Tic-Tac-Toe</h1>
      <GameStatus
        currentPlayer={gameState.currentPlayer}
        status={gameState.status}
        winner={gameState.winner}
      />
      <GameBoard
        board={gameState.board}
        onCellClick={handleCellClick}
        disabled={gameState.status !== 'playing'}
        animatingIndex={animatingIndex}
      />
      <ResetButton onClick={resetGame} />
    </main>
  )
}
```

---

## Development Workflow

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in browser. Hot-reload on file changes.

### Run Tests

```bash
npm run test
```

Write tests in `__tests__/` directory. Use Jest + React Testing Library.

### Build for Production

```bash
npm run build
```

Optimizes bundle and prepares for deployment.

### Export as Static Site

```bash
npm run export
```

Generates static HTML/CSS/JS in `out/` directory. Deploy this folder to any static hosting.

---

## Key Features Implemented

- ✅ 3x3 pixelated game board
- ✅ Turn indicator (X/O)
- ✅ Win detection (8 combinations)
- ✅ Draw detection
- ✅ Reset button
- ✅ Animations (200-300ms pop-in)
- ✅ Responsive design (320px-2560px)
- ✅ localStorage persistence
- ✅ Pixel-art aesthetic (limited colors, high contrast)
- ✅ Touch-friendly (44x44px minimum targets)
- ✅ Offline-capable

---

## Testing

### Test Game Logic

**File**: `__tests__/useGameState.test.ts`

```typescript
import { renderHook, act } from "@testing-library/react";
import { useGameState } from "@/hooks/useGameState";

describe("useGameState", () => {
  it("should make a valid move", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      const res = result.current.makeMove(0);
      expect(res.success).toBe(true);
    });

    expect(result.current.gameState.board[0]).toBe("X");
    expect(result.current.gameState.currentPlayer).toBe("O");
  });

  it("should detect a win", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      // X: 0, 4, 8 (diagonal)
      result.current.makeMove(0); // X
      result.current.makeMove(1); // O
      result.current.makeMove(4); // X
      result.current.makeMove(2); // O
      result.current.makeMove(8); // X - should win
    });

    expect(result.current.gameState.status).toBe("x-wins");
    expect(result.current.gameState.winner).toBe("X");
  });
});
```

---

## Deployment

### Deploy to Vercel (Easiest)

```bash
npm i -g vercel
vercel
```

Vercel auto-detects Next.js and deploys automatically.

### Deploy to GitHub Pages

```bash
npm run build
npm run export
# Push 'out/' folder to gh-pages branch
```

### Deploy to Any Static Hosting

```bash
npm run build
npm run export
# Upload 'out/' folder to your hosting provider
```

Since app is static HTML/CSS/JS with no backend, it works anywhere.

---

## Browser Support

- Chrome/Edge: Last 2 versions ✓
- Firefox: Last 2 versions ✓
- Safari: Last 2 versions ✓
- Mobile browsers: Any modern browser ✓

---

## Performance Targets

- **Page load**: <2s (4G)
- **Interaction response**: 100ms
- **Animation smoothness**: 60fps
- **Bundle size**: ~200KB (uncompressed), ~80KB (gzipped)

---

## Offline Support

Game works offline after initial load. All state saved in localStorage (no network calls).

---

## Next Steps

1. ✅ Implement core game logic
2. ✅ Build responsive UI components
3. ✅ Add pixel-art styling
4. ✅ Implement localStorage persistence
5. 🔲 Add unit/component tests (Phase 2)
6. 🔲 Deploy to production (Phase 2)
7. 🔲 Monitor analytics (future)

---

## Support

For issues or questions, see the [Feature Specification](spec.md) and [Data Model](data-model.md).

---

**Happy coding!** 🎮
