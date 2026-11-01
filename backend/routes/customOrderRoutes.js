
import express from "express";

import {
  createCustomOrder,
  getMyCustomOrders,
} from "../controllers/customOrderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer must be logged in.
router.post("/", protect, createCustomOrder);

// Customer can only retrieve their own requests.
router.get("/my-orders", protect, getMyCustomOrders);

export default router;
