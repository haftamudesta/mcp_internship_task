import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import apiClient from "../services/api";

interface ReservationState {
  id: string;
  productId: string;
  expiresAt: string;
  quantity: number;
  status: "active" | "expired" | "cancelled";
  timeLeft: number;
}

interface ReservationContextType {
  reservations: ReservationState[];
  productErrors: Map<string, string>;
  loadingProducts: Set<string>;
  expiredProducts: Set<string>;
  createReservation: (productId: string, quantity?: number) => Promise<string>;
  checkout: (reservationId: string) => Promise<void>;
  cancel: (reservationId: string) => Promise<void>;
  getReservationByProduct: (productId: string) => ReservationState | undefined;
  getProductError: (productId: string) => string | null;
  isProductLoading: (productId: string) => boolean;
  isProductExpired: (productId: string) => boolean;
  clearProductError: (productId: string) => void;
  clearExpiredNotification: (productId: string) => void;
  error: string | null;
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
  const [reservations, setReservations] = useState<ReservationState[]>([]);
  const [productErrors, setProductErrors] = useState<Map<string, string>>(
    new Map(),
  );
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(
    new Set(),
  );
  const [expiredProducts, setExpiredProducts] = useState<Set<string>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const intervalRefs = useRef<Map<string, number>>(new Map());

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      intervalRefs.current.forEach((interval) => clearInterval(interval));
      intervalRefs.current.clear();
    };
  }, []);

  // Start countdown timer for a reservation
  const startCountdown = useCallback(
    (reservationId: string, productId: string, expiresAt: string) => {
      if (intervalRefs.current.has(reservationId)) {
        clearInterval(intervalRefs.current.get(reservationId)!);
      }

      const updateTimer = () => {
        const now = new Date().getTime();
        const target = new Date(expiresAt).getTime();
        const difference = target - now;

        setReservations((prev) =>
          prev.map((res) => {
            if (res.id === reservationId) {
              const timeLeft = Math.max(0, Math.floor(difference / 1000));

              if (timeLeft === 0 && res.status === "active") {
                if (intervalRefs.current.has(reservationId)) {
                  clearInterval(intervalRefs.current.get(reservationId)!);
                  intervalRefs.current.delete(reservationId);
                }
                setExpiredProducts((prev) => new Set(prev).add(productId));
                return { ...res, status: "expired", timeLeft: 0 };
              }

              return { ...res, timeLeft };
            }
            return res;
          }),
        );
      };

      updateTimer();

      const interval = window.setInterval(updateTimer, 1000);
      intervalRefs.current.set(reservationId, interval);
    },
    [],
  );

  const getProductError = useCallback(
    (productId: string): string | null => {
      return productErrors.get(productId) || null;
    },
    [productErrors],
  );

  const isProductLoading = useCallback(
    (productId: string): boolean => {
      return loadingProducts.has(productId);
    },
    [loadingProducts],
  );

  const isProductExpired = useCallback(
    (productId: string): boolean => {
      return expiredProducts.has(productId);
    },
    [expiredProducts],
  );

  const clearProductError = useCallback((productId: string): void => {
    setProductErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
  }, []);

  const clearExpiredNotification = useCallback((productId: string): void => {
    setExpiredProducts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  }, []);

  const createReservation = useCallback(
    async (productId: string, quantity: number = 1): Promise<string> => {
      setLoadingProducts((prev) => new Set(prev).add(productId));
      clearProductError(productId);
      clearExpiredNotification(productId);
      setError(null);

      try {
        const response = await apiClient.createReservation({
          productId,
          quantity,
        });

        const newReservation: ReservationState = {
          id: response.reservationId,
          productId,
          expiresAt: response.expiresAt,
          quantity,
          status: "active",
          timeLeft: Math.floor(
            (new Date(response.expiresAt).getTime() - Date.now()) / 1000,
          ),
        };

        setReservations((prev) => [...prev, newReservation]);
        startCountdown(response.reservationId, productId, response.expiresAt);

        return response.reservationId;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create reservation";

        setProductErrors((prev) => {
          const newMap = new Map(prev);
          newMap.set(productId, message);
          return newMap;
        });

        throw err;
      } finally {
        setLoadingProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [startCountdown, clearProductError, clearExpiredNotification],
  );

  const checkout = useCallback(
    async (reservationId: string): Promise<void> => {
      try {
        await apiClient.checkout({ reservationId });

        if (intervalRefs.current.has(reservationId)) {
          clearInterval(intervalRefs.current.get(reservationId)!);
          intervalRefs.current.delete(reservationId);
        }

        const reservation = reservations.find((r) => r.id === reservationId);
        if (reservation) {
          clearExpiredNotification(reservation.productId);
        }

        setReservations((prev) =>
          prev.filter((res) => res.id !== reservationId),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Checkout failed";
        setError(message);
        throw err;
      }
    },
    [reservations, clearExpiredNotification],
  );

  const cancel = useCallback(
    async (reservationId: string): Promise<void> => {
      try {
        await apiClient.cancelReservation(reservationId);

        if (intervalRefs.current.has(reservationId)) {
          clearInterval(intervalRefs.current.get(reservationId)!);
          intervalRefs.current.delete(reservationId);
        }

        const reservation = reservations.find((r) => r.id === reservationId);
        if (reservation) {
          clearExpiredNotification(reservation.productId);
        }

        setReservations((prev) =>
          prev.filter((res) => res.id !== reservationId),
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to cancel reservation";
        setError(message);
        throw err;
      }
    },
    [reservations, clearExpiredNotification],
  );

  const getReservationByProduct = useCallback(
    (productId: string): ReservationState | undefined => {
      return reservations.find(
        (res) => res.productId === productId && res.status === "active",
      );
    },
    [reservations],
  );

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        productErrors,
        loadingProducts,
        expiredProducts,
        createReservation,
        checkout,
        cancel,
        getReservationByProduct,
        getProductError,
        isProductLoading,
        isProductExpired,
        clearProductError,
        clearExpiredNotification,
        error,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};
