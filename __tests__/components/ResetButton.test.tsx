import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResetButton } from "@/components/ResetButton";

describe("ResetButton Component", () => {
  it("renders reset button with default label", () => {
    const mockOnClick = jest.fn();
    render(<ResetButton onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Reset");
  });

  it("renders reset button with custom label", () => {
    const mockOnClick = jest.fn();
    render(<ResetButton onClick={mockOnClick} label="Play Again" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Play Again");
  });

  it("calls onClick handler when clicked", () => {
    const mockOnClick = jest.fn();
    render(<ResetButton onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const mockOnClick = jest.fn();
    render(<ResetButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("has aria-label for accessibility", () => {
    const mockOnClick = jest.fn();
    render(<ResetButton onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Reset game");
  });

  it("has correct button type", () => {
    const mockOnClick = jest.fn();
    render(<ResetButton onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    expect(button.tagName).toBe("BUTTON");
  });

  it("updates label when prop changes", () => {
    const mockOnClick = jest.fn();
    const { rerender } = render(
      <ResetButton onClick={mockOnClick} label="Reset" />
    );

    const button1 = screen.getByRole("button");
    expect(button1).toHaveTextContent("Reset");

    rerender(<ResetButton onClick={mockOnClick} label="Play Again" />);

    const button2 = screen.getByRole("button");
    expect(button2).toHaveTextContent("Play Again");
  });
});
