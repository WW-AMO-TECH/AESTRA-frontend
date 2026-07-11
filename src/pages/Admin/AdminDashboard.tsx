import { Navigate } from "react-router-dom";
import type { Product } from "@/data/products";
import { Package, ShoppingCart, Users, Star, BarChart3, Settings, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Admin/Sidebar";
import { useState } from "react";

const sidebarItems = [
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "tracking", label: "Tracking", icon: MapPin },
  { id: "users", label: "Users", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const dateFilters = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "All Time", value: "all" },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const encouragingMessages = [
  "Let's make today productive! 🚀",
  "Great things are happening! ✨",
  "Keep up the amazing work! 💪",
  "Ready to crush it today! 🔥",
  "Your team is counting on you! ⭐",
];

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar user={user} />

      <div className="flex-1 pt-20 lg:pt-6 p-4">
        {!user ? (
          <Navigate to="/admin/login" replace />
        ) : (
          <div className="container mx-auto p-1">
            <h1 className="font-bold text-3xl mb-2">
              {getGreeting()}, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              {encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-lg font-bold">1,234</p>
                  <p className="text-muted-foreground text-sm">Total Users</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

};

export default AdminDashboard;