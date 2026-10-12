import express from "express";

import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================================
// GET ADMIN NOTIFICATIONS
// ==========================================

router.get(
  "/",
  protect,
  adminOnly,
  getAdminNotifications,
);

// ==========================================
// MARK ALL AS READ
// ==========================================

router.patch(
  "/read-all",
  protect,
  adminOnly,
  markAllNotificationsAsRead,
);

// ==========================================
// MARK ONE AS READ
// ==========================================

router.patch(
  "/:id/read",
  protect,
  adminOnly,
  markNotificationAsRead,
);

export default router;