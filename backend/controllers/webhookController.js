import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../models/orderModel.js";
import razorpay from "../config/razorpay.js";

import { reduceInventory } from "../utils/inventory.js";
import { createRazorpayRefund } from "../utils/refund.js";
import {
  createAdminNotification,
  emitCustomerShippingUpdate,
} from "../services/notificationService.js";
import ShippingHistory from "../models/shippingHistoryModel.js";

import { sendCustomerDeliveredEmail, sendCustomerDispatchedEmail } from "../services/emailService.js";

// ==========================================
// RAZORPAY WEBHOOK
// ==========================================

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    const webhookEventId = req.headers["x-razorpay-event-id"];

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay webhook signature",
      });
    }

    if (!webhookEventId) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay webhook event ID",
      });
    }

    // ==========================================
    // RAW BODY
    // ==========================================

    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook body",
      });
    }

    // ==========================================
    // VERIFY WEBHOOK SIGNATURE
    // ==========================================

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const expectedSignature = Buffer.from(generatedSignature, "utf8");

    const receivedSignature = Buffer.from(webhookSignature, "utf8");

    if (
      expectedSignature.length !== receivedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      console.error("INVALID RAZORPAY WEBHOOK SIGNATURE");

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // ==========================================
    // PARSE VERIFIED BODY
    // ==========================================

    let payload;

    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook JSON",
      });
    }

    const event = payload.event;

    console.log(`RAZORPAY WEBHOOK RECEIVED: ${event}`);

    // ==========================================
    // PAYMENT CAPTURED
    // ==========================================

    if (event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;

      if (!payment) {
        return res.status(200).json({
          success: true,
          message: "Payment information missing",
        });
      }

      const razorpayPaymentId = payment.id;

      const razorpayOrderId = payment.order_id;

      // ==========================================
      // FIND OUR ORDER
      // ==========================================

      const order = await Order.findOne({
        "paymentResult.razorpay_order_id": razorpayOrderId,
      });

      if (!order) {
        console.error("ORDER NOT FOUND FOR RAZORPAY ORDER:", razorpayOrderId);

        return res.status(200).json({
          success: true,
          message: "Webhook received for unknown order",
        });
      }

      // ==========================================
      // ALREADY COMPLETELY PROCESSED
      // ==========================================

      if (order.isPaid && order.inventoryAdjusted) {
        return res.status(200).json({
          success: true,
          message: "Order already synchronized",
        });
      }

      // ==========================================
      // VERIFY RAZORPAY ORDER ID
      // ==========================================

      if (order.paymentResult?.razorpay_order_id !== razorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: "Razorpay order ID mismatch",
        });
      }

      // ==========================================
      // VERIFY PAYMENT AMOUNT
      // ==========================================

      const expectedAmount = Math.round(order.totalPrice * 100);

      if (Number(payment.amount) !== expectedAmount) {
        console.error("WEBHOOK PAYMENT AMOUNT MISMATCH");

        return res.status(400).json({
          success: false,
          message: "Payment amount mismatch",
        });
      }

      // ==========================================
      // VERIFY CURRENCY
      // ==========================================

      if (payment.currency !== "INR") {
        return res.status(400).json({
          success: false,
          message: "Payment currency mismatch",
        });
      }

      // ==========================================
      // VERIFY CAPTURED STATUS
      // ==========================================

      if (payment.status !== "captured") {
        return res.status(400).json({
          success: false,
          message: "Payment is not captured",
        });
      }

      // ==========================================
      // SERVER-SIDE PAYMENT FETCH
      // ==========================================

      const verifiedPayment = await razorpay.payments.fetch(razorpayPaymentId);

      if (verifiedPayment.status !== "captured") {
        return res.status(400).json({
          success: false,
          message: "Razorpay payment is not captured",
        });
      }

      if (Number(verifiedPayment.amount) !== expectedAmount) {
        return res.status(400).json({
          success: false,
          message: "Verified payment amount mismatch",
        });
      }

      if (verifiedPayment.currency !== "INR") {
        return res.status(400).json({
          success: false,
          message: "Verified payment currency mismatch",
        });
      }

      if (verifiedPayment.order_id !== razorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: "Verified Razorpay order mismatch",
        });
      }

      // ==========================================
      // INVENTORY TRANSACTION
      // ==========================================

      const session = await mongoose.startSession();

      let inventoryError = null;

      try {
        await session.withTransaction(async () => {
          const transactionOrder = await Order.findById(order._id).session(
            session,
          );

          if (!transactionOrder) {
            throw new Error("Order not found inside transaction");
          }

          // ==========================================
          // IDEMPOTENCY
          // ==========================================

          if (transactionOrder.inventoryAdjusted) {
            return;
          }

          // ==========================================
          // REDUCE INVENTORY
          // ==========================================

          await reduceInventory(transactionOrder.orderItems, session);

          // ==========================================
          // INVENTORY SUCCESS
          // ==========================================

          transactionOrder.inventoryAdjusted = true;

          transactionOrder.inventoryAdjustedAt = new Date();

          transactionOrder.isPaid = true;

          transactionOrder.paidAt = transactionOrder.paidAt || new Date();

          transactionOrder.paymentStatus = "paid";

          transactionOrder.orderStatus = "Confirmed";

          transactionOrder.paymentResult = {
            razorpay_payment_id: razorpayPaymentId,

            razorpay_order_id: razorpayOrderId,

            razorpay_signature:
              transactionOrder.paymentResult?.razorpay_signature,
          };

          await transactionOrder.save({
            session,
          });
        });
      } catch (error) {
        inventoryError = error;
      } finally {
        await session.endSession();
      }

      await createAdminNotification({
        type: "NEW_ORDER",
        title: "New Order Received",
        message: `New paid order received from ${
          order.shippingAddress.firstName || "Customer"
        }`,
        orderId: order._id,
      });

      // ==========================================
      // INVENTORY FAILED
      // PAYMENT ALREADY CAPTURED
      // ==========================================

      if (inventoryError) {
        console.error("INVENTORY REDUCTION FAILED:", inventoryError);

        // ==========================================
        // REFUND LOCK
        // ==========================================

        const refundLock = await Order.findOneAndUpdate(
          {
            _id: order._id,

            isPaid: false,

            inventoryAdjusted: false,

            refundRequested: false,
          },
          {
            $set: {
              refundRequested: true,
              refundRequestedAt: new Date(),

              refundResult: {
                status: "pending",
                amount: order.totalPrice,
                reason: "Inventory unavailable",
              },

              paymentResult: {
                razorpay_payment_id: razorpayPaymentId,

                razorpay_order_id: razorpayOrderId,
              },
            },
          },
          {
            new: true,
          },
        );

        // ==========================================
        // ANOTHER WEBHOOK ALREADY GOT THE LOCK
        // ==========================================

        if (!refundLock) {
          console.log(`REFUND ALREADY REQUESTED FOR ORDER ${order._id}`);

          return res.status(200).json({
            success: true,
            message: "Refund already being processed",
          });
        }

        // ==========================================
        // CREATE RAZORPAY REFUND
        // ==========================================

        try {
          const refund = await createRazorpayRefund({
            paymentId: razorpayPaymentId,

            amount: order.totalPrice,

            reason: "Inventory unavailable",
          });

          // ==========================================
          // REFUND SUCCESS
          // ==========================================

          await Order.findByIdAndUpdate(order._id, {
            $set: {
              paymentStatus: "failed",

              isPaid: false,

              orderStatus: "Cancelled",

              "refundResult.razorpay_refund_id": refund.id,

              "refundResult.status": "processed",

              "refundResult.amount": order.totalPrice,

              "refundResult.reason": "Inventory unavailable",

              "refundResult.refundedAt": new Date(),
            },
          });

          console.log(`REFUND SUCCESSFUL FOR ORDER ${order._id}`);

          return res.status(200).json({
            success: true,
            message: "Payment refunded because inventory was unavailable",
          });
        } catch (refundError) {
          // ==========================================
          // REFUND FAILED
          // ==========================================

          console.error("RAZORPAY REFUND FAILED:", refundError);

          await Order.findByIdAndUpdate(order._id, {
            $set: {
              paymentStatus: "pending",

              orderStatus: "Pending",

              "refundResult.status": "failed",

              "refundResult.amount": order.totalPrice,

              "refundResult.reason": "Inventory unavailable - refund failed",
            },
          });

          // ==========================================
          // IMPORTANT
          // Return 500 so Razorpay retries
          // ==========================================

          return res.status(500).json({
            success: false,
            message: "Inventory failed and refund could not be completed",
          });
        }
      }

      // ==========================================
      // INVENTORY + PAYMENT SUCCESS
      // ==========================================

      console.log(`ORDER ${order._id} SYNCHRONIZED VIA RAZORPAY WEBHOOK`);

      return res.status(200).json({
        success: true,
        message: "Payment and inventory synchronized successfully",
      });
    }

    // ==========================================
    // PAYMENT FAILED
    // ==========================================

    if (event === "payment.failed") {
      const payment = payload.payload?.payment?.entity;

      if (!payment) {
        return res.status(200).json({
          success: true,
        });
      }

      const razorpayOrderId = payment.order_id;

      const order = await Order.findOne({
        "paymentResult.razorpay_order_id": razorpayOrderId,
      });

      if (order && !order.isPaid) {
        order.paymentStatus = "failed";

        await order.save();

        console.log(`ORDER ${order._id} PAYMENT FAILED`);
      }

      return res.status(200).json({
        success: true,
        message: "Payment failure processed",
      });
    }

    // ==========================================
    // OTHER EVENTS
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("RAZORPAY WEBHOOK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

// ==========================================
// SHIPROCKET WEBHOOK HELPERS
// ==========================================

const parseShiprocketDate = (value) => {
  if (!value) return null;

  // Already a Date
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const stringValue = String(value).trim();

  if (!stringValue) return null;

  // ------------------------------------------
  // Shiprocket documented format:
  // DD MM YYYY HH:mm:ss
  // Example:
  // 23 05 2023 11:43:52
  // ------------------------------------------
  const shiprocketDateMatch = stringValue.match(
    /^(\d{2})\s+(\d{2})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
  );

  if (shiprocketDateMatch) {
    const [, day, month, year, hours, minutes, seconds] = shiprocketDateMatch;

    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds),
    );

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // ------------------------------------------
  // Standard date / ISO format
  // ------------------------------------------
  const parsed = new Date(stringValue);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeShiprocketStatus = (status) => {
  if (!status) return null;

  const normalized = String(status).trim().toUpperCase().replace(/[_-]+/g, " ");

  const statusMap = {
    "PICKUP SCHEDULED": "pickup_scheduled",

    "PICKED UP": "picked_up",
    "PICKUP DONE": "picked_up",

    SHIPPED: "in_transit",

    "IN TRANSIT": "in_transit",

    "OUT FOR DELIVERY": "out_for_delivery",

    DELIVERED: "delivered",

    RTO: "rto",
    "RTO INITIATED": "rto",
    "RTO DELIVERED": "rto",

    EXCEPTION: "exception",
    "DELIVERY EXCEPTION": "exception",
    UNDELIVERED: "exception",

    CANCELLED: "cancelled",
    CANCELED: "cancelled",
  };

  return statusMap[normalized] || null;
};

const getShippingStatusPriority = (status) => {
  const priorities = {
    not_created: 0,
    creating: 1,
    created: 2,
    awb_generating: 3,
    awb_assigned: 4,
    pickup_scheduling: 5,
    pickup_scheduled: 6,
    picked_up: 7,
    in_transit: 8,
    out_for_delivery: 9,
    delivered: 10,

    cancelled: 100,
    rto: 100,
    exception: 100,
    failed: 100,
  };

  return priorities[status] ?? -1;
};

// ==========================================
// SHIPROCKET TRACKING WEBHOOK
// ==========================================

export const handleShiprocketWebhook = async (req, res) => {
  try {
    // ==========================================
    // 1. VERIFY WEBHOOK SECURITY TOKEN
    // ==========================================

    const configuredToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;

    if (!configuredToken) {
      console.error(
        "Shiprocket webhook rejected: SHIPROCKET_WEBHOOK_TOKEN is not configured",
      );

      return res.status(500).json({
        success: false,
        message: "Webhook security is not configured",
      });
    }

    const receivedToken = req.headers["x-api-key"];

    if (!receivedToken || receivedToken !== configuredToken) {
      console.warn("Shiprocket webhook rejected: invalid security token");

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ==========================================
    // 2. PARSE RAW REQUEST BODY
    // ==========================================

    let payload;

    try {
      if (Buffer.isBuffer(req.body)) {
        payload = JSON.parse(req.body.toString("utf8"));
      } else if (typeof req.body === "string") {
        payload = JSON.parse(req.body);
      } else {
        payload = req.body;
      }
    } catch (parseError) {
      console.error("Shiprocket webhook JSON parse error:", parseError.message);

      return res.status(400).json({
        success: false,
        message: "Invalid webhook JSON",
      });
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    // ==========================================
    // 3. EXTRACT SHIPROCKET DATA
    // ==========================================

    const awb = payload.awb ? String(payload.awb).trim() : null;

    const shiprocketOrderId =
      payload.sr_order_id !== undefined && payload.sr_order_id !== null
        ? String(payload.sr_order_id).trim()
        : null;

    const currentStatus = payload.current_status
      ? String(payload.current_status).trim()
      : null;

    const shipmentStatus = payload.shipment_status
      ? String(payload.shipment_status).trim()
      : null;

    const courierName = payload.courier_name
      ? String(payload.courier_name).trim()
      : null;

    // ==========================================
    // 4. REQUIRE SHIPMENT IDENTIFIER
    // ==========================================

    if (!awb && !shiprocketOrderId) {
      console.warn("Shiprocket webhook ignored: no AWB or Shiprocket order ID");

      return res.status(200).json({
        success: true,
        message: "Webhook received but no shipment identifier was provided",
      });
    }

    // ==========================================
    // 5. NORMALIZE STATUS
    // ==========================================

    const normalizedStatus =
      normalizeShiprocketStatus(currentStatus) ||
      normalizeShiprocketStatus(shipmentStatus);

    if (!normalizedStatus) {
      console.log("Shiprocket webhook received unknown status:", {
        awb,
        shiprocketOrderId,
        currentStatus,
        shipmentStatus,
      });

      return res.status(200).json({
        success: true,
        message: "Webhook received with unrecognized status",
      });
    }

    // ==========================================
    // 6. FIND ORDER
    // ==========================================

    let order = null;

    if (awb) {
      order = await Order.findOne({
        "shipping.awb": awb,
      });
    }

    if (!order && shiprocketOrderId) {
      order = await Order.findOne({
        "shipping.shiprocketOrderId": shiprocketOrderId,
      });
    }

    if (!order) {
      console.warn("Shiprocket webhook received for unknown shipment:", {
        awb,
        shiprocketOrderId,
        currentStatus,
        shipmentStatus,
      });

      // The webhook itself was valid.
      // There is nothing useful to retry.
      return res.status(200).json({
        success: true,
        message: "Webhook received but shipment was not found",
      });
    }

    // ==========================================
    // 7. EVENT DATE
    // ==========================================

    const eventDate =
      parseShiprocketDate(payload.current_timestamp) || new Date();

    const pickupScheduledAt = parseShiprocketDate(
      payload.pickup_scheduled_date,
    );

    const etd = parseShiprocketDate(payload.etd);

    // ==========================================
    // 8. BUILD A STABLE EVENT KEY
    //
    // Shiprocket can send duplicate events.
    // We create a deterministic key so MongoDB
    // can reject duplicates.
    // ==========================================

    const eventSource =
      payload.current_timestamp ||
      payload.pickup_scheduled_date ||
      payload.etd ||
      eventDate.toISOString();

    const eventKey = crypto
      .createHash("sha256")
      .update(
        [
          order._id.toString(),
          awb || "",
          shiprocketOrderId || "",
          currentStatus || "",
          shipmentStatus || "",
          String(eventSource),
        ].join("|"),
      )
      .digest("hex");

    // ==========================================
    // 9. PREVENT STATUS REGRESSION
    // ==========================================

    const previousStatus = order.shipping?.status || "not_created";

    const previousPriority = getShippingStatusPriority(previousStatus);

    const incomingPriority = getShippingStatusPriority(normalizedStatus);

    const terminalStatuses = ["delivered", "cancelled"];

    const exceptionalStatuses = ["exception", "rto", "cancelled"];

    // Don't move backwards after delivery/cancellation.
    if (
      terminalStatuses.includes(previousStatus) &&
      normalizedStatus !== previousStatus &&
      !exceptionalStatuses.includes(normalizedStatus)
    ) {
      console.warn(
        `Ignoring status regression for order ${order._id}: ${previousStatus} → ${normalizedStatus}`,
      );

      return res.status(200).json({
        success: true,
        message: "Older shipping status ignored",
      });
    }

    // Don't move a normal shipment backwards.
    if (
      !exceptionalStatuses.includes(normalizedStatus) &&
      incomingPriority < previousPriority
    ) {
      console.warn(
        `Ignoring shipping status regression for order ${order._id}: ${previousStatus} → ${normalizedStatus}`,
      );

      return res.status(200).json({
        success: true,
        message: "Older shipping status ignored",
      });
    }

    // ==========================================
    // 10. EXTRACT SCAN INFORMATION
    // ==========================================

    const scans = Array.isArray(payload.scans) ? payload.scans : [];

    const latestScan = scans.length > 0 ? scans[scans.length - 1] : null;

    const scanActivity =
      latestScan?.activity || latestScan?.status || currentStatus || null;

    const scanLocation =
      latestScan?.location ||
      latestScan?.location_name ||
      latestScan?.city ||
      null;

    const scanDescription =
      latestScan?.description || latestScan?.activity || currentStatus || null;

    // ==========================================
    // 11. BUILD ORDER UPDATE
    // ==========================================

    const orderUpdate = {
      $set: {
        "shipping.status": normalizedStatus,
        "shipping.lastError": null,
      },
    };

    if (awb && !order.shipping?.awb) {
      orderUpdate.$set["shipping.awb"] = awb;
    }

    if (courierName) {
      orderUpdate.$set["shipping.courierName"] = courierName;
    }

    if (pickupScheduledAt) {
      orderUpdate.$set["shipping.pickupScheduledAt"] = pickupScheduledAt;
    }

    if (etd) {
      orderUpdate.$set["shipping.etd"] = etd;
    }

    // ==========================================
    // SHIPPED / PICKUP TIMESTAMP
    // ==========================================

    if (normalizedStatus === "picked_up" && !order.shipping?.shippedAt) {
      orderUpdate.$set["shipping.shippedAt"] = eventDate;
    }

    // ==========================================
    // DELIVERED TIMESTAMP
    // ==========================================

    if (normalizedStatus === "delivered" && !order.shipping?.deliveredAt) {
      orderUpdate.$set["shipping.deliveredAt"] = eventDate;
    }

    // ==========================================
    // 12. UPDATE CUSTOMER ORDER STATUS
    // ==========================================

    if (
      ["picked_up", "in_transit", "out_for_delivery"].includes(normalizedStatus)
    ) {
      if (!["Delivered", "Cancelled"].includes(order.orderStatus)) {
        orderUpdate.$set.orderStatus = "Shipped";
      }
    }

    if (normalizedStatus === "delivered") {
      orderUpdate.$set.orderStatus = "Delivered";
    }

    if (normalizedStatus === "cancelled" && order.orderStatus !== "Delivered") {
      orderUpdate.$set.orderStatus = "Cancelled";
    }

    // ==========================================
    // 13. UPDATE ORDER
    // ==========================================

    const updatedOrder = await Order.findByIdAndUpdate(order._id, orderUpdate, {
      new: true,
    });

    if (!updatedOrder) {
      console.error(
        `Failed to update order ${order._id} from Shiprocket webhook`,
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update order",
      });
    }

    // ==========================================
    // 14. CREATE SHIPPING HISTORY
    // ==========================================

    let historyCreated = false;

    try {
      await ShippingHistory.create({
        order: order._id,

        shiprocketOrderId:
          shiprocketOrderId || order.shipping?.shiprocketOrderId || null,

        shipmentId: order.shipping?.shipmentId || null,

        awb: awb || order.shipping?.awb || null,

        courierName: courierName || order.shipping?.courierName || null,

        courierId: order.shipping?.courierId || null,

        status: normalizedStatus,

        rawStatus: currentStatus,

        rawShipmentStatus: shipmentStatus,

        description: scanDescription,

        location: scanLocation,

        activity: scanActivity,

        eventDate,

        etd: etd || null,

        pickupScheduledAt: pickupScheduledAt || null,

        eventKey,

        metadata: payload,
      });

      historyCreated = true;
    } catch (historyError) {
      // Duplicate event is safe.
      if (historyError?.code === 11000) {
        console.log(
          `Duplicate Shiprocket event ignored for order ${order._id}`,
        );
      } else {
        console.error("Shipping history creation error:", historyError.message);

        // Do not pretend the entire webhook failed.
        // The order itself was successfully updated.
      }
    }
    // ==========================================
    // 15. STATUS CHANGE DETECTION
    //
    // Used by both:
    // 1. Customer real-time shipping update
    // 2. Admin shipping notification
    // ==========================================

    const statusChanged = previousStatus !== normalizedStatus;

    // ==========================================
    // 16. CUSTOMER REAL-TIME SHIPPING UPDATE
    // ==========================================

    if (statusChanged && updatedOrder.user) {
      emitCustomerShippingUpdate({
        userId: updatedOrder.user,
        orderId: updatedOrder._id,

        shipping: {
          provider: updatedOrder.shipping?.provider || null,

          status: updatedOrder.shipping?.status || normalizedStatus,

          courierName: updatedOrder.shipping?.courierName || null,

          awb: updatedOrder.shipping?.awb || null,

          trackingUrl: updatedOrder.shipping?.trackingUrl || null,

          pickupScheduledAt: updatedOrder.shipping?.pickupScheduledAt || null,

          shippedAt: updatedOrder.shipping?.shippedAt || null,

          deliveredAt: updatedOrder.shipping?.deliveredAt || null,

          etd: updatedOrder.shipping?.etd || null,
        },

        historyEvent: {
          status: normalizedStatus,
          rawStatus: currentStatus,
          rawShipmentStatus: shipmentStatus,
          description: scanDescription,
          location: scanLocation,
          activity: scanActivity,
          eventDate,
          etd: etd || null,
          pickupScheduledAt: pickupScheduledAt || null,
        },
      });

      console.log(
        `CUSTOMER SHIPPING UPDATE EMITTED: Order ${updatedOrder._id}`,
      );
    }

    // ==========================================
    // 17. ADMIN NOTIFICATION
    //
    // Only notify when the current status actually
    // changes.
    // ==========================================

    if (statusChanged) {
      const statusLabelMap = {
        pickup_scheduled: "Pickup Scheduled",

        picked_up: "Picked Up",

        in_transit: "In Transit",

        out_for_delivery: "Out for Delivery",

        delivered: "Delivered",

        cancelled: "Cancelled",

        rto: "Return to Origin",

        exception: "Shipping Exception",
      };

      const statusLabel = statusLabelMap[normalizedStatus] || normalizedStatus;

      await createAdminNotification({
        type: "SHIPPING",

        title: `Shipping Update: ${statusLabel}`,

        message: `Order ${order._id} is now ${statusLabel}.`,

        orderId: order._id,
      });
    }
    
    // ==========================================
    // CUSTOMER DISPATCH CONFIRMATION EMAIL
    // ==========================================

    const dispatchStatuses = ["picked_up", "in_transit"];

    if (
      dispatchStatuses.includes(normalizedStatus) &&
      ["picked_up", "in_transit"].includes(normalizedStatus) &&
      !["Cancelled", "Delivered"].includes(order.orderStatus)
    ) {
      try {
        await sendCustomerDispatchedEmail(updatedOrder);
        console.log(`DISPATCH EMAIL PROCESSED: Order ${updatedOrder._id}`);
      } catch (emailError) {
        console.error(
          `DISPATCH EMAIL FAILED: Order ${updatedOrder._id}`,
          emailError?.message || emailError,
        );
      }
    }

    // ==========================================
    // CUSTOMER DELIVERY CONFIRMATION EMAIL
    // ==========================================

    if (normalizedStatus === "delivered") {
      try {
        await sendCustomerDeliveredEmail(updatedOrder);

        console.log(`DELIVERY EMAIL PROCESSED: Order ${updatedOrder._id}`);
      } catch (emailError) {
        // Email failure must not fail the Shiprocket webhook.
        console.error(
          `DELIVERY EMAIL FAILED: Order ${updatedOrder._id}`,
          emailError?.message || emailError,
        );
      }
    }

    // ==========================================
    // 16. LOG
    // ==========================================

    console.log(
      [
        "Shiprocket webhook processed:",
        `Order ${order._id}`,
        `${previousStatus} → ${normalizedStatus}`,
        `History: ${historyCreated ? "created" : "duplicate/failed"}`,
      ].join(" | "),
    );

    // ==========================================
    // 17. SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Shiprocket webhook processed successfully",

      orderId: order._id,

      shippingStatus: normalizedStatus,

      historyCreated,
    });
  } catch (error) {
    console.error(
      "Shiprocket webhook processing error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process Shiprocket webhook",
    });
  }
};
