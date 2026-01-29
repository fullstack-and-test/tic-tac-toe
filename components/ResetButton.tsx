"use client";

import React from "react";
import styles from "../styles/board.module.css";

interface ResetButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

/**
 * ResetButton Component
 * Button to reset the game and start a new round
 * T128: Shows "Play Again" when game is over, "Reset" during play
 * T131: ARIA label for accessibility
 */
export function ResetButton({
  onClick,
  label,
  disabled = false,
}: ResetButtonProps) {
  const ariaLabel = label === "Play Again" ? "Play again" : "Reset game";
  
  return (
    <button
      className={styles.resetButton}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {label || "Reset"}
    </button>
  );
}
