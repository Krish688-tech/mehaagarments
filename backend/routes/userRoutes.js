import express from "express";

import {
  getUserProfile,
  updateUserProfile,
  saveUserAddress,
  changePassword,
  getAdminCustomers,
  getAdminCustomerById,
  getAdminCustomerOrders,
  updateAdminCustomerStatus,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();


// ============================================
// CUSTOMER PROFILE
// ============================================

// Get logged-in user's profile
router.get(
  "/profile",
  protect,
  getUserProfile
);


// Update logged-in user's profile
router.put(
  "/profile",
  protect,
  updateUserProfile
);


// ============================================
// ADDRESS
// ============================================

// Save/update customer's address
router.put(
  "/save-address",
  protect,
  saveUserAddress
);


// ============================================
// PASSWORD
// ============================================

// Change logged-in user's password
router.put(
  "/change-password",
  protect,
  changePassword
);

// ============================================
// ADMIN CUSTOMERS
// ============================================

// Get all customers
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminCustomers,
);

// Get customer's orders
router.get(
  "/admin/:id/orders",
  protect,
  adminOnly,
  getAdminCustomerOrders,
);

// Get single customer
router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getAdminCustomerById,
);

// Activate / deactivate customer
router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateAdminCustomerStatus,
);


export default router;