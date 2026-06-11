export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  totalStock: number;
  availableStock: number;
  createdAt: string;
  updatedAt: string;
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
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface CreateReservationRequest {
  productId: string;
  quantity: number;
}

export interface CreateReservationResponse {
  reservationId: string;
  expiresAt: string;
  quantity: number;
}

export interface CheckoutRequest {
  reservationId: string;
}

export interface CheckoutResponse {
  orderId: string;
  status: string;
  totalAmount: number;
}

export type UserRole = 'USER' | 'ADMIN' | 'OWNER';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
     role: UserRole;
  };
  token: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  totalStock: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  totalStock?: number;
}