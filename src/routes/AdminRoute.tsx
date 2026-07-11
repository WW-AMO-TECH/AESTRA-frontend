import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminRoute = ({ children }: any) => {
  const { user, loading } = useAuth();

  if (loading)
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // only admin & super admin allowed
  if (user.role !== "admin" && user.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;