import React, { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../hooks/useAuth";
import { useProductAdmin } from "../hooks/useProductAdmin";
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
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

interface AdminProductsProps {
  onProductChange?: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  onProductChange,
}) => {
  const { isAdmin, isOwner } = useAuth();
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

  const {
    createProduct,
    updateProduct,
    deleteProduct,
    loading: adminLoading,
    error: adminError,
  } = useProductAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canManageProducts = isAdmin || isOwner;
  const canDeleteProducts = isAdmin;

  const handleCreateProduct = async (data: any): Promise<void> => {
    const result = await createProduct(data);
    if (result) {
      setSuccessMessage("Product created successfully!");
      await refetch();
      onProductChange?.();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      throw new Error(adminError || "Failed to create product");
    }
  };

  const handleUpdateProduct = async (data: any): Promise<void> => {
    if (!editingProduct) return;
    const result = await updateProduct(editingProduct.id, data);
    if (result) {
      setSuccessMessage("Product updated successfully!");
      await refetch();
      onProductChange?.();
      setEditingProduct(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      throw new Error(adminError || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (): Promise<void> => {
    if (!deletingProduct) return;
    const success = await deleteProduct(deletingProduct.id);
    if (success) {
      setSuccessMessage("Product deleted successfully!");
      await refetch();
      onProductChange?.();
      setDeletingProduct(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      throw new Error(adminError || "Failed to delete product");
    }
  };

  if (!canManageProducts) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this page. Admin or Moderator
          access required.
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
            {isAdmin
              ? "Full access: Create, edit, and delete products"
              : "Moderator access: Create and edit products only"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {isOwner && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You have owner permissions. You can create and edit products, but
            you cannot delete them.
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {(adminError || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{adminError || error}</AlertDescription>
        </Alert>
      )}

      {(loading || adminLoading) && products.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
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
              <Card
                key={product.id}
                className="relative group hover:shadow-lg transition-shadow"
              >
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

                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          product.availableStock === 0
                            ? "bg-red-500"
                            : product.availableStock < 10
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${(product.availableStock / product.totalStock) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.round(
                        (product.availableStock / product.totalStock) * 100,
                      )}
                      % available
                    </p>
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
                    disabled={adminLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeletingProduct(product)}
                    disabled={adminLoading || !canDeleteProducts}
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
                disabled={currentPage === 1 || adminLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages || adminLoading}
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
