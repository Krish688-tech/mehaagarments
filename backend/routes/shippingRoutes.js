import express from "express";

import {
  createShipment,
  assignAWB,
  getAvailableCouriers,
  schedulePickup,
} from "../controllers/shippingController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================================
// CREATE SHIPMENT
// ==========================================
router.post(
  "/:orderId/create",
  protect,
  adminOnly,
  createShipment,
);

// ==========================================
// GET AVAILABLE COURIERS
// ==========================================
router.get(
  "/:orderId/couriers",
  protect,
  adminOnly,
  getAvailableCouriers,
);

// ==========================================
// ASSIGN COURIER + GENERATE AWB
// ==========================================
router.post(
  "/:orderId/awb",
  protect,
  adminOnly,
  assignAWB,
);

// ==========================================
// SCHEDULE PICKUP
// ==========================================
router.post(
  "/:orderId/pickup",
  protect,
  adminOnly,
  schedulePickup,
);

export default router;