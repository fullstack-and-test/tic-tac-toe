import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GameBoard } from "../../components/GameBoard";

describe("GameBoard Component", () => {
  test("renders 9 cells", () => {
    const mockClick = jest.fn();
    const board = Array(9).fill(null);

    render(<GameBoard board={board} onCellClick={mockClick} />);

    const cells = screen.getAllByRole("button");
    expect(cells).toHaveLength(9);
  });

  test("renders board with correct values", () => {
    const mockClick = jest.fn();
    const board = ["X", "O", null, null, "X", null, null, "O", null];

    render(<GameBoard board={board} onCellClick={mockClick} />);

    const xElements = screen.getAllByText("X");
    const oElements = screen.getAllByText("O");
    expect(xElements).toHaveLength(2);
    expect(oElements).toHaveLength(2);
  });

  test("calls onCellClick with correct index when cell is clicked", () => {
    const mockClick = jest.fn();
    const board = Array(9).fill(null);

    render(<GameBoard board={board} onCellClick={mockClick} />);

    const cells = screen.getAllByRole("button");
    fireEvent.click(cells[0]);

    expect(mockClick).toHaveBeenCalledWith(0);
  });

  test("calls onCellClick for different cell indices", () => {
    const mockClick = jest.fn();
    const board = Array(9).fill(null);

    render(<GameBoard board={board} onCellClick={mockClick} />);

    const cells = screen.getAllByRole("button");
    fireEvent.click(cells[4]);

    expect(mockClick).toHaveBeenCalledWith(4);
  });

  test("disables cells when disabled prop is true", () => {
    const mockClick = jest.fn();
    const board = Array(9).fill(null);

    render(
      <GameBoard board={board} onCellClick={mockClick} disabled={true} />
    );

    const cells = screen.getAllByRole("button");
    cells.forEach((cell) => {
      expect(cell).toBeDisabled();
    });
  });

  test("renders grid role", () => {
    const mockClick = jest.fn();
    const board = Array(9).fill(null);

    render(<GameBoard board={board} onCellClick={mockClick} />);

    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  test("does not call onClick for filled cells", () => {
    const mockClick = jest.fn();
    const board = ["X", null, null, null, null, null, null, null, null];

    render(<GameBoard board={board} onCellClick={mockClick} />);

    const firstCell = screen.getAllByRole("button")[0];
    fireEvent.click(firstCell);

    expect(mockClick).not.toHaveBeenCalled();
  });
});
