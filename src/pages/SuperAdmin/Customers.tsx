import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Ban, Calendar, ChevronLeft, ChevronRight, CheckCircle, Eye, Loader2,
  Mail, Package, Phone, Search, ShieldCheck, SlidersHorizontal, Store,
  Trash2, UserRound, X,
} from "lucide-react";
import Sidebar from "@/components/SuperAdmin/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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

interface ProductImage {
  image_url: string;
}

interface Product {
  id: number;
  name: string;
  images?: ProductImage[];
  seller?: {
    id: number;
    name: string;
    store_name?: string | null;
  };
  model?: string | null;
  storage?: string | null;
  color?: string | null;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product?: Product;
}

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  fulfillment: string;
  subtotal: number;
  total: number;
  discount: number;
  delivery_fee?: number;
  transaction_fee?: number;
  transaction_fee_percentage?: number;
  platform_fee?: number;
  items: OrderItem[];
}

interface Statistics {
  total: number;
  active: number;
  blocked: number;
  new_this_month: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const Customers = () => {
  const { user } = useAuth();

  /* STATE */
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0, active: 0, blocked: 0, new_this_month: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 5;

  const token = localStorage.getItem("token");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  /* FETCH CUSTOMERS */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/superadmin/users`, {
        ...config,
        params: { page: currentPage, search },
      });
      const data = response.data;
      setUsers(data.users?.data || []);
      setStatistics(data.statistics || {
        total: 0, active: 0, blocked: 0, new_this_month: 0,
      });
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      toast.error(error.response?.data?.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  /* SEARCH DEBOUNCE */
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(timer);
  }, [currentPage, search]);

  /* SEARCH ENTER */
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setSearch(event.currentTarget.value.trim());
      setCurrentPage(1);
    }
  };

  /* VIEW CUSTOMER ORDERS */
  const viewCustomer = async (customer: User) => {
    setSelectedUser(customer);
    setSelectedOrder(null);
    setOrders([]);
    setOrdersPage(1);
    setLoadingOrders(true);

    try {
      const response = await axios.get(`${API_URL}/superadmin/users/${customer.id}/orders`, config);
      setOrders(response.data.orders || []);
    } catch (error: any) {
      console.error("Error loading customer orders:", error);
      toast.error(error.response?.data?.message || "Unable to load customer orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  /* BLOCK / UNBLOCK CUSTOMER */
  const toggleBlock = async (customer: User) => {
    try {
      setProcessingId(customer.id);
      const endpoint = customer.is_blocked
        ? `${API_URL}/superadmin/user/unblock/${customer.id}`
        : `${API_URL}/superadmin/user/block/${customer.id}`;

      await axios.post(endpoint, {}, config);
      const blocked = !customer.is_blocked;

      setUsers((prev) => prev.map((item) => item.id === customer.id ? { ...item, is_blocked: blocked } : item));
      setSelectedUser((prev) => prev ? { ...prev, is_blocked: blocked } : null);

      toast.success(blocked ? "Customer blocked successfully" : "Customer unblocked successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update customer");
    } finally {
      setProcessingId(null);
    }
  };

  /* DELETE CUSTOMER */
  const deleteCustomer = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      setProcessingId(id);
      await axios.delete(`${API_URL}/superadmin/users/${id}`, config);
      setSelectedUser(null);
      setUsers((prev) => prev.filter((customer) => customer.id !== id));
      toast.success("Customer deleted successfully");
      await fetchUsers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete customer");
    } finally {
      setProcessingId(null);
    }
  };

  /* HELPERS */
  const formatMoney = (value: number | null | undefined) => `₦${Number(value || 0).toLocaleString()}`;
  const formatValue = (value?: string | null) => value && value.trim() ? value : "Not provided";

  const formatDate = (date?: string | null) => date
    ? new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "Not provided";

  const formatDateTime = (date?: string | null) => {
    if (!date) return "Not provided";
    return `${formatDate(date)} at ${new Date(date).toLocaleTimeString()}`;
  };

  const getAverageOrder = () => {
    if (!selectedUser?.orders_count) return 0;
    return Number(selectedUser.orders_sum_total || 0) / selectedUser.orders_count;
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-50 text-green-700";
      case "processing": return "bg-yellow-50 text-yellow-700";
      case "cancelled":
      case "canceled": return "bg-red-50 text-red-700";
      case "shipped": return "bg-blue-50 text-blue-700";
      case "pending": return "bg-orange-50 text-orange-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  /* PRODUCT IMAGE */
  const getProductImage = (image?: string) => {
    if (!image) return null;
    if (image.startsWith("http://") || image.startsWith("https://")) return image;

    const baseUrl = API_URL.replace(/\/api\/?$/, "");
    if (image.startsWith("/storage/")) return `${baseUrl}${image}`;
    if (image.startsWith("storage/")) return `${baseUrl}/${image}`;
    return `${baseUrl}/storage/${image}`;
  };

  /* FILTERING */
  const filteredUsers = useMemo(() => {
    let result = [...users];
    const term = search.trim().toLowerCase();

    if (term) {
      result = result.filter((customer) =>
        [customer.name, customer.email, customer.phone].some((value) =>
          value?.toLowerCase().includes(term)
        )
      );
    }

    if (statusFilter === "active") result = result.filter((customer) => !customer.is_blocked);
    if (statusFilter === "blocked") result = result.filter((customer) => customer.is_blocked);

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortFilter === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [users, search, statusFilter, sortFilter]);

  /* CUSTOMER PAGINATION */
  const totalUsers = statistics.total;
  const lastPage = Math.max(1, Math.ceil(totalUsers / itemsPerPage));
  const paginatedUsers = filteredUsers.slice(0, itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortFilter, itemsPerPage]);

  /* CUSTOMER ORDER PAGINATION */
  const totalOrderPages = Math.max(1, Math.ceil(orders.length / ordersPerPage));

  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ordersPerPage;
    return orders.slice(start, start + ordersPerPage);
  }, [orders, ordersPage]);

  const goToOrdersPage = (page: number) => {
    setOrdersPage(Math.min(Math.max(page, 1), totalOrderPages));
  };

  /* CLEAR FILTERS */
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortFilter("newest");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  /* STATISTICS */
  const stats = [
    { label: "Total Customers", count: statistics.total, icon: <UserRound className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
    { label: "Active", count: statistics.active, icon: <ShieldCheck className="h-5 w-5" />, color: "bg-green-100 text-green-700" },
    { label: "Blocked", count: statistics.blocked, icon: <Ban className="h-5 w-5" />, color: "bg-red-100 text-red-700" },
  ];

  /* UI */
  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <div className="mt-14 h-screen flex-1 overflow-y-auto p-3 lg:mt-0 lg:p-3">
        <div className="mx-auto max-w-[1600px]">
          {/* PAGE HEADER */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
              <p className="mt-1 text-sm text-slate-500">View and manage customers on AESTRA.</p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              <UserRound className="h-4 w-4 text-primary" /> {statistics.total} Customers
            </div>
          </div>

          {/* STATISTICS */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl border border-border bg-background p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{stat.count.toLocaleString()}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}> {stat.icon} </div>
                </div>
              </div>
            ))}
          </div>

          {/* SEARCH & FILTERS */}
          {!loading && (
            <div className="glass-card mb-5 rounded-2xl border border-border bg-background p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-slate-900">Search & Filters</h2>
                </div>

                {(search || statusFilter !== "all" || sortFilter !== "newest") && (
                  <button onClick={clearFilters} className="text-xs font-semibold text-primary hover:text-primary/80">Clear Filters</button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* SEARCH */}
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search customer, email or phone..."
                    className="h-10 w-full rounded-xl border border-border bg-slate-50 pl-9 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* STATUS */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-10 rounded-xl border border-border bg-slate-50 px-3 text-sm text-slate-700 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Customers</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>

                {/* SORT */}
                <select
                  value={sortFilter}
                  onChange={(e) => { setSortFilter(e.target.value); setCurrentPage(1); }}
                  className="h-10 rounded-xl border border-border bg-slate-50 px-3 text-sm text-slate-700 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{filteredUsers.length}</span> of{" "}
                  <span className="font-semibold text-slate-700">{statistics.total}</span> customers
                </p>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="glass-card flex items-center justify-center rounded-2xl border border-border bg-background p-12 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" /> Loading customers...
            </div>
          )}

          {/* NO CUSTOMERS */}
          {!loading && users.length === 0 && (
            <div className="glass-card rounded-2xl border border-border bg-background p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <UserRound className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">No Customers</h2>
              <p className="mt-1 text-sm text-slate-500">There are currently no registered customers.</p>
            </div>
          )}

          {/* NO MATCHING CUSTOMERS */}
          {!loading && users.length > 0 && filteredUsers.length === 0 && (
            <div className="glass-card rounded-2xl border border-border bg-background p-12 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <h2 className="text-lg font-semibold text-slate-900">No Matching Customers</h2>
              <p className="mb-4 mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
              <button onClick={clearFilters} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90">Clear Filters</button>
            </div>
          )}

          {/* CUSTOMER DIRECTORY */}
          {!loading && paginatedUsers.length > 0 && (
            <div className="glass-card overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Customer Directory</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Manage customers and their account status.</p>
                </div>
                <span className="text-xs text-slate-500">{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/80">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Contact</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Joined</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Orders</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Spent</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {paginatedUsers.map((customer) => {
                      const initials = customer.name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
                      const blocked = customer.is_blocked;
                      const isProcessing = processingId === customer.id;

                      return (
                        <tr key={customer.id} className="transition hover:bg-primary/[0.03]">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary"> {initials || "U"} </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                                <p className="text-[11px] text-slate-500">Customer #{customer.id}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                <span className="max-w-[220px] truncate">{customer.email}</span>
                              </div>
                              {customer.phone && (
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                  <Phone className="h-3.5 w-3.5" /> {customer.phone}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="h-4 w-4 text-slate-400" /> {formatDate(customer.created_at)}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Package className="h-4 w-4 text-slate-400" /> {customer.orders_count}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{formatMoney(customer.orders_sum_total)}</td>

                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${blocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                              {blocked ? <Ban className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                              {blocked ? "Blocked" : "Active"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => viewCustomer(customer)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>

                              <button
                                onClick={() => toggleBlock(customer)}
                                disabled={isProcessing}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${blocked ? "bg-primary text-white hover:bg-primary/90" : "border border-orange-200 text-orange-600 hover:bg-orange-50"}`}
                              >
                                {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : blocked ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                                {blocked ? "Unblock" : "Block"}
                              </button>

                              <button onClick={() => deleteCustomer(customer.id)} disabled={isProcessing} className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50" title="Delete customer">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rows per page</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-slate-700 focus:border-primary focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="text-xs text-slate-500">
                    Page <span className="font-semibold text-slate-700">{currentPage}</span> of{" "}
                    <span className="font-semibold text-slate-700">{lastPage}</span>
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-border bg-background p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: lastPage }, (_, index) => index + 1)
                      .filter((page) => lastPage <= 5 || page === 1 || page === lastPage || Math.abs(page - currentPage) <= 1)
                      .map((page, index, array) => {
                        const previousPage = array[index - 1];

                        return (
                          <div key={page} className="flex items-center">
                            {previousPage && page - previousPage > 1 && <span className="px-1 text-xs text-slate-400">...</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition ${currentPage === page ? "bg-primary text-white" : "border border-border bg-background text-slate-600 hover:bg-slate-50"}`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(lastPage, prev + 1))}
                      disabled={currentPage === lastPage}
                      className="rounded-lg border border-border bg-background p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOMER DETAILS MODAL */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => { setSelectedUser(null); setSelectedOrder(null); }}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedUser.name} />
                <div>
                  <h2 className="text-base font-bold text-slate-900">Customer Details</h2>
                  <p className="text-xs text-slate-500">Customer #{selectedUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => { setSelectedUser(null); setSelectedOrder(null); }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="overflow-y-auto p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{selectedUser.email}</p>
                </div>

                <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${selectedUser.is_blocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {selectedUser.is_blocked ? <Ban className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  {selectedUser.is_blocked ? "Blocked" : "Active Customer"}
                </span>
              </div>

              {/* CUSTOMER STATS */}
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MiniStat icon={<Package className="h-5 w-5" />} label="Total Orders" value={selectedUser.orders_count} />
                <MiniStat icon={<Store className="h-5 w-5" />} label="Total Spent" value={formatMoney(selectedUser.orders_sum_total)} />
                <MiniStat icon={<CheckCircle className="h-5 w-5" />} label="Average Order" value={formatMoney(getAverageOrder())} />
              </div>

              {/* CUSTOMER INFORMATION */}
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Detail icon={<UserRound />} label="Full Name" value={selectedUser.name} />
                <Detail icon={<Mail />} label="Email" value={selectedUser.email} />
                <Detail icon={<Phone />} label="Phone" value={selectedUser.phone} />
                <Detail icon={<Calendar />} label="Joined" value={formatDate(selectedUser.created_at)} />
              </div>

              {/* ORDERS */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Customer Orders</p>
                    <p className="text-lg font-bold text-slate-900">{selectedUser.orders_count} Orders</p>
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="flex items-center justify-center rounded-xl bg-background p-8 text-sm text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-xl bg-background p-8 text-center">
                    <Package className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-500">This customer has no orders.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedOrders.map((order) => (
                        <div key={order.id} className="rounded-xl border border-border bg-background p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Order #{order.order_number}</p>
                              <p className="mt-0.5 text-[11px] text-slate-500">{formatDate(order.created_at)}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClass(order.status)}`}>{order.status}</span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                              {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                            </div>
                            <p className="font-semibold text-slate-900">{formatMoney(order.total)}</p>
                          </div>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Order Details
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* ORDER PAGINATION */}
                    {totalOrderPages > 1 && (
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <p className="text-xs text-slate-500">
                          Page <span className="font-semibold text-slate-700">{ordersPage}</span> of{" "}
                          <span className="font-semibold text-slate-700">{totalOrderPages}</span>
                        </p>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => goToOrdersPage(ordersPage - 1)}
                            disabled={ordersPage === 1}
                            className="rounded-lg border border-border bg-background p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          {Array.from({ length: totalOrderPages }, (_, index) => index + 1)
                            .filter((page) => totalOrderPages <= 5 || page === 1 || page === totalOrderPages || Math.abs(page - ordersPage) <= 1)
                            .map((page, index, array) => {
                              const previousPage = array[index - 1];

                              return (
                                <div key={page} className="flex items-center">
                                  {previousPage && page - previousPage > 1 && <span className="px-1 text-xs text-slate-400">...</span>}
                                  <button
                                    onClick={() => goToOrdersPage(page)}
                                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium ${ordersPage === page ? "bg-primary text-white" : "border border-border bg-background text-slate-600 hover:bg-slate-50"}`}
                                  >
                                    {page}
                                  </button>
                                </div>
                              );
                            })}

                          <button
                            onClick={() => goToOrdersPage(ordersPage + 1)}
                            disabled={ordersPage === totalOrderPages}
                            className="rounded-lg border border-border bg-background p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-border bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => toggleBlock(selectedUser)}
                  disabled={processingId === selectedUser.id}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${selectedUser.is_blocked ? "bg-primary text-white hover:bg-primary/90" : "border border-orange-200 bg-background text-orange-600 hover:bg-orange-50"}`}
                >
                  {processingId === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : selectedUser.is_blocked ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  {selectedUser.is_blocked ? "Unblock Customer" : "Block Customer"}
                </button>

                <button
                  onClick={() => deleteCustomer(selectedUser.id)}
                  disabled={processingId === selectedUser.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-background px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {processingId === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* ORDER HEADER */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Order #{selectedOrder.order_number}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClass(selectedOrder.status)}`}>{selectedOrder.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(selectedOrder.created_at)}</p>
              </div>

              <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ORDER CONTENT */}
            <div className="max-h-[62vh] overflow-y-auto p-5">
              {/* ORDER INFORMATION */}
              <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <OrderInfo label="Payment Method" value={selectedOrder.payment_method || "N/A"} />
                <OrderInfo
                  label="Payment Status"
                  value={selectedOrder.payment_status || "Pending"}
                  badge
                  badgePositive={selectedOrder.payment_status?.toLowerCase() === "paid"}
                />
                <OrderInfo label="Delivery Method" value={selectedOrder.fulfillment || "N/A"} />
              </div>

              {/* ORDER ITEMS */}
              <div className="rounded-xl border border-border bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Order Items</h3>
                  <span className="text-xs text-slate-500">
                    {selectedOrder.items?.length || 0} item{selectedOrder.items?.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => {
                    const imageUrl = item.product?.images?.[0]?.image_url
                      ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${item.product.images[0].image_url}`
                      : null;

                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
                        {/* IMAGE */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-slate-50">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.product?.name || "Product"}
                                className="h-full w-full object-contain p-1"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ) : (
                              <Package className="h-5 w-5 text-slate-300" />
                            )}
                          </div>

                          <div className="min-w-0">
                            {item.product?.seller?.store_name && (
                              <p className="mt-0.5 flex gap-1 truncate text-[10px] font-medium text-primary">
                                <Store  className="h-3 w-3"/> {item.product.seller.store_name}
                              </p>
                            )}

                            <p className="line-clamp-2 text-xs font-semibold text-slate-900">{item.product?.name || "Product"}</p>

                            {(item.product?.model || item.product?.storage || item.product?.color) && (
                              <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                {[item.product?.model, item.product?.storage, item.product?.color].filter(Boolean).join(" • ")}
                              </p>
                            )}

                            <p className="mt-0.5 text-[10px] text-slate-500">Qty: {item.quantity}</p>
                          </div>
                        </div>

                        <p className="shrink-0 text-xs font-bold text-slate-900">{formatMoney(item.price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRICE SUMMARY */}
              <div className="mt-4 rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Price Summary</h3>

                <div className="space-y-2">
                  <PriceRow label="Subtotal" value={formatMoney(selectedOrder.subtotal)} />
                  <PriceRow label="Delivery Fee" value={formatMoney(selectedOrder.delivery_fee)} />

                  <PriceRow
                    label={selectedOrder.payment_method === "paystack" ? "Paystack Fee" : "Bank Transaction Fee"}
                    value={formatMoney(selectedOrder.transaction_fee)}
                  />

                  <PriceRow label="Discount" value={`- ${formatMoney(selectedOrder.discount)}`} />

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm font-semibold text-slate-900">Total</span>
                    <span className="text-base font-bold text-slate-900">{formatMoney(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-border bg-slate-50 p-3">
              <button onClick={() => setSelectedOrder(null)} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Close Order Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* AVATAR */
const Avatar = ({ name }: { name: string }) => {
  const initials = name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();

  return <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary"> {initials || "U"} </div>;
};

/* DETAIL CARD */
interface DetailProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}

const Detail = ({ icon, label, value }: DetailProps) => (
  <div className="rounded-xl border border-border bg-slate-50 p-4">
    <div className="mb-2 flex items-center gap-2 text-slate-500">
      <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"> {icon} </span>
      <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
    </div>
    <p className="break-words text-sm font-medium text-slate-900">{formatDetailValue(value)}</p>
  </div>
);

const formatDetailValue = (value?: string | null) => value && value.trim() ? value : "Not provided";

/* MINI STAT */
interface MiniStatProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}

const MiniStat = ({ icon, value, label }: MiniStatProps) => (
  <div className="rounded-xl border border-border bg-slate-50 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"> {icon} </div>
    </div>
  </div>
);

/* ORDER INFO */
interface OrderInfoProps {
  label: string;
  value: string;
  badge?: boolean;
  badgePositive?: boolean;
}

const OrderInfo = ({ label, value, badge = false, badgePositive = false }: OrderInfoProps) => (
  <div className="rounded-xl border border-border bg-slate-50 p-3">
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>

    {badge ? (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${badgePositive ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
        {value}
      </span>
    ) : (
      <p className="break-words text-sm font-semibold text-slate-900"> {value} </p>
    )}
  </div>
);

/* PRICE ROW */
const PriceRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 text-xs">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-700">{value}</span>
  </div>
);

export default Customers;