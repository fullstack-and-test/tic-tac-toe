import { useState, useEffect, useCallback, useRef } from "react";

export type GameStatus = "playing" | "x-wins" | "o-wins" | "draw";

export interface Move {
  cellIndex: number;
  player: "X" | "O";
  timestamp: number;
}

export interface GameState {
  board: (string | null)[];
  currentPlayer: "X" | "O";
  status: GameStatus;
  winner: string | null;
  moveCount: number;
  moveHistory: Move[];
  createdAt: number;
  lastMovedAt: number;
}

interface MakeMoveResult {
  success: boolean;
  error?: string;
}

const STORAGE_KEY = "tictactoe-game-state";

/**
 * Create initial game state
 */
function createInitialGameState(): GameState {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    status: "playing",
    winner: null,
    moveCount: 0,
    moveHistory: [],
    createdAt: Date.now(),
    lastMovedAt: Date.now(),
  };
}

/**
 * Check for a winner by examining all 8 possible winning combinations
 * Returns the winner or null if no winner
 */
function checkWinner(board: (string | null)[]): string | null {
  // 8 winning combinations: 3 rows, 3 columns, 2 diagonals
  const winPatterns = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Return 'X' or 'O'
    }
  }

  return null;
}

/**
 * Get the indices of the winning cells (T099 - highlight winning cells)
 */
function getWinningCells(board: (string | null)[]): number[] {
  const winPatterns = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }

  return [];
}

/**
 * Check if the board is completely full
 */
function isBoardFull(board: (string | null)[]): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Validate a move
 */
function validateMove(
  board: (string | null)[],
  cellIndex: number,
  status: GameStatus
): { valid: boolean; error?: string } {
  // Check game is still playing
  if (status !== "playing") {
    return { valid: false, error: "Game is not in progress" };
  }

  // Check cell index is valid
  if (cellIndex < 0 || cellIndex > 8) {
    return { valid: false, error: "Invalid cell index" };
  }

  // Check cell is empty
  if (board[cellIndex] !== null) {
    return { valid: false, error: "Cell already occupied" };
  }

  return { valid: true };
}

/**
 * Main game state hook
 * Manages board state, move validation, win detection, and localStorage persistence
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [hydrated, setHydrated] = useState(false);
  const skipSaveRef = useRef(false);

  /**
   * Load game state from localStorage on component mount
   */
  useEffect(() => {
    const loadSavedGame = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as GameState;
          setGameState(parsed);
        }
      } catch (error) {
        console.error("Failed to load saved game:", error);
        setGameState(createInitialGameState());
      }
      setHydrated(true);
    };

    loadSavedGame();
  }, []);

  /**
   * Save game state to localStorage whenever it changes
   */
  useEffect(() => {
    if (!hydrated) return; // Don't save during initial load

    // Don't save if we just cleared due to reset
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  }, [gameState, hydrated]);

  /**
   * Make a move on the board
   * Validates the move, updates the board, checks for win/draw, and switches turns
   */
  const makeMove = useCallback(
    (cellIndex: number): MakeMoveResult => {
      // Validate the move
      const validation = validateMove(gameState.board, cellIndex, gameState.status);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Create new board with the move
      const newBoard = [...gameState.board];
      newBoard[cellIndex] = gameState.currentPlayer;

      // Create move history entry
      const newMove: Move = {
        cellIndex,
        player: gameState.currentPlayer,
        timestamp: Date.now(),
      };

      // Check for winner
      const winner = checkWinner(newBoard);
      let newStatus: GameStatus = gameState.status;

      if (winner) {
        newStatus = winner === "X" ? "x-wins" : "o-wins";
      } else if (isBoardFull(newBoard)) {
        newStatus = "draw";
      }

      // Determine next player
      const nextPlayer: "X" | "O" = gameState.currentPlayer === "X" ? "O" : "X";

      // Update game state
      const newGameState: GameState = {
        board: newBoard,
        currentPlayer: nextPlayer,
        status: newStatus,
        winner: winner || null,
        moveCount: gameState.moveCount + 1,
        moveHistory: [...gameState.moveHistory, newMove],
        createdAt: gameState.createdAt,
        lastMovedAt: Date.now(),
      };

      setGameState(newGameState);

      return { success: true };
    },
    [gameState]
  );

  /**
   * Reset the game to initial state and clear localStorage
   */
  const resetGame = useCallback(() => {
    const initialState = createInitialGameState();
    skipSaveRef.current = true;
    setGameState(initialState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear saved game:", error);
    }
  }, []);

  // Derived values for UI convenience
  const isGameOver = gameState.status !== "playing";
  const isBoardFullFlag = isBoardFull(gameState.board);
  const winningCells = getWinningCells(gameState.board);

  return {
    // State
    gameState,

    // Actions
    makeMove,
    resetGame,

    // Derived values
    currentPlayer: gameState.currentPlayer,
    isGameOver,
    winner: gameState.winner,
    isBoardFull: isBoardFullFlag,
    winningCells,
  };
}
