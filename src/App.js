import "./App.css";

import {
  Route,
  Routes,
  useLocation
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

import PublicRoute from "./components/auth/PublicRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ModuleRoute from "./components/auth/ModuleRoute";
import AdminRoute from "./components/auth/AdminRoute";
import SuperAdminRoute from "./components/auth/SuperAdminRoute";

import Navbar from "./components/general/navbar";

import Home from "./pages/Home";
import Transport from "./pages/Booking";
import Adventure from "./pages/Adventure";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SuperAdminPage from "./pages/superAdmin/SuperAdminPage";
import Clients from "./pages/Clients";
import SettingsPage from "./pages/settings/SettingsPage";
import DashboardPage from "./pages/analytics/DashboardPage";
import DashboardHome from "./pages/home/DashboardHome";
import Reports from "./pages/Reports";
import ActionHandlerPage from "./pages/platform/auth/ActionHandlerPage";

function AppContent() {

  const location = useLocation();

  /*
  ==========================================================
  HIDDEN NAVBAR ROUTES
  ==========================================================
  */

  const hideNavbarRoutes = [

    "/login",

    "/register",

    "/auth/action"

  ];

  const shouldHideNavbar =

    hideNavbarRoutes.includes(

      location.pathname

    );

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <>

      {

        !shouldHideNavbar && (

          <Navbar />

        )

      }

      <Routes>

        {/* ==================================================
            PUBLIC
        ================================================== */}

        <Route

          path="/login"

          element={

            <PublicRoute>

              <Login />

            </PublicRoute>

          }

        />

        <Route

          path="/register"

          element={

            <PublicRoute>

              <Register />

            </PublicRoute>

          }

        />

        <Route

          path="/auth/action"

          element={

            <ActionHandlerPage />

          }

        />

        {/* ==================================================
            HOME
        ================================================== */}

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

        {/* ==================================================
            TRANSPORT
        ================================================== */}

        <Route

          path="/transport"

          element={

            <ProtectedRoute>

              <ModuleRoute

                module="transportation"

              >

                <Transport />

              </ModuleRoute>

            </ProtectedRoute>

          }

        />

        {/* ==================================================
            ADVENTURE
        ================================================== */}

        <Route

          path="/adventure"

          element={

            <ProtectedRoute>

              <ModuleRoute

                module="adventure"

              >

                <Adventure />

              </ModuleRoute>

            </ProtectedRoute>

          }

        />

        {/* ==================================================
            CLIENTS
        ================================================== */}

        <Route

          path="/clients"

          element={

            <ProtectedRoute>

              <Clients />

            </ProtectedRoute>

          }

        />

        {/* ==================================================
            SETTINGS
        ================================================== */}

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

        {/* ==================================================
            REPORTS
        ================================================== */}

        <Route

          path="/reports"

          element={

            <ProtectedRoute>

              <Reports />

            </ProtectedRoute>

          }

        />

        {/* ==================================================
            ANALYTICS
        ================================================== */}

        <Route

          path="/analytics"

          element={

            <ProtectedRoute>

              <DashboardPage />

            </ProtectedRoute>

          }

        />

        {/* ==================================================
            SUPER ADMIN
        ================================================== */}

        <Route

          path="/superadmin"

          element={

            <ProtectedRoute>

              <SuperAdminRoute>

                <SuperAdminPage />

              </SuperAdminRoute>

            </ProtectedRoute>

          }

        />

      </Routes>

    </>

  );

}

/*
==========================================================
APP
==========================================================
*/

function App() {

  return (

    <AuthProvider>

      <LanguageProvider>

        <AppContent />

      </LanguageProvider>

    </AuthProvider>

  );

}

export default App;