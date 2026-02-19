import { Navigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import Loading from "../../components/general/loading"; 

const AdminRoute = ({ children }) => {
  const { adminData, loading } = UserAuth();

  if (loading) {
    return <div><Loading /></div>;
  }

  if (!adminData) {
    return <Navigate to="/home" replace />;
  }

  const role = adminData.role?.trim().toLowerCase();

  if (role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
