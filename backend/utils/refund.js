import razorpay from "../config/razorpay.js";

// ==========================================
// RAZORPAY REFUND
// ==========================================

export const createRazorpayRefund = async ({
  paymentId,
  amount,
  reason,
}) => {
  if (!paymentId) {
    throw new Error(
      "Razorpay payment ID is required for refund",
    );
  }

  if (!amount || amount <= 0) {
    throw new Error(
      "Valid refund amount is required",
    );
  }

  const refund = await razorpay.payments.refund(
    paymentId,
    {
      amount: Math.round(amount * 100),

      notes: {
        reason:
          reason ||
          "Inventory unavailable",
      },
    },
  );

  return refund;
};