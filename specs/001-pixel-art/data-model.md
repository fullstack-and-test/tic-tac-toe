# Phase 1 Data Model: Modern Pixel-Art Tic-Tac-Toe Website

**Feature**: 001-pixel-art  
**Date**: 2026-01-29  
**Status**: Complete

---

## Entities & Data Structures

### 1. Cell

**What it represents**: A single position on the 3x3 game board.

**Fields**:

- `id` (number): 0-8, position identifier (left-to-right, top-to-bottom)
- `value` (string): 'X' | 'O' | null (empty)

**Relationships**:

- Belongs to: GameBoard (9 cells per board)

**Validation Rules**:

- `id` must be 0-8 (inclusive)
- `value` must be one of: 'X', 'O', null
- Once filled, cannot be changed without board reset
- Cell is clickable only when `value` is null

**State Transitions**:

- Empty → X (when X player moves)
- Empty → O (when O player moves)
- X/O → stays (immutable until reset)

---

### 2. GameBoard

**What it represents**: The 3x3 grid containing all cells and their current state.

**Fields**:

- `cells` (Cell[]): Array of 9 cells, indexed 0-8
- `moveCount` (number): Total moves made (0-9)
- `lastMoveIndex` (number): Index of most recent move (-1 if none)

**Relationships**:

- Contains: 9 Cell objects
- Part of: GameState

**Validation Rules**:

- Always exactly 9 cells
- `moveCount` = count of non-null cells
- `moveCount` must be between 0-9

**State Transitions**:

- Initialized empty (all cells null)
- Updated on each player move (one cell per move)
- Resets to empty on game reset

---

### 3. Player

**What it represents**: A player in the game (X or O).

**Fields**:

- `symbol` (string): 'X' | 'O' (constant per player)
- `isCurrent` (boolean): Whether this player's turn is active
- `moveCount` (number): Number of moves this player has made

**Relationships**:

- Associated with: GameState
- Owns: Moves on GameBoard

**Validation Rules**:

- Exactly 2 players (X and O)
- Only one player can have `isCurrent = true` at any time
- X always plays first (initial turn)
- Players alternate turns

**State Transitions**:

- X plays → O's turn
- O plays → X's turn
- Continue until win or draw

---

### 4. GameState

**What it represents**: The complete state of a game session, including board, current player, and outcome.

**Fields**:

- `board` (GameBoard): Current board state
- `currentPlayer` (Player): Whose turn it is
- `status` (string): 'playing' | 'x-wins' | 'o-wins' | 'draw'
- `winner` (Player | null): Which player won (null if draw/playing)
- `moveHistory` (Move[]): Sequence of all moves (for future features)
- `createdAt` (timestamp): When this game started
- `lastMovedAt` (timestamp): When last move occurred

**Relationships**:

- Contains: GameBoard, 2 Players
- Persisted in: Browser localStorage

**Validation Rules**:

- `status = 'playing'` only if `moveCount < 9` and no winner
- `status = 'x-wins'` only if X has 3 in a row
- `status = 'o-wins'` only if O has 3 in a row
- `status = 'draw'` only if `moveCount = 9` and no winner
- Cannot modify board if `status !== 'playing'`
- Only `currentPlayer` can make moves
- A game cannot transition back to 'playing' (must reset for new game)

**State Transitions**:

```
[new game] → status: 'playing', currentPlayer: X
            ↓
[X moves] → validate move → update board → check win/draw → update currentPlayer → status: 'playing' or 'x-wins'
            ↓
[O moves] → validate move → update board → check win/draw → update currentPlayer → status: 'playing' or 'o-wins'
            ↓
[Full board, no winner] → status: 'draw'
            ↓
[Reset clicked] → Create new GameState (start over)
```

---

### 5. Move

**What it represents**: A single player action (placing X or O on a cell).

**Fields**:

- `cellIndex` (number): 0-8, which cell was played
- `player` (string): 'X' | 'O', who made the move
- `timestamp` (number): When move occurred
- `boardAfterMove` (Cell[]): Board state after this move

**Relationships**:

- Recorded in: GameState.moveHistory
- References: Cell (by index)

**Validation Rules**:

- `cellIndex` must be valid (0-8)
- Target cell must be empty at time of move
- `player` must match `currentPlayer` at move time
- Moves are immutable once recorded

**Notes**: For MVP, moveHistory is optional (stored but not used in UI). Enables future features like undo/replay.

---

## Win Detection Logic

**Winning Combinations** (8 total):

Rows:

- Cells 0, 1, 2
- Cells 3, 4, 5
- Cells 6, 7, 8

Columns:

- Cells 0, 3, 6
- Cells 1, 4, 7
- Cells 2, 5, 8

Diagonals:

- Cells 0, 4, 8
- Cells 2, 4, 6

**Detection Algorithm**:
After each move, check all 8 combinations. If any combination contains three of the current player's symbols, that player wins.

```
checkWin(board, player) {
  const winningCombinations = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diags
  ]

  return winningCombinations.some(combo =>
    combo.every(i => board[i] === player)
  )
}
```

---

## Draw Detection Logic

**Condition**: All 9 cells filled (`moveCount = 9`) AND no player has won.

```
checkDraw(board) {
  return board.every(cell => cell !== null) &&
         !checkWin(board, 'X') &&
         !checkWin(board, 'O')
}
```

---

## Storage Schema (localStorage)

**Key**: `tictactoe-game-state`

**Value** (JSON):

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

**Load on Startup**:

- If localStorage key exists and valid: Load game state
- If localStorage key missing or invalid: Create new game
- If status is 'playing': Resume from last state
- If status is 'x-wins' | 'o-wins' | 'draw': Show result + reset button

---

## Entity Relationships Diagram

```
GameState (1)
├── GameBoard (1)
│   └── Cell (9)
│       ├── value: 'X' | 'O' | null
│       └── id: 0-8
├── Players (2)
│   ├── X (Player)
│   └── O (Player)
├── status: 'playing' | 'x-wins' | 'o-wins' | 'draw'
├── moveHistory (M)
│   └── Move
│       ├── cellIndex: 0-8
│       ├── player: 'X' | 'O'
│       └── timestamp
└── Persistence
    └── localStorage (key: 'tictactoe-game-state')
```

---

## Summary

**Total Entities**: 5 (Cell, GameBoard, Player, GameState, Move)

**Persistence Layer**: Browser localStorage only (no backend database)

**State Management**: React hooks (useState) with auto-save to localStorage

**Data Complexity**: Low - all data structures are simple objects/arrays

**Next Phase**: Contracts and API design in `contracts/` directory
