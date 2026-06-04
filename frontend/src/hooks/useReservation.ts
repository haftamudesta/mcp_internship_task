import { useState, useCallback } from 'react';
import apiClient from '../services/api';
import { useCountdown } from './useCountdown';

interface ReservationState {
  id: string | null;
  productId: string | null;
  expiresAt: string | null;
  quantity: number;
  status: 'idle' | 'loading' | 'active' | 'expired' | 'cancelled';
}

interface UseReservationReturn {
  reservation: ReservationState;
  timeLeft: number;
  createReservation: (productId: string, quantity?: number) => Promise<string>;
  checkout: () => Promise<void>;
  cancel: () => Promise<void>;
  reset: () => void;
  error: string | null;
}

export const useReservation = (): UseReservationReturn => {
  const [reservation, setReservation] = useState<ReservationState>({
    id: null,
    productId: null,
    expiresAt: null,
    quantity: 1,
    status: 'idle'
  });
  const [error, setError] = useState<string | null>(null);
  
  const timeLeft = useCountdown(reservation.expiresAt);

  const createReservation = useCallback(async (productId: string, quantity: number = 1): Promise<string> => {
    setError(null);
    setReservation(prev => ({ ...prev, status: 'loading' }));
    
    try {
      const response = await apiClient.createReservation({ productId, quantity });
      
      setReservation({
        id: response.reservationId,
        productId,
        expiresAt: response.expiresAt,
        quantity,
        status: 'active'
      });
      
      return response.reservationId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create reservation';
      setError(message);
      setReservation(prev => ({ ...prev, status: 'idle' }));
      throw err;
    }
  }, []);

  const checkout = useCallback(async (): Promise<void> => {
    if (!reservation.id) {
      setError('No active reservation');
      return;
    }
    
    setError(null);
    
    try {
      await apiClient.checkout({ reservationId: reservation.id });
      setReservation(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      setError(message);
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
        status: 'cancelled'
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel reservation';
      setError(message);
    }
  }, [reservation.id]);

  const reset = useCallback((): void => {
    setReservation({
      id: null,
      productId: null,
      expiresAt: null,
      quantity: 1,
      status: 'idle'
    });
    setError(null);
  }, []);

  // Check if reservation has expired
  if (reservation.status === 'active' && timeLeft === 0 && reservation.id) {
    setReservation(prev => ({ ...prev, status: 'expired' }));
  }

  return {
    reservation,
    timeLeft,
    createReservation,
    checkout,
    cancel,
    reset,
    error
  };
};