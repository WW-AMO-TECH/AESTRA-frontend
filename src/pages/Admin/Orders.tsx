import { useEffect, useState } from "react";
import axios from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Eye, Pencil, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import Sidebar from "@/components/Admin/Sidebar";

const AdminOrders = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [editOrderStatus, setEditOrderStatus] = useState<any | null>(null);

  const [orderDateFilter, setOrderDateFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const dateFilters = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7days" },
    { label: "30 Days", value: "30days" },
  ];

  useEffect(() => {
    filterOrders();
  }, [orders, orderStatusFilter, orderDateFilter]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/admin/orders");

      console.log("Orders Response:", res.data);

      const data = res.data;

      const normalizedOrders = Array.isArray(data)
        ? data
        : data.orders || data.data || [];

      setOrders(normalizedOrders);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };
  
  const filterOrders = () => {
    let data = [...orders];

    // Status filter
    if (orderStatusFilter !== "all") {
      data = data.filter(
        (o) => o.status === orderStatusFilter
      );
    }

    // Date filter
    const now = new Date();

    if (orderDateFilter === "today") {
      data = data.filter((o) => {
        const orderDate = new Date(o.created_at);

        return (
          orderDate.toDateString() ===
          now.toDateString()
        );
      });
    }

    if (orderDateFilter === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      data = data.filter(
        (o) => new Date(o.created_at) >= sevenDaysAgo
      );
    }

    if (orderDateFilter === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      data = data.filter(
        (o) => new Date(o.created_at) >= thirtyDaysAgo
      );
    }

    setFilteredOrders(data);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`/admin/orders/${id}/status`, { status });
      toast.success("Order updated");
      fetchOrders();
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      await axios.delete(`/admin/orders/${id}`);
      toast.success("Order deleted");
      fetchOrders();
    } catch {
      toast.error("Delete failed");
    }
  };

  const statusBadge = (status: string) => {
    const map: any = {
      pending: "bg-amber-100 text-amber-800",
      shipped: "bg-primary/10 text-primary",
      delivered: "bg-emerald-100 text-emerald-800",
      picked_up: "bg-secondary text-foreground",
      cancelled: "bg-destructive/10 text-destructive",
    };

    return (
      <span className={`px-2 py-1 text-[10px] rounded-full font-semibold ${map[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar user={user} />

      {/* MAIN */}
      <div className="flex-1 p-4 space-y-4">

        {/* FILTERS */}
        {tab === "orders" && !viewOrder && (
          <div className="space-y-4">

            <div className="flex flex-wrap gap-2">
              <select
                value={orderDateFilter}
                onChange={e => setOrderDateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border bg-background text-xs"
              >
                {dateFilters.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border bg-background text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="picked_up">Picked Up</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Processing", count: filteredOrders.filter(o => o.status === "processing").length, color: "bg-blue-100 text-blue-800" },
                { label: "Pending", count: filteredOrders.filter(o => o.status === "pending").length, color: "bg-amber-100 text-amber-800" },
                { label: "Shipped", count: filteredOrders.filter(o => o.status === "shipped").length, color: "bg-primary/10 text-primary" },
                { label: "Delivered", count: filteredOrders.filter(o => o.status === "delivered").length, color: "bg-emerald-100 text-emerald-800" },
                { label: "Picked Up", count: filteredOrders.filter(o => o.status === "picked_up").length, color: "bg-secondary text-foreground" },
                { label: "Cancelled", count: filteredOrders.filter(o => o.status === "cancelled").length, color: "bg-destructive/10 text-destructive" },
              ].map(s => (
                <div key={s.label} className="glass-card p-3 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.color}`}>
                    {s.label}
                  </span>
                  <p className="text-xl font-bold mt-1">{s.count}</p>
                </div>
              ))}
            </div>

            {/* TABLE */}
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left">Order ID</th>
                    <th className="p-3 md:table-cell text-left">Customer</th>
                    <th className="p-3 md:table-cell text-left">Email</th>
                    <th className="p-3 text-left">Fulfillment</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Total</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center p-8 text-muted-foreground"
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border hover:bg-secondary/30"
                      >
                        <td className="p-3">
                          <div className="font-semibold">
                            {order.order_number}
                          </div>

                          <div className="text-[10px] text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </td>

                        <td className="p-3 md:table-cell">
                          {order.full_name}
                        </td>

                        <td className="p-3 md:table-cell">
                          {order.user?.email}
                        </td>

                        <td className="p-3 capitalize">
                          {order.fulfillment}
                        </td>

                        <td className="p-3">
                          {editOrderStatus?.id === order.id ? (
                            <select
                              value={editOrderStatus.status}
                              onChange={(e) =>
                                setEditOrderStatus({
                                  ...editOrderStatus,
                                  status: e.target.value,
                                })
                              }
                              className="border rounded-lg px-2 py-1 text-xs"
                            >

                              <option value="pending">
                                Pending
                              </option>

                              <option value="processing">
                                Processing
                              </option>

                              <option value="shipped">
                                Shipped
                              </option>

                              <option value="delivered">
                                Delivered
                              </option>
                              
                              <option value="ready_for_pickup">
                                Ready for Pickup
                              </option>

                              <option value="picked_up">
                                Picked Up
                              </option>

                              <option value="delivered">
                                Completed
                              </option>

                              <option value="cancelled">
                                Cancelled
                              </option>
                            </select>
                          ) : (
                            statusBadge(order.status)
                          )}
                        </td>

                        <td className="p-3 font-semibold">
                          {formatPrice(
                            order.total_price || order.total
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setViewOrder(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {editOrderStatus?.id === order.id ? (
                              <button
                                onClick={async () => {
                                  await updateOrderStatus(
                                    order.id,
                                    editOrderStatus.status
                                  );

                                  setEditOrderStatus(null);
                                }}
                              >
                                <Save className="w-4 h-4 text-green-600" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditOrderStatus({
                                    id: order.id,
                                    status: order.status,
                                  })
                                }
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() =>
                                deleteOrder(order.id)
                              }
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW ORDER */}
        {tab === "orders" && viewOrder && (
          <div className="space-y-4">

            <div className="glass-card p-5 space-y-4">

              <div className="flex justify-between">
                <h2 className="font-bold">Order {viewOrder.id}</h2>
                {statusBadge(viewOrder.status)}
              </div>

              {/* TRACKING */}
              <div className="space-y-2">
                {["pending", "shipped", "picked", "delivered"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs capitalize">{step}</span>
                  </div>
                ))}
              </div>

              {/* ITEMS */}
              <div className="space-y-2">
                {viewOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <img
                      src={`http://127.0.0.1:8000${item.product?.images?.[0]?.image_url}`}
                      className="w-8 h-8 rounded"
                    />
                    <span>{item.product?.name} x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="font-bold flex justify-between border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(viewOrder.total)}</span>
              </div>

            </div>

            <button onClick={() => setViewOrder(null)} className="text-primary text-xs">
              ← Back
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrders;