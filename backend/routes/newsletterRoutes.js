
import express from "express";

import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers,
  exportNewsletterSubscribers,
} from "../controllers/newsletterController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

router.post("/subscribe", subscribeNewsletter);

router.post("/unsubscribe", unsubscribeNewsletter);

// ==========================================
// ADMIN ROUTES
// ==========================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getNewsletterSubscribers
);

router.get(
  "/admin/export",
  protect,
  adminOnly,
  exportNewsletterSubscribers
);

export default router;
