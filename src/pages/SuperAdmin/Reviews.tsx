import { useEffect, useMemo, useState } from "react";
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
  MessageSquare,
  Clock3,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
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
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");

  const [selectedReview, setSelectedReview] =
    useState<Review | null>(null);

  const [editingReview, setEditingReview] =
    useState<Review | null>(null);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const reviewsPerPage = 10;

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
  });

  /* FETCH REVIEWS */

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/superadmin/reviews", {
        headers: headers(),
      });

      setReviews(response.data.reviews || []);
    } catch (err: any) {
      console.error(err);

      toast.error(
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

  /* FILTER */

  const filteredReviews = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    return reviews.filter((review) => {
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
        status === "all" ||
        review.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, search, status]);

  /* PAGINATION */

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

  /* STATISTICS */

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

  /* STARS */

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
          size={interactive ? 24 : 13}
          onClick={() =>
            interactive && setRating(star)
          }
          className={`
            ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }
            ${
              interactive
                ? "cursor-pointer transition hover:scale-110"
                : ""
            }
          `}
        />
      ))}
    </div>
  );

  /* STATUS BADGE */

  const StatusBadge = ({
    review,
  }: {
    review: Review;
  }) => {
    const styles = {
      approved:
        "bg-emerald-100 text-emerald-800",
      pending:
        "bg-orange-100 text-orange-800",
      rejected:
        "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${styles[review.status]}`}
      >
        {review.status.charAt(0).toUpperCase() +
          review.status.slice(1)}
      </span>
    );
  };

  /* APPROVE */

  const approveReview = async (id: number) => {
    try {
      setSaving(true);

      await axios.patch(
        `/superadmin/reviews/${id}/approve`,
        {},
        { headers: headers() }
      );

      toast.success("Review approved successfully.");

      setSelectedReview(null);

      await fetchReviews();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Unable to approve review."
      );
    } finally {
      setSaving(false);
    }
  };

  /* REJECT */

  const rejectReview = async (id: number) => {
    try {
      setSaving(true);

      await axios.patch(
        `/superadmin/reviews/${id}/reject`,
        {},
        { headers: headers() }
      );

      toast.success("Review rejected successfully.");

      setSelectedReview(null);

      await fetchReviews();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Unable to reject review."
      );
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */

  const deleteReview = async (id: number) => {
    try {
      setSaving(true);

      await axios.delete(
        `/superadmin/reviews/${id}`,
        {
          headers: headers(),
        }
      );

      toast.success("Review deleted successfully.");

      setSelectedReview(null);

      await fetchReviews();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Unable to delete review."
      );
    } finally {
      setSaving(false);
    }
  };

  /* START EDIT */

  const startEditing = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setReviewText(review.review);
    setSelectedReview(null);
  };

  /* SAVE EDIT */

  const saveEdit = async () => {
    if (!editingReview) return;

    if (!rating) {
      toast.error("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Review cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `/superadmin/reviews/${editingReview.id}`,
        {
          rating,
          review: reviewText,
        },
        {
          headers: headers(),
        }
      );

      toast.success("Review updated successfully.");

      closeEdit();

      await fetchReviews();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Unable to update review."
      );
    } finally {
      setSaving(false);
    }
  };

  /* CLOSE EDIT */

  const closeEdit = () => {
    setEditingReview(null);
    setRating(0);
    setReviewText("");
  };

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <main className="flex-1 p-3 lg:p-3 mt-14 lg:mt-0 h-screen overflow-y-auto">
        <div className="space-y-4">

          {/* HEADER */}

          <div className="flex flex-col gap-1">
            <h1 className="lg:text-2xl text-lg font-bold">
              Reviews
            </h1>

            <p className="text-xs text-muted-foreground">
              Manage customer reviews, ratings and moderation.
            </p>
          </div>

          {/* STATISTICS */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <StatCard
              label="Total Reviews"
              count={total}
              icon={
                <MessageSquare className="w-5 h-5" />
              }
              color="bg-primary/10 text-primary"
            />

            <StatCard
              label="Pending"
              count={pending}
              icon={
                <Clock3 className="w-5 h-5" />
              }
              color="bg-orange-100 text-orange-800"
            />

            <StatCard
              label="Approved"
              count={approved}
              icon={
                <CheckCircle2 className="w-5 h-5" />
              }
              color="bg-emerald-100 text-emerald-800"
            />

            <StatCard
              label="Rejected"
              count={rejected}
              icon={
                <XCircle className="w-5 h-5" />
              }
              color="bg-red-100 text-red-800"
            />

          </div>

          {/* SECTION HEADER / FILTERS */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-sm">
                Customer Reviews
              </h2>

              <p className="text-[11px] text-muted-foreground">
                Review customer feedback and manage moderation status.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

              <div className="relative w-full sm:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search reviews..."
                  className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as FilterStatus
                  )
                }
                className="rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
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

          <div className="glass-card overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-xs min-w-[1050px]">

                <thead>
                  <tr className="border-b bg-secondary/50">

                    <th className="p-3 text-left">
                      Customer
                    </th>

                    <th className="p-3 text-left">
                      Product
                    </th>

                    <th className="p-3 text-left">
                      Rating
                    </th>

                    <th className="p-3 text-left">
                      Review
                    </th>

                    <th className="p-3 text-left">
                      Status
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
                        colSpan={6}
                        className="p-10 text-center"
                      >
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                      </td>
                    </tr>
                  ) : paginatedReviews.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center"
                      >
                        <MessageSquare className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />

                        <p className="text-xs font-medium">
                          No reviews found
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Try changing your search or filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedReviews.map((review) => (
                      <tr
                        key={review.id}
                        className="border-b border-border hover:bg-secondary/30"
                      >

                        {/* CUSTOMER */}

                        <td className="p-3">
                          <div className="flex items-center gap-2">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {review.user?.name
                                ?.charAt(0)
                                .toUpperCase() || "C"}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold truncate max-w-[150px]">
                                {review.user?.name ||
                                  "Customer"}
                              </p>

                              <p className="text-[10px] text-muted-foreground truncate max-w-[170px]">
                                {review.user?.email}
                              </p>

                              <span className="mt-1 inline-flex rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground">
                                Edits: {review.edit_count}
                              </span>
                            </div>

                          </div>
                        </td>

                        {/* PRODUCT */}

                        <td className="p-3">
                          <p className="max-w-[190px] truncate font-medium">
                            {review.product?.name ||
                              "Product"}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            Product #{review.product_id}
                          </p>
                        </td>

                        {/* RATING */}

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Stars value={review.rating} />

                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {review.rating}.0
                            </span>
                          </div>
                        </td>

                        {/* REVIEW */}

                        <td className="p-3 max-w-[300px]">
                          <p className="truncate text-muted-foreground">
                            {review.review}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="p-3">
                          <StatusBadge review={review} />
                        </td>

                        {/* ACTIONS */}

                        <td className="p-3">
                          <div className="flex justify-end gap-2">

                            <ActionButton
                              title="View"
                              onClick={() =>
                                setSelectedReview(review)
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </ActionButton>

                            <ActionButton
                              title="Edit"
                              className="text-primary"
                              onClick={() =>
                                startEditing(review)
                              }
                            >
                              <Pencil className="w-4 h-4" />
                            </ActionButton>

                            {review.status !==
                              "approved" && (
                              <ActionButton
                                title="Approve"
                                className="text-emerald-600"
                                onClick={() =>
                                  approveReview(
                                    review.id
                                  )
                                }
                              >
                                <Check className="w-4 h-4" />
                              </ActionButton>
                            )}

                            {review.status !==
                              "rejected" && (
                              <ActionButton
                                title="Reject"
                                className="text-orange-500"
                                onClick={() =>
                                  rejectReview(
                                    review.id
                                  )
                                }
                              >
                                <X className="w-4 h-4" />
                              </ActionButton>
                            )}

                            <ActionButton
                              title="Delete"
                              className="text-red-500"
                              onClick={() =>
                                deleteReview(
                                  review.id
                                )
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </ActionButton>

                          </div>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>
              </table>

            </div>

            {/* PAGINATION */}

            {!loading &&
              filteredReviews.length > 0 && (
                <div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-[11px] text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(
                        startIndex +
                          reviewsPerPage,
                        filteredReviews.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {filteredReviews.length}
                    </span>{" "}
                    reviews
                  </p>

                  <div className="flex items-center gap-1">

                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage(
                          (page) => page - 1
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    )
                      .slice(
                        Math.max(0, currentPage - 3),
                        Math.min(
                          totalPages,
                          currentPage + 2
                        )
                      )
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() =>
                            setCurrentPage(page)
                          }
                          className={`
                            h-8 min-w-8 rounded-lg px-2 text-[11px] font-semibold
                            ${
                              currentPage === page
                                ? "bg-primary text-primary-foreground"
                                : "border hover:bg-secondary"
                            }
                          `}
                        >
                          {page}
                        </button>
                      ))}

                    <button
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) => page + 1
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              )}

          </div>
        </div>
      </main>

      {/* VIEW MODAL */}

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">

          <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b p-4">

              <div>
                <h2 className="font-bold">
                  Review Details
                </h2>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Review #{selectedReview.id}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedReview(null)
                }
                className="rounded-lg p-1 hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="space-y-4 p-4">

              {/* CUSTOMER */}

              <div className="rounded-xl border bg-secondary/20 p-3">

                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Customer
                </p>

                <div className="mt-2 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                    {selectedReview.user?.name
                      ?.charAt(0)
                      .toUpperCase() || "C"}
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      {selectedReview.user?.name}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      {selectedReview.user?.email}
                    </p>
                  </div>

                </div>

              </div>

              {/* PRODUCT */}

              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Product
                </p>

                <p className="mt-1 text-xs font-semibold">
                  {selectedReview.product?.name ||
                    "Product"}
                </p>
              </div>

              {/* RATING */}

              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Rating
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Stars
                    value={selectedReview.rating}
                  />

                  <span className="text-xs font-semibold">
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>

              {/* REVIEW */}

              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Review
                </p>

                <div className="mt-2 rounded-xl border bg-secondary/20 p-3">
                  <p className="whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                    {selectedReview.review}
                  </p>
                </div>
              </div>

              {/* META */}

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                  Customer edits:{" "}
                  {selectedReview.edit_count}/1
                </span>

                <StatusBadge
                  review={selectedReview}
                />

              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap justify-end gap-2 border-t pt-4">

                {selectedReview.status !==
                  "approved" && (
                  <button
                    onClick={() =>
                      approveReview(
                        selectedReview.id
                      )
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" />
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
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 disabled:opacity-60"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                )}

                <button
                  onClick={() =>
                    startEditing(selectedReview)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold hover:bg-secondary"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteReview(
                      selectedReview.id
                    )
                  }
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}

      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">

          <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b p-4">

              <div>
                <h2 className="font-bold">
                  Edit Review
                </h2>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Admin edits do not affect the customer's edit count.
                </p>
              </div>

              <button
                onClick={closeEdit}
                className="rounded-lg p-1 hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="space-y-4 p-4">

              {/* CUSTOMER */}

              <div className="rounded-xl border bg-secondary/20 p-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                    {editingReview.user?.name
                      ?.charAt(0)
                      .toUpperCase() || "C"}
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      {editingReview.user?.name}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      {editingReview.user?.email}
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Customer edits:{" "}
                      {editingReview.edit_count}/1
                    </p>
                  </div>

                </div>

              </div>

              {/* RATING */}

              <div>
                <label className="text-xs font-semibold">
                  Rating
                </label>

                <div className="mt-2">
                  <Stars
                    value={rating}
                    interactive
                  />
                </div>
              </div>

              {/* REVIEW */}

              <div>
                <label className="text-xs font-semibold">
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
                  className="mt-1.5 w-full resize-none rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Write review..."
                />

                <p className="mt-1 text-right text-[10px] text-muted-foreground">
                  {reviewText.length}/2000
                </p>
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-2 border-t pt-4">

                <button
                  onClick={closeEdit}
                  className="rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-secondary"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

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

/* STAT CARD */

const StatCard = ({
  label,
  count,
  icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="glass-card p-3">

    <div className="flex items-center justify-between gap-3">

      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </span>

      <div className="text-right">

        <p className="text-xl font-bold">
          {count}
        </p>

        <p className="text-[10px] text-muted-foreground">
          {label}
        </p>

      </div>

    </div>
  </div>
);

/* ACTION BUTTON */

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
    className={`rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary ${className}`}
  >
    {children}
  </button>
);

export default Reviews;