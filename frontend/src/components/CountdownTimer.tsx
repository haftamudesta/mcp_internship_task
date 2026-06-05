import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiresAt: string | null;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(expiresAt).getTime();
      const difference = target - now;

      if (difference <= 0) {
        onExpire?.();
        return 0;
      }

      return Math.floor(difference / 1000);
    };

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!expiresAt || timeLeft <= 0) {
    return null;
  }

  const isUrgent = timeLeft <= 60;
  const isCritical = timeLeft <= 30;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="text-center">
        <p className="text-sm text-blue-600 mb-1">
          Time remaining to complete checkout
        </p>
        <div
          className={`font-mono text-3xl font-bold ${isCritical ? "text-red-600 animate-pulse" : isUrgent ? "text-orange-500" : "text-blue-700"}`}
        >
          {formatTime(timeLeft)}
        </div>
        <p className="text-xs text-blue-500 mt-2">
          {isUrgent
            ? "Hurry! Reservation expiring soon!"
            : "Complete checkout before time expires"}
        </p>
      </div>
    </div>
  );
};
