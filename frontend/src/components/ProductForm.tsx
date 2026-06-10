import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  totalStock: number;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Partial<ProductFormData>;
  mode: "create" | "edit";
}

type FormErrors = {
  name?: string;
  description?: string;
  price?: string;
  totalStock?: string;
};

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    totalStock: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        totalStock: initialData.totalStock || 0,
      });
    } else if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        totalStock: 0,
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    } else if (isNaN(formData.price)) {
      newErrors.price = "Price must be a valid number";
    }

    if (formData.totalStock <= 0) {
      newErrors.totalStock = "Stock must be greater than 0";
    } else if (!Number.isInteger(formData.totalStock)) {
      newErrors.totalStock = "Stock must be a whole number";
    } else if (isNaN(formData.totalStock)) {
      newErrors.totalStock = "Stock must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Submission failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "price" || name === "totalStock") {
      const numValue = value === "" ? 0 : parseFloat(value);
      const finalValue = isNaN(numValue) ? 0 : numValue;

      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "price" | "totalStock",
  ) => {
    const value = e.target.value;
    const numValue = value === "" ? 0 : parseFloat(value);
    const finalValue = isNaN(numValue) ? 0 : numValue;

    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create New Product" : "Edit Product"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new product to your limited drops collection"
                : "Update the product details below"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Limited Edition Sneakers"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">
                Price (USD) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price === 0 ? "" : formData.price}
                onChange={(e) => handleNumberChange(e, "price")}
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="totalStock">
                Total Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalStock"
                name="totalStock"
                type="number"
                step="1"
                min="1"
                value={formData.totalStock === 0 ? "" : formData.totalStock}
                onChange={(e) => handleNumberChange(e, "totalStock")}
                placeholder="Number of units available"
                className={errors.totalStock ? "border-red-500" : ""}
              />
              {errors.totalStock && (
                <p className="text-sm text-red-500">{errors.totalStock}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This is the total stock quantity. Available stock will be set
                equal to total stock.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : mode === "create" ? (
                "Create Product"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
