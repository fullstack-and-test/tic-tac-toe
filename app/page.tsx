"use client";

import React, { useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { GameBoard } from "@/components/GameBoard";
import { GameStatus } from "@/components/GameStatus";
import { ResetButton } from "@/components/ResetButton";
import styles from "@/styles/board.module.css";
import animationStyles from "@/styles/animations.module.css";

/**
 * Home Page
 * Main tic-tac-toe game interface
 */
export default function Home() {
  const { gameState, makeMove, resetGame, isGameOver, winningCells } = useGameState();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetAnimating, setResetAnimating] = useState(false);

  const handleCellClick = (cellIndex: number) => {
    const result = makeMove(cellIndex);
    if (!result.success) {
      console.warn(`Move failed: ${result.error}`);
    }
  };

  const handleResetClick = () => {
    if (gameState.moveCount > 0 && !isGameOver) {
      setShowResetConfirm(true);
    } else {
      resetGame();
      setShowResetConfirm(false);
    }
  };

  const confirmReset = () => {
    // Apply fade out animation
    setResetAnimating(true);
    
    // After animation completes, reset game and fade back in
    const timeout = setTimeout(() => {
      resetGame();
      setResetAnimating(false);
      setShowResetConfirm(false);
    }, 300); // Match boardFadeOut animation duration
    
    return () => clearTimeout(timeout);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const resetButtonLabel = isGameOver ? "Play Again" : "Reset";

  return (
    <main role="main" aria-label="Tic-tac-toe game">
      <h1>Pixel-Art Tic-Tac-Toe</h1>

      <GameStatus
        currentPlayer={gameState.currentPlayer}
        status={gameState.status}
        moveCount={gameState.moveCount}
      />

      <GameBoard
        board={gameState.board}
        onCellClick={handleCellClick}
        disabled={isGameOver}
        isAnimating={!resetAnimating}
        className={resetAnimating ? animationStyles.boardFadeOut : animationStyles.boardFadeIn}
        winningCells={winningCells}
      />

      {showResetConfirm && (
        <div 
          style={confirmDialogStyles.overlay}
          role="presentation"
        >
          <div 
            style={confirmDialogStyles.dialog}
            role="alertdialog"
            aria-labelledby="confirmDialogTitle"
            aria-describedby="confirmDialogDesc"
          >
            <p id="confirmDialogTitle">Are you sure you want to reset the game?</p>
            <p id="confirmDialogDesc" style={{ display: "none" }}>
              This will clear the current game and start a new one.
            </p>
            <div style={confirmDialogStyles.buttonGroup}>
              <button
                onClick={confirmReset}
                style={confirmDialogStyles.confirmBtn}
                aria-label="Yes, confirm reset"
              >
                Yes, Reset
              </button>
              <button 
                onClick={cancelReset} 
                style={confirmDialogStyles.cancelBtn}
                aria-label="Cancel, keep playing"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ResetButton onClick={handleResetClick} label={resetButtonLabel} />
    </main>
  );
}

// Confirmation dialog styles (inline for simplicity)
const confirmDialogStyles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: "var(--color-grid)",
    padding: "2rem",
    borderRadius: "0.5rem",
    maxWidth: "400px",
    textAlign: "center" as const,
    border: "2px solid var(--color-accent)",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "1.5rem",
    justifyContent: "center",
  },
  confirmBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "var(--color-button-bg)",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  cancelBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    color: "var(--color-text)",
    border: "2px solid var(--color-text-secondary)",
    borderRadius: "0.25rem",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
};
