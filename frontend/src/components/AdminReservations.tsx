import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useReservation } from "../context/ReservationContext";
import { apiClient } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import {
  AlertCircle,
  Clock,
  User,
  Package,
  Loader2,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface Reservation {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  product?: {
    id: string;
    name: string;
    price: number;
    availableStock: number;
    totalStock: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export const AdminReservations: React.FC = () => {
  const { isAdmin, isOwner } = useAuth();
  const { cancel } = useReservation();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "active" | "expired" | "cancelled"
  >("active");

  const canManageReservations = isAdmin || isOwner;

  useEffect(() => {
    if (canManageReservations) {
      fetchReservations();
    }
  }, [canManageReservations]);

  useEffect(() => {
    if (!canManageReservations) return;

    const interval = setInterval(() => {
      fetchReservations();
    }, 30000);

    return () => clearInterval(interval);
  }, [canManageReservations]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ApiResponse<Reservation[]>>(
        "/api/admin/reservations",
      );

      // Handle different response structures
      let reservationsData: Reservation[] = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          reservationsData = response.data;
        } else if (
          response.data &&
          (response.data as any).data &&
          Array.isArray((response.data as any).data)
        ) {
          reservationsData = (response.data as any).data;
        } else if (Array.isArray(response)) {
          reservationsData = response;
        }
      }

      setReservations(reservationsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch reservations",
      );
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      setCancellingId(reservationId);
      setError(null);
      await cancel(reservationId);
      await fetchReservations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel reservation",
      );
      console.error("Error cancelling reservation:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getTimeLeft = (expiresAt: string) => {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));

    if (timeLeft === 0) return "Expired";

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeLeftColor = (expiresAt: string) => {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));

    if (timeLeft <= 30) return "text-red-600 font-bold";
    if (timeLeft <= 60) return "text-orange-500";
    return "text-green-600";
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (filter === "all") return true;
    return reservation.status.toUpperCase() === filter.toUpperCase();
  });

  const stats = {
    total: reservations.length,
    active: reservations.filter((r) => r.status.toUpperCase() === "ACTIVE")
      .length,
    expired: reservations.filter((r) => r.status.toUpperCase() === "EXPIRED")
      .length,
    cancelled: reservations.filter(
      (r) => r.status.toUpperCase() === "CANCELLED",
    ).length,
  };

  if (!canManageReservations) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Admin or Owner access required</AlertDescription>
      </Alert>
    );
  }

  if (loading && reservations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading reservations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reservations Management
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage all customer reservations
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchReservations}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.active}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-700">
                  {stats.expired}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-red-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-700">
                  {stats.cancelled}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b">
        {["all", "active", "expired", "cancelled"].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === filterOption
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
              {filterOption === "all"
                ? stats.total
                : filterOption === "active"
                  ? stats.active
                  : filterOption === "expired"
                    ? stats.expired
                    : stats.cancelled}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reservations List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {filter !== "all" ? filter : ""} reservations found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Qty
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Time Left
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Expires
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">
                              {reservation.user?.name ||
                                reservation.user?.email?.split("@")[0] ||
                                "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {reservation.user?.email || reservation.userId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">
                              {reservation.product?.name || "Unknown Product"}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {reservation.productId.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{reservation.quantity}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={getStatusBadgeColor(reservation.status)}
                        >
                          {reservation.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {reservation.status.toUpperCase() === "ACTIVE" ? (
                          <div
                            className={`flex items-center gap-1 ${getTimeLeftColor(reservation.expiresAt)}`}
                          >
                            <Clock className="h-3 w-3" />
                            <span className="font-mono text-sm font-medium">
                              {getTimeLeft(reservation.expiresAt)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(reservation.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {reservation.expiresAt
                          ? new Date(reservation.expiresAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {reservation.status.toUpperCase() === "ACTIVE" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleCancelReservation(reservation.id)
                            }
                            disabled={cancellingId === reservation.id}
                          >
                            {cancellingId === reservation.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            <span className="ml-1">Cancel</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
