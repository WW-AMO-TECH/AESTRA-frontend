import { useEffect, useState } from "react";
import axios from "@/api/axios";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/SuperAdmin/Sidebar";

interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  review: string;
  edit_count: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  status: "pending" | "approved" | "rejected";

  user?: {
    id: number;
    name: string;
    email: string;
  };

  product?: {
    id: number;
    name: string;
  };
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

const Reviews = () => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");

  const [selectedReview, setSelectedReview] =
    useState<Review | null>(null);

  const [editingReview, setEditingReview] =
    useState<Review | null>(null);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* --------------------------------
     PAGINATION
  -------------------------------- */

  const [currentPage, setCurrentPage] = useState(1);

  const reviewsPerPage = 10;

  /* --------------------------------
     HEADERS
  -------------------------------- */

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
  });

  /* --------------------------------
     FETCH REVIEWS
  -------------------------------- */

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/admin/reviews", {
        headers: headers(),
      });

      setReviews(response.data.reviews || []);
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  /* --------------------------------
     FILTER
  -------------------------------- */

  const filteredReviews = reviews.filter((review) => {
    const searchTerm = search.toLowerCase().trim();

    const matchesSearch =
      !searchTerm ||
      review.user?.name
        ?.toLowerCase()
        .includes(searchTerm) ||
      review.user?.email
        ?.toLowerCase()
        .includes(searchTerm) ||
      review.product?.name
        ?.toLowerCase()
        .includes(searchTerm) ||
      review.review
        ?.toLowerCase()
        .includes(searchTerm);

    const matchesStatus =
      status === "all" || review.status === status;

    return matchesSearch && matchesStatus;
  });

  /* --------------------------------
     PAGINATION
  -------------------------------- */

  const totalPages = Math.ceil(
    filteredReviews.length / reviewsPerPage
  );

  const startIndex =
    (currentPage - 1) * reviewsPerPage;

  const paginatedReviews = filteredReviews.slice(
    startIndex,
    startIndex + reviewsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  /* --------------------------------
     STATISTICS
  -------------------------------- */

  const total = reviews.length;

  const pending = reviews.filter(
    (review) => review.status === "pending"
  ).length;

  const approved = reviews.filter(
    (review) => review.status === "approved"
  ).length;

  const rejected = reviews.filter(
    (review) => review.status === "rejected"
  ).length;

  /* --------------------------------
     STARS
  -------------------------------- */

  const Stars = ({
    value,
    interactive = false,
  }: {
    value: number;
    interactive?: boolean;
  }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={interactive ? 25 : 15}
          onClick={() =>
            interactive && setRating(star)
          }
          className={`${
            star <= value
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          } ${
            interactive
              ? "cursor-pointer transition hover:scale-110"
              : ""
          }`}
        />
      ))}
    </div>
  );

  /* --------------------------------
     APPROVE
  -------------------------------- */

  const approveReview = async (id: number) => {
    try {
      setError("");

      await axios.patch(
        `/admin/reviews/${id}/approve`,
        {},
        { headers: headers() }
      );

      setMessage("Review approved successfully.");

      setSelectedReview(null);

      await fetchReviews();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to approve review."
      );
    }
  };

  /* --------------------------------
     REJECT
  -------------------------------- */

  const rejectReview = async (id: number) => {
    try {
      setError("");

      await axios.patch(
        `/admin/reviews/${id}/reject`,
        {},
        { headers: headers() }
      );

      setMessage("Review rejected successfully.");

      setSelectedReview(null);

      await fetchReviews();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to reject review."
      );
    }
  };

  /* --------------------------------
     DELETE
  -------------------------------- */

  const deleteReview = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `/admin/reviews/${id}`,
        {
          headers: headers(),
        }
      );

      setMessage("Review deleted successfully.");

      setSelectedReview(null);

      await fetchReviews();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to delete review."
      );
    }
  };

  /* --------------------------------
     START EDIT
  -------------------------------- */

  const startEditing = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setReviewText(review.review);
    setSelectedReview(null);
    setError("");
  };

  /* --------------------------------
     SAVE EDIT
  -------------------------------- */

  const saveEdit = async () => {
    if (!editingReview) return;

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      setError("Review cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.put(
        `/admin/reviews/${editingReview.id}`,
        {
          rating,
          review: reviewText,
        },
        {
          headers: headers(),
        }
      );

      setMessage("Review updated successfully.");

      closeEdit();

      await fetchReviews();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to update review."
      );
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------
     CLOSE EDIT
  -------------------------------- */

  const closeEdit = () => {
    setEditingReview(null);
    setRating(0);
    setReviewText("");
  };

  /* --------------------------------
     STATUS BADGE
  -------------------------------- */

  const StatusBadge = ({
    review,
  }: {
    review: Review;
  }) => {
    const styles = {
      approved:
        "bg-green-50 text-green-700",
      pending:
        "bg-orange-50 text-orange-700",
      rejected:
        "bg-red-50 text-red-700",
    };

    return (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          styles[review.status]
        }`}
      >
        {review.status.charAt(0).toUpperCase() +
          review.status.slice(1)}
      </span>
    );
  };

  /* --------------------------------
     UI
  -------------------------------- */

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar user={user} />

      <main className="flex-1 p-3 lg:p-4 lg:py-0 mt-12 lg:mt-0 h-screen overflow-y-auto">
        {/* HEADER */}

        <div className="p-4 lg:pt-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Reviews
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer reviews and ratings.
          </p>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              className="rounded p-1 hover:bg-green-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="rounded p-1 hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Reviews"
            value={total}
          />

          <StatCard
            title="Pending"
            value={pending}
            valueClass="text-orange-500"
          />

          <StatCard
            title="Approved"
            value={approved}
            valueClass="text-green-600"
          />

          <StatCard
            title="Rejected"
            value={rejected}
            valueClass="text-red-500"
          />
        </div>

        {/* FILTERS */}

        <div className="mb-5 rounded-xl border bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search reviews..."
                className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-500"
              />
            </div>

            {/* STATUS */}

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as FilterStatus
                )
              }
              className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500"
            >
              <option value="all">
                All Reviews
              </option>
              <option value="pending">
                Pending
              </option>
              <option value="approved">
                Approved
              </option>
              <option value="rejected">
                Rejected
              </option>
            </select>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border bg-white mb-2">
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-500">
              Loading reviews...
            </div>
          ) : paginatedReviews.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-medium text-gray-700">
                No reviews found
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b bg-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="px-4 py-4">
                      Customer
                    </th>

                    <th className="px-4 py-4">
                      Product
                    </th>

                    <th className="px-4 py-4">
                      Rating
                    </th>

                    <th className="px-4 py-4">
                      Review
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-4 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {paginatedReviews.map((review) => (
                    <tr
                      key={review.id}
                      className="hover:bg-gray-50"
                    >
                      {/* CUSTOMER */}

                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {review.user?.name ||
                            "Customer"}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          {review.user?.email}
                        </p>

                        <span className="mt-2 inline-flex rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-500">
                          Edits: {review.edit_count}
                        </span>
                      </td>

                      {/* PRODUCT */}

                      <td className="px-4 py-4">
                        <p className="max-w-[180px] truncate text-sm text-gray-700">
                          {review.product?.name ||
                            "Product"}
                        </p>
                      </td>

                      {/* RATING */}

                      <td className="px-4 py-4">
                        <Stars value={review.rating} />
                      </td>

                      {/* REVIEW */}

                      <td className="max-w-[280px] px-4 py-4">
                        <p className="truncate text-sm text-gray-600">
                          {review.review}
                        </p>
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">
                        <StatusBadge
                          review={review}
                        />
                      </td>

                      {/* ACTIONS */}

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          {/* VIEW */}

                          <ActionButton
                            title="View"
                            onClick={() =>
                              setSelectedReview(
                                review
                              )
                            }
                          >
                            <Eye size={16} />
                          </ActionButton>

                          {/* EDIT */}

                          <ActionButton
                            title="Edit"
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() =>
                              startEditing(review)
                            }
                          >
                            <Pencil size={16} />
                          </ActionButton>

                          {/* APPROVE */}

                          {review.status !==
                            "approved" && (
                            <ActionButton
                              title="Approve"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() =>
                                approveReview(
                                  review.id
                                )
                              }
                            >
                              <Check size={16} />
                            </ActionButton>
                          )}

                          {/* REJECT */}

                          {review.status !==
                            "rejected" && (
                            <ActionButton
                              title="Reject"
                              className="text-orange-500 hover:bg-orange-50"
                              onClick={() =>
                                rejectReview(
                                  review.id
                                )
                              }
                            >
                              <X size={16} />
                            </ActionButton>
                          )}

                          {/* DELETE */}

                          <ActionButton
                            title="Delete"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() =>
                              deleteReview(
                                review.id
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}

          {!loading &&
            filteredReviews.length > 0 && (
              <div className="flex flex-col gap-3 border-t px-5 py-1">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium text-gray-700">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-700">
                    {Math.min(
                      startIndex +
                        reviewsPerPage,
                      filteredReviews.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700">
                    {filteredReviews.length}
                  </span>{" "}
                  reviews
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        (page) => page - 1
                      )
                    }
                    className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <span className="min-w-[80px] text-center text-sm text-gray-600">
                    Page {currentPage} of{" "}
                    {totalPages || 1}
                  </span>

                  <button
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) => page + 1
                      )
                    }
                    className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
        </div>
      </main>

      {/* VIEW MODAL */}

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Review Details
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  Review #{selectedReview.id}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedReview(null)
                }
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* CUSTOMER */}

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Customer
                </p>

                <p className="mt-1 font-semibold">
                  {selectedReview.user?.name}
                </p>

                <p className="text-sm text-gray-500">
                  {selectedReview.user?.email}
                </p>
              </div>

              {/* PRODUCT */}

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Product
                </p>

                <p className="mt-1 font-medium">
                  {selectedReview.product?.name}
                </p>
              </div>

              {/* RATING */}

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Rating
                </p>

                <div className="mt-2">
                  <Stars
                    value={
                      selectedReview.rating
                    }
                  />
                </div>
              </div>

              {/* REVIEW */}

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Review
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {selectedReview.review}
                </p>
              </div>

              {/* INFO */}

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  Customer edits:{" "}
                  {selectedReview.edit_count}/1
                </span>

                <StatusBadge
                  review={selectedReview}
                />
              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-2 border-t pt-4">
                {selectedReview.status !==
                  "approved" && (
                  <button
                    onClick={() =>
                      approveReview(
                        selectedReview.id
                      )
                    }
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                )}

                {selectedReview.status !==
                  "rejected" && (
                  <button
                    onClick={() =>
                      rejectReview(
                        selectedReview.id
                      )
                    }
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    <X size={16} />
                    Reject
                  </button>
                )}

                <button
                  onClick={() =>
                    startEditing(selectedReview)
                  }
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteReview(
                      selectedReview.id
                    )
                  }
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}

      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-semibold">
                  Edit Review
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Admin edits do not affect the customer's edit count.
                </p>
              </div>

              <button
                onClick={closeEdit}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* CUSTOMER */}

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium">
                  {editingReview.user?.name}
                </p>

                <p className="text-xs text-gray-500">
                  {editingReview.user?.email}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Customer edits:{" "}
                  {editingReview.edit_count}/1
                </p>
              </div>

              {/* RATING */}

              <div>
                <p className="mb-2 text-sm font-medium">
                  Rating
                </p>

                <Stars
                  value={rating}
                  interactive
                />
              </div>

              {/* REVIEW */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Review
                </label>

                <textarea
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(
                      e.target.value
                    )
                  }
                  rows={6}
                  maxLength={2000}
                  className="w-full resize-none rounded-lg border p-3 text-sm outline-none focus:border-green-500"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {reviewText.length}/2000
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  onClick={closeEdit}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --------------------------------
   STAT CARD
-------------------------------- */

const StatCard = ({
  title,
  value,
  valueClass = "text-gray-900",
}: {
  title: string;
  value: number;
  valueClass?: string;
}) => (
  <div className="rounded-xl border bg-white p-4">
    <p className="text-sm text-gray-500">
      {title}
    </p>

    <p
      className={`mt-1 text-2xl font-bold ${valueClass}`}
    >
      {value}
    </p>
  </div>
);

/* --------------------------------
   ACTION BUTTON
-------------------------------- */

const ActionButton = ({
  children,
  title,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`rounded-lg p-2 text-gray-500 hover:bg-gray-100 ${className}`}
  >
    {children}
  </button>
);

export default Reviews;