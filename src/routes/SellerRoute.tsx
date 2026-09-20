import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const SellerRoute = ({ children }: any) => {
  const { user, loading } = useAuth();

  if (loading)
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );

  if (!user) {
    return <Navigate to="/seller/login" replace />;
  }

  // only seller & super admin allowed
  if (user.role !== "seller" && user.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SellerRoute;