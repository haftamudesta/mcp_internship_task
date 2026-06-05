import { useState, useEffect } from 'react';

export const useCountdown = (targetDate: string | null): number => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(0);
      return;
    }

    // Ensure we're working with a valid date
    const target = new Date(targetDate);
    
    // Check if date is valid
    if (isNaN(target.getTime())) {
      console.error('Invalid date format:', targetDate);
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = (): number => {
      const now = new Date().getTime();
      const targetTime = target.getTime();
      const difference = targetTime - now;
      
      console.log('Countdown calculation:', {
        now: new Date(now).toISOString(),
        target: new Date(targetTime).toISOString(),
        difference
      });
      
      if (difference <= 0) return 0;
      return Math.floor(difference / 1000);
    };

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};