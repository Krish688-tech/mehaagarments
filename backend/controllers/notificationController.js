import Notification from "../models/notificationModel.js";
import PushSubscription from "../models/pushSubscriptionModel.js";

// ==========================================
// GET ADMIN NOTIFICATIONS
// ==========================================

export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("order", "_id orderStatus totalPrice createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error.message,
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error.message,
    );

    res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsRead = async (
  req,
  res,
) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } },
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error.message,
    );

    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

// ==========================================
// SUBSCRIBE ADMIN TO DESKTOP PUSH NOTIFICATIONS
// ==========================================

export const subscribeAdminToPush = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({
        success: false,
        message: "Invalid push subscription",
      });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        $set: {
          endpoint,
          keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
          admin: req.user._id,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(201).json({
      success: true,
      message: "Desktop notifications enabled",
    });
  } catch (error) {
    console.error("Push subscription error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to enable desktop notifications",
    });
  }
};

// ==========================================
// UNSUBSCRIBE ADMIN FROM DESKTOP PUSH
// ==========================================

export const unsubscribeAdminFromPush = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: "Subscription endpoint is required",
      });
    }

    await PushSubscription.deleteOne({
      endpoint,
      admin: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Desktop notifications disabled",
    });
  } catch (error) {
    console.error("Push unsubscribe error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to disable desktop notifications",
    });
  }
};