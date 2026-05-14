import './App.css';

import { Route, Routes, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import SuperAdminRoute from "./components/auth/SuperAdminRoute";
import AdminRoute from "./components/auth/AdminRoute";

import Navbar from "./components/general/navbar";

import Home from "./pages/Home";
import Transport from "./pages/Booking";
import Adventure from "./pages/Adventure";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pending from "./pages/Pending";
import SuperAdmin from "./pages/SuperAdmin";
import ClientsPage from "./pages/clients/ClientsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import DashboardPage from "./pages/analytics/DashboardPage";
import DashboardHome from "./pages/home/DashboardHome";
import Reports from "./pages/Reports";

function AppContent() {

  const location = useLocation();

  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/pending"
  ];

  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname);

  return (

    <>

      {

        !shouldHideNavbar && (
          <Navbar />
        )

      }

      <Routes>

        {/* PUBLICAS */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/pending"
          element={<Pending />}
        />

        {/* HOME */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          }
        />

        {/* TRANSPORT */}

        <Route
          path="/transport"
          element={
            <ProtectedRoute>
              <Transport />
            </ProtectedRoute>
          }
        />

        {/* ADVENTURE */}

        <Route
          path="/adventure"
          element={
            <ProtectedRoute>
              <Adventure />
            </ProtectedRoute>
          }
        />

        {/* CLIENTS */}

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          }
        />

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>

              <AdminRoute>

                <SettingsPage />

              </AdminRoute>

            </ProtectedRoute>
          }
        />

        {/* REPORTS */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* ANALYTICS */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* SUPERADMIN */}

        <Route
          path="/superadmin"
          element={
            <SuperAdminRoute>
              <SuperAdmin />
            </SuperAdminRoute>
          }
        />

      </Routes>

    </>

  );

}

function App() {

  return (

    <AuthProvider>

      <AppContent />

    </AuthProvider>

  );

}

export default App;