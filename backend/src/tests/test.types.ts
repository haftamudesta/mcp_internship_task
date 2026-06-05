import { User, Product, Reservation, Order } from '../types';

export interface TestUser {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  token: string;
}

export interface TestProduct extends Product {}

export interface TestReservation extends Reservation {}

export interface TestOrder extends Order {}