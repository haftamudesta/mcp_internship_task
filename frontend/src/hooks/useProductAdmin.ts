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
      setError(err instanceof Error ? err.message : 'Failed to create product');
      return null;
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
      setError(err instanceof Error ? err.message : 'Failed to update product');
      return null;
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
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
    error,
  };
};