import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  totalStock: number;
  availableStock: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    reservations: number;
  };
}

export interface Reservation {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  user?: User;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  reservationId: string | null;
  quantity: number;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  user?: User;
}

export interface InventoryLog {
  id: string;
  productId: string;
  changeType: 'RESERVATION_CREATE' | 'RESERVATION_EXPIRE' | 'RESERVATION_COMPLETE' | 'RESERVATION_CANCEL' | 'STOCK_RESTORE' | 'ORDER_CREATE';
  quantity: number;
  oldStock: number;
  newStock: number;
  reason: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  message?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Type-safe pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}


export const CreateReservationSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(10)
});

export const CheckoutSchema = z.object({
  reservationId: z.string().uuid()
});

export const ListProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['name', 'price', 'createdAt', 'availableStock']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type ListProductsInput = z.infer<typeof ListProductsSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// Type-safe DTOs
export interface ReservationResponse {
  reservationId: string;
  expiresAt: Date;
  quantity: number;
  status: string;
}

export interface CheckoutResponse {
  orderId: string;
  status: string;
  totalAmount: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  token: string;
}

// Service response types
export interface CreateReservationResult {
  id: string;
  expiresAt: Date;
  quantity: number;
  status: string;
}

export interface CheckoutResult {
  id: string;
  status: string;
  totalAmount: number;
}

export interface TokenPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  totalStock: z.number().int().positive('Total stock must be a positive integer')
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;