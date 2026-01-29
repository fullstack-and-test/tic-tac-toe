"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/board.module.css";
import animations from "../styles/animations.module.css";

interface GameStatusProps {
  currentPlayer: string;
  status: string;
  moveCount: number;
}

/**
 * GameStatus Component
 * Displays the current turn, winner, or draw message
 * Includes animations for turn changes and win/draw announcements
 * T121-T132: Turn indicator, game over messages, accessibility
 */
export function GameStatus({
  currentPlayer,
  status,
  moveCount,
}: GameStatusProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [prevStatus, setPrevStatus] = useState(status);

  // Trigger animation when status changes (win, draw) or turn changes
  useEffect(() => {
    if (status !== prevStatus) {
      setShowAnimation(true);
      setPrevStatus(status);
      
      // Reset animation state after it completes
      const timeout = setTimeout(() => {
        setShowAnimation(false);
      }, 400); // Match winnerAnnounce animation duration
      
      return () => clearTimeout(timeout);
    }
  }, [status, prevStatus]);

  const getStatusMessage = (): string => {
    switch (status) {
      case "x-wins":
        return "X Wins!";
      case "o-wins":
        return "O Wins!";
      case "draw":
        return "Draw!";
      case "playing":
      default:
        return `${currentPlayer}'s Turn`;
    }
  };

  const getStatusClass = (): string => {
    switch (status) {
      case "x-wins":
        return styles.statusWin;
      case "o-wins":
        return styles.statusWin;
      case "draw":
        return styles.statusDraw;
      case "playing":
      default:
        return styles.statusPlaying;
    }
  };

  // Get player-specific color indicator (T124: Visual distinction between X and O)
  const getPlayerIndicatorClass = (): string => {
    if (status === "playing") {
      return currentPlayer === "X" ? styles.playerX : styles.playerO;
    }
    if (status === "x-wins") return styles.playerX;
    if (status === "o-wins") return styles.playerO;
    return "";
  };

  // Apply winner announcement animation for win/draw, turn switch animation for playing status
  const getAnimationClass = (): string => {
    if (showAnimation) {
      if (status === "x-wins" || status === "o-wins" || status === "draw") {
        // Win/Draw announcement: scale up + fade in (T098)
        return animations.winnerAnnounce;
      } else if (status === "playing") {
        // Turn switch: fade in with subtle highlight (T094-T095)
        return animations.fadeIn;
      }
    }
    return "";
  };

  return (
    <div 
      className={styles.statusContainer}
      role="status"
      aria-live="polite"
      aria-label={`Game status: ${getStatusMessage()}`}
    >
      <div
        className={`${styles.status} ${getStatusClass()} ${getAnimationClass()} ${getPlayerIndicatorClass()}`}
      >
        {/* Player symbol indicator for visual distinction (T124) */}
        {status === "playing" && (
          <span className={styles.playerSymbol} aria-hidden="true">
            {currentPlayer}
          </span>
        )}
        {getStatusMessage()}
      </div>
      {status === "playing" && (
        <div className={styles.moveCounter} aria-label={`Move ${moveCount + 1} of 9`}>
          Move {moveCount + 1}/9
        </div>
      )}
    </div>
  );
}
