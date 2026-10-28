import webpush from "web-push";
import PushSubscription from "../models/pushSubscriptionModel.js";
import Notification from "../models/notificationModel.js";

let ioInstance = null;

// ==========================================
// WEB PUSH CONFIGURATION
// ==========================================

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const emitCustomerShippingUpdate = ({
  userId,
  orderId,
  shipping,
  historyEvent = null,
}) => {
  if (!ioInstance || !userId || !orderId) {
    return;
  }

  ioInstance
    .to(`customer:${userId.toString()}`)
    .emit("customer:shipping:update", {
      orderId: orderId.toString(),
      shipping,
      historyEvent,
    });
};

// ==========================================
// SEND PUSH NOTIFICATIONS TO ADMIN DEVICES
// ==========================================

const sendAdminPushNotification = async (notification) => {
  try {
    const subscriptions = await PushSubscription.find();

    if (!subscriptions.length) {
      return;
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      url: notification.order
        ? `/admin/orders/${notification.order}`
        : "/admin/orders",
      notificationId: notification._id.toString(),
    });

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            payload,
          );
        } catch (error) {
          // Remove expired or invalid browser subscriptions.
          if (error.statusCode === 404 || error.statusCode === 410) {
            await PushSubscription.deleteOne({
              _id: subscription._id,
            });
          } else {
            console.error(
              "Admin push delivery error:",
              error.statusCode || error.message,
            );
          }
        }
      }),
    );
  } catch (error) {
    console.error("Admin push service error:", error.message);
  }
};

export const createAdminNotification = async ({
  type,
  title,
  message,
  orderId = null,
}) => {
  try {
    // ==========================================
    // FAST DUPLICATE CHECK
    // ==========================================

    if (type === "NEW_ORDER" && orderId) {
      const existingNotification =
        await Notification.findOne({
          type: "NEW_ORDER",
          order: orderId,
        });

      if (existingNotification) {
        return existingNotification;
      }
    }

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================

    const notification = await Notification.create({
      type,
      title,
      message,
      order: orderId,
    });

  

    // ==========================================
    // REAL-TIME ADMIN NOTIFICATION
    // ==========================================

    if (ioInstance) {
      ioInstance
        .to("admins")
        .emit("admin:notification", notification);
    }

    // ==========================================
    // WINDOWS DESKTOP PUSH NOTIFICATION
    // ==========================================

    await sendAdminPushNotification(notification);

    return notification;
  } catch (error) {
    // ==========================================
    // DATABASE-LEVEL DUPLICATE PROTECTION
    // ==========================================

    if (
      error?.code === 11000 &&
      type === "NEW_ORDER" &&
      orderId
    ) {
      const existingNotification =
        await Notification.findOne({
          type: "NEW_ORDER",
          order: orderId,
        });

      return existingNotification || null;
    }

    // ==========================================
    // OTHER NOTIFICATION ERRORS
    // ==========================================

    console.error(
      "Notification creation error:",
      error.message,
    );

    return null;
  }
};