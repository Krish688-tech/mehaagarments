import express from "express";

import {
  getUniqueCategories,
  getAdminUniqueCategories,
  getUniqueCategoryBySlug,
  createUniqueCategory,
  updateUniqueCategory,
  deleteUniqueCategory,
  addProductToUniqueCategory,
  removeProductFromUniqueCategory,
} from "../controllers/uniqueCategoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

// Get all active unique categories
router.get(
  "/",
  getUniqueCategories,
);

// ==========================================
// ADMIN
// ==========================================

// Get all unique categories
router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminUniqueCategories,
);

// Create unique category
router.post(
  "/admin",
  protect,
  adminOnly,
  createUniqueCategory,
);

// Update unique category
router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateUniqueCategory,
);

// Delete unique category
router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteUniqueCategory,
);

// Add product
router.post(
  "/admin/:id/products",
  protect,
  adminOnly,
  addProductToUniqueCategory,
);

// Remove product
router.delete(
  "/admin/:id/products/:productId",
  protect,
  adminOnly,
  removeProductFromUniqueCategory,
);

// ==========================================
// PUBLIC - SINGLE CATEGORY
// ==========================================

// Get single unique category
router.get(
  "/:slug",
  getUniqueCategoryBySlug,
);

export default router;