# API & Component Contracts: Modern Pixel-Art Tic-Tac-Toe Website

**Feature**: 001-pixel-art  
**Date**: 2026-01-29  
**Status**: Complete

---

## Overview

This document defines the contracts for all user-facing actions and component interfaces. Since this is a client-side only application with no backend, contracts define:

1. **User Actions** → Component event handlers
2. **Component Props** → TypeScript interfaces
3. **Game Logic** → Hook contracts
4. **Data Persistence** → localStorage schema

No REST/GraphQL APIs needed - all operations are in-memory with local persistence.

---

## User Actions

### Action 1: Play Move (Make Move on Board)

**User Action**: Player clicks an empty cell

**Input**:

- `cellIndex` (number): 0-8

**Validation**:

- Cell exists (0 ≤ cellIndex ≤ 8)
- Cell is empty (board[cellIndex] === null)
- Game status is 'playing'
- It's the current player's turn

**Output**:

```typescript
{
  success: boolean
  message?: string
  updatedGameState?: GameState
  error?: string
}
```

**Success Response**:

```json
{
  "success": true,
  "updatedGameState": {
    "board": ["X", "O", null, null, "X", null, null, null, "O"],
    "currentPlayer": "O",
    "status": "playing",
    "moveCount": 4
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Cell already occupied" | "Invalid cell index" | "Game not in progress"
}
```

**Side Effects**:

- Save updated GameState to localStorage
- Trigger UI re-render (React state update)
- Check for win/draw conditions
- Animate cell appearance

**Acceptance Scenarios**:

- [x] User clicks empty cell → move recorded, board updates, turn switches
- [x] User clicks occupied cell → error shown, no state change
- [x] User plays winning move → game ends, winner announced
- [x] User fills last cell with no winner → draw announced
- [x] Game is reset → can play moves again

---

### Action 2: Reset Game

**User Action**: Player clicks "Reset" or "Play Again" button

**Input**: None (implicit: use current GameState)

**Validation**:

- No validation needed (can reset anytime)

**Output**:

```typescript
{
  success: boolean
  newGameState?: GameState
}
```

**Success Response**:

```json
{
  "success": true,
  "newGameState": {
    "board": [null, null, null, null, null, null, null, null, null],
    "currentPlayer": "X",
    "status": "playing",
    "moveCount": 0,
    "createdAt": 1706460000000
  }
}
```

**Side Effects**:

- Clear GameState in localStorage
- Reset all UI components
- Animate board clearing
- Set focus to first cell

**Acceptance Scenarios**:

- [x] User clicks reset during game → board clears with animation
- [x] User clicks reset after win/draw → new game starts
- [x] User refreshes page → previous game state is restored (if not reset)

---

### Action 3: Load Saved Game

**User Action**: Page loads (automatic on mount)

**Input**: None (reads from localStorage)

**Process**:

1. Check if localStorage key exists
2. Validate GameState structure
3. Load if valid, create new if missing/invalid

**Output**:

```typescript
{
  gameState: GameState;
  isRestoredFromStorage: boolean;
}
```

**Success Response (Restored)**:

```json
{
  "gameState": {
    "board": ["X", "O", null, null, "X", null, null, null, "O"],
    "currentPlayer": "O",
    "status": "playing",
    "moveCount": 4
  },
  "isRestoredFromStorage": true
}
```

**Success Response (New Game)**:

```json
{
  "gameState": {
    "board": [null, null, null, null, null, null, null, null, null],
    "currentPlayer": "X",
    "status": "playing",
    "moveCount": 0
  },
  "isRestoredFromStorage": false
}
```

**Side Effects**:

- Initialize React state
- Render UI based on loaded GameState
- If game was in progress: resume with animations
- If game was won/drawn: show result screen

---

## Component Contracts

### Component 1: GameBoard

**Purpose**: Display the 3x3 grid of cells

**Props**:

```typescript
interface GameBoardProps {
  board: (string | null)[]; // 9 elements: 'X', 'O', or null
  onCellClick: (cellIndex: number) => void;
  disabled?: boolean; // Disable clicks if game ended
  isAnimating?: boolean; // Show animations on move
}
```

**Events**:

- `onCellClick(cellIndex)` - Fired when user clicks a cell

**Rendered Output**:

- 3x3 grid with pixelated styling
- Each cell shows: empty | 'X' | 'O'
- Hover state for desktop
- Tap feedback for mobile

**Example Usage**:

```tsx
<GameBoard
  board={gameState.board}
  onCellClick={handleMove}
  disabled={gameState.status !== "playing"}
  isAnimating={true}
/>
```

---

### Component 2: Cell

**Purpose**: Single cell in the game board

**Props**:

```typescript
interface CellProps {
  value: string | null; // 'X', 'O', or null
  index: number; // 0-8
  onClick: () => void;
  disabled?: boolean;
  isAnimating?: boolean;
}
```

**Events**:

- `onClick()` - Fired when user clicks the cell

**Rendered Output**:

- Square 44x44px minimum size
- Shows symbol or empty
- Visual feedback on click
- Responds to touch and mouse

---

### Component 3: GameStatus

**Purpose**: Display current turn, winner, or draw message

**Props**:

```typescript
interface GameStatusProps {
  currentPlayer: string; // 'X' | 'O'
  status: string; // 'playing' | 'x-wins' | 'o-wins' | 'draw'
  moveCount: number;
}
```

**Rendered Output**:

- Turn indicator: "X's Turn" | "O's Turn"
- Winner message: "X Wins!" | "O Wins!"
- Draw message: "Draw!"
- Move counter (optional): "Moves: 5"

**Example**:

```
Status: "X's Turn"  (when status = 'playing' and currentPlayer = 'X')
Status: "X Wins!"   (when status = 'x-wins')
Status: "Draw!"     (when status = 'draw')
```

---

### Component 4: ResetButton

**Purpose**: Allow player to start a new game

**Props**:

```typescript
interface ResetButtonProps {
  onClick: () => void;
  label?: string; // Default: "Reset" | "Play Again"
  disabled?: boolean;
}
```

**Events**:

- `onClick()` - Fired when user clicks button

**Rendered Output**:

- Button with text "Reset" or "Play Again"
- Full-width or fixed width based on viewport
- Minimum 44x44px tap target

---

### Hook Contract: useGameState

**Purpose**: Manage all game state and logic

**Returns**:

```typescript
interface GameStateHook {
  gameState: GameState;
  makeMove: (cellIndex: number) => { success: boolean; error?: string };
  resetGame: () => void;
  loadSavedGame: () => void;

  // Derived values for UI
  currentPlayer: string;
  isGameOver: boolean;
  winner: string | null;
  isBoardFull: boolean;
}
```

**State Management**:

- Initializes from localStorage on load
- Auto-saves to localStorage on every change
- Validates all moves before updating
- Detects win/draw conditions
- Manages game status transitions

**Example Usage**:

```tsx
const { gameState, makeMove, resetGame } = useGameState();

const handleCellClick = (index: number) => {
  const result = makeMove(index);
  if (!result.success) {
    console.error(result.error);
  }
};
```

---

## localStorage Schema

**Key**: `tictactoe-game-state`

**TypeScript Schema**:

```typescript
interface StoredGameState {
  board: (string | null)[];
  currentPlayer: "X" | "O";
  status: "playing" | "x-wins" | "o-wins" | "draw";
  winner: string | null;
  moveCount: number;
  moveHistory: Move[];
  createdAt: number;
  lastMovedAt: number;
}
```

**Example**:

```json
{
  "board": ["X", "O", null, null, "X", null, null, null, "O"],
  "currentPlayer": "O",
  "status": "playing",
  "winner": null,
  "moveCount": 4,
  "moveHistory": [
    { "cellIndex": 0, "player": "X", "timestamp": 1706460000000 },
    { "cellIndex": 1, "player": "O", "timestamp": 1706460001000 },
    { "cellIndex": 4, "player": "X", "timestamp": 1706460002000 },
    { "cellIndex": 8, "player": "O", "timestamp": 1706460003000 }
  ],
  "createdAt": 1706459999000,
  "lastMovedAt": 1706460003000
}
```

---

## API Summary

| Action     | Input          | Output             | Side Effects                          |
| ---------- | -------------- | ------------------ | ------------------------------------- |
| Play Move  | cellIndex      | GameState or error | State change, localStorage, animation |
| Reset Game | (none)         | New GameState      | Clear localStorage, animation         |
| Load Game  | (localStorage) | GameState          | Initialize UI                         |

| Component   | Props                 | Events    | Output         |
| ----------- | --------------------- | --------- | -------------- |
| GameBoard   | board[], onCellClick  | cellClick | 3x3 grid       |
| Cell        | value, index, onClick | click     | Single cell    |
| GameStatus  | currentPlayer, status | (none)    | Status message |
| ResetButton | onClick               | click     | Button         |

| Hook         | Returns            | State               | Side Effects      |
| ------------ | ------------------ | ------------------- | ----------------- |
| useGameState | gameState, actions | Board, turn, status | localStorage sync |

---

**Next Phase**: Quickstart documentation and agent context update
