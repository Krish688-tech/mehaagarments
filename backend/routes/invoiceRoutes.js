import express from "express";

import {
  createInvoice,
  getInvoice,
  downloadInvoicePdf,
} from "../controllers/invoiceController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================================
// ADMIN INVOICE ROUTES
// ==========================================

// Generate invoice
router.post(
  "/:orderId",
  protect,
  adminOnly,
  createInvoice,
);

// Get invoice
router.get(
  "/:orderId",
  protect,
  adminOnly,
  getInvoice,
);

// ==========================================
// CUSTOMER + ADMIN
// ==========================================

// Download invoice PDF
router.get(
  "/:orderId/pdf",
  protect,
  downloadInvoicePdf,
);

export default router;