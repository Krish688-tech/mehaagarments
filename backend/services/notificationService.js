import Notification from "../models/notificationModel.js";

let ioInstance = null;

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