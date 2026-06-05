import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import apiClient from "../services/api";

interface ReservationState {
  id: string | null;
  productId: string | null;
  expiresAt: string | null;
  quantity: number;
  status: "idle" | "loading" | "active" | "expired" | "cancelled" | "failed";
  errorType?:
    | "network"
    | "timeout"
    | "race_condition"
    | "stock"
    | "duplicate"
    | "unknown";
}

interface ReservationContextType {
  reservation: ReservationState;
  timeLeft: number;
  createReservation: (productId: string, quantity?: number) => Promise<string>;
  checkout: () => Promise<void>;
  cancel: () => Promise<void>;
  reset: () => void;
  error: string | null;
  isRetrying: boolean;
  retry: () => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined,
);

export const useReservation = (): ReservationContextType => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservation must be used within ReservationProvider");
  }
  return context;
};

interface ReservationProviderProps {
  children: ReactNode;
}

export const ReservationProvider: React.FC<ReservationProviderProps> = ({
  children,
}) => {
  const [reservation, setReservation] = useState<ReservationState>(() => {
    const saved = localStorage.getItem("reservation");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
        return { ...parsed, status: "active" };
      }
    }
    return {
      id: null,
      productId: null,
      expiresAt: null,
      quantity: 1,
      status: "idle",
    };
  });

  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastAttemptRef = useRef<{
    productId: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (reservation.id && reservation.status === "active") {
      localStorage.setItem("reservation", JSON.stringify(reservation));
    } else if (
      reservation.status === "expired" ||
      reservation.status === "cancelled"
    ) {
      localStorage.removeItem("reservation");
    }
  }, [reservation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (reservation.status === "active" && reservation.expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const target = new Date(reservation.expiresAt!).getTime();
        const difference = target - now;

        if (difference <= 0) {
          setTimeLeft(0);
          setReservation((prev) => ({ ...prev, status: "expired" }));
          localStorage.removeItem("reservation");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          setTimeLeft(Math.floor(difference / 1000));
        }
      };

      updateTimer();
      intervalRef.current = window.setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(0);
    }
  }, [reservation.status, reservation.expiresAt]);

  const isDuplicateAttempt = (productId: string): boolean => {
    if (
      lastAttemptRef.current &&
      lastAttemptRef.current.productId === productId &&
      Date.now() - lastAttemptRef.current.timestamp < 2000
    ) {
      return true;
    }
    return false;
  };

  const createReservation = useCallback(
    async (productId: string, quantity: number = 1): Promise<string> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (isDuplicateAttempt(productId)) {
        const errorMsg = "Please wait a moment before trying again";
        setError(errorMsg);
        setReservation((prev) => ({
          ...prev,
          status: "failed",
          errorType: "duplicate",
        }));
        throw new Error(errorMsg);
      }

      lastAttemptRef.current = { productId, timestamp: Date.now() };

      setError(null);
      setReservation((prev) => ({
        ...prev,
        status: "loading",
        errorType: undefined,
      }));

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current === abortController) {
          abortController.abort();
        }
      }, 30000);

      try {
        const response = await apiClient.createReservation(
          { productId, quantity },
          abortController.signal,
        );

        clearTimeout(timeoutId);

        const newReservation = {
          id: response.reservationId,
          productId: productId,
          expiresAt: response.expiresAt,
          quantity: quantity,
          status: "active" as const,
        };

        setReservation(newReservation);
        localStorage.setItem("reservation", JSON.stringify(newReservation));

        return response.reservationId;
      } catch (err) {
        clearTimeout(timeoutId);

        let errorMessage = "";
        let errorType: ReservationState["errorType"] = "unknown";

        if (err instanceof Error && err.name === "AbortError") {
          errorMessage =
            "Request was cancelled or timed out. Please try again.";
          errorType = "timeout";
        } else if (err instanceof Error) {
          const message = err.message.toLowerCase();

          if (message.includes("network") || message.includes("fetch")) {
            errorMessage =
              "Network error. Please check your internet connection.";
            errorType = "network";
          } else if (message.includes("insufficient stock")) {
            errorMessage = "Sorry, this item is no longer in stock.";
            errorType = "stock";
          } else if (message.includes("already exists")) {
            errorMessage =
              "You already have an active reservation for this item.";
            errorType = "duplicate";
          } else {
            errorMessage = err.message;
            errorType = "unknown";
          }
        } else {
          errorMessage = "Failed to create reservation";
        }

        setError(errorMessage);
        setReservation((prev) => ({
          ...prev,
          status: "failed",
          errorType,
        }));
        throw err;
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [],
  );

  const retry = useCallback(async () => {
    if (reservation.productId && reservation.status === "failed") {
      setIsRetrying(true);
      setError(null);
      try {
        await createReservation(reservation.productId, reservation.quantity);
      } finally {
        setIsRetrying(false);
      }
    }
  }, [
    reservation.productId,
    reservation.quantity,
    reservation.status,
    createReservation,
  ]);

  const checkout = useCallback(async (): Promise<void> => {
    if (!reservation.id) {
      setError("No active reservation");
      return;
    }

    setError(null);

    const checkoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      checkoutController.abort();
    }, 30000);

    try {
      await apiClient.checkout(
        { reservationId: reservation.id },
        checkoutController.signal,
      );
      clearTimeout(timeoutId);
      setReservation({
        id: null,
        productId: null,
        expiresAt: null,
        quantity: 1,
        status: "cancelled",
      });
      localStorage.removeItem("reservation");
    } catch (err) {
      clearTimeout(timeoutId);

      let errorMessage = "";
      if (err instanceof Error && err.name === "AbortError") {
        errorMessage = "Checkout timed out. Please try again.";
      } else if (err instanceof Error) {
        if (err.message.toLowerCase().includes("expired")) {
          errorMessage = "Your reservation has expired. Please reserve again.";
          setReservation((prev) => ({ ...prev, status: "expired" }));
          localStorage.removeItem("reservation");
        } else {
          errorMessage = err.message;
        }
      } else {
        errorMessage = "Checkout failed";
      }
      setError(errorMessage);
      throw err;
    }
  }, [reservation.id]);

  const cancel = useCallback(async (): Promise<void> => {
    if (!reservation.id) {
      return;
    }

    try {
      await apiClient.cancelReservation(reservation.id);
      setReservation({
        id: null,
        productId: null,
        expiresAt: null,
        quantity: 1,
        status: "cancelled",
      });
      localStorage.removeItem("reservation");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel reservation";
      setError(message);
    }
  }, [reservation.id]);

  const reset = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setReservation({
      id: null,
      productId: null,
      expiresAt: null,
      quantity: 1,
      status: "idle",
    });
    setTimeLeft(0);
    setError(null);
    setIsRetrying(false);
    lastAttemptRef.current = null;
    localStorage.removeItem("reservation");
  }, []);

  return (
    <ReservationContext.Provider
      value={{
        reservation,
        timeLeft,
        createReservation,
        checkout,
        cancel,
        reset,
        error,
        isRetrying,
        retry,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};
