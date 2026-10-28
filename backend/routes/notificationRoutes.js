import express from "express";

import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeAdminToPush,
  unsubscribeAdminFromPush,
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

// ==========================================
// DESKTOP PUSH SUBSCRIPTION
// ==========================================

router.post(
  "/push/subscribe",
  protect,
  adminOnly,
  subscribeAdminToPush,
);

router.delete(
  "/push/unsubscribe",
  protect,
  adminOnly,
  unsubscribeAdminFromPush,
);

export default router;