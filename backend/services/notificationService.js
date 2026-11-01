
import webpush from "web-push";
import PushSubscription from "../models/pushSubscriptionModel.js";
import Notification from "../models/notificationModel.js";

let ioInstance = null;

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
  if (!ioInstance || !userId || !orderId) return;

  ioInstance
    .to(`customer:${userId.toString()}`)
    .emit("customer:shipping:update", {
      orderId: orderId.toString(),
      shipping,
      historyEvent,
    });
};

// ==========================================
// ADMIN PUSH NOTIFICATIONS
// ==========================================

const sendAdminPushNotification = async (notification) => {
  try {
    const subscriptions = await PushSubscription.find();

    if (!subscriptions.length) return;

    const isCustomOrder = Boolean(notification.customOrder);

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      url: isCustomOrder
        ? `/admin/custom-orders/${notification.customOrder}`
        : notification.order
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

// ==========================================
// CREATE ADMIN NOTIFICATION
// ==========================================

export const createAdminNotification = async ({
  type,
  title,
  message,
  orderId = null,
  customOrderId = null,
}) => {
  try {
    // Duplicate protection
    if (type === "NEW_ORDER" && orderId) {
      const existing = await Notification.findOne({
        type: "NEW_ORDER",
        order: orderId,
      });

      if (existing) return existing;
    }

    if (type === "CUSTOM_ORDER" && customOrderId) {
      const existing = await Notification.findOne({
        type: "CUSTOM_ORDER",
        customOrder: customOrderId,
      });

      if (existing) return existing;
    }

    const notification = await Notification.create({
      type,
      title,
      message,
      order: orderId,
      customOrder: customOrderId,
    });

    // Real-time admin notification
    if (ioInstance) {
      ioInstance
        .to("admins")
        .emit("admin:notification", notification);
    }

    // Desktop push notification
    await sendAdminPushNotification(notification);

    return notification;
  } catch (error) {
    // Handle duplicate database entries
    if (error?.code === 11000) {
      if (type === "NEW_ORDER" && orderId) {
        return await Notification.findOne({
          type: "NEW_ORDER",
          order: orderId,
        });
      }

      if (type === "CUSTOM_ORDER" && customOrderId) {
        return await Notification.findOne({
          type: "CUSTOM_ORDER",
          customOrder: customOrderId,
        });
      }
    }

    console.error(
      "Notification creation error:",
      error.message,
    );

    return null;
  }
};
