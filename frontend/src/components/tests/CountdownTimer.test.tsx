import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CountdownTimer } from "../CountdownTimer";

describe("CountdownTimer Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render timer with correct initial time (5 minutes)", () => {
    const expiresAt = new Date(Date.now() + 300000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} />);

    expect(
      screen.getByText("Time remaining to complete checkout"),
    ).toBeInTheDocument();
    expect(screen.getByText("5:00")).toBeInTheDocument();
  });

  it("should count down correctly over time", () => {
    const expiresAt = new Date(Date.now() + 120000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} />);

    expect(screen.getByText("2:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.getByText("1:30")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.getByText("1:00")).toBeInTheDocument();
  });

  it("should update every second", () => {
    const expiresAt = new Date(Date.now() + 5000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} />);

    expect(screen.getByText("0:05")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("0:04")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("0:03")).toBeInTheDocument();
  });

  it("should show normal styling when time > 60 seconds", () => {
    const expiresAt = new Date(Date.now() + 120000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} />);

    const timerElement = screen.getByText("2:00");
    expect(timerElement).toHaveClass("text-blue-700");
    expect(timerElement).not.toHaveClass("text-orange-500");
    expect(timerElement).not.toHaveClass("text-red-600");
  });

  it("should show urgent styling when time <= 60 seconds", () => {
    const expiresAt = new Date(Date.now() + 55000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} />);

    const timerElement = screen.getByText("0:55");
    expect(timerElement).toHaveClass("text-orange-500");
    expect(
      screen.getByText("Hurry! Reservation expiring soon!"),
    ).toBeInTheDocument();
  });

  it("should show critical styling when time <= 30 seconds", () => {
    const expiresAt = new Date(Date.now() + 25000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} />);

    const timerElement = screen.getByText("0:25");
    expect(timerElement).toHaveClass("text-red-600");
    expect(timerElement).toHaveClass("animate-pulse");
  });

  it("should call onExpire callback when timer reaches zero", () => {
    const onExpire = vi.fn();
    const expiresAt = new Date(Date.now() + 3000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />);

    expect(onExpire).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("should not render when expiresAt is null", () => {
    render(<CountdownTimer expiresAt={null} />);

    expect(
      screen.queryByText("Time remaining to complete checkout"),
    ).not.toBeInTheDocument();
  });

  it("should not render when expiresAt is expired", () => {
    const expiresAt = new Date(Date.now() - 1000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} />);

    expect(
      screen.queryByText("Time remaining to complete checkout"),
    ).not.toBeInTheDocument();
  });

  it("should format time correctly for various durations", () => {
    // Test 3 minutes 30 seconds
    let expiresAt = new Date(Date.now() + 210000).toISOString();
    const { unmount } = render(<CountdownTimer expiresAt={expiresAt} />);
    expect(screen.getByText("3:30")).toBeInTheDocument();
    unmount();

    // Test 1 minute 15 seconds
    expiresAt = new Date(Date.now() + 75000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} />);
    expect(screen.getByText("1:15")).toBeInTheDocument();
  });

  it("should transition styling from normal to urgent to critical", () => {
    const expiresAt = new Date(Date.now() + 120000).toISOString();
    render(<CountdownTimer expiresAt={expiresAt} />);

    // Initially normal
    let timerElement = screen.getByText("2:00");
    expect(timerElement).toHaveClass("text-blue-700");

    // Advance to 55 seconds (urgent)
    act(() => {
      vi.advanceTimersByTime(65000);
    });

    timerElement = screen.getByText("0:55");
    expect(timerElement).toHaveClass("text-orange-500");

    // Advance to 25 seconds (critical)
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    timerElement = screen.getByText("0:25");
    expect(timerElement).toHaveClass("text-red-600");
    expect(timerElement).toHaveClass("animate-pulse");
  });
});
