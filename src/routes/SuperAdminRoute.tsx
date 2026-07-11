import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const SuperAdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  // IMPORTANT: WAIT FOR AUTH CHECK
  if (loading) {
    return <div>Loading...</div>;
  }

  // NOT LOGGED IN
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // NORMAL ADMIN
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ONLY SUPER ADMIN ALLOWED
  if (user.role !== "super_admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default SuperAdminRoute;