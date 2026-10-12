import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const AdminReviews = () => {
  const { token } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [replyReview, setReplyReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  // ==========================================
  // FETCH ALL REVIEWS
  // ==========================================

  const fetchReviews = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/reviews/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch reviews",
        );
      }

      setReviews(
        Array.isArray(data.reviews)
          ? data.reviews
          : [],
      );
    } catch (error) {
      console.error(
        "Fetch Admin Reviews Error:",
        error,
      );

      setError(
        error.message ||
          "Failed to load customer reviews",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token]);

  // ==========================================
  // FILTER REVIEWS
  // ==========================================

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (activeTab === "pending") {
      result = result.filter(
        (review) => !review.isApproved,
      );
    }

    if (activeTab === "approved") {
      result = result.filter(
        (review) => review.isApproved,
      );
    }

    if (search.trim()) {
      const query = search
        .toLowerCase()
        .trim();

      result = result.filter((review) => {
        const customerName =
          review.user?.name || "";

        const customerEmail =
          review.user?.email || "";

        const productName =
          review.product?.name || "";

        const title =
          review.title || "";

        const comment =
          review.comment || "";

        return (
          customerName
            .toLowerCase()
            .includes(query) ||
          customerEmail
            .toLowerCase()
            .includes(query) ||
          productName
            .toLowerCase()
            .includes(query) ||
          title
            .toLowerCase()
            .includes(query) ||
          comment
            .toLowerCase()
            .includes(query)
        );
      });
    }

    return result;
  }, [
    reviews,
    activeTab,
    search,
  ]);

  // ==========================================
  // APPROVE REVIEW
  // ==========================================

  const handleApprove = async (review) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Approve this review?",
      text: "The review will become visible on the storefront.",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#000000",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(review._id);

      const response = await fetch(
        `${API_URL}/reviews/admin/${review._id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to approve review",
        );
      }

      setReviews((previous) =>
        previous.map((item) =>
          item._id === review._id
            ? {
                ...item,
                isApproved: true,
              }
            : item,
        ),
      );

      await Swal.fire({
        icon: "success",
        title: "Review approved",
        text: "The customer review is now visible on the storefront.",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      console.error(
        "Approve Review Error:",
        error,
      );

      Swal.fire({
        icon: "error",
        title: "Unable to approve review",
        text:
          error.message ||
          "Something went wrong.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // REJECT REVIEW
  // ==========================================

  const handleReject = async (review) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Reject this review?",
      text: "The review will remain hidden from customers.",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#000000",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(review._id);

      const response = await fetch(
        `${API_URL}/reviews/admin/${review._id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reject review",
        );
      }

      setReviews((previous) =>
        previous.map((item) =>
          item._id === review._id
            ? {
                ...item,
                isApproved: false,
              }
            : item,
        ),
      );

      await Swal.fire({
        icon: "success",
        title: "Review rejected",
        text: "The review remains hidden from the storefront.",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      console.error(
        "Reject Review Error:",
        error,
      );

      Swal.fire({
        icon: "error",
        title: "Unable to reject review",
        text:
          error.message ||
          "Something went wrong.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // DELETE REVIEW
  // ==========================================

  const handleDelete = async (review) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this review?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(review._id);

      const response = await fetch(
        `${API_URL}/reviews/admin/${review._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete review",
        );
      }

      setReviews((previous) =>
        previous.filter(
          (item) =>
            item._id !== review._id,
        ),
      );

      await Swal.fire({
        icon: "success",
        title: "Review deleted",
        text: "The review has been permanently removed.",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      console.error(
        "Delete Review Error:",
        error,
      );

      Swal.fire({
        icon: "error",
        title: "Unable to delete review",
        text:
          error.message ||
          "Something went wrong.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // OPEN REPLY
  // ==========================================

  const openReply = (review) => {
    setReplyReview(review);
    setReplyText(
      review.adminReply || "",
    );
  };

  // ==========================================
  // CLOSE REPLY
  // ==========================================

  const closeReply = () => {
    setReplyReview(null);
    setReplyText("");
  };

  // ==========================================
  // SUBMIT ADMIN REPLY
  // ==========================================

  const handleReply = async (event) => {
    event.preventDefault();

    if (!replyReview) {
      return;
    }

    const cleanReply =
      replyText.trim();

    if (!cleanReply) {
      Swal.fire({
        icon: "warning",
        title: "Reply required",
        text: "Please enter a reply.",
        confirmButtonColor: "#000000",
      });

      return;
    }

    if (cleanReply.length > 1000) {
      Swal.fire({
        icon: "warning",
        title: "Reply too long",
        text: "Admin reply cannot exceed 1000 characters.",
        confirmButtonColor: "#000000",
      });

      return;
    }

    try {
      setActionLoading(
        `reply-${replyReview._id}`,
      );

      const response = await fetch(
        `${API_URL}/reviews/admin/${replyReview._id}/reply`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminReply: cleanReply,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add reply",
        );
      }

      setReviews((previous) =>
        previous.map((item) =>
          item._id === replyReview._id
            ? {
                ...item,
                adminReply:
                  data.review?.adminReply ||
                  cleanReply,
                adminRepliedAt:
                  data.review
                    ?.adminRepliedAt ||
                  new Date().toISOString(),
              }
            : item,
        ),
      );

      closeReply();

      await Swal.fire({
        icon: "success",
        title: "Reply added",
        text: "Your reply has been saved.",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      console.error(
        "Reply Review Error:",
        error,
      );

      Swal.fire({
        icon: "error",
        title: "Unable to reply",
        text:
          error.message ||
          "Something went wrong.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(
      date,
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // RATING STARS
  // ==========================================

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <span
              key={star}
              className={
                star <= rating
                  ? "text-yellow-500"
                  : "text-gray-300"
              }
            >
              ★
            </span>
          ),
        )}
      </div>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm tracking-wide text-gray-500">
          Loading customer reviews...
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">

      {/* HEADER */}

      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-500">
          Mehaa Garments
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Customer Reviews
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Review, moderate and respond to
              customer feedback before it appears
              on the storefront.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReviews}
            className="border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Total Reviews
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {reviews.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Pending
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {
              reviews.filter(
                (review) =>
                  !review.isApproved,
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Approved
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {
              reviews.filter(
                (review) =>
                  review.isApproved,
              ).length
            }
          </p>
        </div>

      </div>

      {/* FILTER BAR */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                setActiveTab("all")
              }
              className={`px-4 py-2 text-sm transition ${
                activeTab === "all"
                  ? "bg-black text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-black"
              }`}
            >
              All Reviews
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("pending")
              }
              className={`px-4 py-2 text-sm transition ${
                activeTab === "pending"
                  ? "bg-black text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-black"
              }`}
            >
              Pending
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("approved")
              }
              className={`px-4 py-2 text-sm transition ${
                activeTab === "approved"
                  ? "bg-black text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-black"
              }`}
            >
              Approved
            </button>

          </div>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search customer, product or review..."
            className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black lg:w-96"
          />

        </div>

      </div>

      {/* REVIEWS */}

      {filteredReviews.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-medium text-gray-900">
            No reviews found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are no reviews matching
            your current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {filteredReviews.map(
            (review) => (
              <div
                key={review._id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >

                {/* REVIEW HEADER */}

                <div className="border-b border-gray-200 px-5 py-5 md:px-6">

                  <div className="flex flex-col justify-between gap-5 lg:flex-row">

                    {/* PRODUCT */}

                    <div className="flex gap-4">

                      {review.product
                        ?.image ? (
                        <img
                          src={
                            review.product
                              .image
                          }
                          alt={
                            review.product
                              ?.name ||
                            "Product"
                          }
                          className="h-20 w-16 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-16 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                          No image
                        </div>
                      )}

                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                          Product
                        </p>

                        <h2 className="mt-1 font-medium text-gray-900">
                          {review.product
                            ?.name ||
                            "Unknown product"}
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                          Review date:{" "}
                          {formatDate(
                            review.createdAt,
                          )}
                        </p>
                      </div>

                    </div>

                    {/* STATUS */}

                    <div className="flex items-start">

                      {review.isApproved ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Approved
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Not Approved
                        </span>
                      )}

                    </div>

                  </div>

                </div>

                {/* REVIEW BODY */}

                <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1fr_280px]">

                  <div>

                    {/* CUSTOMER */}

                    <div className="mb-5">

                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                        Customer
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {review.user
                          ?.name ||
                          "Unknown customer"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {review.user
                          ?.email ||
                          "No email"}
                      </p>

                    </div>

                    {/* RATING */}

                    <div className="mb-4">
                      {renderStars(
                        review.rating,
                      )}
                    </div>

                    {/* TITLE */}

                    {review.title && (
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.title}
                      </h3>
                    )}

                    {/* COMMENT */}

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                      {review.comment}
                    </p>

                    {/* VERIFIED PURCHASE */}

                    <div className="mt-5">

                      {review.isVerifiedPurchase ? (
                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          ✓ Verified Purchase
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                          Purchase not verified
                        </span>
                      )}

                    </div>

                    {/* REVIEW IMAGES */}

                    {Array.isArray(
                      review.images,
                    ) &&
                      review.images.length >
                        0 && (
                        <div className="mt-6">

                          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gray-400">
                            Customer Photos
                          </p>

                          <div className="flex flex-wrap gap-3">

                            {review.images.map(
                              (
                                image,
                                index,
                              ) => (
                                <a
                                  key={`${review._id}-${index}`}
                                  href={image}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={image}
                                    alt={`Customer review ${index + 1}`}
                                    className="h-24 w-20 rounded-md object-cover transition hover:opacity-80"
                                  />
                                </a>
                              ),
                            )}

                          </div>

                        </div>
                      )}

                    {/* ADMIN REPLY */}

                    {review.adminReply && (
                      <div className="mt-6 border-l-2 border-black bg-gray-50 px-4 py-4">

                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                          Mehaa Garments Reply
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                          {review.adminReply}
                        </p>

                        {review.adminRepliedAt && (
                          <p className="mt-2 text-xs text-gray-400">
                            {formatDate(
                              review.adminRepliedAt,
                            )}
                          </p>
                        )}

                      </div>
                    )}

                  </div>

                  {/* ACTION PANEL */}

                  <div className="border-t border-gray-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">

                    <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gray-400">
                      Review Actions
                    </p>

                    <div className="space-y-3">

                      {!review.isApproved && (
                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            review._id
                          }
                          onClick={() =>
                            handleApprove(
                              review,
                            )
                          }
                          className="w-full bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading ===
                          review._id
                            ? "Processing..."
                            : "Approve Review"}
                        </button>
                      )}

                      {review.isApproved && (
                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            review._id
                          }
                          onClick={() =>
                            handleReject(
                              review,
                            )
                          }
                          className="w-full border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading ===
                          review._id
                            ? "Processing..."
                            : "Hide Review"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          openReply(review)
                        }
                        className="w-full border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black"
                      >
                        {review.adminReply
                          ? "Edit Reply"
                          : "Reply to Customer"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionLoading ===
                          review._id
                        }
                        onClick={() =>
                          handleDelete(
                            review,
                          )
                        }
                        className="w-full border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete Review
                      </button>

                    </div>

                    {/* ORDER */}

                    {review.order && (
                      <div className="mt-6 border-t border-gray-200 pt-5">

                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                          Order
                        </p>

                        <p className="mt-2 break-all text-xs text-gray-500">
                          {review.order._id}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Status:{" "}
                          <span className="font-medium text-gray-700">
                            {review.order
                              .orderStatus ||
                              "—"}
                          </span>
                        </p>

                      </div>
                    )}

                  </div>

                </div>

              </div>
            ),
          )}

        </div>
      )}

      {/* ==========================================
          REPLY MODAL
      ========================================== */}

      {replyReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-start justify-between">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Mehaa Garments
                </p>

                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  Reply to Customer
                </h2>
              </div>

              <button
                type="button"
                onClick={closeReply}
                className="text-2xl leading-none text-gray-400 transition hover:text-black"
              >
                ×
              </button>

            </div>

            <div className="mb-5 rounded-lg bg-gray-50 p-4">

              <p className="text-sm font-medium text-gray-900">
                {replyReview.user
                  ?.name ||
                  "Customer"}
              </p>

              <div className="mt-1">
                {renderStars(
                  replyReview.rating,
                )}
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {replyReview.comment}
              </p>

            </div>

            <form
              onSubmit={handleReply}
            >

              <label className="text-sm font-medium text-gray-900">
                Your Reply
              </label>

              <textarea
                value={replyText}
                onChange={(event) =>
                  setReplyText(
                    event.target.value,
                  )
                }
                maxLength={1000}
                rows={6}
                placeholder="Write a professional response to the customer..."
                className="mt-2 w-full resize-none border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />

              <div className="mt-1 text-right text-xs text-gray-400">
                {replyText.length}/1000
              </div>

              <div className="mt-5 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeReply}
                  className="border border-gray-300 px-5 py-2.5 text-sm text-gray-700 transition hover:border-black"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading ===
                    `reply-${replyReview._id}`
                  }
                  className="bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading ===
                  `reply-${replyReview._id}`
                    ? "Saving..."
                    : "Save Reply"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminReviews;