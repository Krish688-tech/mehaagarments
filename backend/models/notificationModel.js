import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["NEW_ORDER", "ORDER_STATUS", "PAYMENT", "SHIPPING"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// PRODUCTION IDEMPOTENCY
// ==========================================
//
// A single order can have only ONE NEW_ORDER
// notification.
//
// Other notification types such as ORDER_STATUS,
// PAYMENT and SHIPPING can still have multiple
// notifications for the same order.
//

notificationSchema.index(
  { type: 1, order: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "NEW_ORDER",
      order: {
        $type: "objectId",
      },
    },
    name: "unique_new_order_notification",
  },
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
);

export default Notification;