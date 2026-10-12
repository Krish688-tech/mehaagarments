import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    sequence: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const InvoiceCounter = mongoose.model(
  "InvoiceCounter",
  invoiceCounterSchema,
);

export default InvoiceCounter;