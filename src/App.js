import './App.css';
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SuperAdminRoute from "./components/auth/SuperAdminRoute";
import AdminRoute from "./components/auth/AdminRoute";

import Navbar from "./components/general/navbar";

import Home from "./pages/Home";
import Transport from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pending from "./pages/Pending";
import SuperAdmin from "./pages/SuperAdmin";
import ClientsPage from "./pages/clients/ClientsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import DashboardHome from "./pages/home/DashboardHome";

function App() {
  return (
    <AuthProvider>

      <Routes>

        {/* PUBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending" element={<Pending />} />

        {/* PRIVADAS */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                {/* <Home /> */}
                <DashboardHome />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                {/* <Home /> */}
                <DashboardHome />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transport"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Transport />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ClientsPage />
              </>
            </ProtectedRoute>
          }
        />

        {/* 🔥 SETTINGS - (SOLO ADMIN) */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <>
                  <Navbar />
                  <SettingsPage />
                </>
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin"
          element={
            <SuperAdminRoute>
              <>
                <Navbar />
                <SuperAdmin />
              </>
            </SuperAdminRoute>
          }
        />

      </Routes>
    </AuthProvider>
  );
}

export default App;
