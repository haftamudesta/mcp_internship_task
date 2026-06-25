import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { HealthPage } from "./pages/HealthPage";
import { DashboardPage } from "./pages/DashboardPage";
import TermOfServices from "./pages/TermOfServices";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import { ReservationProvider } from "./context/ReservationContext";
import { AdminProducts } from "./pages/AdminProducts";
import { AdminLayout } from "./components/AdminLayout";
import { AdminAnalytics } from "./components/AdminAnalytics";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminUsers } from "./components/AdminUsers";
import { AdminReservations } from "./components/AdminReservations";
import { AdminSettings } from "./components/AdminSettings";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <Router>
        <AuthProvider>
          <ReservationProvider>
            <Routes>
              {/* Main Layout Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="signin" element={<SignInPage />} />
                <Route path="signup" element={<SignUpPage />} />
                <Route path="health" element={<HealthPage />} />
                <Route path="term-of-service" element={<TermOfServices />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="refund-policy" element={<RefundPolicy />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="reservations" element={<AdminReservations />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>
            </Routes>
          </ReservationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
