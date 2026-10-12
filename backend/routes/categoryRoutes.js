import express from "express";

import {
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  getAdminCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../controllers/categoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC CATEGORIES
// ==========================================

router.get("/", getCategories);



// ==========================================
// ADMIN CATEGORIES
// ==========================================

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminCategories,
);

router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getAdminCategoryById,
);

router.post(
  "/admin",
  protect,
  adminOnly,
  createCategory,
);

router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateCategory,
);

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateCategoryStatus,
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteCategory,
);

// PUBLIC SINGLE CATEGORY
router.get("/:slug", getCategoryBySlug);

export default router;