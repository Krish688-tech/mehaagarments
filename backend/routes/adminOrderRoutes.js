import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
} from "../controllers/adminOrderController.js";

import { generateInvoice } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAdminOrders);

router.get("/:id", protect, adminOnly, getAdminOrderById);

router.put("/:id/status", protect, adminOnly, updateAdminOrderStatus);

// ==========================================
// GENERATE INVOICE
// ==========================================

router.post(
  "/:id/invoice",
  protect,
  adminOnly,
  generateInvoice
);

export default router;