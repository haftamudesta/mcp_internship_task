import React, { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../hooks/useAuth";
import { ProductForm } from "../components/ProductForm";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import apiClient from "../services/api";

interface AdminProductsProps {
  onProductChange?: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  onProductChange,
}) => {
  const { user } = useAuth();
  const {
    products,
    loading,
    error,
    refetch,
    setPage,
    currentPage,
    totalPages,
  } = useProducts({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
    autoRefresh: true,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin" || user?.email === "admin@example.com";

  const handleCreateProduct = async (data: any) => {
    setActionError(null);
    try {
      await apiClient.post("/products", data);
      await refetch();
      onProductChange?.();
    } catch (error: any) {
      setActionError(
        error.response?.data?.message || "Failed to create product",
      );
      throw error;
    }
  };

  const handleUpdateProduct = async (data: any) => {
    setActionError(null);
    try {
      await apiClient.put(`/products/${editingProduct.id}`, data);
      await refetch();
      onProductChange?.();
      setEditingProduct(null);
    } catch (error: any) {
      setActionError(
        error.response?.data?.message || "Failed to update product",
      );
      throw error;
    }
  };

  const handleDeleteProduct = async () => {
    setActionError(null);
    try {
      await apiClient.delete(`/products/${deletingProduct.id}`);
      await refetch();
      onProductChange?.();
      setDeletingProduct(null);
    } catch (error: any) {
      setActionError(
        error.response?.data?.message || "Failed to delete product",
      );
      throw error;
    }
  };

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this page. Admin access required.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create, edit, and manage your limited drop products
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first limited drop product
            </p>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="relative group">
                <CardHeader>
                  <CardTitle className="pr-16">{product.name}</CardTitle>
                  <CardDescription>
                    {product.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                      <DollarSign className="h-5 w-5" />
                      {product.price.toFixed(2)}
                    </div>
                    <Badge
                      variant={
                        product.availableStock === 0
                          ? "destructive"
                          : product.availableStock < 10
                            ? "default"
                            : "secondary"
                      }
                    >
                      <Layers className="h-3 w-3 mr-1" />
                      {product.availableStock} / {product.totalStock} in stock
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingProduct(product);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeletingProduct(product)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        initialData={editingProduct || undefined}
        mode={editingProduct ? "edit" : "create"}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        productName={deletingProduct?.name || ""}
      />
    </div>
  );
};
