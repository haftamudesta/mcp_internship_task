import React, { useRef, useEffect, useState, useCallback } from "react";

interface AdvancedMarqueeProps {
  messages?: string[];
  speed?: {
    fast: number;
    slow: number;
  };
  className?: string;
}

export const AdvancedMarquee: React.FC<AdvancedMarqueeProps> = ({
  messages = [
    "LIMITED EDITION DROPS — SHOP BEFORE THEY'RE GONE!",
    "5-MINUTE RESERVATIONS — ACT FAST!",
    "REAL-TIME STOCK UPDATES — EVERY 5 SECONDS!",
    "💎 EXCLUSIVE ITEMS — LIMITED QUANTITIES! 💎",
    "SECURE CHECKOUT — SAFE & ENCRYPTED!",
    "1000+ CONCURRENT USERS — TRUSTED SYSTEM!",
  ],
  speed = { fast: 1.2, slow: 0.25 },
  className = "",
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(false);
  const [position, setPosition] = useState<number>(100);
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      const deltaTime = Math.min(timestamp - lastTimestamp, 33) / 16.67;
      lastTimestamp = timestamp;

      let currentSpeed = isVisibleRef.current ? speed.slow : speed.fast;
      if (isPaused) currentSpeed = 0;

      setPosition((prev) => {
        let newPos = prev - currentSpeed * deltaTime;

        // Reset position and change message when completely off-screen left
        if (newPos < -100) {
          newPos = 100;
          setCurrentMessageIndex(
            (prevIndex) => (prevIndex + 1) % messages.length,
          );
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, messages.length, isPaused]);

  // Pause animation on hover
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  return (
    <div
      className={`relative py-3 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={elementRef}
        className="whitespace-nowrap will-change-transform cursor-pointer"
        style={{
          transform: `translateX(${position}%)`,
          contain: "layout paint",
          transition: isPaused ? "transform 0.1s linear" : "none",
        }}
      >
        <div className="inline-flex items-center bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          <span className="tracking-wide">{messages[currentMessageIndex]}</span>
        </div>
      </div>
    </div>
  );
};
