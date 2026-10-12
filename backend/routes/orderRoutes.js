import express from "express";

import {
  createOrder,
  updateOrderToPaid,
  getMyOrders,
  getMyOrderById,
  getCustomerOrderTracking,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import  adminOnly  from "../middleware/adminMiddleware.js";

const router = express.Router();

// =====================================================
// CUSTOMER ROUTES
// =====================================================

// CREATE ORDER
router.post(
  "/create",
  protect,
  createOrder,
);

// GET MY ORDERS

router.get(
  "/my-orders",
  protect,
  getMyOrders,
);

router.get(
  "/:orderId/tracking",
  protect,
  getCustomerOrderTracking,
);

// GET SINGLE MY ORDER
router.get(
  "/:id",
  protect,
  getMyOrderById,
);

// VERIFY RAZORPAY PAYMENT
router.put(
  "/:id/pay",
  protect,
  updateOrderToPaid,
);

// =====================================================
// ADMIN ROUTES
// =====================================================

// GET ALL ORDERS
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminOrders,
);

// GET SINGLE ORDER
router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getAdminOrderById,
);

// UPDATE ORDER STATUS
router.put(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateAdminOrderStatus,
);


export default router;