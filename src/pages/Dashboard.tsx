import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { User, Heart, Package, FileText, MapPin, Settings, LogOut, Loader2 } from "lucide-react";
import axios from "@/api/axios";

import { formatPrice } from "@/lib/utils";

type TabKey =
  | "profile"
  | "wishlist"
  | "orders"
  | "tracking"
  | "receipts"
  | "settings";


const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>(
    location.state?.tab || "profile"
  );
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const { addToCart } = useAuth();

  const TAB_CONFIG = [
    { id: "profile", label: "Profile", icon: User },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "orders", label: "Orders", icon: Package },
    { id: "tracking", label: "Tracking", icon: MapPin },
    { id: "receipts", label: "Receipts", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;
  
  const getTabBadge = (tabId: string) => {
    switch (tabId) {
      case "orders":
        return orders.length;

      case "wishlist":
        return wishlist.length;

      default:
        return 0;
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const fetchWishlist = async () => {
    try {
      setLoadingWishlist(true);

      const response = await axios.get("/wishlist");

      const data = response?.data;

      const normalizedWishlist = Array.isArray(data)
        ? data
        : data?.wishlist ?? [];

      setWishlist(normalizedWishlist);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoadingWishlist(false);
    }
  };
  
  const removeFromWishlist = async (productId: number) => {
    try {
      setLoadingWishlist(true);

      const response = await axios.delete(`/wishlist/${productId}`);

      const data = response?.data;

      toast.success(data?.message || "Removed from wishlist");

      // Update UI state after successful deletion
      setWishlist((prev) =>
        prev.filter((item) => item.product_id !== productId)
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove from wishlist");
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      const response = await axios.get("/orders");

      const data = response?.data;

      const normalizedOrders = Array.isArray(data)
        ? data
        : data?.orders ?? [];

      setOrders(normalizedOrders);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderStatus = (status: string) => {
    const map: Record<string, string> = {
      processing: "bg-gray-300 text-gray-500",
      pending: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
          map[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  const renderTabs = () => (
    <div className="glass-card p-3 flex md:flex-col gap-2 overflow-x-auto">
      {TAB_CONFIG.map((t) => {
        const Icon = t.icon;
        const Label = t.label;
        const badge = getTabBadge(t.id);
        return (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id as TabKey);
              setSelectedReceipt(null);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
              activeTab === t.id
                ? "bg-primary text-white"
                : "hover:bg-secondary text-muted-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {Label}
            {typeof badge === "number" && badge > 0 && (
              <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.25 rounded-2xl">
                {badge}
              </span>
            )}
          </button>
        );
      })}

      <button
        onClick={logout}
        className="flex items-center gap-2 px-2 py-2 text-red-500 text-sm hover:bg-red-50 rounded-lg"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );

  const renderProfile = () => (
    <div className="glass-card p-3 space-y-4">
      <h2 className="text-xl font-bold">Profile</h2>

      {/* NAME SECTION */}
      <div className="border rounded-xl p-4 flex flex-col gap-3">
        <div className="text-xs text-muted-foreground">Full Name</div>

        {editingName ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="input flex-1"
              placeholder="Enter your name"
            />

            <button className="btn-primary w-full sm:w-auto">
              Save
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-sm font-semibold">
              {user.name}
            </div>

            <button
              onClick={() => {
                setNameInput(user.name);
                setEditingName(true);
              }}
              className="btn w-full sm:w-auto"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* EMAIL SECTION */}
      <div className="border rounded-xl p-4 flex flex-col gap-2">
        <div className="text-xs text-muted-foreground">Email Address</div>

        <div className="text-sm font-semibold">
          {user.email}
        </div>
      </div>

      {/* OPTIONAL INFO BLOCK (matches order-style separation) */}
      <div className="border rounded-xl p-4 flex justify-between items-center">
        <div>
          <div className="text-xs text-muted-foreground">
            Account Status
          </div>
          <div className="text-sm font-semibold">
            Active
          </div>
        </div>

        <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
          Verified
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="glass-card p-3">

      {loadingOrders ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-xl p-4 flex flex-col gap-4"
            >
              <div className="flex justify-between text-sm font-semibold">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="text-black">{order.order_number || order.id}</p>
                  <p className="text-black">Ref: {order.reference}</p>
                  <p>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <div className="space-y-2 mt-4">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 mt-3"
                    >
                      <img
                        src={`http://127.0.0.1:8000${
                          item.product?.images?.[0]?.image_url
                        }`}
                        alt={item.product?.name}
                        className="w-6 h-6 rounded object-cover"
                      />

                      <span className="truncate">
                        {item.product?.name} x {item.quantity}
                      </span>
                    </div>
                  ))}
                  </div>
                </div>

                <div>
                  <p>{renderStatus(order.fulfillment)}</p>
                  <p>{renderStatus(order.payment_method)}</p>
                  <p>{renderStatus(order.status)}</p>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-border text-sm font-semibold">
                <span>Total</span><span>{formatPrice(order.total_price || order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div className="glass-card p-3">
      {loadingWishlist ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No wishlist items found.
        </div>
      ) : (
        <div className="space-y-4">
          {wishlist.map((item: any) => (
            <div
              key={item.id}
              className="border rounded-xl p-4 flex flex-col gap-4"
            >
              <div className="flex justify-between text-sm font-semibold">
                
                {/* Left side: product info */}
                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={`http://127.0.0.1:8000${
                        item.product?.images?.[0]?.image_url
                      }`}
                      alt={item.product?.name}
                      className="w-10 h-10 rounded object-cover"
                    />

                    <p className="text-black truncate">
                      {item.product?.name}
                    </p>
                  </div>

                  <p className="text-black font-semibold">
                    {formatPrice(item.product?.price)}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Added on{" "}
                    {new Date(item.created_at).toLocaleDateString(
                      "en-NG",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>

                {/* Right side: actions */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="text-red-500 text-xs font-semibold hover:underline"
                  >
                    Remove
                  </button>

                  <button
                    onClick={() => addToCart(item.product)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTracking = () => (
    <div className="glass-card p-5">
      <h2 className="text-xl font-bold mb-3">Tracking</h2>
    </div>
  );

  const renderReceipts = () => (
    <div className="glass-card p-5">
      <h2 className="text-xl font-bold mb-3">Receipts</h2>
    </div>
  );

  const renderSettings = () => (
    <div className="glass-card p-5 space-y-4">
      <h2 className="text-xl font-bold">Settings</h2>

      <div className="flex justify-between">
        <span>Email notifications</span>
        <input type="checkbox" defaultChecked />
      </div>

      <div className="flex justify-between">
        <span>SMS notifications</span>
        <input type="checkbox" />
      </div>
    </div>
  );

  const renderContent = () => {
    if (selectedReceipt) {
      return (
        <div className="glass-card p-5">
          <button
            onClick={() => setSelectedReceipt(null)}
            className="text-sm text-primary mb-3"
          >
            ← Back
          </button>

          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(selectedReceipt, null, 2)}
          </pre>
        </div>
      );
    }

    switch (activeTab) {
      case "profile":
        return renderProfile();
      case "wishlist":
        return renderWishlist();
      case "orders":
        return renderOrders();
      case "tracking":
        return renderTracking();
      case "receipts":
        return renderReceipts();
      case "settings":
        return renderSettings();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <aside className="md:w-64">{renderTabs()}</aside>
          <main className="flex-1">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;