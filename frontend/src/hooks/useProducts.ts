import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import {type Product } from '../types';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  autoRefresh?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalItems: number;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    autoRefresh = true
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [currentSearch, setCurrentSearch] = useState<string>(search);
  const [currentSortBy, setCurrentSortBy] = useState<string>(sortBy);
  const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>(sortOrder);

  const fetchProducts = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getProducts({
        page: currentPage,
        limit,
        search: currentSearch,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder
      });
      
      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, currentSearch, currentSortBy, currentSortOrder]);

  useEffect(() => {
    fetchProducts();
    
    if (autoRefresh) {
      const interval = setInterval(fetchProducts, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchProducts, autoRefresh]);

  return {
    products,
    loading,
    error,
    totalPages,
    currentPage,
    totalItems,
    refetch: fetchProducts,
    setPage: setCurrentPage,
    setSearch: setCurrentSearch,
    setSortBy: setCurrentSortBy,
    setSortOrder: setCurrentSortOrder
  };
};