import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ShieldAlert,
  Mail,
  Calendar,
  Check,
  X,
  Phone,
  MapPin,
  Store,
  Building2,
  UserRound,
  FileText,
  Eye,
  Loader2,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";
import Sidebar from "@/components/SuperAdmin/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface SellerSignupRequest {
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
  created_at: string;
}

interface DetailProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  full?: boolean;
}

const SellerSignupRequests = () => {
  const { user } = useAuth();

  const [requests, setRequests] = useState<SellerSignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<SellerSignupRequest | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://127.0.0.1:8000/api/superadmin/seller-requests",
        config
      );

      setRequests(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.status === 401
          ? "Unauthorized"
          : "Failed to fetch seller requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const approveSeller = async (id: number) => {
    try {
      setProcessingId(id);

      await axios.post(
        `http://127.0.0.1:8000/api/superadmin/seller-request/${id}/approve`,
        {},
        config
      );

      setRequests(prev => prev.filter(request => request.id !== id));
      setSelectedSeller(null);
      toast.success("Seller approved successfully");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.status === 401
          ? "Unauthorized"
          : "Failed to approve seller"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const rejectSeller = async (id: number) => {
    try {
      setProcessingId(id);

      await axios.delete(
        `http://127.0.0.1:8000/api/superadmin/seller-request/${id}`,
        config
      );

      setRequests(prev => prev.filter(request => request.id !== id));
      setSelectedSeller(null);
      toast.success("Seller request rejected");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.status === 401
          ? "Unauthorized"
          : "Failed to reject seller"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatValue = (value?: string | null) =>
    value && value.trim() ? value : "Not provided";

  const formatDate = (date?: string | null) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : "Not provided";

  const filteredRequests = useMemo(() => {
    let result = [...requests];
    const term = search.trim().toLowerCase();

    if (term) {
      result = result.filter(request =>
        [request.name, request.store_name, request.email, request.phone]
          .some(value => value?.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        request => (request.status || "pending").toLowerCase() === statusFilter
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return sortFilter === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [requests, search, statusFilter, sortFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / itemsPerPage)
  );

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortFilter, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortFilter("newest");
    setItemsPerPage(10);
    setCurrentPage(1);
  };

  const stats = useMemo(() => {
    const pending = requests.filter(
      request => (request.status || "pending").toLowerCase() === "pending"
    ).length;

    const approved = requests.filter(
      request => request.status?.toLowerCase() === "approved"
    ).length;

    const rejected = requests.filter(
      request => request.status?.toLowerCase() === "rejected"
    ).length;

    return [
      {
        label: "Total Requests",
        count: requests.length,
        icon: <Store className="w-5 h-5" />,
        color: "bg-primary/10 text-primary"
      },
      {
        label: "Pending",
        count: pending,
        icon: <Clock className="w-5 h-5" />,
        color: "bg-orange-100 text-orange-700"
      },
      {
        label: "Reviewed",
        count: approved + rejected,
        icon: <Check className="w-5 h-5" />,
        color: "bg-green-100 text-green-700"
      }
    ];
  }, [requests]);

  const pendingRequests = stats[1].count;

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <div className="flex-1 p-3 lg:p-3 mt-14 lg:mt-0 h-screen overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-4">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Seller Requests
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Review and manage seller applications.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-semibold text-slate-700 shadow-sm w-fit">
              <ShieldAlert className="w-4 h-4 text-primary" />
              {pendingRequests} Pending
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.map(stat => (
              <StatCard
                key={stat.label}
                label={stat.label}
                count={stat.count}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>

          {/* FILTERS */}
          {!loading && requests.length > 0 && (
            <div className="glass-card bg-background border border-border rounded-2xl p-4 shadow-sm">
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

                <SelectField
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    ["all", "All Requests"],
                    ["pending", "Pending"],
                    ["approved", "Approved"],
                    ["rejected", "Rejected"]
                  ]}
                />

                <SelectField
                  value={sortFilter}
                  onChange={setSortFilter}
                  options={[
                    ["newest", "Newest First"],
                    ["oldest", "Oldest First"]
                  ]}
                />
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredRequests.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {requests.length}
                  </span>{" "}
                  requests
                </p>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="glass-card bg-background border border-border rounded-2xl p-12 flex items-center justify-center text-slate-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary" />
              Loading seller requests...
            </div>
          )}

          {/* EMPTY */}
          {!loading && requests.length === 0 && (
            <div className="glass-card bg-background border border-border rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Check className="w-7 h-7 text-primary" />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                No Seller Requests
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                There are currently no seller applications.
              </p>
            </div>
          )}

          {/* NO RESULTS */}
          {!loading && requests.length > 0 && filteredRequests.length === 0 && (
            <div className="glass-card bg-background border border-border rounded-2xl p-12 text-center">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />

              <h2 className="text-lg font-semibold text-slate-900">
                No Matching Requests
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

          {/* TABLE */}
          {!loading && paginatedRequests.length > 0 && (
            <div className="glass-card bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-4 border-b border-border flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Seller Applications
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Review and manage seller applications.
                  </p>
                </div>

                <span className="text-xs text-slate-500">
                  {filteredRequests.length} result
                  {filteredRequests.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-border">
                      {["Seller", "Store", "Contact", "Applied", "Status", "Actions"].map((heading, index) => (
                        <th
                          key={heading}
                          className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide ${
                            index === 5 ? "text-right" : "text-left"
                          }`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {paginatedRequests.map(request => {
                      const initials = request.name
                        ?.split(" ")
                        .map(word => word[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      const isProcessing = processingId === request.id;

                      return (
                        <tr
                          key={request.id}
                          className="hover:bg-primary/[0.03] transition"
                        >
                          {/* SELLER */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {request.avatar ? (
                                <img
                                  src={request.avatar}
                                  alt={request.name}
                                  className="w-9 h-9 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                  {initials || "S"}
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-sm text-slate-900">
                                  {request.name}
                                </p>

                                <p className="text-[11px] text-slate-500">
                                  Seller #{request.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* STORE */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Store className="w-4 h-4 text-slate-400" />

                              <span className="max-w-[180px] truncate">
                                {formatValue(request.store_name)}
                              </span>
                            </div>
                          </td>

                          {/* CONTACT */}
                          <td className="px-4 py-3.5">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />

                                <span className="max-w-[220px] truncate">
                                  {request.email}
                                </span>
                              </div>

                              {request.phone && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  {request.phone}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* DATE */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {formatDate(request.created_at)}
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-semibold">
                              <Clock className="w-3.5 h-3.5" />
                              Pending
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedSeller(request)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>

                              <button
                                onClick={() => approveSeller(request.id)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium transition disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                Approve
                              </button>

                              <button
                                onClick={() => rejectSeller(request.id)}
                                disabled={isProcessing}
                                className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5" />
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
              <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3">
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

                <div className="flex items-center gap-3">
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
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-border bg-background text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .filter(page =>
                        totalPages <= 5 ||
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => {
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
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

      {/* DETAILS MODAL */}
      {selectedSeller && (
        <SellerDetailsModal
          seller={selectedSeller}
          processingId={processingId}
          onClose={() => setSelectedSeller(null)}
          onApprove={approveSeller}
          onReject={rejectSeller}
          formatValue={formatValue}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

/* STAT CARD */

const StatCard = ({
  label,
  count,
  icon,
  color
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="glass-card rounded-2xl p-4 border border-border bg-background shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="text-2xl font-bold text-slate-900 mt-1">
          {count}
        </p>
      </div>

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

/* SELECT FIELD */

const SelectField = ({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="h-10 px-3 rounded-xl border border-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-slate-700"
  >
    {options.map(([optionValue, label]) => (
      <option key={optionValue} value={optionValue}>
        {label}
      </option>
    ))}
  </select>
);

/* SELLER DETAILS MODAL */

interface SellerDetailsModalProps {
  seller: SellerSignupRequest;
  processingId: number | null;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  formatValue: (value?: string | null) => string;
  formatDate: (date?: string | null) => string;
}

const SellerDetailsModal = ({
  seller,
  processingId,
  onClose,
  onApprove,
  onReject,
  formatValue,
  formatDate
}: SellerDetailsModalProps) => {
  const isProcessing = processingId === seller.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-11 h-11 rounded-xl object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                {seller.name
                  ?.split(" ")
                  .map(word => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Seller Details
              </h2>

              <p className="text-xs text-slate-500">
                Application #{seller.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {seller.name}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {formatValue(seller.store_name)}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">
              <Clock className="w-4 h-4" />
              Pending Approval
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Detail icon={<UserRound />} label="Full Name" value={seller.name} />
            <Detail icon={<Store />} label="Store Name" value={seller.store_name} />
            <Detail icon={<Mail />} label="Email" value={seller.email} />
            <Detail icon={<Phone />} label="Phone" value={seller.phone} />
            <Detail icon={<MapPin />} label="Personal Address" value={seller.address} />
            <Detail icon={<Building2 />} label="Business Address" value={seller.business_address} />
            <Detail icon={<FileText />} label="Contact Information" value={seller.contact_information} full />
            <Detail icon={<Calendar />} label="Application Date" value={formatDate(seller.created_at)} />
            <Detail icon={<ShieldAlert />} label="Account Status" value={seller.status} />
            <Detail icon={<ShieldAlert />} label="Verification" value={seller.verification_status} />
          </div>

          {seller.google_id && (
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

        {/* ACTIONS */}
        <div className="p-4 border-t border-border bg-slate-50">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onReject(seller.id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-background text-red-600 hover:bg-red-50 text-sm font-semibold transition disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Reject Application
            </button>

            <button
              onClick={() => onApprove(seller.id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Approve Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* DETAIL */

const Detail = ({ icon, label, value, full }: DetailProps) => (
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

export default SellerSignupRequests;