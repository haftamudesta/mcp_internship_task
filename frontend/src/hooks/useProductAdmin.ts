// useProductAdmin.ts
import { useState } from 'react';
import { apiClient } from '../services/api';
import type { Product, CreateProductInput, UpdateProductInput } from '../types';

export const useProductAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (data: CreateProductInput): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const product = await apiClient.createProduct(data);
      return product;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      setError(message);
      return null; // Return null instead of throwing
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, data: UpdateProductInput): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const product = await apiClient.updateProduct(id, data);
      return product;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      return null; // Return null instead of throwing
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.deleteProduct(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
    loading,
    error,
  };
};