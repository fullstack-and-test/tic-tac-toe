import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Cell } from "../../components/Cell";

describe("Cell Component", () => {
  test("renders empty cell", () => {
    const mockClick = jest.fn();
    render(
      <Cell value={null} index={0} onClick={mockClick} />
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-testid", "cell-0");
    expect(button.textContent).toBe("");
  });

  test("renders cell with X symbol", () => {
    const mockClick = jest.fn();
    render(
      <Cell value="X" index={1} onClick={mockClick} />
    );

    expect(screen.getByText("X")).toBeInTheDocument();
  });

  test("renders cell with O symbol", () => {
    const mockClick = jest.fn();
    render(
      <Cell value="O" index={2} onClick={mockClick} />
    );

    expect(screen.getByText("O")).toBeInTheDocument();
  });

  test("calls onClick when empty cell is clicked", () => {
    const mockClick = jest.fn();
    render(
      <Cell value={null} index={3} onClick={mockClick} />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when filled cell is clicked", () => {
    const mockClick = jest.fn();
    render(
      <Cell value="X" index={4} onClick={mockClick} />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockClick).not.toHaveBeenCalled();
  });

  test("does not call onClick when disabled", () => {
    const mockClick = jest.fn();
    render(
      <Cell value={null} index={5} onClick={mockClick} disabled={true} />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  test("has correct aria-label", () => {
    const mockClick = jest.fn();
    render(
      <Cell value="X" index={6} onClick={mockClick} />
    );

    expect(screen.getByLabelText("Cell 6: X")).toBeInTheDocument();
  });

  test("has popIn animation class when isAnimating is true", () => {
    const mockClick = jest.fn();
    const { container } = render(
      <Cell value="X" index={7} onClick={mockClick} isAnimating={true} />
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("popIn");
  });
});
