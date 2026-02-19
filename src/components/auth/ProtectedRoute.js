import { Navigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import Loading from "../../components/general/loading"; 

const ProtectedRoute = ({ children }) => {
  const { user, adminData, loading } = UserAuth();

  if (loading) {
    return <div> <Loading /> </div>;
  }

  // No autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Esperar a que adminData esté listo
  if (!adminData) {
    return <div> <Loading /> </div>;
  }

  const status = adminData.status?.trim().toLowerCase();

  // Admin pendiente
  if (status === "pending") {
    return <Navigate to="/pending" replace />;
  }

  // Aprobado pero sin empresa
  if (status === "approved" && !adminData.companyId) {
    return <Navigate to="/pending" replace />;
  }

  // Todo correcto
  if (status === "approved") {
    return children;
  }

  // Cualquier caso extraño → login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
