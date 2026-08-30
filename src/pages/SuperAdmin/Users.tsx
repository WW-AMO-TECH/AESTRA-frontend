import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Eye,
  MoreHorizontal,
  X,
  Ban,
  CheckCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

import Sidebar from "@/components/Admin/Sidebar";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  is_blocked: boolean;
  orders_count: number;
  orders_sum_total: number | null;
}

interface Product {
  model: any;
  storage: any;
  color: any;
  id: number;
  name: string;
  image?: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product?: Product;
}

interface Order {
  discount: number;
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  fulfillment: string;
  subtotal: number;
  total: number;
  delivery_fee?: number;
  items: OrderItem[];
}

interface Statistics {
  total: number;
  active: number;
  blocked: number;
  new_this_month: number;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

const Users = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] =
    useState<Statistics>({
      total: 0,
      active: 0,
      blocked: 0,
      new_this_month: 0,
    });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  /* -----------------------------------------
     FETCH USERS
  ----------------------------------------- */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/superadmin/users`,
        {
          headers,
          params: {
            page,
            search,
          },
        }
      );

      const data = response.data;

      setUsers(data.users?.data || []);

      setLastPage(data.users?.last_page || 1);
      setTotalUsers(data.users?.total || 0);

      setStatistics(
        data.statistics || {
          total: 0,
          active: 0,
          blocked: 0,
          new_this_month: 0,
        }
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  /* -----------------------------------------
     VIEW CUSTOMER
  ----------------------------------------- */

  const viewCustomer = async (customer: User) => {
    setSelectedUser(customer);
    setSelectedOrder(null);
    setLoadingOrders(true);

    try {
      const response = await axios.get(
        `${API_URL}/superadmin/users/${customer.id}/orders`,
        {
          headers,
        }
      );

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load customer orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  /* -----------------------------------------
     BLOCK / UNBLOCK
  ----------------------------------------- */

  const toggleBlock = async (customer: User) => {
    try {
      setError("");
      setMessage("");

      const endpoint = customer.is_blocked
        ? `${API_URL}/superadmin/user/unblock/${customer.id}`
        : `${API_URL}/superadmin/user/block/${customer.id}`;

      await axios.post(
        endpoint,
        {},
        {
          headers,
        }
      );

      setMessage(
        customer.is_blocked
          ? "Customer unblocked successfully."
          : "Customer blocked successfully."
      );

      await fetchUsers();

      if (selectedUser?.id === customer.id) {
        setSelectedUser({
          ...customer,
          is_blocked: !customer.is_blocked,
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to update customer."
      );
    }
  };

  /* -----------------------------------------
     DELETE CUSTOMER
  ----------------------------------------- */

  const deleteCustomer = async (customer: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/superadmin/users/${customer.id}`,
        {
          headers,
        }
      );

      setMessage("Customer deleted successfully.");

      setSelectedUser(null);

      await fetchUsers();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to delete customer."
      );
    }
  };

  /* -----------------------------------------
     HELPERS
  ----------------------------------------- */

  const formatMoney = (value: number | null) => {
    return `₦${Number(value || 0).toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const getAverageOrder = () => {
    if (!selectedUser || !selectedUser.orders_count) {
      return 0;
    }

    return (
      Number(selectedUser.orders_sum_total || 0) /
      selectedUser.orders_count
    );
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-50 text-green-700";

      case "processing":
        return "bg-yellow-50 text-yellow-700";

      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* -----------------------------------------
     UI
  ----------------------------------------- */

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar user={user} />

      <main className="flex-1 p-3 lg:p-4 lg:py-0 mt-12 lg:mt-0 h-screen overflow-y-auto">

        {/* HEADER */}

        <div className="border-b px-6 py-5 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Customers
              </h1>

              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <span>Dashboard</span>
                <span>›</span>
                <span>Customers</span>
              </div>
            </div>

            <div className="relative hidden w-72 md:block">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search customers..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">

          {/* MESSAGES */}

          {message && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <span>{message}</span>

              <button
                onClick={() => setMessage("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                onClick={() => setError("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* STATISTICS */}

          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Customers"
              value={statistics.total}
              description="All registered users"
            />

            <StatCard
              title="Active Customers"
              value={statistics.active}
              description="Not blocked"
            />

            <StatCard
              title="Blocked Customers"
              value={statistics.blocked}
              description="Restricted users"
            />

            <StatCard
              title="New This Month"
              value={statistics.new_this_month}
              description="Joined this month"
            />

          </div>

          {/* MOBILE SEARCH */}

          <div className="mb-5 md:hidden">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search customers..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none"
              />
            </div>
          </div>

          {/* CUSTOMER TABLE */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

            {loading ? (
              <div className="py-20 text-center text-sm text-gray-500">
                Loading customers...
              </div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-medium text-gray-700">
                  No customers found
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Try changing your search.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px]">

                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">

                        <th className="px-5 py-4">
                          User
                        </th>

                        <th className="px-5 py-4">
                          Email
                        </th>

                        <th className="px-5 py-4">
                          Phone
                        </th>

                        <th className="px-5 py-4">
                          Orders
                        </th>

                        <th className="px-5 py-4">
                          Total Spent
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>

                        <th className="px-5 py-4 text-right">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y">

                      {users.map((customer) => (
                        <tr
                          key={customer.id}
                          className="hover:bg-gray-50"
                        >

                          {/* USER */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">

                              <Avatar
                                name={customer.name}
                              />

                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {customer.name}
                                </p>

                                <p className="text-xs text-gray-400">
                                  Joined{" "}
                                  {formatDate(
                                    customer.created_at
                                  )}
                                </p>
                              </div>

                            </div>
                          </td>

                          {/* EMAIL */}

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {customer.email}
                          </td>

                          {/* PHONE */}

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {customer.phone || "—"}
                          </td>

                          {/* ORDERS */}

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {customer.orders_count}
                          </td>

                          {/* SPENT */}

                          <td className="px-5 py-4 text-sm font-medium text-gray-800">
                            {formatMoney(
                              customer.orders_sum_total
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                customer.is_blocked
                                  ? "bg-red-50 text-red-600"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {customer.is_blocked
                                ? "Blocked"
                                : "Active"}
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-1">

                              <button
                                onClick={() =>
                                  viewCustomer(
                                    customer
                                  )
                                }
                                title="View customer"
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  toggleBlock(
                                    customer
                                  )
                                }
                                title={
                                  customer.is_blocked
                                    ? "Unblock customer"
                                    : "Block customer"
                                }
                                className={`rounded-lg p-2 ${
                                  customer.is_blocked
                                    ? "text-green-600 hover:bg-green-50"
                                    : "text-red-500 hover:bg-red-50"
                                }`}
                              >
                                {customer.is_blocked ? (
                                  <CheckCircle
                                    size={17}
                                  />
                                ) : (
                                  <Ban size={17} />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  deleteCustomer(
                                    customer
                                  )
                                }
                                title="Delete customer"
                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={17} />
                              </button>

                            </div>

                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>
                </div>

                {/* PAGINATION */}

                <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    {users.length} of{" "}
                    {totalUsers} customers
                  </p>

                  <div className="flex items-center gap-1">

                    <button
                      disabled={page === 1}
                      onClick={() =>
                        setPage((p) => p - 1)
                      }
                      className="rounded-lg border p-2 text-gray-500 disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <span className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white">
                      {page}
                    </span>

                    <span className="px-2 text-sm text-gray-500">
                      of {lastPage}
                    </span>

                    <button
                      disabled={page === lastPage}
                      onClick={() =>
                        setPage((p) => p + 1)
                      }
                      className="rounded-lg border p-2 text-gray-500 disabled:opacity-40"
                    >
                      <ChevronRight size={17} />
                    </button>

                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      </main>

      {/* CUSTOMER SIDE PANEL */}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">

          <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl">

            {/* PANEL HEADER */}
            <div className="flex items-center justify-between border-b px-6 py-5">

              <div className="flex items-center gap-4">

                <Avatar
                  name={selectedUser.name}
                  large
                />

                <div>
                  <div className="flex items-center gap-2">

                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedUser.name}
                    </h2>

                    <span
                      className={`rounded-full px-2 py-1 text-[11px] ${
                        selectedUser.is_blocked
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {selectedUser.is_blocked
                        ? "Blocked"
                        : "Active"}
                    </span>

                  </div>

                  <p className="text-sm text-gray-500">
                    {selectedUser.email}
                  </p>

                  <p className="text-sm text-gray-500">
                    {selectedUser.phone}
                  </p>

                </div>

              </div>

              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedOrder(null);
                }}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* CUSTOMER STATS */}
            <div className="grid grid-cols-3 border-b px-6 py-5">

              <MiniStat
                value={selectedUser.orders_count}
                label="Total Orders"
              />

              <MiniStat
                value={formatMoney(
                  selectedUser.orders_sum_total
                )}
                label="Total Spent"
              />

              <MiniStat
                value={formatMoney(
                  getAverageOrder()
                )}
                label="Average Order"
              />

            </div>

            {/* ORDERS */}
            <div className="flex-1 overflow-y-auto px-6 py-5">

              <div className="mb-4 flex items-center gap-2">

                <Package
                  size={18}
                  className="text-green-600"
                />

                <h3 className="font-semibold">
                  Orders
                </h3>

              </div>

              {loadingOrders ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-lg border py-10 text-center">
                  <p className="text-sm text-gray-500">
                    This customer has no orders.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">

                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border p-4"
                    >

                      <div className="flex items-center justify-between">

                        <p className="text-sm font-semibold">
                          Order #{order.order_number}
                        </p>

                        <p className="text-xs text-gray-400">
                          {formatDate(
                            order.created_at
                          )}
                        </p>

                      </div>

                      <div className="mt-3 flex items-center justify-between">

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                        <span className="font-semibold">
                          {formatMoney(order.total)}
                        </span>

                      </div>

                      <div className="mt-3">

                        {order.items
                          ?.slice(0, 2)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between py-1 text-sm"
                            >
                              <span className="truncate text-gray-600">
                                {item.product?.name ||
                                  "Product"}{" "}
                                × {item.quantity}
                              </span>

                              <span className="ml-3">
                                {formatMoney(
                                  item.price
                                )}
                              </span>
                            </div>
                          ))}

                      </div>

                      <button
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                        className="mt-3 w-full rounded-lg border py-2 text-sm font-medium hover:bg-gray-50"
                      >
                        View Details
                      </button>

                    </div>
                  ))}

                </div>
              )}

            </div>

            {/* PANEL FOOTER */}
            <div className="flex gap-3 border-t p-5">

              <button
                onClick={() =>
                  toggleBlock(selectedUser)
                }
                className={`flex-1 rounded-lg border py-2.5 text-sm font-medium ${
                  selectedUser.is_blocked
                    ? "border-green-200 text-green-600 hover:bg-green-50"
                    : "border-red-200 text-red-600 hover:bg-red-50"
                }`}
              >
                {selectedUser.is_blocked
                  ? "Unblock User"
                  : "Block User"}
              </button>

              <button
                onClick={() =>
                  setSelectedUser(null)
                }
                className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ORDER DETAILS */}

      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">

            {/* HEADER */}
            <div className="flex items-start justify-between border-b px-5 py-4">

              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">
                  Order #{selectedOrder.order_number}
                </h2>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={17} />
              </button>

            </div>

            {/* CONTENT */}
            <div className="px-5 py-4">

              {/* ORDER DATE */}
              <div className="mb-4 flex justify-between text-xs">
                <span className="text-gray-500">
                  Order Date & Time
                </span>

                <span className="font-medium text-gray-700">
                  {formatDate(selectedOrder.created_at)} at {new Date(selectedOrder.created_at).toLocaleTimeString()}
                </span>
                
              </div>

              {/* ORDER INFORMATION */}
              <div className="border-y border-gray-100 py-3">

                <div className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-gray-500">
                    Payment Method
                  </span>

                  <span className="font-medium text-gray-700">
                    {selectedOrder.payment_method || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-gray-500">
                    Payment Status
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      selectedOrder.payment_status?.toLowerCase() === "paid"
                        ? "bg-green-50 text-green-600"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {selectedOrder.payment_status || "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-gray-500">
                    Delivery Method
                  </span>

                  <span className="max-w-[200px] text-right font-medium text-gray-700">
                    {selectedOrder.fulfillment || "N/A"}
                  </span>
                </div>

              </div>

              {/* ITEMS */}
              <div className="pt-4">

                <h3 className="mb-3 text-xs font-semibold text-gray-900">
                  Items ({selectedOrder.items?.length || 0})
                </h3>

                <div className="space-y-2">

                  {selectedOrder.items?.map((item) => (

                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >

                      {/* PRODUCT */}
                      <div className="flex min-w-0 items-center gap-3">

                        {/* PRODUCT IMAGE */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">

                          {item.product?.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product?.name || "Product"}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="text-[9px] text-gray-400">
                              No Image
                            </div>
                          )}

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-xs font-medium text-gray-900">
                            {item.product?.name || "Product"}
                          </p>

                          {/* Optional product variant/model */}
                          {(item.product?.model ||
                            item.product?.storage ||
                            item.product?.color) && (
                            <p className="mt-0.5 truncate text-[10px] text-gray-500">
                              {[
                                item.product?.model,
                                item.product?.storage,
                                item.product?.color,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}

                          <p className="mt-0.5 text-[10px] text-gray-500">
                            Qty: {item.quantity}
                          </p>

                        </div>

                      </div>

                      {/* PRICE */}
                      <p className="shrink-0 text-xs font-semibold text-gray-900">
                        {formatMoney(item.price * item.quantity)}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

              {/* PRICE SUMMARY */}
              <div className="mt-4 border-t border-gray-100 pt-3">

                <div className="flex justify-between py-1 text-xs">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="text-gray-700">
                    {formatMoney(
                      selectedOrder.subtotal ??
                        selectedOrder.total
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1 text-xs">
                  <span className="text-gray-500">
                    Delivery Fee
                  </span>

                  <span className="text-gray-700">
                    {formatMoney(
                      selectedOrder.delivery_fee ?? 0
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1 text-xs">
                  <span className="text-gray-500">
                    Discount
                  </span>

                  <span className="text-gray-700">
                    -{" "}
                    {formatMoney(
                      selectedOrder.discount ?? 0
                    )}
                  </span>
                </div>

                {/* TOTAL */}
                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">

                  <span className="text-sm font-semibold text-gray-900">
                    Total
                  </span>

                  <span className="text-sm font-bold text-gray-900">
                    {formatMoney(selectedOrder.total)}
                  </span>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}
      </div>
  );
};

/* -----------------------------------------
   STAT CARD
----------------------------------------- */

const StatCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value.toLocaleString()}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>

    </div>
  );
};

/* -----------------------------------------
   AVATAR
----------------------------------------- */

const Avatar = ({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) => {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-green-50 font-semibold text-green-700 ${
        large
          ? "h-16 w-16 text-xl"
          : "h-10 w-10 text-sm"
      }`}
    >
      {name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
};

/* -----------------------------------------
   MINI STAT
----------------------------------------- */

const MiniStat = ({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) => {
  return (
    <div className="text-center">

      <p className="font-semibold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {label}
      </p>

    </div>
  );
};

export default Users;