import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: ["ORDER_CONFIRMATION", "ORDER_DELIVERED", "NEW_ORDER_ADMIN", "PASSWORD_RESET"],
      required: true,
    },

    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },

    messageId: {
      type: String,
      default: null,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    error: {
      type: String,
      default: null,
      trim: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// PREVENT DUPLICATE EMAILS
// ==========================================

emailLogSchema.index(
  { order: 1, type: 1, recipient: 1 },
  {
    unique: true,
    name: "unique_order_email",
    partialFilterExpression: { order: { $type: "objectId" } },
  },
);

emailLogSchema.index(
  { user: 1, type: 1, recipient: 1 },
  {
    unique: true,
    name: "unique_user_email",
    partialFilterExpression: { user: { $type: "objectId" } },
  },
);

const EmailLog = mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
