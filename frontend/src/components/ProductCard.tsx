import React, { useState } from "react";
import { type Product } from "../types";
import { useReservation } from "../hooks/useReservation";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProductCardProps {
  product: Product;
  onRefresh: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onRefresh,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const { reservation, timeLeft, createReservation, checkout, cancel, error } =
    useReservation();

  const hasActiveReservation =
    reservation.status === "active" && reservation.productId === product.id;
  const isSoldOut = product.availableStock === 0;
  const isReserving = reservation.status === "loading";
  const isExpired = reservation.status === "expired";
  const stockPercentage = (product.availableStock / product.totalStock) * 100;
  const isLowStock = product.availableStock < 10 && product.availableStock > 0;

  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleReserve = async (): Promise<void> => {
    try {
      await createReservation(product.id, 1);
      onRefresh();
    } catch (err) {
      // Error handled by hook
      console.log("some thing want wrong!!!");
    }
  };

  const handleCheckout = async (): Promise<void> => {
    setIsCheckingOut(true);
    try {
      await checkout();
      onRefresh();
    } catch (err) {
      // Error handled by hook
      console.log("some thing want wrong!!!");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCancel = async (): Promise<void> => {
    await cancel();
    onRefresh();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
              Low Stock!
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
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isExpired && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Reservation has expired. The stock has been released.
            </AlertDescription>
          </Alert>
        )}

        {hasActiveReservation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  Reservation Active!
                </span>
              </div>
              <Badge variant="outline" className="bg-blue-100">
                {reservation.quantity} unit(s)
              </Badge>
            </div>

            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-blue-700">
                {formatTimeLeft(timeLeft)}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Time remaining to checkout
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!hasActiveReservation ? (
          <Button
            onClick={handleReserve}
            disabled={isSoldOut || isReserving}
            className="w-full"
            size="lg"
          >
            {isReserving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
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
        ) : (
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isCheckingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
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
        )}
      </CardFooter>
    </Card>
  );
};
