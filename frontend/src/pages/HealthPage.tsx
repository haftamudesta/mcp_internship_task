import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Activity,
  Database,
  Server,
  Clock,
} from "lucide-react";
import apiClient from "../services/api";

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: string;
}

export const HealthPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async (): Promise<void> => {
    try {
      const data = await apiClient.get<HealthStatus>("/health");
      setHealth(data);
      setError(null);
    } catch (err) {
      console.error("Health check error:", err);
      setError("Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusItems = [
    {
      label: "API Status",
      value: health?.status || "unknown",
      isGood: health?.status === "healthy",
      icon: Server,
    },
    {
      label: "Database",
      value: health?.database || "unknown",
      isGood: health?.database === "connected",
      icon: Database,
    },
    {
      label: "Environment",
      value: health?.environment || "unknown",
      isGood: true,
      icon: Activity,
    },
    {
      label: "Up Time",
      value: health?.uptime
        ? `${Math.floor(health.uptime / 60)} minutes`
        : "unknown",
      isGood: true,
      icon: Clock,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-sky-400">System Health</h1>
        <p className="text-gray-600 mt-2 font-bold text-3xl">
          Monitor the status of my services
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-emerald-300 rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-6 w-6 text-gray-400" />
                {item.isGood ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-500">
                {item.label}
              </h3>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-linear-to-r from-green-400 via-green-100 to-pink-600 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          System Information
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Last Checked:</span>
            <span className="text-gray-900">
              {health?.timestamp
                ? new Date(health.timestamp).toLocaleString()
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Reservation Expiration:</span>
            <span className="text-gray-900">5 minutes</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Auto-refresh Rate:</span>
            <span className="text-gray-900">5 seconds (products)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
