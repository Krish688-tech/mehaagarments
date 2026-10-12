import mongoose from "mongoose";

import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

// ==========================================
// HELPER - RECALCULATE PRODUCT RATING
// ==========================================

const recalculateProductRating = async (productId) => {
  const result = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        reviewCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const averageRating = result.length
    ? Math.round(result[0].averageRating * 100) / 100
    : 0;

  const reviewCount = result.length
    ? result[0].reviewCount
    : 0;

  await Product.findByIdAndUpdate(productId, {
    $set: {
      rating: averageRating,
      reviews: reviewCount,
    },
  });

  return {
    rating: averageRating,
    reviews: reviewCount,
  };
};

// ==========================================
// GET APPROVED REVIEWS FOR PRODUCT
// GET /api/reviews/product/:productId
// PUBLIC
// ==========================================

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId)
      .select("_id name image rating reviews isActive")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product is no longer available",
      });
    }

    const reviews = await Review.find({
      product: productId,
      isApproved: true,
    })
      .populate("user", "name")
      .select(
        "rating title comment images isVerifiedPurchase adminReply adminRepliedAt createdAt updatedAt user",
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      reviews,
      rating: product.rating || 0,
      reviewCount: product.reviews || 0,
    });
  } catch (error) {
    console.error("GET PRODUCT REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get product reviews",
    });
  }
};

// ==========================================
// GET CUSTOMER'S REVIEW FOR PRODUCT
// GET /api/reviews/product/:productId/my-review
// AUTHENTICATED
// ==========================================

export const getMyProductReview = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const review = await Review.findOne({
      product: productId,
      user: req.user._id,
    })
      .populate("product", "name image")
      .lean();

    return res.status(200).json({
      success: true,
      hasReviewed: Boolean(review),
      review: review || null,
    });
  } catch (error) {
    console.error("GET MY PRODUCT REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get your review",
    });
  }
};

// ==========================================
// CREATE CUSTOMER REVIEW
// POST /api/reviews
// AUTHENTICATED
// ==========================================

export const createReview = async (req, res) => {
  try {
    const {
      productId,
      rating,
      title,
      comment,
      images,
    } = req.body;

    // ==========================================
    // VALIDATE PRODUCT ID
    // ==========================================

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // ==========================================
    // VALIDATE RATING
    // ==========================================

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    // ==========================================
    // VALIDATE COMMENT
    // ==========================================

    const cleanComment =
      typeof comment === "string"
        ? comment.trim()
        : "";

    if (!cleanComment) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }

    if (cleanComment.length < 10) {
      return res.status(400).json({
        success: false,
        message:
          "Review comment must contain at least 10 characters",
      });
    }

    if (cleanComment.length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Review comment cannot exceed 2000 characters",
      });
    }

    // ==========================================
    // FIND PRODUCT
    // ==========================================

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: "This product is no longer available",
      });
    }

    // ==========================================
    // CHECK EXISTING REVIEW
    // ==========================================

    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
        review: existingReview,
      });
    }

    // ==========================================
    // VERIFY DELIVERED PURCHASE
    // ==========================================

    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      orderStatus: "Delivered",
      "orderItems.productId": productId,
    }).sort({
      updatedAt: -1,
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message:
          "You can review this product only after purchasing and receiving it.",
      });
    }

    // ==========================================
    // VALIDATE REVIEW IMAGES
    // ==========================================

    let reviewImages = [];

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "Review images must be an array",
        });
      }

      if (images.length > 5) {
        return res.status(400).json({
          success: false,
          message: "You can upload a maximum of 5 review images",
        });
      }

      reviewImages = images
        .filter(
          (image) =>
            typeof image === "string" &&
            image.trim().length > 0,
        )
        .map((image) => image.trim());
    }

    // ==========================================
    // CREATE REVIEW
    // IMPORTANT:
    // user/order/isVerifiedPurchase/isApproved
    // are controlled by the backend.
    // ==========================================

    const review = await Review.create({
      product: productId,

      user: req.user._id,

      order: deliveredOrder._id,

      rating: numericRating,

      title:
        typeof title === "string"
          ? title.trim().slice(0, 120)
          : "",

      comment: cleanComment,

      images: reviewImages,

      isVerifiedPurchase: true,

      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully and is awaiting approval.",
      review,
    });
  } catch (error) {
    // ==========================================
    // DUPLICATE REVIEW SAFETY
    // Handles race conditions with unique index.
    // ==========================================

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    console.error("CREATE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

// ==========================================
// UPDATE CUSTOMER REVIEW
// PUT /api/reviews/:id
// AUTHENTICATED
// ==========================================

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const {
      rating,
      title,
      comment,
      images,
    } = req.body;

    let hasChanges = false;

    // ==========================================
    // RATING
    // ==========================================

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be a whole number between 1 and 5",
        });
      }

      review.rating = numericRating;
      hasChanges = true;
    }

    // ==========================================
    // TITLE
    // ==========================================

    if (title !== undefined) {
      if (typeof title !== "string") {
        return res.status(400).json({
          success: false,
          message: "Review title must be text",
        });
      }

      review.title = title.trim().slice(0, 120);
      hasChanges = true;
    }

    // ==========================================
    // COMMENT
    // ==========================================

    if (comment !== undefined) {
      if (typeof comment !== "string") {
        return res.status(400).json({
          success: false,
          message: "Review comment must be text",
        });
      }

      const cleanComment = comment.trim();

      if (cleanComment.length < 10) {
        return res.status(400).json({
          success: false,
          message:
            "Review comment must contain at least 10 characters",
        });
      }

      if (cleanComment.length > 2000) {
        return res.status(400).json({
          success: false,
          message:
            "Review comment cannot exceed 2000 characters",
        });
      }

      review.comment = cleanComment;
      hasChanges = true;
    }

    // ==========================================
    // IMAGES
    // ==========================================

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: "Review images must be an array",
        });
      }

      if (images.length > 5) {
        return res.status(400).json({
          success: false,
          message:
            "You can upload a maximum of 5 review images",
        });
      }

      review.images = images
        .filter(
          (image) =>
            typeof image === "string" &&
            image.trim().length > 0,
        )
        .map((image) => image.trim());

      hasChanges = true;
    }

    if (!hasChanges) {
      return res.status(400).json({
        success: false,
        message: "No review changes were provided",
      });
    }

    // ==========================================
    // RE-MODERATION AFTER EDIT
    // ==========================================

    review.isApproved = false;

    await review.save();

    // ==========================================
    // RATING MUST BE RECALCULATED
    // ==========================================

    const ratingSummary =
      await recalculateProductRating(review.product);

    return res.status(200).json({
      success: true,
      message:
        "Review updated successfully and is awaiting approval again.",
      review,
      rating: ratingSummary.rating,
      reviewCount: ratingSummary.reviews,
    });
  } catch (error) {
    console.error("UPDATE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

// ==========================================
// DELETE CUSTOMER REVIEW
// DELETE /api/reviews/:id
// AUTHENTICATED
// ==========================================

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const productId = review.product;

    await review.deleteOne();

    const ratingSummary =
      await recalculateProductRating(productId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      rating: ratingSummary.rating,
      reviewCount: ratingSummary.reviews,
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

// ==========================================
// ADMIN - GET ALL REVIEWS
// GET /api/reviews/admin
// ADMIN ONLY
// ==========================================

export const getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name image")
      .populate("order", "_id orderStatus totalPrice")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET ADMIN REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get reviews",
    });
  }
};

// ==========================================
// ADMIN - GET PENDING REVIEWS
// GET /api/reviews/admin/pending
// ADMIN ONLY
// ==========================================

export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      isApproved: false,
    })
      .populate("user", "name email")
      .populate("product", "name image")
      .populate("order", "_id orderStatus")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET PENDING REVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get pending reviews",
    });
  }
};

// ==========================================
// ADMIN - APPROVE REVIEW
// PUT /api/reviews/admin/:id/approve
// ADMIN ONLY
// ==========================================

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.isApproved = true;

    await review.save();

    const ratingSummary =
      await recalculateProductRating(review.product);

    return res.status(200).json({
      success: true,
      message: "Review approved successfully",
      review,
      rating: ratingSummary.rating,
      reviewCount: ratingSummary.reviews,
    });
  } catch (error) {
    console.error("APPROVE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve review",
    });
  }
};

// ==========================================
// ADMIN - REJECT REVIEW
// PUT /api/reviews/admin/:id/reject
// ADMIN ONLY
// ==========================================

export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.isApproved = false;

    await review.save();

    const ratingSummary =
      await recalculateProductRating(review.product);

    return res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      review,
      rating: ratingSummary.rating,
      reviewCount: ratingSummary.reviews,
    });
  } catch (error) {
    console.error("REJECT REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject review",
    });
  }
};

// ==========================================
// ADMIN - DELETE REVIEW
// DELETE /api/reviews/admin/:id
// ADMIN ONLY
// ==========================================

export const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const productId = review.product;

    await review.deleteOne();

    const ratingSummary =
      await recalculateProductRating(productId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      rating: ratingSummary.rating,
      reviewCount: ratingSummary.reviews,
    });
  } catch (error) {
    console.error("ADMIN DELETE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

// ==========================================
// ADMIN - REPLY TO REVIEW
// PUT /api/reviews/admin/:id/reply
// ADMIN ONLY
// ==========================================

export const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (
      typeof adminReply !== "string" ||
      !adminReply.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin reply is required",
      });
    }

    const cleanReply = adminReply.trim();

    if (cleanReply.length > 1000) {
      return res.status(400).json({
        success: false,
        message:
          "Admin reply cannot exceed 1000 characters",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.adminReply = cleanReply;
    review.adminRepliedAt = new Date();

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      review,
    });
  } catch (error) {
    console.error("REPLY TO REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add admin reply",
    });
  }
};

