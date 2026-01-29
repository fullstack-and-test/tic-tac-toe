"use client";

import React from "react";
import { Cell } from "./Cell";
import styles from "../styles/board.module.css";

interface GameBoardProps {
  board: (string | null)[];
  onCellClick: (cellIndex: number) => void;
  disabled?: boolean;
  isAnimating?: boolean;
  className?: string;
  winningCells?: number[];
}

/**
 * GameBoard Component
 * Renders a 3x3 grid of cells
 * Supports animation for reset and winning cell highlighting (T099)
 */
export function GameBoard({
  board,
  onCellClick,
  disabled = false,
  isAnimating = false,
  className = "",
  winningCells = [],
}: GameBoardProps) {
  return (
    <div className={styles.boardContainer}>
      <div className={`${styles.board} ${className}`} role="grid" aria-label="Tic-tac-toe board">
        {board.map((value, index) => (
          <Cell
            key={index}
            value={value}
            index={index}
            onClick={() => onCellClick(index)}
            disabled={disabled}
            isAnimating={isAnimating && value !== null}
            isWinningCell={winningCells.includes(index)}
          />
        ))}
      </div>
    </div>
  );
}
