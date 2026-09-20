import { useEffect,useMemo,useState } from "react";
import axios from "axios";
import {
  ShieldCheck,Mail,Calendar,Phone,MapPin,Store,Building2,
  UserRound,FileText,Eye,X,Search,ChevronLeft,ChevronRight,
  SlidersHorizontal,Loader2,ShieldAlert,Ban,Trash2,Package
} from "lucide-react";
import Sidebar from "@/components/SuperAdmin/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Seller {
  id: number;
  name: string;
  store_name?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  business_address?: string | null;
  contact_information?: string | null;
  google_id?: string | null;
  avatar?: string | null;
  role?: string;
  status?: string;
  verification_status?: string;
  is_blocked?: boolean;
  approved_at?: string | null;
  created_at: string;
  products_count?: number;
}

const Sellers = () => {
  const { user } = useAuth();

  const [sellers,setSellers] = useState<Seller[]>([]);
  const [loading,setLoading] = useState(true);
  const [selectedSeller,setSelectedSeller] = useState<Seller | null>(null);
  const [processingId,setProcessingId] = useState<number | null>(null);

  const [search,setSearch] = useState("");
  const [statusFilter,setStatusFilter] = useState("all");
  const [sortFilter,setSortFilter] = useState("newest");
  const [itemsPerPage,setItemsPerPage] = useState(10);
  const [currentPage,setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://127.0.0.1:8000/api/superadmin/sellers",
        config
      );

      setSellers(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error: any) {
      console.error("Error fetching sellers:",error);

      toast.error(
        error.response?.status === 401
          ? "Unauthorized"
          : "Failed to fetch sellers"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value?: string | null) =>
    value && value.trim() ? value : "Not provided";

  const formatDate = (date?: string | null) =>
    date
      ? new Date(date).toLocaleDateString("en-US",{
          day:"numeric",
          month:"short",
          year:"numeric"
        })
      : "Not provided";

  const filteredSellers = useMemo(() => {
    let result = [...sellers];
    const term = search.trim().toLowerCase();

    if (term) {
      result = result.filter(seller =>
        [seller.name,seller.store_name,seller.email,seller.phone].some(
          value => value?.toLowerCase().includes(term)
        )
      );
    }

    if (statusFilter === "active") {
      result = result.filter(
        seller => !seller.is_blocked && seller.status !== "blocked"
      );
    }

    if (statusFilter === "blocked") {
      result = result.filter(
        seller => seller.is_blocked || seller.status === "blocked"
      );
    }

    result.sort((a,b) => {
      const dateA = new Date(a.approved_at || a.created_at).getTime();
      const dateB = new Date(b.approved_at || b.created_at).getTime();

      return sortFilter === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  },[sellers,search,statusFilter,sortFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSellers.length / itemsPerPage)
  );

  const paginatedSellers = filteredSellers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  },[search,statusFilter,sortFilter,itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  },[currentPage,totalPages]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortFilter("newest");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  const toggleBlock = async (seller: Seller) => {
    try {
      setProcessingId(seller.id);

      await axios.patch(
        `http://127.0.0.1:8000/api/superadmin/sellers/${seller.id}/block`,
        {},
        config
      );

      const blocked = !seller.is_blocked;

      setSellers(prev =>
        prev.map(item =>
          item.id === seller.id
            ? {
                ...item,
                is_blocked: blocked,
                status: blocked ? "blocked" : "active"
              }
            : item
        )
      );

      setSelectedSeller(prev =>
        prev
          ? {
              ...prev,
              is_blocked: blocked,
              status: blocked ? "blocked" : "active"
            }
          : null
      );

      toast.success(
        blocked
          ? "Seller blocked successfully"
          : "Seller unblocked successfully"
      );
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update seller"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const deleteSeller = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this seller?")) {
      return;
    }

    try {
      setProcessingId(id);

      await axios.delete(
        `http://127.0.0.1:8000/api/superadmin/sellers/${id}`,
        config
      );

      setSellers(prev => prev.filter(seller => seller.id !== id));
      setSelectedSeller(null);

      toast.success("Seller deleted successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to delete seller"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const activeSellers = sellers.filter(
    seller => !seller.is_blocked && seller.status !== "blocked"
  ).length;

  const blockedSellers = sellers.filter(
    seller => seller.is_blocked || seller.status === "blocked"
  ).length;

  const stats = [
    {
      label:"Total Sellers",
      count:sellers.length,
      icon:<Store className="w-5 h-5" />,
      color:"bg-primary/10 text-primary"
    },
    {
      label:"Active",
      count:activeSellers,
      icon:<ShieldCheck className="w-5 h-5" />,
      color:"bg-green-100 text-green-700"
    },
    {
      label:"Blocked",
      count:blockedSellers,
      icon:<Ban className="w-5 h-5" />,
      color:"bg-red-100 text-red-700"
    }
  ];

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <div className="flex-1 p-3 lg:p-3 mt-14 lg:mt-0 h-screen overflow-y-auto">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Sellers
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                View and manage approved sellers on AESTRA.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-semibold text-slate-700 shadow-sm w-fit">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {sellers.length} Sellers
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {stats.map(stat => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl p-4 border border-border bg-background shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {stat.count}
                    </p>
                  </div>

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && sellers.length > 0 && (
            <div className="glass-card bg-background border border-border rounded-2xl p-4 mb-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-slate-900">
                    Search & Filters
                  </h2>
                </div>

                {(search || statusFilter !== "all" || sortFilter !== "newest") && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-primary hover:text-primary/80"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search seller, store, email or phone..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-700"
                >
                  <option value="all">All Sellers</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>

                <select
                  value={sortFilter}
                  onChange={e => setSortFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 pt-3 border-t border-border">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredSellers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {sellers.length}
                  </span>{" "}
                  sellers
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="glass-card bg-background border border-border rounded-2xl p-12 flex items-center justify-center text-slate-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary" />
              Loading sellers...
            </div>
          )}

          {!loading && sellers.length === 0 && (
            <div className="glass-card bg-background border border-border rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Store className="w-7 h-7 text-primary" />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                No Sellers
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                There are currently no approved sellers.
              </p>
            </div>
          )}

          {!loading && sellers.length > 0 && filteredSellers.length === 0 && (
            <div className="glass-card bg-background border border-border rounded-2xl p-12 text-center">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />

              <h2 className="text-lg font-semibold text-slate-900">
                No Matching Sellers
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-4">
                Try changing your search or filters.
              </p>

              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!loading && paginatedSellers.length > 0 && (
            <div className="glass-card bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Seller Directory
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage approved sellers and their account status.
                  </p>
                </div>

                <span className="text-xs text-slate-500">
                  {filteredSellers.length} result{filteredSellers.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-border">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Seller
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Store
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Contact
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Joined
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {paginatedSellers.map(seller => {
                      const initials = seller.name
                        ?.split(" ")
                        .map(word => word[0])
                        .join("")
                        .slice(0,2)
                        .toUpperCase();

                      const blocked =
                        seller.is_blocked || seller.status === "blocked";

                      const isProcessing = processingId === seller.id;

                      return (
                        <tr
                          key={seller.id}
                          className="hover:bg-primary/[0.03] transition"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {seller.avatar ? (
                                <img
                                  src={seller.avatar}
                                  alt={seller.name}
                                  className="w-9 h-9 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                  {initials || "S"}
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-sm text-slate-900">
                                  {seller.name}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Seller #{seller.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Store className="w-4 h-4 text-slate-400" />
                              <span className="max-w-[180px] truncate">
                                {formatValue(seller.store_name)}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span className="max-w-[220px] truncate">
                                  {seller.email}
                                </span>
                              </div>

                              {seller.phone && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  {seller.phone}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {formatDate(seller.approved_at || seller.created_at)}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${blocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                              {blocked ? (
                                <Ban className="w-3.5 h-3.5" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                              {blocked ? "Blocked" : "Active"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedSeller(seller)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>

                              <button
                                onClick={() => toggleBlock(seller)}
                                disabled={isProcessing}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                                  blocked
                                    ? "bg-primary hover:bg-primary/90 text-white"
                                    : "border border-orange-200 text-orange-600 hover:bg-orange-50"
                                }`}
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : blocked ? (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                ) : (
                                  <Ban className="w-3.5 h-3.5" />
                                )}
                                {blocked ? "Unblock" : "Block"}
                              </button>

                              <button
                                onClick={() => deleteSeller(seller.id)}
                                disabled={isProcessing}
                                className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                title="Delete seller"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Rows per page
                  </span>

                  <select
                    value={itemsPerPage}
                    onChange={e => setItemsPerPage(Number(e.target.value))}
                    className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-slate-700 focus:outline-none focus:border-primary"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <p className="text-xs text-slate-500">
                    Page{" "}
                    <span className="font-semibold text-slate-700">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1,prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-border bg-background text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages },(_,index) => index + 1)
                      .filter(page =>
                        totalPages <= 5 ||
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      )
                      .map((page,index,array) => {
                        const previousPage = array[index - 1];

                        return (
                          <div key={page} className="flex items-center">
                            {previousPage && page - previousPage > 1 && (
                              <span className="px-1 text-slate-400 text-xs">
                                ...
                              </span>
                            )}

                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium transition ${
                                currentPage === page
                                  ? "bg-primary text-white"
                                  : "border border-border bg-background text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages,prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-border bg-background text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSeller && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setSelectedSeller(null)}
        >
          <div
            className="bg-background w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedSeller.avatar ? (
                  <img
                    src={selectedSeller.avatar}
                    alt={selectedSeller.name}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {selectedSeller.name
                      ?.split(" ")
                      .map(word => word[0])
                      .join("")
                      .slice(0,2)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Seller Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Seller #{selectedSeller.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSeller(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedSeller.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatValue(selectedSeller.store_name)}
                  </p>
                </div>

                <span className={`inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full text-xs font-semibold ${
                  selectedSeller.is_blocked || selectedSeller.status === "blocked"
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}>
                  {selectedSeller.is_blocked || selectedSeller.status === "blocked" ? (
                    <Ban className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {selectedSeller.is_blocked || selectedSeller.status === "blocked" ? "Blocked" : "Approved Seller"}
                </span>
              </div>

              <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary">
                    <Package className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      Products Created
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedSeller.products_count ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Detail icon={<UserRound />} label="Full Name" value={selectedSeller.name} />
                <Detail icon={<Store />} label="Store Name" value={selectedSeller.store_name} />
                <Detail icon={<Mail />} label="Email" value={selectedSeller.email} />
                <Detail icon={<Phone />} label="Phone" value={selectedSeller.phone} />
                <Detail icon={<MapPin />} label="Personal Address" value={selectedSeller.address} />
                <Detail icon={<Building2 />} label="Business Address" value={selectedSeller.business_address} />
                <Detail icon={<FileText />} label="Contact Information" value={selectedSeller.contact_information} full />
                <Detail icon={<Calendar />} label="Joined" value={formatDate(selectedSeller.created_at)} />
                <Detail icon={<ShieldCheck />} label="Approved" value={formatDate(selectedSeller.approved_at)} />
                <Detail icon={<ShieldAlert />} label="Verification" value={selectedSeller.verification_status} />
              </div>

              {selectedSeller.google_id && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[11px] font-semibold text-blue-700">
                    AUTHENTICATION
                  </p>
                  <p className="text-sm text-blue-900 mt-1">
                    This seller registered using Google authentication.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-slate-50">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => toggleBlock(selectedSeller)}
                  disabled={processingId === selectedSeller.id}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
                    selectedSeller.is_blocked || selectedSeller.status === "blocked"
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : "border border-orange-200 bg-background text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  {processingId === selectedSeller.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : selectedSeller.is_blocked || selectedSeller.status === "blocked" ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  {selectedSeller.is_blocked || selectedSeller.status === "blocked" ? "Unblock Seller" : "Block Seller"}
                </button>

                <button
                  onClick={() => deleteSeller(selectedSeller.id)}
                  disabled={processingId === selectedSeller.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-background text-red-600 hover:bg-red-50 text-sm font-semibold transition disabled:opacity-50"
                >
                  {processingId === selectedSeller.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DetailProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  full?: boolean;
}

const Detail = ({ icon,label,value,full }: DetailProps) => (
  <div className={`rounded-xl border border-border bg-slate-50 p-4 ${full ? "sm:col-span-2" : ""}`}>
    <div className="flex items-center gap-2 text-slate-500 mb-2">
      <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">
        {icon}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>

    <p className="text-sm font-medium text-slate-900 break-words">
      {value && value.trim() ? value : "Not provided"}
    </p>
  </div>
);

export default Sellers;