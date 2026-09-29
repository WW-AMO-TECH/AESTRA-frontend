import { useEffect, useMemo, useState } from "react";
import axios from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  Eye,
  Pencil,
  Trash2,
  Save,
  Search,
  ShoppingBag,
  Clock3,
  Truck,
  CheckCircle2,
  PackageCheck,
  Ban,
  CalendarDays,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import Sidebar from "@/components/SuperAdmin/Sidebar";

type Status =
  | "all"
  | "processing"
  | "pending"
  | "shipped"
  | "delivered"
  | "ready_for_pickup"
  | "picked_up"
  | "cancelled";

interface Order {
  id: number;
  order_number?: string;

  reference_number?: string;
  reference?: string;
  payment_reference?: string;
  transaction_reference?: string;
  order_reference?: string;

  full_name?: string;
  fulfillment?: string;
  status: string;

  total_price?: number;
  total?: number;
  subtotal?: number;

  transaction_fee?: number;

  paystack_fee?: number;
  payment_fee?: number;
  gateway_fee?: number;

  transfer_fee?: number;
  bank_transfer_fee?: number;

  fees?: {
    paystack?: number;
    transfer?: number;
  };

  created_at: string;

  user?: {
    email?: string;
    name?: string;
  };

  items?: any[];

  shipping_address?: any;

  payment_method?: string;

  pickup_location?: any;
  pickup_location_name?: string;
  pickup_location_id?: number | string;
}

interface PriceRowProps {
  label: string;
  value: string;
}

const PriceRow = ({
  label,
  value,
}: PriceRowProps) => {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="font-medium">
        {value}
      </span>
    </div>
  );
};

const Orders = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<Status>("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [viewOrder, setViewOrder] =
    useState<Order | null>(null);

  const [editOrderStatus, setEditOrderStatus] = useState<{
    id: number;
    status: string;
  } | null>(null);

  /* =====================================================
     FETCH ORDERS
  ===================================================== */

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/superadmin/orders");

      const data = res.data;

      const normalizedOrders = Array.isArray(data)
        ? data
        : data?.orders || data?.data || [];

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

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =====================================================
     FILTER ORDERS
  ===================================================== */

  const filteredOrders = useMemo(() => {
    let data = [...orders];

    const value = search.toLowerCase().trim();

    if (value) {
      data = data.filter((order) => {
        return (
          order.order_number
            ?.toLowerCase()
            .includes(value) ||
          order.reference_number
            ?.toLowerCase()
            .includes(value) ||
          order.reference
            ?.toLowerCase()
            .includes(value) ||
          order.payment_reference
            ?.toLowerCase()
            .includes(value) ||
          order.transaction_reference
            ?.toLowerCase()
            .includes(value) ||
          order.order_reference
            ?.toLowerCase()
            .includes(value) ||
          order.full_name
            ?.toLowerCase()
            .includes(value) ||
          order.user?.email
            ?.toLowerCase()
            .includes(value) ||
          order.status
            ?.toLowerCase()
            .includes(value)
        );
      });
    }

    if (statusFilter !== "all") {
      data = data.filter(
        (order) => order.status === statusFilter
      );
    }

    const now = new Date();

    if (dateFilter === "today") {
      data = data.filter((order) => {
        const orderDate = new Date(
          order.created_at
        );

        return (
          orderDate.toDateString() ===
          now.toDateString()
        );
      });
    }

    if (dateFilter === "7days") {
      const sevenDaysAgo = new Date();

      sevenDaysAgo.setDate(
        now.getDate() - 7
      );

      data = data.filter(
        (order) =>
          new Date(order.created_at) >=
          sevenDaysAgo
      );
    }

    if (dateFilter === "30days") {
      const thirtyDaysAgo = new Date();

      thirtyDaysAgo.setDate(
        now.getDate() - 30
      );

      data = data.filter(
        (order) =>
          new Date(order.created_at) >=
          thirtyDaysAgo
      );
    }

    return data;
  }, [
    orders,
    search,
    statusFilter,
    dateFilter,
    ]);

    const totalPages = Math.ceil(
    filteredOrders.length / ordersPerPage
  );

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(
      startIndex,
      startIndex + ordersPerPage
    );
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(
    () => [
      {
        value: "all" as Status,
        label: "All Orders",
        count: orders.length,
        icon: (
          <ShoppingBag className="w-3 h-3 sm:w-5 sm:h-5" />
        ),
        color: "bg-primary/10 text-primary",
      },

      {
        value: "processing" as Status,
        label: "Processing",
        count: orders.filter(
          (order) =>
            order.status === "processing"
        ).length,
        icon: (
          <Clock3 className="w-3 h-3 sm:w-5 sm:h-5" />
        ),
        color: "bg-blue-100 text-blue-800",
      },

      {
        value: "pending" as Status,
        label: "Pending",
        count: orders.filter(
          (order) =>
            order.status === "pending"
        ).length,
        icon: (
          <Clock3 className="w-3 h-3 sm:w-5 sm:h-5" />
        ),
        color: "bg-amber-100 text-amber-800",
      },

      {
        value: "shipped" as Status,
        label: "Shipped",
        count: orders.filter(
          (order) =>
            order.status === "shipped"
        ).length,
        icon: (
          <Truck className="w-3 h-3 sm:w-5 sm:h-5" />
        ),
        color: "bg-primary/10 text-primary",
      },

      {
        value: "ready_for_pickup" as Status,
        label: "Ready for Pickup",
        count: orders.filter(
          (order) =>
            order.status ===
            "ready_for_pickup"
        ).length,
        icon: (
          <PackageCheck className="w-3 h-3 sm:w-5 sm:h-5" />
        ),
        color: "bg-violet-100 text-violet-800",
      },

      {
        value: "picked_up" as Status,
        label: "Picked Up",
        count: orders.filter(
          (order) =>
            order.status === "picked_up"
        ).length,
        icon: (
          <PackageCheck className="w-3 h-3 sm:w-5 sm:h-5" />
        ),
        color:
          "bg-secondary text-foreground",
      },

      {
        value: "delivered" as Status,
        label: "Delivered",
        count: orders.filter(
          (order) =>
            order.status === "delivered"
        ).length,
        icon: (
          <CheckCircle2 className="w-3 h-3 sm:w-5 sm:h-5" />
        ),
        color:
          "bg-emerald-100 text-emerald-800",
      },

      {
        value: "cancelled" as Status,
        label: "Cancelled",
        count: orders.filter(
          (order) =>
            order.status === "cancelled"
        ).length,
        icon: (
          <Ban className="w-3 h-3 sm:w-5 sm:h-5" />
        ),
        color:
          "bg-destructive/10 text-destructive",
      },
    ],
    [orders]
  );

  /* =====================================================
     STATUS BADGE
  ===================================================== */

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      processing:
        "bg-blue-100 text-blue-800",

      pending:
        "bg-amber-100 text-amber-800",

      shipped:
        "bg-primary/10 text-primary",

      delivered:
        "bg-emerald-100 text-emerald-800",

      ready_for_pickup:
        "bg-violet-100 text-violet-800",

      picked_up:
        "bg-secondary text-foreground",

      cancelled:
        "bg-destructive/10 text-destructive",
    };

    const label = status.replace(
      /_/g,
      " "
    );

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${
          map[status] ||
          "bg-secondary text-muted-foreground"
        }`}
      >
        {label}
      </span>
    );
  };

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  const updateOrderStatus = async (
    id: number,
    status: string
  ) => {
    try {
      await axios.patch(
        `/superadmin/orders/${id}/status`,
        { status }
      );

      toast.success(
        "Order updated successfully"
      );

      setEditOrderStatus(null);

      fetchOrders();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update order"
      );
    }
  };

  /* =====================================================
     DELETE ORDER
  ===================================================== */

  const deleteOrder = async (id: number) => {
    try {
      await axios.delete(
        `/superadmin/orders/${id}`
      );

      toast.success(
        "Order deleted successfully"
      );

      fetchOrders();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete order"
      );
    }
  };

  /* =====================================================
     ORDER HELPERS
  ===================================================== */

  const getOrderTotal = (order: Order) => {
    return Number(
      order.total_price ??
        order.total ??
        0
    );
  };

  const getOrderSubtotal = (
    order: Order
  ) => {
    if (
      order.subtotal !== undefined &&
      order.subtotal !== null
    ) {
      return Number(order.subtotal);
    }

    if (order.items?.length) {
      return order.items.reduce(
        (
          sum: number,
          item: any
        ) => {
          const lineTotal =
            item.line_total ??
            item.total;

          if (
            lineTotal !== undefined &&
            lineTotal !== null
          ) {
            return (
              sum + Number(lineTotal)
            );
          }

          const price = Number(
            item.price ??
              item.unit_price ??
              0
          );

          const quantity = Number(
            item.quantity ?? 1
          );

          return (
            sum + price * quantity
          );
        },
        0
      );
    }

    return getOrderTotal(order);
  };

  const getOrderReference = (
    order: Order
  ) => {
    return (
      order.reference_number ||
      order.reference ||
      order.payment_reference ||
      order.transaction_reference ||
      order.order_reference ||
      "—"
    );
  };

  const getTransactionFee = (
    order: Order
  ) => {
    return Number(
      order.transaction_fee ??
        order.paystack_fee ??
        order.payment_fee ??
        order.gateway_fee ??
        order.transfer_fee ??
        order.bank_transfer_fee ??
        0
    );
  };

  const isBankTransfer = (
    order: Order
  ) => {
    const paymentMethod =
      order.payment_method
        ?.toLowerCase()
        .replace(/[_-]/g, " ") || "";

    return (
      paymentMethod.includes(
        "bank transfer"
      ) ||
      paymentMethod === "transfer" ||
      paymentMethod === "bank"
    );
  };

  const getStoreName = (
    item: any
  ) => {
    return (
      item.store?.name ||
      item.store_name ||
      item.product?.store?.name ||
      item.product?.store_name ||
      item.seller?.store_name ||
      item.seller?.name ||
      item.product?.seller
        ?.store_name ||
      item.product?.seller?.name ||
      "Store not available"
    );
  };

  const getPickupLocation = (
    order: Order
  ) => {
    const location =
      order.pickup_location;

    if (
      typeof location === "string" &&
      location.trim()
    ) {
      return location;
    }

    if (
      location &&
      typeof location === "object"
    ) {
      return (
        location.name ||
        location.title ||
        location.location_name ||
        location.address ||
        location.city ||
        "Pickup location not specified"
      );
    }

    return (
      order.pickup_location_name ||
      "Pickup location not specified"
    );
  };

  const formatOrderDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatOrderTime = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =====================================================
     STATUS PROGRESSION
  ===================================================== */

  const statusSteps = [
    "pending",
    "processing",
    "shipped",
    "ready_for_pickup",
    "picked_up",
    "delivered",
  ];

  const getStatusIndex = (
    status: string
  ) => {
    return statusSteps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <main className="mt-14 h-screen flex-1 overflow-y-auto p-3 lg:mt-0 lg:p-3">

        {!viewOrder ? (
          <div className="space-y-4">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="lg:text-2xl text-lg font-bold">
                  Orders
                </h1>

                <p className="text-xs text-muted-foreground mt-1">
                  Manage customer orders, fulfillment and order status.
                </p>
              </div>
            </div>

            {/* =====================================================
                STATS
            ===================================================== */}

            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 xl:grid-cols-8">
              {stats.map((stat) => (
                <button
                  key={stat.value}
                  onClick={() =>
                    setStatusFilter(
                      stat.value
                    )
                  }
                  className={`glass-card min-h-[58px] p-1.5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-h-0 sm:p-3 sm:text-left ${
                    statusFilter ===
                    stat.value
                      ? "ring-2 ring-primary/30"
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">

                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${stat.color}`}
                    >
                      {stat.icon}
                    </span>

                    <div className="min-w-0 text-center sm:text-right">
                      <p className="text-sm font-bold leading-none sm:text-xl">
                        {stat.count}
                      </p>

                      <p className="mt-0.5 max-w-[58px] break-words text-[7px] leading-[9px] text-muted-foreground sm:mt-1 sm:max-w-none sm:truncate sm:text-[10px] sm:leading-tight">
                        {stat.label}
                      </p>
                    </div>

                  </div>
                </button>
              ))}
            </div>

            {/* =====================================================
                SECTION HEADER + SEARCH
            ===================================================== */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="font-semibold text-sm">
                  {statusFilter ===
                  "all"
                    ? "All Orders"
                    : statusFilter
                        .replace(
                          /_/g,
                          " "
                        )
                        .replace(
                          /\b\w/g,
                          (char) =>
                            char.toUpperCase()
                        )}
                </h2>

                <p className="text-[11px] text-muted-foreground">
                  {filteredOrders.length}{" "}
                  {filteredOrders.length ===
                  1
                    ? "order"
                    : "orders"}{" "}
                  found
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                {/* SEARCH */}

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search orders..."
                    className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* DATE FILTER */}

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                  <select
                    value={dateFilter}
                    onChange={(e) =>
                      setDateFilter(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border bg-background py-2.5 pl-9 pr-8 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">
                      All Time
                    </option>

                    <option value="today">
                      Today
                    </option>

                    <option value="7days">
                      Last 7 Days
                    </option>

                    <option value="30days">
                      Last 30 Days
                    </option>
                  </select>
                </div>

              </div>
            </div>

            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="glass-card overflow-x-auto">

              <table className="w-full text-xs">

                <thead>
                  <tr className="border-b bg-secondary/50">

                    <th className="p-3 text-left">
                      Order
                    </th>

                    <th className="p-3 text-left">
                      Customer
                    </th>

                    <th className="p-3 text-left">
                      Fulfillment
                    </th>

                    <th className="p-3 text-left">
                      Status
                    </th>

                    <th className="p-3 text-left">
                      Total
                    </th>

                    <th className="p-3 text-left">
                      Date
                    </th>

                    <th className="p-3 text-right">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-10 text-center"
                      >
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                      </td>
                    </tr>
                  ) : filteredOrders.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-10 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                          </div>

                          <p className="mt-3 text-xs font-semibold">
                            No orders found
                          </p>

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Try adjusting your search or filters.
                          </p>

                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map(
                      (order) => (
                        <tr
                          key={order.id}
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >

                          {/* ORDER */}

                          <td className="p-3">
                            <div>
                              <p className="font-semibold">
                                {order.order_number ||
                                  `#${order.id}`}
                              </p>

                              <p className="text-[10px] text-muted-foreground">
                                #{order.id}
                              </p>
                            </div>
                          </td>

                          {/* CUSTOMER */}

                          <td className="p-3">
                            <div>
                              <p className="font-semibold">
                                {order.full_name ||
                                  order.user?.name ||
                                  "Unknown Customer"}
                              </p>

                              <p className="text-[10px] text-muted-foreground">
                                {order.user?.email ||
                                  "No email"}
                              </p>
                            </div>
                          </td>

                          {/* FULFILLMENT */}

                          <td className="p-3">
                            <span className="capitalize">
                              {order.fulfillment?.replace(
                                /_/g,
                                " "
                              ) ||
                                "—"}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td className="p-3">

                            {editOrderStatus?.id ===
                            order.id ? (
                              <select
                                value={
                                  editOrderStatus.status
                                }
                                onChange={(e) =>
                                  setEditOrderStatus(
                                    {
                                      ...editOrderStatus,
                                      status:
                                        e.target.value,
                                    }
                                  )
                                }
                                className="rounded-lg border bg-background px-2 py-1.5 text-[10px] outline-none focus:ring-2 focus:ring-primary/20"
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

                                <option value="ready_for_pickup">
                                  Ready for Pickup
                                </option>

                                <option value="picked_up">
                                  Picked Up
                                </option>

                                <option value="delivered">
                                  Delivered
                                </option>

                                <option value="cancelled">
                                  Cancelled
                                </option>
                              </select>
                            ) : (
                              statusBadge(
                                order.status
                              )
                            )}

                          </td>

                          {/* TOTAL */}

                          <td className="p-3 font-semibold">
                            {formatPrice(
                              getOrderTotal(
                                order
                              )
                            )}
                          </td>

                          {/* DATE */}

                          <td className="p-3">
                            <span className="text-muted-foreground">
                              {formatOrderDate(
                                order.created_at
                              )}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td className="p-3">

                            <div className="flex justify-end gap-2">

                              {/* VIEW */}

                              <button
                                onClick={() =>
                                  setViewOrder(
                                    order
                                  )
                                }
                                className="rounded-lg p-1.5 hover:bg-secondary transition-colors"
                                title="View order"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* SAVE / EDIT */}

                              {editOrderStatus?.id ===
                              order.id ? (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(
                                      order.id,
                                      editOrderStatus.status
                                    )
                                  }
                                  className="rounded-lg p-1.5 hover:bg-emerald-50 transition-colors"
                                  title="Save status"
                                >
                                  <Save className="w-4 h-4 text-emerald-600" />
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setEditOrderStatus(
                                      {
                                        id: order.id,
                                        status:
                                          order.status,
                                      }
                                    )
                                  }
                                  className="rounded-lg p-1.5 hover:bg-secondary transition-colors"
                                  title="Edit status"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}

                              {/* DELETE */}

                              <button
                                onClick={() =>
                                  deleteOrder(
                                    order.id
                                  )
                                }
                                className="rounded-lg p-1.5 hover:bg-red-50 transition-colors"
                                title="Delete order"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>

              </table>
              {filteredOrders.length > 0 && (
                <div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {(currentPage - 1) * ordersPerPage + 1}
                    </span>
                    {" - "}
                    <span className="font-semibold text-foreground">
                      {Math.min(
                        currentPage * ordersPerPage,
                        filteredOrders.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {filteredOrders.length}
                    </span>{" "}
                    orders
                  </p>

                  <div className="flex items-center justify-between gap-1">
                    <button
                      onClick={() =>
                        setCurrentPage((page) => Math.max(page - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 min-w-8 rounded-lg px-2 text-[11px] font-semibold transition-colors ${
                            currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-secondary"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(page + 1, totalPages)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (

          /* =====================================================
             VIEW ORDER
          ===================================================== */

          <div className="space-y-2">

            {/* BACK */}

            <button
              onClick={() =>
                setViewOrder(null)
              }
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>

            {/* =====================================================
                ORDER SUMMARY
            ===================================================== */}

            <div className="glass-card overflow-hidden">

              {/* DETAILS */}

              <div className="grid grid-cols-2 gap-x-4 gap-y-5 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">

                {/* ORDER NUMBER */}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Order Number
                  </p>

                  <p className="mt-1 text-xs font-semibold break-all">
                    {viewOrder.order_number ||
                      `#${viewOrder.id}`}
                  </p>
                </div>

                {/* REFERENCE */}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Reference
                  </p>

                  <p className="mt-1 text-xs font-semibold break-all">
                    {getOrderReference(
                      viewOrder
                    )}
                  </p>
                </div>

                {/* DATE */}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Date
                  </p>

                  <p className="mt-1 text-xs font-semibold">
                    {formatOrderDate(
                      viewOrder.created_at
                    )}
                  </p>
                </div>

                {/* TIME */}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Time
                  </p>

                  <p className="mt-1 text-xs font-semibold">
                    {formatOrderTime(
                      viewOrder.created_at
                    )}
                  </p>
                </div>

                {/* STATUS */}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>

                  <div className="mt-1">
                    {statusBadge(
                      viewOrder.status
                    )}
                  </div>
                </div>

                {/* CUSTOMER */}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Customer
                  </p>

                  <p className="mt-1 text-xs font-semibold truncate">
                    {viewOrder.full_name ||
                      viewOrder.user?.name ||
                      "Unknown"}
                  </p>

                  <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
                    {viewOrder.user?.email ||
                      "No email"}
                  </p>
                </div>

                {/* FULFILLMENT */}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Fulfillment
                  </p>

                  <p className="mt-1 text-xs font-semibold capitalize">
                    {viewOrder.fulfillment?.replace(
                      /_/g,
                      " "
                    ) ||
                      "Not specified"}
                  </p>
                </div>

                {/* PAYMENT */}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Payment Method
                  </p>

                  <p className="mt-1 text-xs font-semibold capitalize">
                    {viewOrder.payment_method?.replace(
                      /_/g,
                      " "
                    ) ||
                      "Not specified"}
                  </p>
                </div>

                {/* PICKUP LOCATION */}

                <div className="col-span-2 sm:col-span-3 lg:col-span-2 xl:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Pickup Location
                  </p>

                  <div className="mt-1 flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                    <p className="text-xs font-semibold">
                      {getPickupLocation(
                        viewOrder
                      )}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* =====================================================
                ORDER ITEMS
            ===================================================== */}

            <div className="glass-card overflow-hidden">

              <div className="border-b p-4">

                <h2 className="text-sm font-semibold">
                  Order Items
                </h2>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {viewOrder.items?.length ||
                    0}{" "}
                  {viewOrder.items?.length ===
                  1
                    ? "item"
                    : "items"}{" "}
                  in this order
                </p>

              </div>

              {/* ITEMS */}

              <div className="divide-y">

                {viewOrder.items?.length ? (
                  viewOrder.items.map(
                    (item: any) => {

                      const image =
                        item.product
                          ?.images?.[0]
                          ?.image_url;

                      const imageUrl =
                        image
                          ? image.startsWith(
                              "http"
                            )
                            ? image
                            : `https://aestra.onrender.com${image}`
                          : "";

                      const quantity =
                        Number(
                          item.quantity ??
                            1
                        );

                      const lineTotalValue =
                        item.line_total ??
                        item.total;

                      const price =
                        Number(
                          item.price ??
                            item.unit_price ??
                            0
                        );

                      const lineTotal =
                        lineTotalValue !==
                        undefined &&
                        lineTotalValue !==
                        null
                          ? Number(
                              lineTotalValue
                            )
                          : price *
                            quantity;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-4"
                        >

                          {/* IMAGE */}

                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-secondary">

                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={
                                  item
                                    .product
                                    ?.name ||
                                  "Product"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}

                          </div>

                          {/* PRODUCT */}

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-semibold">
                              {item.product
                                ?.name ||
                                "Product"}
                            </p>

                            <p className="mt-1 text-[10px] text-muted-foreground">
                              Store:{" "}
                              <span className="font-medium text-foreground">
                                {getStoreName(
                                  item
                                )}
                              </span>
                            </p>

                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              Qty:{" "}
                              {quantity}{" "}
                              ×{" "}
                              {formatPrice(
                                price
                              )}
                            </p>

                          </div>

                          {/* TOTAL */}

                          <div className="text-right">
                            <p className="text-xs font-semibold">
                              {formatPrice(
                                lineTotal
                              )}
                            </p>
                          </div>

                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No items found for this order.
                  </div>
                )}

              </div>

              {/* =====================================================
                  ORDER TOTALS
              ===================================================== */}

              <div className="border-t bg-secondary/30 p-4">

                <div className="ml-auto w-full max-w-sm space-y-2">

                  {/* SUBTOTAL */}

                  <PriceRow
                    label="Subtotal"
                    value={formatPrice(
                      getOrderSubtotal(
                        viewOrder
                      )
                    )}
                  />

                  {/* TRANSACTION FEE */}

                  <PriceRow
                    label={
                      viewOrder.payment_method ===
                      "paystack"
                        ? "Paystack Fee"
                        : "Bank Transaction Fee"
                    }
                    value={formatPrice(
                      getTransactionFee(
                        viewOrder
                      )
                    )}
                  />

                  {/* TOTAL */}

                  <div className="flex items-center justify-between border-t pt-3">

                    <span className="text-xs font-semibold">
                      Order Total
                    </span>

                    <span className="text-base font-bold text-primary">
                      {formatPrice(
                        getOrderTotal(
                          viewOrder
                        )
                      )}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* =====================================================
                ORDER STATUS PROGRESSION
            ===================================================== */}

            <div className="glass-card p-4 sm:p-5">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-sm font-semibold">
                    Order Status
                  </h2>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Current fulfillment progress
                  </p>
                </div>

              </div>

              {/* CANCELLED */}

              {viewOrder.status ===
              "cancelled" ? (
                <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                      <Ban className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-destructive">
                        Order Cancelled
                      </p>

                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        This order is no longer progressing through fulfillment.
                      </p>
                    </div>

                  </div>

                </div>
              ) : (

                /* PROGRESSION */

                <div className="mt-5 overflow-x-auto pb-2">

                  <div className="flex min-w-[680px] items-start">

                    {statusSteps.map(
                      (
                        step,
                        index
                      ) => {

                        const currentIndex =
                          getStatusIndex(
                            viewOrder.status
                          );

                        const completed =
                          currentIndex >=
                          index;

                        const current =
                          viewOrder.status ===
                          step;

                        return (
                          <div
                            key={step}
                            className="flex flex-1 items-start"
                          >

                            {/* STEP */}

                            <div className="flex min-w-0 flex-col items-center">

                              {/* DOT */}

                              <div
                                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                                  completed
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-muted-foreground"
                                } ${
                                  current
                                    ? "ring-4 ring-primary/10"
                                    : ""
                                }`}
                              >
                                {completed ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                )}
                              </div>

                              {/* LABEL */}

                              <p
                                className={`mt-2 max-w-[80px] text-center text-[9px] font-semibold capitalize ${
                                  current
                                    ? "text-primary"
                                    : completed
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {step.replace(
                                  /_/g,
                                  " "
                                )}
                              </p>

                            </div>

                            {/* DASH */}

                            {index <
                              statusSteps.length -
                                1 && (
                              <div className="flex-1 px-1 pt-3.5">

                                <div
                                  className={`h-0.5 w-full border-t-2 border-dashed ${
                                    currentIndex >
                                    index
                                      ? "border-primary"
                                      : "border-border"
                                  }`}
                                />

                              </div>
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default Orders;