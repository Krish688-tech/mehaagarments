import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // ==========================================
    // PRODUCT
    // ==========================================
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // ==========================================
    // CUSTOMER
    // ==========================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // ORDER
    // Used to verify the customer actually
    // purchased the product.
    // ==========================================
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    // ==========================================
    // RATING
    // ==========================================
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5",
      },
    },

    // ==========================================
    // REVIEW TITLE
    // ==========================================
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    // ==========================================
    // REVIEW COMMENT
    // ==========================================
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    // ==========================================
    // REVIEW IMAGES
    // Optional customer-uploaded images
    // ==========================================
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    // ==========================================
    // VERIFIED PURCHASE
    // This must be determined by the backend.
    // Never trust this value directly from frontend.
    // ==========================================
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // REVIEW APPROVAL
    // Reviews remain hidden until admin approves.
    // ==========================================
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ==========================================
    // ADMIN REPLY
    // ==========================================
    adminReply: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    adminRepliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// ONE REVIEW PER CUSTOMER PER PRODUCT
// ==========================================

reviewSchema.index(
  {
    product: 1,
    user: 1,
  },
  {
    unique: true,
  },
);

// ==========================================
// PRODUCT REVIEWS QUERY OPTIMIZATION
// ==========================================

reviewSchema.index({
  product: 1,
  isApproved: 1,
  createdAt: -1,
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;