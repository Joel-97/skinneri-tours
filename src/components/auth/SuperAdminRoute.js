import { Navigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import Loading from "../../components/general/loading"; 

const SuperAdminRoute = ({ children }) => {
  const { user, isSuperAdmin, loading } = UserAuth();

  if (loading) return <div> <Loading /> </div>;


  if (!user) return <Navigate to="/login" />;

  if (!isSuperAdmin) return <Navigate to="/home" />;

  return children;
};

export default SuperAdminRoute;
