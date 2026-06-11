import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Package, ShoppingBag, DollarSign } from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { products, loading } = useProducts({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
    autoRefresh: true,
  });

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0);
  const availableStock = products.reduce((sum, p) => sum + p.availableStock, 0);
  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.totalStock,
    0,
  );

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Package className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Total Stock",
      value: totalStock,
      icon: <ShoppingBag className="h-8 w-8 text-green-500" />,
      color: "bg-green-50",
    },
    {
      title: "Available Stock",
      value: availableStock,
      icon: <Package className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-50",
    },
    {
      title: "Inventory Value",
      value: `$${totalValue.toFixed(2)}`,
      icon: <DollarSign className="h-8 w-8 text-yellow-500" />,
      color: "bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.name || user?.email}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/products"
              className="block p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <h3 className="font-semibold text-indigo-900">Manage Products</h3>
              <p className="text-sm text-indigo-700 mt-1">
                Add, edit, or remove products from your catalog
              </p>
            </a>
            {isAdmin && (
              <a
                href="/admin/users"
                className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="font-semibold text-green-900">Manage Users</h3>
                <p className="text-sm text-green-700 mt-1">
                  View and manage user accounts and permissions
                </p>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
