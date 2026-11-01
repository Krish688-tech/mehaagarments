import express from "express";

import {
  getAllCustomOrders,
  getCustomOrderById,
  updateCustomOrder,
} from "../controllers/customOrderController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", getAllCustomOrders);

router.get("/:id", getCustomOrderById);

router.put("/:id", updateCustomOrder);

export default router;