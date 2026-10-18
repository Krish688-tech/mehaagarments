import express from "express";

import {
  getProducts,
  getProductById,
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductSitemap,
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import  adminOnly  from "../middleware/adminMiddleware.js";

const router = express.Router();


// =====================================================
// ADMIN ROUTES
// =====================================================

// ADMIN - ALL PRODUCTS

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminProducts
);

// ADMIN - SINGLE PRODUCT

router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getAdminProductById
);

// ADMIN - CREATE PRODUCT

router.post(
  "/",
  protect,
  adminOnly,
  createProduct
);


// ADMIN - UPDATE PRODUCT

router.put(
  "/:id",
  protect,
  adminOnly,
  updateProduct
);


// ADMIN - DEACTIVATE PRODUCT

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

 // =====================================================
// PUBLIC ROUTES
// =====================================================

// DYNAMIC PRODUCT SITEMAP

router.get("/sitemap.xml", getProductSitemap);

// ALL ACTIVE PRODUCTS

router.get("/", getProducts);

// SINGLE ACTIVE PRODUCT

router.get("/:id", getProductById);

export default router;