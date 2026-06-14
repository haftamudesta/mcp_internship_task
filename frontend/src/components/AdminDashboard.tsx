import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import { apiClient } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Eye,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "./ui/alert";

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

interface ReservationStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  completed: number;
}

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { products, loading: productsLoading } = useProducts({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
    autoRefresh: true,
  });

  const [reservationStats, setReservationStats] = useState<ReservationStats>({
    total: 0,
    active: 0,
    expired: 0,
    cancelled: 0,
    completed: 0,
  });
  const [recentReservations, setRecentReservations] = useState<Reservation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservationData();
  }, []);

  const fetchReservationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: any = await apiClient.get("/api/admin/reservations");

      let reservations: Reservation[] = [];

      console.log("Reservations API Response:", response);

      if (response && typeof response === "object") {
        if (Array.isArray(response)) {
          reservations = response;
        } else if (response.data && Array.isArray(response.data)) {
          reservations = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          reservations = response.data.data;
        } else if (
          response.reservations &&
          Array.isArray(response.reservations)
        ) {
          reservations = response.reservations;
        } else if (
          response.data &&
          response.data.reservations &&
          Array.isArray(response.data.reservations)
        ) {
          reservations = response.data.reservations;
        }
      }

      if (reservations.length === 0) {
        console.log(
          "No reservations found in primary endpoint, trying alternative...",
        );
        try {
          const altResponse: any = await apiClient.get(
            "/api/reservations/active",
          );
          if (altResponse && Array.isArray(altResponse)) {
            reservations = altResponse;
          } else if (
            altResponse &&
            altResponse.data &&
            Array.isArray(altResponse.data)
          ) {
            reservations = altResponse.data;
          }
        } catch (altErr) {
          console.log("Alternative endpoint also failed");
        }
      }

      const stats = {
        total: reservations.length,
        active: reservations.filter((r: Reservation) => r.status === "ACTIVE")
          .length,
        expired: reservations.filter((r: Reservation) => r.status === "EXPIRED")
          .length,
        cancelled: reservations.filter(
          (r: Reservation) => r.status === "CANCELLED",
        ).length,
        completed: reservations.filter(
          (r: Reservation) => r.status === "COMPLETED",
        ).length,
      };

      setReservationStats(stats);

      const recent = reservations
        .filter((r: Reservation) => r.status === "ACTIVE")
        .sort(
          (a: Reservation, b: Reservation) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

      setRecentReservations(recent);
    } catch (err) {
      console.error("Error fetching reservation data:", err);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0);
  const availableStock = products.reduce((sum, p) => sum + p.availableStock, 0);
  const soldStock = totalStock - availableStock;
  const soldPercentage = totalStock > 0 ? (soldStock / totalStock) * 100 : 0;
  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.totalStock,
    0,
  );

  const lowStockProducts = products.filter(
    (p) => p.availableStock < 10 && p.availableStock > 0,
  );
  const outOfStockProducts = products.filter((p) => p.availableStock === 0);

  const getTimeLeft = (expiresAt: string) => {
    if (!expiresAt) return "No expiry";
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));

    if (timeLeft === 0) return "Expired";

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeLeftColor = (expiresAt: string) => {
    if (!expiresAt) return "text-gray-500";
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));

    if (timeLeft <= 30) return "text-red-600 font-bold";
    if (timeLeft <= 60) return "text-orange-500";
    return "text-green-600";
  };

  const mainStats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Package className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-50",
      link: "/admin/products",
    },
    {
      title: "Active Reservations",
      value: reservationStats.active,
      icon: <Clock className="h-8 w-8 text-green-500" />,
      color: "bg-green-50",
      link: "/admin/reservations",
    },
    {
      title: "Total Users",
      value: "-",
      icon: <Users className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-50",
      link: "/admin/users",
    },
    {
      title: "Inventory Value",
      value: `$${totalValue.toFixed(2)}`,
      icon: <DollarSign className="h-8 w-8 text-yellow-500" />,
      color: "bg-yellow-50",
      link: "/admin/products",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.name || user?.email?.split("@")[0]}!
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Link to={stat.link} key={index}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {productsLoading || loading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Total Reservations</p>
                <p className="text-xl font-bold">{reservationStats.total}</p>
              </div>
              <ShoppingBag className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-green-600">Active</p>
                <p className="text-xl font-bold text-green-700">
                  {reservationStats.active}
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-600">Expired</p>
                <p className="text-xl font-bold text-gray-700">
                  {reservationStats.expired}
                </p>
              </div>
              <AlertCircle className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-red-600">Cancelled</p>
                <p className="text-xl font-bold text-red-700">
                  {reservationStats.cancelled}
                </p>
              </div>
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-600">Completed</p>
                <p className="text-xl font-bold text-blue-700">
                  {reservationStats.completed}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStock} units
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Sold Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {soldStock} units
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Available Stock</p>
              <p className="text-2xl font-bold text-blue-600">
                {availableStock} units
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Sold Percentage</p>
              <p className="text-2xl font-bold text-purple-600">
                {soldPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {soldPercentage.toFixed(1)}% of total inventory sold
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Recent Active Reservations
            </CardTitle>
            <Link to="/admin/reservations">
              <Button variant="ghost" size="sm">
                View All
                <Eye className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : recentReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active reservations
              </div>
            ) : (
              <div className="space-y-4">
                {recentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-sm">
                          {reservation.product?.name || "Unknown Product"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        User:{" "}
                        {reservation.user?.email?.split("@")[0] ||
                          reservation.userId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        <span
                          className={getTimeLeftColor(reservation.expiresAt)}
                        >
                          {getTimeLeft(reservation.expiresAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Qty: {reservation.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockProducts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-yellow-600 mb-2">
                  ⚠️ Low Stock ({lowStockProducts.length})
                </h4>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center text-sm p-2 bg-yellow-50 rounded"
                    >
                      <span>{product.name}</span>
                      <span className="font-semibold text-yellow-700">
                        {product.availableStock} left
                      </span>
                    </div>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <Link to="/admin/products">
                      <Button variant="link" size="sm" className="text-xs">
                        +{lowStockProducts.length - 3} more
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
            {outOfStockProducts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">
                  ❌ Out of Stock ({outOfStockProducts.length})
                </h4>
                <div className="space-y-2">
                  {outOfStockProducts.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center text-sm p-2 bg-red-50 rounded"
                    >
                      <span>{product.name}</span>
                      <span className="font-semibold text-red-700">
                        Sold Out
                      </span>
                    </div>
                  ))}
                  {outOfStockProducts.length > 3 && (
                    <Link to="/admin/products">
                      <Button variant="link" size="sm" className="text-xs">
                        +{outOfStockProducts.length - 3} more
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {lowStockProducts.length === 0 &&
              outOfStockProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>All products have healthy stock levels!</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/products">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
            </Link>
            <Link to="/admin/reservations">
              <Button variant="outline" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                View Reservations
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin/users">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
