"use client";

import React from "react";
import styles from "../styles/board.module.css";
import animations from "../styles/animations.module.css";

interface CellProps {
  value: string | null;
  index: number;
  onClick: () => void;
  disabled?: boolean;
  isAnimating?: boolean;
  isWinningCell?: boolean;
}

/**
 * Cell Component
 * Represents a single cell in the tic-tac-toe board
 * Supports animation for symbol appearance and optional winning cell highlight (T099)
 */
export function Cell({
  value,
  index,
  onClick,
  disabled = false,
  isAnimating = false,
  isWinningCell = false,
}: CellProps) {
  const handleClick = () => {
    if (!disabled && !value) {
      onClick();
    }
  };

  const cellClasses = [
    styles.cell,
    isAnimating && value && animations.popIn,
    isWinningCell && animations.cellGlow,
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={cellClasses}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Cell ${index}: ${value || "empty"}`}
      data-testid={`cell-${index}`}
    >
      {value && <span className={styles.symbol}>{value}</span>}
    </button>
  );
}
