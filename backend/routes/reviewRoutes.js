import express from "express";

import {
  getProductReviews,
  getMyProductReview,
  createReview,
  updateReview,
  deleteReview,
  getAdminReviews,
  getPendingReviews,
  approveReview,
  rejectReview,
  replyToReview,
  adminDeleteReview,
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

router.get(
  "/product/:productId",
  getProductReviews,
);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/pending",
  protect,
  adminOnly,
  getPendingReviews,
);

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminReviews,
);

router.put(
  "/admin/:id/approve",
  protect,
  adminOnly,
  approveReview,
);

router.put(
  "/admin/:id/reject",
  protect,
  adminOnly,
  rejectReview,
);

router.put(
  "/admin/:id/reply",
  protect,
  adminOnly,
  replyToReview,
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  adminDeleteReview,
);

// ==========================================
// CUSTOMER
// ==========================================

router.get(
  "/product/:productId/my-review",
  protect,
  getMyProductReview,
);

router.post(
  "/",
  protect,
  createReview,
);

router.put(
  "/:id",
  protect,
  updateReview,
);

router.delete(
  "/:id",
  protect,
  deleteReview,
);

export default router;