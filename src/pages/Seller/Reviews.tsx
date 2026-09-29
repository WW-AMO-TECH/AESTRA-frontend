import { useEffect, useMemo, useState } from "react";
import axios from "@/api/axios";
import {
  Star,
  Search,
  Eye,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarDays,
  UserRound,
  Package,
} from "lucide-react";
import Sidebar from "@/components/Seller/Sidebar";
import { useAuth } from "@/context/AuthContext";

/* REVIEW */
interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  review: string;
  edit_count: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
  product?: {
  id: number;
  name: string;
  seller_id: number;
  images?: {
    id: number;
    image: string;
  }[];
};
}

/* STARS */
const Stars = ({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-slate-300"
          }
        />
      ))}
    </div>
  );
};

/* STATUS BADGE */
const StatusBadge = ({ status }: { status: Review["status"] }) => {
  const config = {
    approved: {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-600",
      icon: CheckCircle2,
    },
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-600",
      icon: Clock3,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-50 text-red-600",
      icon: XCircle,
    },
  };

  const item = config[status] || config.pending;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.className}`}
    >
      <Icon size={13} />
      {item.label}
    </span>
  );
};

/* STAT CARD */
const StatCard = ({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

/* ACTION BUTTON */
const ActionButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
    >
      {icon}
    </button>
  );
};

export default function SellerReviews() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  /* FETCH REVIEWS */
  const fetchReviews = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get("/seller/reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch seller reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchReviews();
    }
  }, [user?.id]);

  /* STATS */
  const stats = useMemo(() => {
    return {
      total: reviews.length,
      pending: reviews.filter((review) => review.status === "pending").length,
      approved: reviews.filter((review) => review.status === "approved")
        .length,
      rejected: reviews.filter((review) => review.status === "rejected")
        .length,
    };
  }, [reviews]);

  /* FILTER */
  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        review.user?.name?.toLowerCase().includes(query) ||
        review.product?.name?.toLowerCase().includes(query) ||
        review.review?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || review.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, search, statusFilter]);

  /* PAGINATION */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / itemsPerPage)
  );

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    };

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <main className="mt-14 h-screen flex-1 overflow-y-auto p-3 lg:mt-0 lg:p-3">
        {/* HEADER */}
        <div className="mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Reviews</h1>

            <p className="mt-0.5 text-xs text-slate-500">
              Reviews from customers who purchased your products
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Reviews"
            value={stats.total}
            icon={<Star size={20} className="text-primary" />}
            iconClass="bg-primary/10"
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock3 size={20} className="text-amber-600" />}
            iconClass="bg-amber-50"
          />

          <StatCard
            label="Approved"
            value={stats.approved}
            icon={<CheckCircle2 size={20} className="text-emerald-600" />}
            iconClass="bg-emerald-50"
          />

          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={<XCircle size={20} className="text-red-600" />}
            iconClass="bg-red-50"
          />
        </div>

        {/* FILTERS */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, product or review..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : paginatedReviews.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Star size={26} />
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                No reviews found
              </h3>

              <p className="mt-1 max-w-sm text-xs text-slate-500">
                {search || statusFilter !== "all"
                  ? "Try changing your search or filter."
                  : "Your product reviews will appear here."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Customer
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Rating
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Review
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedReviews.map((review) => (
                      <tr
                        key={review.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        {/* CUSTOMER */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <UserRound size={16} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {review.user?.name || "Unknown Customer"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* PRODUCT */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <Package size={15} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[180px] truncate text-sm font-medium text-slate-700">
                                {review.product?.name || "Unknown Product"}
                              </p>

                              <p className="text-[10px] text-slate-400">
                                Product #{review.product_id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* RATING */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Stars rating={review.rating} size={14} />

                            <span className="text-xs font-semibold text-slate-600">
                              {review.rating}.0
                            </span>
                          </div>
                        </td>

                        {/* REVIEW */}
                        <td className="max-w-[280px] px-4 py-3">
                          <p className="truncate text-sm text-slate-600">
                            {review.review}
                          </p>
                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-3">
                          <StatusBadge status={review.status} />
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <ActionButton
                              icon={<Eye size={15} />}
                              label="View Review"
                              onClick={() => setSelectedReview(review)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredReviews.length === 0
                      ? 0
                      : (currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredReviews.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredReviews.length}
                  </span>{" "}
                  reviews
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;

                      if (currentPage <= 3) {
                        return page <= 5;
                      }

                      if (currentPage >= totalPages - 2) {
                        return page >= totalPages - 4;
                      }

                      return (
                        page >= currentPage - 2 && page <= currentPage + 2
                      );
                    })
                    .map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                          currentPage === page
                            ? "bg-primary text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* VIEW REVIEW MODAL */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Review Details
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Customer feedback for your product
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={17} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-4 p-5">
              {/* CUSTOMER */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRound size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedReview.user?.name || "Unknown Customer"}
                  </p>
                </div>
              </div>

              {/* PRODUCT */}
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </p>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Package size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedReview.product?.name || "Unknown Product"}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Product #{selectedReview.product_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* RATING */}
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Rating
                </p>

                <div className="flex items-center gap-3">
                  <Stars rating={selectedReview.rating} size={19} />

                  <span className="text-sm font-semibold text-slate-700">
                    {selectedReview.rating}.0 / 5
                  </span>
                </div>
              </div>

              {/* REVIEW */}
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Review
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {selectedReview.review}
                  </p>
                </div>
              </div>

              {/* META */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                    <CalendarDays size={13} />

                    <span className="text-[10px] font-semibold uppercase tracking-wide">
                      Submitted
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-700">
                    {formatDateTime(selectedReview.created_at)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </div>

                  <StatusBadge status={selectedReview.status} />
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}