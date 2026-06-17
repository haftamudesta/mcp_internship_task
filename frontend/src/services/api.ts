import axios, {type AxiosInstance,type InternalAxiosRequestConfig, AxiosError } from 'axios';
import type{ 
  Product, 
  PaginatedResponse, 
  AuthResponse, 
  CreateReservationResponse, 
  CheckoutResponse, 
  CreateReservationRequest, 
  CheckoutRequest,
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  CreateProductInput,
  UpdateProductInput
} from '../types';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN' | 'OWNER'; 
  createdAt?: string; 
  updatedAt?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
      timeout: 30000, 
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(this.handleRequest.bind(this));
    this.client.interceptors.response.use(
      (response) => response,
      this.handleError.bind(this)
    );
  }

  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  private handleError(error: AxiosError): Promise<never> {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    const data = error.response?.data as ApiErrorResponse;
    if (data?.error) {
      throw new Error(data.error);
    }
    
    throw error;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (this.token) return this.token;
    const stored = localStorage.getItem('auth_token');
    if (stored) this.token = stored;
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.success === true;
  }

  // Generic HTTP methods
  async get<T = unknown>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T = unknown>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T = unknown>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/api/auth/register', {
      email,
      password,
      name: name || undefined
    });
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Registration failed');
    }
    return data.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/api/auth/login', {
      email,
      password
    });
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Login failed');
    }
    return data.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/api/auth/me');
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to get profile');
    }
    return data.data;
  }

  // User management endpoints (Admin only)
  async getAllUsers(): Promise<{ data: User[] }> {
    const response = await this.client.get<ApiResponse<User[]>>('/api/auth/users');
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to fetch users');
    }
    return { data: data.data };
  }

  async updateUserRole(userId: string, role: string): Promise<{ data: User }> {
    const response = await this.client.put<ApiResponse<User>>('/api/auth/users/role', { userId, role });
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to update user role');
    }
    return { data: data.data };
  }
  async updateProfile(name: string): Promise<User> {
  const response = await this.client.put<ApiResponse<User>>('/api/auth/profile', { name });
  
  const data = response.data;
  if (!this.isSuccessResponse(data)) {
    throw new Error(data.error || 'Failed to update profile');
  }
  return data.data;
}

  // Product endpoints
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<Product>>>('/api/products', { params });
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to fetch products');
    }
    return data.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.client.get<ApiResponse<Product>>(`/api/products/${id}`);
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to fetch product');
    }
    return data.data;
  }

  async createProduct(productData: CreateProductInput): Promise<Product> {
    const response = await this.client.post<ApiResponse<Product>>('/api/products', productData);
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to create product');
    }
    return data.data;
  }

  async updateProduct(id: string, productData: UpdateProductInput): Promise<Product> {
    const response = await this.client.put<ApiResponse<Product>>(`/api/products/${id}`, productData);
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to update product');
    }
    return data.data;
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<null>>(`/api/products/${id}`);
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to delete product');
    }
  }

  // Reservation endpoints
  async createReservation(data: CreateReservationRequest, signal?: AbortSignal): Promise<CreateReservationResponse> {
    const response = await this.client.post<ApiResponse<CreateReservationResponse>>('/api/reservations', data, {
      signal
    });
    
    const responseData = response.data;
    if (!this.isSuccessResponse(responseData)) {
      throw new Error(responseData.error || 'Failed to create reservation');
    }
    return responseData.data;
  }

  async checkout(data: CheckoutRequest, signal?: AbortSignal): Promise<CheckoutResponse> {
    const response = await this.client.post<ApiResponse<CheckoutResponse>>('/api/reservations/checkout', data, {
      signal
    });
    
    const responseData = response.data;
    if (!this.isSuccessResponse(responseData)) {
      throw new Error(responseData.error || 'Checkout failed');
    }
    return responseData.data;
  }

  async getActiveReservations(): Promise<any[]> {
    const response = await this.client.get<ApiResponse<any[]>>('/api/reservations/active');
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to fetch reservations');
    }
    return data.data;
  }

  async cancelReservation(reservationId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<null>>(`/api/reservations/${reservationId}`);
    
    const data = response.data;
    if (!this.isSuccessResponse(data)) {
      throw new Error(data.error || 'Failed to cancel reservation');
    }
  }
  async deleteReservation<T = unknown>(url: string): Promise<T> {
  const response = await this.client.delete<T>(url);
  return response.data;
}
}

export const apiClient = new ApiClient();
export default apiClient;