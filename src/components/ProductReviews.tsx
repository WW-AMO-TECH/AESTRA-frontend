import { useEffect, useState } from "react";
import axios from "@/api/axios";
import {
  Star,
  Pencil,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  review: string;
  edit_count: number;
  is_approved: boolean;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

interface ProductReviewsProps {
  productId: number;
}

/* --------------------------------------------------
   STAR COMPONENT
-------------------------------------------------- */

const Stars = ({
  value,
  interactive = false,
  size = 18,
  onSelect,
}: {
  value: number;
  interactive?: boolean;
  size?: number;
  onSelect?: (rating: number) => void;
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          onClick={() => {
            if (interactive && onSelect) {
              onSelect(star);
            }
          }}
          className={`
            ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
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
};

/* --------------------------------------------------
   REVIEW FORM
   IMPORTANT:
   This is OUTSIDE ProductReviews.
   This prevents the textarea from losing focus.
-------------------------------------------------- */

interface ReviewFormProps {
  editingReview: Review | null;
  rating: number;
  reviewText: string;
  submitting: boolean;
  error: string;
  onRatingChange: (rating: number) => void;
  onReviewChange: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ReviewForm = ({
  editingReview,
  rating,
  reviewText,
  submitting,
  error,
  onRatingChange,
  onReviewChange,
  onSubmit,
  onCancel,
}: ReviewFormProps) => {
  return (
    <div className="mt-5 rounded-xl border bg-white p-5">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {editingReview
            ? "Edit Your Review"
            : "Write a Review"}
        </h3>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* EDIT MESSAGE */}

      {editingReview && (
        <p className="mt-2 text-xs text-orange-600">
          You can only edit your review once.
        </p>
      )}

      {/* RATING */}

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">
          Your rating
        </p>

        <Stars
          value={rating}
          interactive
          size={26}
          onSelect={onRatingChange}
        />
      </div>

      {/* TEXTAREA */}

      <textarea
        value={reviewText}
        onChange={(e) => onReviewChange(e.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="Share your experience with this product..."
        className="mt-4 block w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
      />

      {/* CHARACTER COUNT */}

      <div className="mt-1 text-right text-xs text-gray-400">
        {reviewText.length}/2000
      </div>

      {/* ERROR */}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* SUBMIT */}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Saving..."
          : editingReview
          ? "Update Review"
          : "Submit Review"}
      </button>
    </div>
  );
};

/* --------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------- */

const ProductReviews = ({
  productId,
}: ProductReviewsProps) => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [ratingBreakdown, setRatingBreakdown] =
    useState<Record<number, number>>({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    });

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] =
    useState<Review | null>(null);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* --------------------------------------------------
     FETCH REVIEWS
  -------------------------------------------------- */

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `/products/${productId}/reviews`
      );

      setReviews(response.data.reviews || []);

      setAverageRating(
        Number(response.data.average_rating || 0)
      );

      setTotalReviews(
        Number(response.data.total_reviews || 0)
      );

      setRatingBreakdown(
        response.data.rating_breakdown || {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        }
      );
    } catch (error) {
      console.error(
        "Failed to load reviews",
        error
      );

      setError("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  /* --------------------------------------------------
     RATING PERCENTAGE
  -------------------------------------------------- */

  const ratingPercentage = (star: number) => {
    if (!totalReviews) return 0;

    return Math.round(
      ((ratingBreakdown[star] || 0) /
        totalReviews) *
        100
    );
  };

  /* --------------------------------------------------
     RESET FORM
  -------------------------------------------------- */

  const resetForm = () => {
    setShowForm(false);
    setEditingReview(null);
    setRating(0);
    setReviewText("");
    setError("");
  };

  /* --------------------------------------------------
     SUBMIT REVIEW
  -------------------------------------------------- */

  const submitReview = async () => {
    setError("");
    setMessage("");

    if (!user) {
      setError(
        "Please login to submit a review."
      );
      return;
    }

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write a review.");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(
        `/products/${productId}/reviews`,
        {
          rating,
          review: reviewText.trim(),
        }
      );

      setMessage(
        "Review submitted successfully. It is awaiting approval."
      );

      resetForm();

      await fetchReviews();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------------------------
     START EDITING
  -------------------------------------------------- */

  const startEditing = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setReviewText(review.review);
    setShowForm(false);
    setError("");
    setMessage("");
  };

  /* --------------------------------------------------
     UPDATE REVIEW
  -------------------------------------------------- */

  const updateReview = async () => {
    if (!editingReview) return;

    setError("");
    setMessage("");

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write a review.");
      return;
    }

    try {
      setSubmitting(true);

      await axios.put(
        `/reviews/${editingReview.id}`,
        {
          rating,
          review: reviewText.trim(),
        }
      );

      setMessage(
        "Review updated successfully. It is awaiting approval again."
      );

      resetForm();

      await fetchReviews();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to update review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------------------------
     DELETE REVIEW
  -------------------------------------------------- */

  const deleteReview = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`/reviews/${id}`);

      setMessage(
        "Review deleted successfully."
      );

      await fetchReviews();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to delete review."
      );
    }
  };

  /* --------------------------------------------------
     RETURN
  -------------------------------------------------- */

  return (
    <section
      id="reviews"
      className="mt-8 border-t bg-white px-5 py-2 md:px-8"
    >
      {/* HEADER */}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Customer Reviews
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            See what customers think about this
            product.
          </p>
        </div>

        {user && !editingReview && (
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setMessage("");
            }}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {showForm
              ? "Cancel"
              : "Add a review"}
          </button>
        )}
      </div>

      {/* MESSAGE */}

      {message && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* RATING SUMMARY */}

      <div className="mt-6 grid grid-cols-1 gap-6 border-b pb-7 md:grid-cols-[180px_1fr]">
        {/* AVERAGE */}

        <div className="flex flex-col justify-center">
          <span className="text-5xl font-semibold text-gray-900">
            {averageRating.toFixed(1)}
          </span>

          <div className="mt-2">
            <Stars
              value={averageRating}
              size={18}
            />
          </div>

          <span className="mt-2 text-sm text-gray-500">
            Based on {totalReviews}{" "}
            {totalReviews === 1
              ? "review"
              : "reviews"}
          </span>
        </div>

        {/* BREAKDOWN */}

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className="flex items-center gap-3"
            >
              <span className="w-7 text-sm text-gray-600">
                {star} ★
              </span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${ratingPercentage(
                      star
                    )}%`,
                  }}
                />
              </div>

              <span className="w-7 text-right text-xs text-gray-500">
                {ratingBreakdown[star] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* REVIEW FORM */}

      {showForm && !editingReview && (
        <ReviewForm
          editingReview={null}
          rating={rating}
          reviewText={reviewText}
          submitting={submitting}
          error={error}
          onRatingChange={setRating}
          onReviewChange={setReviewText}
          onSubmit={submitReview}
          onCancel={resetForm}
        />
      )}

      {editingReview && (
        <ReviewForm
          editingReview={editingReview}
          rating={rating}
          reviewText={reviewText}
          submitting={submitting}
          error={error}
          onRatingChange={setRating}
          onReviewChange={setReviewText}
          onSubmit={updateReview}
          onCancel={resetForm}
        />
      )}

      {/* REVIEWS LIST */}

      <div className="mt-7">
        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500">
              No reviews yet.
            </p>

            {user && (
              <p className="mt-1 text-xs text-gray-400">
                Be the first to review this
                product.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {reviews.map((review) => {
              const isOwner =
                user?.id === review.user_id;

              /*
               * IMPORTANT:
               * Convert the name to a string before
               * displaying it. This prevents numeric
               * values such as 0 from appearing.
               */

              const userName =
                typeof review.user?.name ===
                "string" &&
                review.user.name.trim()
                  ? review.user.name.trim()
                  : "Customer";

              const firstLetter =
                userName.charAt(0).toUpperCase();

              return (
                <div
                  key={review.id}
                  className="py-6 first:pt-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* USER */}

                    <div className="flex items-center gap-3">
                      {/* AVATAR */}

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                        {firstLetter}
                      </div>

                      {/* NAME */}

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {userName}
                          </p>

                          {review.is_approved ===
                            true && (
                            <CheckCircle
                              size={13}
                              className="text-green-600"
                            />
                          )}

                          {isOwner &&
                            review.is_approved ===
                              false && (
                              <span className="text-[11px] text-orange-500">
                                Awaiting approval
                              </span>
                            )}
                        </div>

                        <p className="mt-0.5 text-xs text-gray-400">
                          {new Date(
                            review.created_at
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    {isOwner && (
                      <div className="flex items-center gap-1">
                        {review.edit_count < 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                review
                              )
                            }
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            title="Edit review"
                          >
                            <Pencil size={16} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deleteReview(
                              review.id
                            )
                          }
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* RATING */}

                  <div className="mt-3">
                    <Stars
                      value={review.rating}
                      size={16}
                    />
                  </div>

                  {/* REVIEW */}

                  <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-600">
                    {review.review}
                  </p>

                  {/* EDIT LIMIT */}

                  {isOwner &&
                    review.edit_count >= 1 && (
                      <p className="mt-2 text-xs text-gray-400">
                        You have used your one
                        allowed edit.
                      </p>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductReviews;