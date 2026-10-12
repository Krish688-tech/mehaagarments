import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        name: String,

        image: String,

        price: Number,

        quantity: Number,

        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    shippingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      apartment: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "razorpay",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cod_pending", "refund_pending"],
      default: "pending",
    },

    paymentResult: {
      razorpay_payment_id: String,

      razorpay_order_id: {
        type: String,
        index: true,
      },

      razorpay_signature: String,
    },

    refundResult: {
      razorpay_refund_id: String,
      status: {
        type: String,
        enum: ["pending", "processed", "failed"],
        default: "pending",
      },
      amount: Number,
      reason: String,
      refundedAt: Date,
    },

    invoice: {
      invoiceNumber: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
      },

      issuedAt: {
        type: Date,
      },
    },

    refundRequested: {
      type: Boolean,
      default: false,
    },

    refundRequestedAt: Date,

    isPaid: {
      type: Boolean,
      default: false,
    },

    inventoryAdjusted: {
      type: Boolean,
      default: false,
    },

    inventoryAdjustedAt: Date,

    paidAt: Date,

    shipping: {
      provider: {
        type: String,
        enum: ["shiprocket"],
        default: null,
      },

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

      courierName: {
        type: String,
        default: null,
      },

      courierId: {
        type: Number,
        default: null,
      },

      awb: {
        type: String,
        default: null,
        index: true,
      },

      trackingUrl: {
        type: String,
        default: null,
      },

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
        default: "not_created",
      },

      creationAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      lastError: {
        type: String,
        default: null,
        trim: true,
      },

      createdAt: {
        type: Date,
        default: null,
      },

      pickupScheduledAt: {
        type: Date,
        default: null,
      },

      shippedAt: {
        type: Date,
        default: null,
      },

      deliveredAt: {
        type: Date,
        default: null,
      },

      etd: {
        type: Date,
        default: null,
      },
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
