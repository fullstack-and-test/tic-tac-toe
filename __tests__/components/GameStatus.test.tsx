import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GameStatus } from "../../components/GameStatus";

describe("GameStatus Component", () => {
  test("displays X's Turn when status is playing and currentPlayer is X", () => {
    render(
      <GameStatus currentPlayer="X" status="playing" moveCount={0} />
    );

    expect(screen.getByText("X's Turn")).toBeInTheDocument();
  });

  test("displays O's Turn when status is playing and currentPlayer is O", () => {
    render(
      <GameStatus currentPlayer="O" status="playing" moveCount={1} />
    );

    expect(screen.getByText("O's Turn")).toBeInTheDocument();
  });

  test("displays X Wins! when status is x-wins", () => {
    render(
      <GameStatus currentPlayer="X" status="x-wins" moveCount={5} />
    );

    expect(screen.getByText("X Wins!")).toBeInTheDocument();
  });

  test("displays O Wins! when status is o-wins", () => {
    render(
      <GameStatus currentPlayer="O" status="o-wins" moveCount={6} />
    );

    expect(screen.getByText("O Wins!")).toBeInTheDocument();
  });

  test("displays Draw! when status is draw", () => {
    render(
      <GameStatus currentPlayer="X" status="draw" moveCount={9} />
    );

    expect(screen.getByText("Draw!")).toBeInTheDocument();
  });

  test("displays move counter when status is playing", () => {
    render(
      <GameStatus currentPlayer="X" status="playing" moveCount={3} />
    );

    expect(screen.getByText("Move 4/9")).toBeInTheDocument();
  });

  test("does not display move counter when game is won", () => {
    const { container } = render(
      <GameStatus currentPlayer="X" status="x-wins" moveCount={5} />
    );

    expect(container.textContent).not.toContain("Move");
  });

  test("does not display move counter when game is drawn", () => {
    const { container } = render(
      <GameStatus currentPlayer="X" status="draw" moveCount={9} />
    );

    expect(container.textContent).not.toContain("Move");
  });

  test("displays move count for first move", () => {
    render(
      <GameStatus currentPlayer="O" status="playing" moveCount={0} />
    );

    expect(screen.getByText("Move 1/9")).toBeInTheDocument();
  });

  test("displays move count for last move", () => {
    render(
      <GameStatus currentPlayer="X" status="playing" moveCount={8} />
    );

    expect(screen.getByText("Move 9/9")).toBeInTheDocument();
  });
});
