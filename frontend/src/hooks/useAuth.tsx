import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import apiClient from "../services/api";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "OWNER";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isUser: boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    const token = apiClient.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await apiClient.getProfile();

      const userWithRole = {
        ...profile,
        role: profile.role || "USER",
      };
      setUser(userWithRole);
    } catch (err) {
      apiClient.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    try {
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.token);
      const userWithRole = {
        ...response.user,
        role: response.user.role || "USER",
      };
      setUser(userWithRole);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  };

  const register = async (
    email: string,
    password: string,
    name?: string,
  ): Promise<void> => {
    setError(null);
    try {
      const response = await apiClient.register(email, password, name);
      apiClient.setToken(response.token);
      const userWithRole = {
        ...response.user,
        role: response.user.role || "USER",
      };
      setUser(userWithRole);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    }
  };

  const logout = (): void => {
    apiClient.clearToken();
    setUser(null);
    setError(null);
  };

  // Helper function to check if user has specific role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;

    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.role === "OWNER";
  const isUser = user?.role === "USER";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        isOwner,
        isUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
