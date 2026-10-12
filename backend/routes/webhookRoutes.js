import express from "express";

import {
  handleRazorpayWebhook,
  handleShiprocketWebhook,
} from "../controllers/webhookController.js";

const router = express.Router();

// ==========================================
// RAZORPAY WEBHOOK
// ==========================================
router.post(
  "/razorpay",
  handleRazorpayWebhook,
);

// ==========================================
// SHIPPING TRACKING WEBHOOK
// ==========================================
router.post(
  "/tracking",
  handleShiprocketWebhook,
);

export default router;