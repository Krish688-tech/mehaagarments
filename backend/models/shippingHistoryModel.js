import mongoose from "mongoose";

const shippingHistorySchema = new mongoose.Schema(
  {
    // ------------------------------------------
    // ORDER
    // ------------------------------------------
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    // ------------------------------------------
    // SHIPROCKET IDENTIFIERS
    // ------------------------------------------
    shiprocketOrderId: {
      type: String,
      default: null,
      index: true,
    },

    shipmentId: {
      type: String,
      default: null,
      index: true,
    },

    awb: {
      type: String,
      default: null,
      index: true,
    },

    // ------------------------------------------
    // COURIER
    // ------------------------------------------
    courierName: {
      type: String,
      default: null,
      trim: true,
    },

    courierId: {
      type: Number,
      default: null,
    },

    // ------------------------------------------
    // SHIPPING STATUS
    // ------------------------------------------
    status: {
      type: String,
      enum: [
        "not_created",
        "creating",
        "created",
        "awb_generating",
        "awb_assigned",
        "pickup_scheduling",
        "pickup_scheduled",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "rto",
        "exception",
        "failed",
      ],
      required: true,
    },

    // ------------------------------------------
    // SHIPROCKET ORIGINAL STATUS
    // ------------------------------------------
    rawStatus: {
      type: String,
      default: null,
      trim: true,
    },

    rawShipmentStatus: {
      type: String,
      default: null,
      trim: true,
    },

    // ------------------------------------------
    // TRACKING INFORMATION
    // ------------------------------------------
    description: {
      type: String,
      default: null,
      trim: true,
    },

    location: {
      type: String,
      default: null,
      trim: true,
    },

    activity: {
      type: String,
      default: null,
      trim: true,
    },

    // ------------------------------------------
    // DATES
    // ------------------------------------------
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },

    etd: {
      type: Date,
      default: null,
    },

    pickupScheduledAt: {
      type: Date,
      default: null,
    },

    // ------------------------------------------
    // SHIPROCKET EVENT ID / DEDUPLICATION
    // ------------------------------------------
    eventKey: {
      type: String,
      required: true,
    },

    // ------------------------------------------
    // ORIGINAL SHIPROCKET PAYLOAD
    //
    // Useful for debugging and future integrations.
    // ------------------------------------------
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// INDEXES
// ==========================================

// Fast order timeline lookup
shippingHistorySchema.index({
  order: 1,
  eventDate: -1,
});

// Prevent duplicate webhook events
shippingHistorySchema.index(
  {
    order: 1,
    eventKey: 1,
  },
  {
    unique: true,
    name: "unique_shipping_event",
  },
);

// Fast AWB tracking lookup
shippingHistorySchema.index({
  awb: 1,
  eventDate: -1,
});

const ShippingHistory = mongoose.model(
  "ShippingHistory",
  shippingHistorySchema,
);

export default ShippingHistory;