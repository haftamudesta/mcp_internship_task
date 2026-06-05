import React, { useState, useEffect } from "react";
import { type Product } from "../types";
import { useReservationGlobal } from "../context/ReservationContext";
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
  WifiOff,
  RefreshCw,
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
  const {
    reservation,
    timeLeft,
    createReservation,
    checkout,
    cancel,
    error,
    isRetrying,
    retry,
  } = useReservationGlobal();

  const hasActiveReservation =
    reservation.status === "active" && reservation.productId === product.id;
  const isSoldOut = product.availableStock === 0;
  const isReserving = reservation.status === "loading";
  const isExpired = reservation.status === "expired";
  const isFailed = reservation.status === "failed";
  const stockPercentage = (product.availableStock / product.totalStock) * 100;
  const isLowStock = product.availableStock < 10 && product.availableStock > 0;

  const getErrorDisplay = () => {
    if (!error) return null;

    const errorConfig: Record<
      string,
      { icon: React.ReactNode; title: string; action?: React.ReactNode }
    > = {
      network: {
        icon: <WifiOff className="h-5 w-5" />,
        title: "Network Error",
      },
      timeout: {
        icon: <Clock className="h-5 w-5" />,
        title: "Request Timeout",
      },
      stock: {
        icon: <XCircle className="h-5 w-5" />,
        title: "Out of Stock",
      },
      duplicate: {
        icon: <AlertCircle className="h-5 w-5" />,
        title: "Duplicate Request",
      },
      race_condition: {
        icon: <RefreshCw className="h-5 w-5" />,
        title: "Concurrent Request",
      },
    };

    const config = errorConfig[reservation.errorType || ""] || {
      icon: <AlertCircle className="h-5 w-5" />,
      title: "Error",
    };

    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          {config.icon}
          <div className="flex-1">
            <AlertDescription className="text-red-800 font-medium">
              {config.title}
            </AlertDescription>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          {(reservation.errorType === "network" ||
            reservation.errorType === "timeout") && (
            <Button
              size="sm"
              variant="outline"
              onClick={retry}
              disabled={isRetrying}
              className="border-red-300 hover:bg-red-50"
            >
              {isRetrying ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Retry
            </Button>
          )}
        </div>
      </Alert>
    );
  };

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
      onRefresh();
    } catch (err) {
      console.error("Reservation failed:", err);
    }
  };

  const handleCheckout = async (): Promise<void> => {
    setIsCheckingOut(true);
    try {
      await checkout();
      onRefresh();
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCancel = async (): Promise<void> => {
    await cancel();
    onRefresh();
  };

  useEffect(() => {
    if (isSoldOut && product.availableStock === 0) {
      onRefresh();
    }
  }, [product.availableStock, isSoldOut, onRefresh]);

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
              ⚡ Only {product.availableStock} left!
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

        {getErrorDisplay()}

        {isExpired && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Reservation has expired! The stock has been released. You can try
              reserving again.
            </AlertDescription>
          </Alert>
        )}

        {isReserving && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
              <span className="text-indigo-700">
                Creating your reservation...
              </span>
            </div>
          </div>
        )}

        {hasActiveReservation && reservation.expiresAt && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-blue-800">
                  ✅ Reservation Confirmed!
                </span>
              </div>
              <Badge variant="outline" className="bg-blue-100">
                {reservation.quantity} unit(s)
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
                className={`font-mono text-4xl font-bold ${getTimerColor(timeLeft)}`}
              >
                {formatTimeLeft(timeLeft)}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {timeLeft <= 60
                  ? "⚠️ Hurry! Your reservation is about to expire!"
                  : "Complete checkout before time expires"}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!hasActiveReservation ? (
          <Button
            onClick={handleReserve}
            disabled={isSoldOut || isReserving || isRetrying}
            className="w-full"
            size="lg"
          >
            {isReserving || isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isRetrying ? "Retrying..." : "Reserving..."}
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Checkout
                </>
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

      {!hasActiveReservation && !isSoldOut && !isReserving && !isFailed && (
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
