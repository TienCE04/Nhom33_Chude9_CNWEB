import { Navigate } from "react-router-dom";
import { authApi } from "@/lib/api";

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = authApi.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;
