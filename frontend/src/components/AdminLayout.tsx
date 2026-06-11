// components/AdminLayout.tsx
import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Package,
  Users,
  Settings,
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  Shield,
  BarChart3,
} from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isOwner, logout } = useAuth();
  const navigate = useNavigate();

  const canAccessAdmin = isAdmin || isOwner;

  if (!canAccessAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the admin area. This area is
            restricted to administrators and owners only.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button onClick={() => navigate("/products")}>
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      allowed: ["ADMIN", "MODERATOR"],
    },
    {
      path: "/admin/products",
      label: "Products",
      icon: <Package className="h-4 w-4" />,
      allowed: ["ADMIN", "MODERATOR"],
    },
    {
      path: "/admin/orders",
      label: "Orders",
      icon: <ShoppingBag className="h-4 w-4" />,
      allowed: ["ADMIN", "MODERATOR"],
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: <Users className="h-4 w-4" />,
      allowed: ["ADMIN"],
    },
    {
      path: "/admin/analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      allowed: ["ADMIN"],
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      allowed: ["ADMIN"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.allowed.includes(user?.role || ""),
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  {isAdmin ? "Administrator" : "Moderator"} Access
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  Role: {user?.role?.toLowerCase()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64 shrink-0">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
