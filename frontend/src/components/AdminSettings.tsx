import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription } from "./ui/alert";
import {
  User,
  Mail,
  Bell,
  Moon,
  Sun,
  Globe,
  Database,
  RefreshCw,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Key,
  Palette,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../services/api";

interface Settings {
  name: string;
  email: string;
  reservationAlerts: boolean;
  stockAlerts: boolean;

  theme: "light" | "dark" | "system";
  compactMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export const AdminSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>({
    name: user?.name || "",
    email: user?.email || "",
    reservationAlerts: true,
    stockAlerts: true,
    theme: "light",
    compactMode: false,
    autoRefresh: true,
    refreshInterval: 30,
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      localStorage.setItem("adminSettings", JSON.stringify(settings));

      if (settings.name !== user?.name) {
        await apiClient.updateProfile(settings.name);
        if (updateUser) {
          updateUser({ ...user, name: settings.name });
        }
      }

      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.updateProfile(newName);
      if (updateUser) {
        updateUser({ ...user, name: newName });
      }
      setSettings((prev) => ({ ...prev, name: newName }));
      setIsEditingName(false);
      setSuccess("Name updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setSuccess("Password change feature coming soon!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setSettings((prev) => ({ ...prev, theme }));
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">
          Manage your profile, preferences, and application settings
        </p>
      </div>
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Profile Settings
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex gap-2">
                {isEditingName ? (
                  <>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleUpdateName}
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(settings.name);
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      id="name"
                      value={settings.name || "Not set"}
                      disabled
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingName(true)}
                      size="sm"
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  value={settings.email}
                  disabled
                  className="flex-1"
                />
                <Button variant="outline" size="sm" disabled>
                  Verified
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleChangePassword}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Change Password
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reservationAlerts" className="font-medium">
                Reservation Alerts
              </Label>
              <p className="text-sm text-gray-500">
                Get notified about new reservations
              </p>
            </div>
            <Switch
              id="reservationAlerts"
              checked={settings.reservationAlerts}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, reservationAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="stockAlerts" className="font-medium">
                Stock Alerts
              </Label>
              <p className="text-sm text-gray-500">
                Get notified about low stock products
              </p>
            </div>
            <Switch
              id="stockAlerts"
              checked={settings.stockAlerts}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, stockAlerts: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-indigo-600" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={settings.theme === "light" ? "default" : "outline"}
                onClick={() => handleThemeChange("light")}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={settings.theme === "dark" ? "default" : "outline"}
                onClick={() => handleThemeChange("dark")}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={settings.theme === "system" ? "default" : "outline"}
                onClick={() => handleThemeChange("system")}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compactMode" className="font-medium">
                Compact Mode
              </Label>
              <p className="text-sm text-gray-500">Use a more compact layout</p>
            </div>
            <Switch
              id="compactMode"
              checked={settings.compactMode}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, compactMode: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure application behavior and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoRefresh" className="font-medium">
                Auto Refresh
              </Label>
              <p className="text-sm text-gray-500">
                Automatically refresh data every {settings.refreshInterval}{" "}
                seconds
              </p>
            </div>
            <Switch
              id="autoRefresh"
              checked={settings.autoRefresh}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, autoRefresh: checked }))
              }
            />
          </div>

          {settings.autoRefresh && (
            <div className="space-y-2">
              <Label htmlFor="refreshInterval">
                Refresh Interval (seconds)
              </Label>
              <Input
                id="refreshInterval"
                type="number"
                min="10"
                max="120"
                value={settings.refreshInterval}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    refreshInterval: parseInt(e.target.value) || 30,
                  }))
                }
                className="w-32"
              />
              <p className="text-xs text-gray-500">
                Minimum: 10 seconds, Maximum: 120 seconds
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">User Role:</span>{" "}
              <span className="font-medium">{user?.role}</span>
            </div>
            <div>
              <span className="text-gray-500">User ID:</span>{" "}
              <span className="font-mono text-xs">{user?.id}</span>
            </div>
            <div>
              <span className="text-gray-500">App Version:</span>{" "}
              <span className="font-medium">1.0.0</span>
            </div>
            <div>
              <span className="text-gray-500">Environment:</span>{" "}
              <span className="font-medium">
                {import.meta.env.MODE || "development"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
