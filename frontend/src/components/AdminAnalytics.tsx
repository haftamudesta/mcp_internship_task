import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import { apiClient } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  Users,
  BarChart3,
  Download,
  RefreshCw,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
} from "lucide-react";

interface ReservationStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  completed: number;
}

interface ProductStats {
  totalProducts: number;
  totalStock: number;
  availableStock: number;
  soldStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

interface DailyStats {
  date: string;
  reservations: number;
  completed: number;
  revenue: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const AdminAnalytics: React.FC = () => {
  const { isAdmin, isOwner } = useAuth();
  const { products } = useProducts({
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
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");
  const [selectedMetric, setSelectedMetric] = useState<
    "reservations" | "revenue"
  >("reservations");

  const canAccessAnalytics = isAdmin || isOwner;

  useEffect(() => {
    if (canAccessAnalytics) {
      fetchAnalyticsData();
    }
  }, [canAccessAnalytics, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsResponse = await apiClient.get<ApiResponse<ReservationStats>>(
        "/api/admin/reservations/stats",
      );

      if (statsResponse && typeof statsResponse === "object") {
        const responseData = statsResponse as any;
        if (responseData.data) {
          setReservationStats(responseData.data);
        }
      }

      const dailyResponse = await apiClient.get<ApiResponse<DailyStats[]>>(
        `/api/admin/analytics/daily?days=${timeRange}`,
      );

      if (dailyResponse && typeof dailyResponse === "object") {
        const responseData = dailyResponse as any;
        if (responseData.data) {
          setDailyStats(responseData.data);
        }
      }
      console.log("daily analytics:", dailyResponse);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data",
      );
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const productStats: ProductStats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.totalStock, 0),
    availableStock: products.reduce((sum, p) => sum + p.availableStock, 0),
    soldStock: products.reduce(
      (sum, p) => sum + p.totalStock - p.availableStock,
      0,
    ),
    lowStockCount: products.filter(
      (p) => p.availableStock < 10 && p.availableStock > 0,
    ).length,
    outOfStockCount: products.filter((p) => p.availableStock === 0).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.totalStock, 0),
  };

  const getMetricChange = (data: DailyStats[]): number => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    if (selectedMetric === "reservations") {
      return previous.reservations > 0
        ? ((current.reservations - previous.reservations) /
            previous.reservations) *
            100
        : 0;
    } else {
      return previous.revenue > 0
        ? ((current.revenue - previous.revenue) / previous.revenue) * 100
        : 0;
    }
  };

  if (!canAccessAnalytics) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access analytics. Admin or Owner access
          required.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  const metricChange = getMetricChange(dailyStats);
  const isPositive = metricChange > 0;
  const isNegative = metricChange < 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor your business performance and insights
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={timeRange === "7" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("7")}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === "30" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("30")}
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === "90" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("90")}
            >
              90 Days
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">
                  {productStats.totalProducts}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(productStats.totalValue * 0.3).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  Estimated 30% of inventory value
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reservations</p>
                <p className="text-2xl font-bold">{reservationStats.total}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Reservations</p>
                <p className="text-2xl font-bold">{reservationStats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-xl font-bold text-green-600">
              {reservationStats.active}
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Expired</p>
            <p className="text-xl font-bold text-gray-600">
              {reservationStats.expired}
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Cancelled</p>
            <p className="text-xl font-bold text-red-600">
              {reservationStats.cancelled}
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-xl font-bold text-blue-600">
              {reservationStats.completed}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Completion Rate</p>
            <p className="text-xl font-bold text-indigo-600">
              {reservationStats.total > 0
                ? Math.round(
                    (reservationStats.completed / reservationStats.total) * 100,
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trend Overview</CardTitle>
                <CardDescription>
                  {selectedMetric === "reservations"
                    ? "Daily reservation trends"
                    : "Daily revenue trends"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={
                    selectedMetric === "reservations" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedMetric("reservations")}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Reservations
                </Button>
                <Button
                  variant={selectedMetric === "revenue" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric("revenue")}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Revenue
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dailyStats.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No data available for the selected period
              </div>
            ) : (
              <div className="space-y-4">
                {/* Metric Change Indicator */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Change:</span>
                    <span
                      className={`flex items-center gap-1 font-semibold ${isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-600"}`}
                    >
                      {isPositive && <ArrowUp className="h-4 w-4" />}
                      {isNegative && <ArrowDown className="h-4 w-4" />}
                      {!isPositive && !isNegative && (
                        <Minus className="h-4 w-4" />
                      )}
                      {Math.abs(metricChange).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last {dailyStats.length} days
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Day</span>
                    <span>
                      {selectedMetric === "reservations"
                        ? "Reservations"
                        : "Revenue ($)"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dailyStats.slice(-10).map((day, index) => {
                      const maxValue = Math.max(
                        ...dailyStats.map((d) =>
                          selectedMetric === "reservations"
                            ? d.reservations
                            : d.revenue,
                        ),
                      );
                      const value =
                        selectedMetric === "reservations"
                          ? day.reservations
                          : day.revenue;
                      const percentage =
                        maxValue > 0 ? (value / maxValue) * 100 : 0;
                      const barColor =
                        value > 0 ? "bg-indigo-500" : "bg-gray-200";

                      return (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">
                            {new Date(day.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-16 text-right">
                            {selectedMetric === "reservations"
                              ? value
                              : `$${value.toFixed(2)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Inventory Overview
            </CardTitle>
            <CardDescription>Current product inventory status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Total Stock</p>
                <p className="text-lg font-bold">{productStats.totalStock}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Available</p>
                <p className="text-lg font-bold text-blue-600">
                  {productStats.availableStock}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Sold</p>
                <p className="text-lg font-bold text-green-600">
                  {productStats.soldStock}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Inventory Value</p>
                <p className="text-lg font-bold text-purple-600">
                  ${productStats.totalValue.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Stock Health</span>
                <span className="font-medium">
                  {productStats.totalProducts > 0
                    ? Math.round(
                        (productStats.availableStock /
                          productStats.totalStock) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      productStats.totalProducts > 0
                        ? (productStats.availableStock /
                            productStats.totalStock) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {productStats.lowStockCount > 0 && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    {productStats.lowStockCount} product(s) have low stock (
                    {"<"} 10 units)
                  </AlertDescription>
                </Alert>
              )}
              {productStats.outOfStockCount > 0 && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {productStats.outOfStockCount} product(s) are out of stock
                  </AlertDescription>
                </Alert>
              )}
              {productStats.lowStockCount === 0 &&
                productStats.outOfStockCount === 0 && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      All products have healthy stock levels!
                    </AlertDescription>
                  </Alert>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Quick Stats
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Total Users</span>
                </div>
                <span className="font-medium">-</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Reservation Rate</span>
                </div>
                <span className="font-medium">
                  {reservationStats.total > 0
                    ? `${Math.round((reservationStats.active / reservationStats.total) * 100)}%`
                    : "0%"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Expiry Rate</span>
                </div>
                <span className="font-medium">
                  {reservationStats.total > 0
                    ? `${Math.round((reservationStats.expired / reservationStats.total) * 100)}%`
                    : "0%"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Avg. Products per User</span>
                </div>
                <span className="font-medium">-</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Avg. Reservation Time</span>
                </div>
                <span className="font-medium">-</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
        <Button
          onClick={fetchAnalyticsData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};
