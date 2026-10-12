import crypto from "crypto";
import mongoose from "mongoose";
import { reduceInventory } from "../utils/inventory.js";
import { createRazorpayRefund } from "../utils/refund.js";
import { createAdminNotification } from "../services/notificationService.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import razorpay from "../config/razorpay.js";
import ShippingHistory from "../models/shippingHistoryModel.js";
import {
  sendCustomerOrderConfirmationEmail,
  sendAdminNewOrderEmail,
  sendCustomerDeliveredEmail,
} from "../services/emailService.js";

const sendOrderEmailSafely = async (emailFunction, order, emailLabel) => {
  try {
    return await emailFunction(order);
  } catch (error) {
    console.error(
      `Failed to send ${emailLabel} for order ${order?._id}:`,
      error?.message || error,
    );

    return null;
  }
};

// ==========================================
// CREATE ORDER
// SERVER-SIDE PRICE & PRODUCT VALIDATION
// ==========================================

export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const allowedPaymentMethods = ["razorpay", "cod"];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // ==========================================
    // VALIDATE PRODUCT IDS & QUANTITIES
    // ==========================================

    const productIds = [];

    for (const item of orderItems) {
      if (!item?.productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }

      productIds.push(item.productId);
    }

    // ==========================================
    // FETCH TRUSTED PRODUCTS FROM DATABASE
    // ==========================================

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
      isActive: true,
    });

    // ==========================================
    // VERIFY ALL PRODUCTS EXIST
    // ==========================================

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are unavailable",
      });
    }

    // ==========================================
    // CREATE PRODUCT LOOKUP MAP
    // ==========================================

    const productMap = new Map(
      products.map((dbProduct) => [dbProduct._id.toString(), dbProduct]),
    );

    // ==========================================
    // BUILD TRUSTED ORDER ITEMS
    // ==========================================

    const trustedOrderItems = [];

    for (const item of orderItems) {
      const dbProduct = productMap.get(item.productId.toString());

      if (!dbProduct) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
        });
      }

      const quantity = Number(item.quantity);

      // ========================================
      // STOCK VALIDATION
      // ========================================

      if (dbProduct.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${dbProduct.name} has only ${dbProduct.stock} item(s) available`,
        });
      }

      // ========================================
      // USE DATABASE VALUES
      // NEVER TRUST FRONTEND PRICE
      // ========================================

      trustedOrderItems.push({
        name: dbProduct.name,
        image: dbProduct.image,
        price: Number(dbProduct.price),
        quantity,
        productId: dbProduct._id,
      });
    }

    // ==========================================
    // CALCULATE TOTAL FROM DATABASE
    // ==========================================

    const totalPrice = trustedOrderItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const roundedTotalPrice = Math.round(totalPrice * 100) / 100;

    if (roundedTotalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total",
      });
    }

    // ==========================================
    // CREATE DATABASE ORDER
    // ==========================================

    const order = await Order.create({
      user: req.user._id,

      orderItems: trustedOrderItems,

      shippingAddress,

      totalPrice: roundedTotalPrice,

      paymentMethod,

      paymentStatus: paymentMethod === "cod" ? "cod_pending" : "pending",

      isPaid: false,
    });

    // ==========================================
    // CASH ON DELIVERY
    // ==========================================

    if (paymentMethod === "cod") {
      await createAdminNotification({
        type: "NEW_ORDER",
        title: "New Order Received",
        message: `New COD order received from ${
          shippingAddress.firstName || req.user.name
        }`,
        orderId: order._id,
      });

      await Promise.all([
        sendOrderEmailSafely(
          sendCustomerOrderConfirmationEmail,
          order,
          "customer order confirmation email",
        ),
        sendOrderEmailSafely(
          sendAdminNewOrderEmail,
          order,
          "admin new order email",
        ),
      ]);

      return res.status(201).json({
        success: true,
        message: "COD order placed successfully",
        order,
      });
    }

    // ==========================================
    // RAZORPAY ORDER
    // ==========================================

    const options = {
      amount: Math.round(roundedTotalPrice * 100),
      currency: "INR",
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // ==========================================
    // SAVE RAZORPAY ORDER ID
    // ==========================================

    order.paymentResult = {
      razorpay_order_id: razorpayOrder.id,
    };

    await order.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      order,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
};

// ==========================================
// UPDATE ORDER TO PAID
// RAZORPAY PAYMENT VERIFICATION
// + INVENTORY SAFETY
// + AUTOMATIC REFUND
// ==========================================

export const updateOrderToPaid = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // ==========================================
    // VALIDATE PAYMENT DATA
    // ==========================================

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Incomplete Razorpay payment information",
      });
    }

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // OWNERSHIP CHECK
    // ==========================================

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // ==========================================
    // PREVENT DOUBLE PAYMENT
    // ==========================================

    if (order.isPaid) {
      return res.status(409).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // ==========================================
    // GET TRUSTED RAZORPAY ORDER ID
    // ==========================================

    const storedRazorpayOrderId = order.paymentResult?.razorpay_order_id;

    if (!storedRazorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID not found",
      });
    }

    // ==========================================
    // VERIFY RAZORPAY ORDER ID
    // ==========================================

    if (storedRazorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order mismatch",
      });
    }

    // ==========================================
    // VERIFY RAZORPAY SIGNATURE
    // ==========================================

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${storedRazorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature, "utf8");

    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");

    const isSignatureValid =
      generatedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(generatedBuffer, receivedBuffer);

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay payment signature",
      });
    }

    // ==========================================
    // FETCH PAYMENT FROM RAZORPAY
    // ==========================================

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // ==========================================
    // VERIFY PAYMENT BELONGS TO THIS ORDER
    // ==========================================

    if (payment.order_id !== storedRazorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to this order",
      });
    }

    // ==========================================
    // VERIFY PAYMENT AMOUNT
    // ==========================================

    const expectedAmount = Math.round(order.totalPrice * 100);

    if (Number(payment.amount) !== expectedAmount) {
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
        message: "Invalid payment currency",
      });
    }

    // ==========================================
    // VERIFY PAYMENT CAPTURE
    // ==========================================

    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment is not captured. Current status: ${payment.status}`,
      });
    }

    // ==========================================
    // MONGODB TRANSACTION
    // ==========================================

    const session = await mongoose.startSession();

    let updatedOrder;

    // This becomes true once we start
    // touching inventory.
    let inventoryAttempted = false;

    let transactionError = null;

    try {
      await session.withTransaction(async () => {
        // ==========================================
        // RE-FETCH ORDER INSIDE TRANSACTION
        // ==========================================

        const transactionOrder = await Order.findById(req.params.id).session(
          session,
        );

        if (!transactionOrder) {
          throw new Error("Order not found inside transaction");
        }

        // ==========================================
        // PREVENT DOUBLE PAYMENT
        // ==========================================

        if (transactionOrder.isPaid) {
          throw new Error("Order is already paid");
        }

        // ==========================================
        // INVENTORY
        // ==========================================

        if (!transactionOrder.inventoryAdjusted) {
          inventoryAttempted = true;

          try {
            await reduceInventory(transactionOrder.orderItems, session);
          } catch (error) {
            transactionError = error;

            throw error;
          }

          transactionOrder.inventoryAdjusted = true;

          transactionOrder.inventoryAdjustedAt = new Date();
        }

        // ==========================================
        // MARK PAYMENT SUCCESSFUL
        // ==========================================

        transactionOrder.isPaid = true;

        transactionOrder.paidAt = new Date();

        transactionOrder.paymentStatus = "paid";

        transactionOrder.orderStatus = "Confirmed";

        transactionOrder.paymentResult = {
          razorpay_payment_id,

          razorpay_order_id: storedRazorpayOrderId,

          razorpay_signature,
        };

        updatedOrder = await transactionOrder.save({
          session,
        });
      });
    } finally {
      await session.endSession();
    }

    await createAdminNotification({
      type: "NEW_ORDER",
      title: "New Order Received",
      message: `New paid order received from ${
        order.shippingAddress.firstName || order.user?.name || "Customer"
      }`,
      orderId: order._id,
    });
    await Promise.all([
      sendOrderEmailSafely(
        sendCustomerOrderConfirmationEmail,
        updatedOrder,
        "customer order confirmation email",
      ),
      sendOrderEmailSafely(
        sendAdminNewOrderEmail,
        updatedOrder,
        "admin new order email",
      ),
    ]);

    // ==========================================
    // INVENTORY / TRANSACTION FAILURE
    // PAYMENT WAS ALREADY CAPTURED
    // ==========================================

    if (inventoryAttempted && !updatedOrder) {
      console.error("ORDER TRANSACTION FAILED:", transactionError);

      // ==========================================
      // CREATE RAZORPAY REFUND
      // ==========================================

      try {
        const refund = await createRazorpayRefund({
          paymentId: razorpay_payment_id,

          amount: order.totalPrice,

          reason: "Inventory unavailable after payment",
        });

        // ==========================================
        // SAVE REFUND RESULT
        // ==========================================

        const refundStatus =
          refund.status === "processed" ? "processed" : "pending";

        const refundedOrder = await Order.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              paymentStatus:
                refundStatus === "processed" ? "failed" : "refund_pending",

              orderStatus: "Cancelled",

              refundResult: {
                razorpay_refund_id: refund.id,

                status: refundStatus,

                amount: order.totalPrice,

                reason: "Inventory unavailable after payment",

                refundedAt:
                  refundStatus === "processed" ? new Date() : undefined,
              },
            },
          },
          {
            new: true,
          },
        );

        return res.status(409).json({
          success: false,

          message:
            refundStatus === "processed"
              ? "Payment was received, but the product became unavailable. Your payment has been refunded."
              : "Payment was received, but the product became unavailable. Your refund is being processed.",

          order: refundedOrder,
        });
      } catch (refundError) {
        // ==========================================
        // CRITICAL REFUND FAILURE
        // ==========================================

        console.error("RAZORPAY REFUND FAILED:", refundError);

        await Order.findByIdAndUpdate(req.params.id, {
          $set: {
            paymentStatus: "refund_pending",

            orderStatus: "Cancelled",

            refundResult: {
              status: "failed",

              amount: order.totalPrice,

              reason: "Inventory unavailable and automatic refund failed",
            },
          },
        });

        return res.status(500).json({
          success: false,

          message:
            "Payment was received, but the product became unavailable. Automatic refund could not be completed. Please contact support.",
        });
      }
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(200).json({
      success: true,

      message: "Payment verified and inventory updated successfully",

      order: updatedOrder,
    });
  } catch (error) {
    console.error("PAYMENT VERIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// ==========================================
// CUSTOMER - GET MY ORDERS
// ==========================================

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("orderItems.productId", "name image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your orders",
    });
  }
};

// ==========================================
// CUSTOMER - GET SINGLE MY ORDER
// ==========================================

export const getMyOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // VALIDATE ORDER ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ==========================================
    // FIND ONLY THIS USER'S ORDER
    // ==========================================

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    })
      .populate("orderItems.productId", "name image")
      .populate("user", "name email");

    // ==========================================
    // ORDER NOT FOUND
    // ==========================================

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET MY ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order details",
    });
  }
};

// ==========================================
// GET CUSTOMER ORDER TRACKING
// ==========================================
export const getCustomerOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    // ------------------------------------------
    // Validate Order ID
    // ------------------------------------------
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ------------------------------------------
    // Find order belonging to logged-in customer
    // ------------------------------------------
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    }).select("_id orderStatus createdAt shipping totalPrice");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ------------------------------------------
    // Get shipping history
    // ------------------------------------------
    const history = await ShippingHistory.find({
      order: order._id,
    })
      .sort({
        eventDate: 1,
      })
      .select(
        "status rawStatus rawShipmentStatus description location activity eventDate etd pickupScheduledAt courierName awb createdAt",
      )
      .lean();

    // ------------------------------------------
    // Response
    // ------------------------------------------
    return res.status(200).json({
      success: true,

      tracking: {
        orderId: order._id,

        orderStatus: order.orderStatus,

        shipping: {
          provider: order.shipping?.provider || null,

          status: order.shipping?.status || "not_created",

          courierName: order.shipping?.courierName || null,

          awb: order.shipping?.awb || null,

          trackingUrl: order.shipping?.trackingUrl || null,

          pickupScheduledAt: order.shipping?.pickupScheduledAt || null,

          shippedAt: order.shipping?.shippedAt || null,

          deliveredAt: order.shipping?.deliveredAt || null,

          etd: order.shipping?.etd || null,
        },

        history,
      },
    });
  } catch (error) {
    console.error("Get customer order tracking error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order tracking information",
    });
  }
};

// ==========================================
// ADMIN - GET ALL ORDERS
// ==========================================

export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.productId", "name image")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET ADMIN ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET SINGLE ORDER
// ==========================================

export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.productId", "name image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET ADMIN ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// ADMIN - UPDATE ORDER STATUS
// ==========================================

export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent modifying delivered orders
    if (order.orderStatus === "Delivered" && orderStatus !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be changed",
      });
    }

    order.orderStatus = orderStatus;

    const updatedOrder = await order.save();

    return res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // If invoice already exists, return the existing invoice
    if (order.invoice?.invoiceNumber) {
      return res.status(200).json({
        message: "Invoice already exists",
        invoice: order.invoice,
        order,
      });
    }

    // Generate invoice number
    const year = new Date().getFullYear();

    const invoiceCount = await Order.countDocuments({
      "invoice.invoiceNumber": {
        $exists: true,
      },
    });

    const invoiceNumber = `MG-${year}-${String(invoiceCount + 1).padStart(5, "0")}`;

    order.invoice = {
      invoiceNumber,
      issuedAt: new Date(),
    };

    await order.save();

    return res.status(200).json({
      message: "Invoice generated successfully",
      invoice: order.invoice,
      order,
    });
  } catch (error) {
    console.error("Generate invoice error:", error);

    return res.status(500).json({
      message: "Failed to generate invoice",
    });
  }
};
