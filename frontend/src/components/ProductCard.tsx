import React, { useState, useEffect } from "react";
import { type Product } from "../types";
import { useReservation } from "../context/ReservationContext";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  XCircle,
  Loader2,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  onRefresh: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onRefresh,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [showExpiredMessage, setShowExpiredMessage] = useState<boolean>(false);
  const {
    createReservation,
    checkout,
    cancel,
    getReservationByProduct,
    getProductError,
    isProductLoading,
    isProductExpired,
    clearProductError,
    clearExpiredNotification,
  } = useReservation();

  const productError = getProductError(product.id);
  const isReserving = isProductLoading(product.id);
  const hasExpired = isProductExpired(product.id);

  const productReservation = getReservationByProduct(product.id);
  const hasActiveReservation =
    !!productReservation && productReservation.status === "active";
  const stockPercentage = (product.availableStock / product.totalStock) * 100;
  const isLowStock = product.availableStock < 10 && product.availableStock > 0;
  const isSoldOut = product.availableStock === 0;

  useEffect(() => {
    if (hasExpired && !showExpiredMessage) {
      setShowExpiredMessage(true);
      onRefresh();

      const timer = setTimeout(() => {
        setShowExpiredMessage(false);
        clearExpiredNotification(product.id);
        onRefresh();
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [
    hasExpired,
    showExpiredMessage,
    product.id,
    clearExpiredNotification,
    onRefresh,
  ]);

  useEffect(() => {
    if (hasActiveReservation) {
      setShowExpiredMessage(false);
      clearExpiredNotification(product.id);
    }
  }, [hasActiveReservation, product.id, clearExpiredNotification]);

  useEffect(() => {
    setShowExpiredMessage(false);
  }, [product.id]);

  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimerColor = (seconds: number): string => {
    if (seconds <= 30) return "text-red-600 animate-pulse";
    if (seconds <= 60) return "text-orange-500";
    return "text-blue-700";
  };

  const handleReserve = async (): Promise<void> => {
    try {
      await createReservation(product.id, 1);
      setShowExpiredMessage(false);
      onRefresh();
    } catch (err) {
      console.error("Reservation failed:", err);
    }
  };

  const handleCheckout = async (): Promise<void> => {
    if (!productReservation) return;

    setIsCheckingOut(true);
    try {
      await checkout(productReservation.id);
      onRefresh();
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCancel = async (): Promise<void> => {
    if (!productReservation) return;
    await cancel(productReservation.id);
    onRefresh();
  };

  const handleClearError = () => {
    clearProductError(product.id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-linear-to-r from-emerald-50 via-white to-teal-50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{product.name}</CardTitle>
            <CardDescription className="mt-1">
              {product.description || "No description available"}
            </CardDescription>
          </div>
          {isLowStock && !isSoldOut && (
            <Badge variant="destructive" className="animate-pulse">
              Only {product.availableStock} left!
            </Badge>
          )}
          {isSoldOut && <Badge variant="secondary">Sold Out</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available Stock:</span>
            <span
              className={
                isLowStock ? "text-destructive font-semibold" : "font-semibold"
              }
            >
              {product.availableStock} / {product.totalStock} units
            </span>
          </div>
          <Progress
            value={stockPercentage}
            className={isLowStock ? "bg-destructive/20" : ""}
          />
        </div>

        {productError && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1">
              <AlertDescription className="text-red-800">
                {productError}
              </AlertDescription>
            </div>
            <button
              onClick={handleClearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </Alert>
        )}

        {showExpiredMessage && (
          <Alert className="bg-yellow-50 border-yellow-200 animate-pulse">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 font-medium">
              Reservation has expired! The stock has been released. You can try
              reserving again.
            </AlertDescription>
          </Alert>
        )}

        {isReserving && !hasActiveReservation && !showExpiredMessage && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
              <span className="text-indigo-700">
                Creating your reservation...
              </span>
            </div>
          </div>
        )}

        {hasActiveReservation && productReservation && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-blue-800">
                  ✅ Reservation Confirmed!
                </span>
              </div>
              <Badge variant="outline" className="bg-blue-100">
                {productReservation.quantity} unit(s)
              </Badge>
            </div>
            <div className="text-center py-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Time Remaining
                </span>
              </div>
              <div
                className={`font-mono text-4xl font-bold ${getTimerColor(productReservation.timeLeft)}`}
              >
                {formatTimeLeft(productReservation.timeLeft)}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {productReservation.timeLeft <= 60
                  ? "Hurry! Your reservation is about to expire!"
                  : "Complete checkout before time expires"}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!hasActiveReservation && !showExpiredMessage ? (
          <Button
            onClick={handleReserve}
            disabled={isSoldOut || isReserving}
            className="w-full"
            size="lg"
          >
            {isReserving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reserving...
              </>
            ) : isSoldOut ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Sold Out
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Reserve Now
              </>
            )}
          </Button>
        ) : hasActiveReservation ? (
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Checkout"
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isCheckingOut}
            >
              Cancel
            </Button>
          </div>
        ) : null}
      </CardFooter>

      {!hasActiveReservation &&
        !isSoldOut &&
        !isReserving &&
        !showExpiredMessage && (
          <div className="px-6 pb-4">
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              You have 5 minutes to complete checkout after reserving
            </p>
          </div>
        )}
    </Card>
  );
};
