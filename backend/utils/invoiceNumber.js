import InvoiceCounter from "../models/invoiceCounterModel.js";

// ==========================================
// GENERATE UNIQUE INVOICE NUMBER
// ==========================================

export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();

  const counterId = `invoice-${year}`;

  // ==========================================
  // ATOMIC COUNTER INCREMENT
  // ==========================================

  const counter = await InvoiceCounter.findOneAndUpdate(
    {
      _id: counterId,
    },
    {
      $inc: {
        sequence: 1,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  // ==========================================
  // GENERATE INVOICE NUMBER
  // ==========================================

  return `MG-${year}-${String(counter.sequence).padStart(6, "0")}`;
};