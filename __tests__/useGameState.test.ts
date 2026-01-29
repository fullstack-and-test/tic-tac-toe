import { renderHook, act } from "@testing-library/react";
import { useGameState, GameState } from "../hooks/useGameState";

/**
 * Mock localStorage for testing
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useGameState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Initialization", () => {
    test("should initialize with empty board and X as current player", () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState.board).toEqual([
        null, null, null, null, null, null, null, null, null,
      ]);
      expect(result.current.gameState.currentPlayer).toBe("X");
      expect(result.current.gameState.status).toBe("playing");
      expect(result.current.gameState.moveCount).toBe(0);
    });

    test("should have correct initial derived values", () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.currentPlayer).toBe("X");
      expect(result.current.isGameOver).toBe(false);
      expect(result.current.winner).toBeNull();
      expect(result.current.isBoardFull).toBe(false);
    });
  });

  describe("Move Validation", () => {
    test("should allow valid move on empty cell", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        const moveResult = result.current.makeMove(0);
        expect(moveResult.success).toBe(true);
      });

      expect(result.current.gameState.board[0]).toBe("X");
    });

    test("should reject move on occupied cell", () => {
      const { result } = renderHook(() => useGameState());

      // Make first move
      act(() => {
        result.current.makeMove(0);
      });

      // Try to make move on same cell
      act(() => {
        const moveResult = result.current.makeMove(0);
        expect(moveResult.success).toBe(false);
        expect(moveResult.error).toBe("Cell already occupied");
      });

      expect(result.current.gameState.board[0]).toBe("X");
    });

    test("should reject move with invalid cell index", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        const moveResult = result.current.makeMove(-1);
        expect(moveResult.success).toBe(false);
        expect(moveResult.error).toBe("Invalid cell index");
      });

      act(() => {
        const moveResult = result.current.makeMove(9);
        expect(moveResult.success).toBe(false);
        expect(moveResult.error).toBe("Invalid cell index");
      });
    });

    test("should reject move when game is not in progress", () => {
      const { result, rerender } = renderHook(() => useGameState());

      // Create a winning position for X
      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(3); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(4); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(2); // X wins
      });
      rerender();

      expect(result.current.gameState.status).toBe("x-wins");

      // Try to make move after game ended
      act(() => {
        const moveResult = result.current.makeMove(5);
        expect(moveResult.success).toBe(false);
        expect(moveResult.error).toBe("Game is not in progress");
      });
    });
  });

  describe("Turn Switching", () => {
    test("should switch turn after each valid move", () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState.currentPlayer).toBe("X");

      act(() => {
        result.current.makeMove(0);
      });

      expect(result.current.gameState.currentPlayer).toBe("O");

      act(() => {
        result.current.makeMove(1);
      });

      expect(result.current.gameState.currentPlayer).toBe("X");

      act(() => {
        result.current.makeMove(2);
      });

      expect(result.current.gameState.currentPlayer).toBe("O");
    });

    test("should place correct symbols based on player turn", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(2); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(3); // O
      });
      rerender();

      expect(result.current.gameState.board).toEqual([
        "X", "O", "X", "O", null, null, null, null, null,
      ]);
    });

    test("should increment move count with each move", () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState.moveCount).toBe(0);

      act(() => {
        result.current.makeMove(0);
      });

      expect(result.current.gameState.moveCount).toBe(1);

      act(() => {
        result.current.makeMove(1);
      });

      expect(result.current.gameState.moveCount).toBe(2);
    });
  });

  describe("Win Detection", () => {
    test("should detect win in top row (0, 1, 2)", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(3); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(4); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(2); // X wins
      });
      rerender();

      expect(result.current.gameState.status).toBe("x-wins");
      expect(result.current.gameState.winner).toBe("X");
      expect(result.current.isGameOver).toBe(true);
    });

    test("should detect win in middle row (3, 4, 5)", () => {
      const { result, rerender } = renderHook(() => useGameState());

      // Moves: X at 0, O at 3, X at 6, O at 4, X at 7, O at 5 (wins)
      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(3); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(6); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(4); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(7); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(5); // O wins middle row (3, 4, 5)
      });
      rerender();

      expect(result.current.gameState.status).toBe("o-wins");
      expect(result.current.gameState.winner).toBe("O");
      expect(result.current.isGameOver).toBe(true);
    });

    test("should detect win in bottom row (6, 7, 8)", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(6); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(0); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(7); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(8); // X wins
      });
      rerender();

      expect(result.current.gameState.status).toBe("x-wins");
      expect(result.current.gameState.winner).toBe("X");
      expect(result.current.isGameOver).toBe(true);
    });

    test("should detect win in left column (0, 3, 6)", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(3); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(2); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(6); // X wins
      });
      rerender();

      expect(result.current.gameState.status).toBe("x-wins");
      expect(result.current.gameState.winner).toBe("X");
      expect(result.current.isGameOver).toBe(true);
    });

    test("should detect win in middle column (1, 4, 7)", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(1); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(0); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(4); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(2); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(7); // X wins
      });
      rerender();

      expect(result.current.gameState.status).toBe("x-wins");
      expect(result.current.gameState.winner).toBe("X");
      expect(result.current.isGameOver).toBe(true);
    });

    test("should detect win in right column (2, 5, 8)", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(2); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(0); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(5); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(8); // X wins
      });
      rerender();

      expect(result.current.gameState.status).toBe("x-wins");
      expect(result.current.gameState.winner).toBe("X");
      expect(result.current.isGameOver).toBe(true);
    });

    test("should detect win in main diagonal (0, 4, 8)", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(4); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(2); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(8); // X wins
      });
      rerender();

      expect(result.current.gameState.status).toBe("x-wins");
      expect(result.current.gameState.winner).toBe("X");
      expect(result.current.isGameOver).toBe(true);
    });

    test("should detect win in anti-diagonal (2, 4, 6)", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(2); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(0); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(4); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(6); // X wins
      });
      rerender();

      expect(result.current.gameState.status).toBe("x-wins");
      expect(result.current.gameState.winner).toBe("X");
      expect(result.current.isGameOver).toBe(true);
    });
  });

  describe("Draw Detection", () => {
    test("should detect draw when board is full with no winner", () => {
      const { result, rerender } = renderHook(() => useGameState());

      // Play moves to create a draw
      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(2); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(4); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(3); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(5); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(7); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(6); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(8); // X - board full, no winner
      });
      rerender();

      expect(result.current.gameState.status).toBe("draw");
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.isBoardFull).toBe(true);
      expect(result.current.isGameOver).toBe(true);
    });

    test("should not declare draw if board not full", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(0); // X
        result.current.makeMove(1); // O
      });

      expect(result.current.gameState.status).toBe("playing");
      expect(result.current.isBoardFull).toBe(false);
    });
  });

  describe("Reset Game", () => {
    test("should reset board to empty state", () => {
      const { result, rerender } = renderHook(() => useGameState());

      // Play a few moves
      act(() => {
        result.current.makeMove(0);
      });
      rerender();

      act(() => {
        result.current.makeMove(1);
      });
      rerender();

      act(() => {
        result.current.makeMove(2);
      });
      rerender();

      expect(result.current.gameState.board[0]).toBe("X");
      expect(result.current.gameState.board[1]).toBe("O");

      // Reset
      act(() => {
        result.current.resetGame();
      });
      rerender();

      expect(result.current.gameState.board).toEqual([
        null, null, null, null, null, null, null, null, null,
      ]);
    });

    test("should reset all state to initial values", () => {
      const { result, rerender } = renderHook(() => useGameState());

      // Play moves and reach end state
      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(3); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(4); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(2); // X wins
      });
      rerender();

      expect(result.current.gameState.status).toBe("x-wins");
      expect(result.current.gameState.moveCount).toBe(5);

      // Reset
      act(() => {
        result.current.resetGame();
      });
      rerender();

      expect(result.current.gameState.currentPlayer).toBe("X");
      expect(result.current.gameState.status).toBe("playing");
      expect(result.current.gameState.winner).toBeNull();
      expect(result.current.gameState.moveCount).toBe(0);
      expect(result.current.gameState.moveHistory).toEqual([]);
      expect(result.current.isGameOver).toBe(false);
    });

    test("should clear localStorage on reset", () => {
      const { result, rerender } = renderHook(() => useGameState());

      // Play moves
      act(() => {
        result.current.makeMove(0);
      });
      rerender();

      expect(localStorage.getItem("tictactoe-game-state")).toBeTruthy();

      // Reset
      act(() => {
        result.current.resetGame();
      });
      rerender();

      expect(localStorage.getItem("tictactoe-game-state")).toBeNull();
    });

    test("should allow new game after reset", () => {
      const { result, rerender } = renderHook(() => useGameState());

      // Play game 1
      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(3); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // X
      });
      rerender();

      const game1Moves = result.current.gameState.moveCount;
      expect(game1Moves).toBe(3);

      // Reset
      act(() => {
        result.current.resetGame();
      });
      rerender();

      // Play game 2
      act(() => {
        result.current.makeMove(8); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(7); // O
      });
      rerender();

      expect(result.current.gameState.moveCount).toBe(2);
      expect(result.current.gameState.board[0]).toBeNull();
      expect(result.current.gameState.board[8]).toBe("X");
      expect(result.current.gameState.board[7]).toBe("O");
    });
  });

  describe("localStorage Persistence", () => {
    test("should save game state to localStorage after move", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(0);
      });
      rerender();

      const saved = localStorage.getItem("tictactoe-game-state");
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.board[0]).toBe("X");
      expect(parsed.moveCount).toBe(1);
    });

    test("should restore game state from localStorage on mount", () => {
      // Simulate saved game state
      const savedState: GameState = {
        board: ["X", "O", null, null, null, null, null, null, null],
        currentPlayer: "X",
        status: "playing",
        winner: null,
        moveCount: 2,
        moveHistory: [
          { cellIndex: 0, player: "X", timestamp: 1000 },
          { cellIndex: 1, player: "O", timestamp: 2000 },
        ],
        createdAt: 1000,
        lastMovedAt: 2000,
      };

      localStorage.setItem("tictactoe-game-state", JSON.stringify(savedState));

      const { result } = renderHook(() => useGameState());

      // After hydration, should have restored state
      expect(result.current.gameState.board).toEqual(savedState.board);
      expect(result.current.gameState.moveCount).toBe(2);
      expect(result.current.gameState.currentPlayer).toBe("X");
    });

    test("should create new game if localStorage is invalid", () => {
      localStorage.setItem("tictactoe-game-state", "invalid json");

      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState.board).toEqual([
        null, null, null, null, null, null, null, null, null,
      ]);
      expect(result.current.gameState.moveCount).toBe(0);
    });

    test("should create new game if localStorage is empty", () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState.board).toEqual([
        null, null, null, null, null, null, null, null, null,
      ]);
      expect(result.current.gameState.moveCount).toBe(0);
    });

    test("should update move history with each move", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(0); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(1); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(2); // X
      });
      rerender();

      const moveHistory = result.current.gameState.moveHistory;
      expect(moveHistory).toHaveLength(3);

      expect(moveHistory[0]).toMatchObject({
        cellIndex: 0,
        player: "X",
      });
      expect(moveHistory[1]).toMatchObject({
        cellIndex: 1,
        player: "O",
      });
      expect(moveHistory[2]).toMatchObject({
        cellIndex: 2,
        player: "X",
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle localStorage save errors gracefully", () => {
      const { result } = renderHook(() => useGameState());

      // Mock localStorage to throw error
      const setItemSpy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("Storage full");
        });

      // Should not throw
      act(() => {
        expect(() => {
          result.current.makeMove(0);
        }).not.toThrow();
      });

      setItemSpy.mockRestore();
    });

    test("should handle localStorage load errors gracefully", () => {
      const getItemSpy = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("Storage error");
        });

      // Should not throw
      expect(() => {
        renderHook(() => useGameState());
      }).not.toThrow();

      getItemSpy.mockRestore();
    });
  });

  describe("Move History", () => {
    test("should maintain accurate move history", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(4); // X
      });
      rerender();

      act(() => {
        result.current.makeMove(0); // O
      });
      rerender();

      act(() => {
        result.current.makeMove(8); // X
      });
      rerender();

      const history = result.current.gameState.moveHistory;
      expect(history).toHaveLength(3);
      expect(history[0].cellIndex).toBe(4);
      expect(history[0].player).toBe("X");
      expect(history[1].cellIndex).toBe(0);
      expect(history[1].player).toBe("O");
      expect(history[2].cellIndex).toBe(8);
      expect(history[2].player).toBe("X");
    });

    test("should clear move history on reset", () => {
      const { result, rerender } = renderHook(() => useGameState());

      act(() => {
        result.current.makeMove(0);
      });
      rerender();

      act(() => {
        result.current.makeMove(1);
      });
      rerender();

      expect(result.current.gameState.moveHistory).toHaveLength(2);

      act(() => {
        result.current.resetGame();
      });
      rerender();

      expect(result.current.gameState.moveHistory).toHaveLength(0);
    });
  });
});
