
import mongoose from "mongoose";

const customOrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    zariType: {
      type: String,
      enum: ["gold", "silver"],
      required: true,
    },

    preferredColor: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    occasion: {
      type: String,
      enum: [
        "Wedding",
        "Reception",
        "Festival",
        "Traditional Event",
        "Other",
        "",
      ],
      default: "",
    },

    designDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },

    referenceImages: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "NEW_REQUEST",
        "UNDER_REVIEW",
        "CONTACTED",
        "QUOTATION_SENT",
        "APPROVED",
        "IN_PRODUCTION",
        "COMPLETED",
        "REJECTED",
      ],
      default: "NEW_REQUEST",
      index: true,
    },

    adminNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

customOrderSchema.index({ createdAt: -1 });

const CustomOrder = mongoose.model(
  "CustomOrder",
  customOrderSchema
);

export default CustomOrder;
