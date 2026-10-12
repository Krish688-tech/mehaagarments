import Order from "../models/orderModel.js";
import { generateInvoicePdf } from "../utils/invoicePdf.js";
import { generateInvoiceNumber } from "../utils/invoiceNumber.js";

// ==========================================
// CREATE / GENERATE INVOICE
// POST /api/invoices/:orderId
// ADMIN ONLY
// ==========================================

export const createInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate(
        "orderItems.productId",
        "name image",
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // PAYMENT VALIDATION
    // ==========================================

    if (
      order.paymentMethod === "razorpay" &&
      !order.isPaid
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invoice cannot be generated before payment is completed",
      });
    }

    // ==========================================
    // COD VALIDATION
    // ==========================================

    if (
      order.paymentMethod === "cod" &&
      order.orderStatus !== "Delivered"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "COD invoice can be generated after delivery",
      });
    }

    // ==========================================
    // EXISTING INVOICE
    // ==========================================

    if (order.invoice?.invoiceNumber) {
      return res.status(200).json({
        success: true,
        message: "Invoice already exists",
        invoice: order.invoice,
        order,
      });
    }

    // ==========================================
    // GENERATE UNIQUE INVOICE NUMBER
    // ==========================================

    const invoiceNumber =
      await generateInvoiceNumber();

    // ==========================================
    // SAVE INVOICE
    // ==========================================

    order.invoice = {
      invoiceNumber,
      issuedAt: new Date(),
    };

    await order.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      invoice: order.invoice,
      order,
    });
  } catch (error) {
    console.error(
      "CREATE INVOICE ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate invoice",
    });
  }
};

// ==========================================
// GET INVOICE
// GET /api/invoices/:orderId
// ADMIN ONLY
// ==========================================

export const getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate(
        "orderItems.productId",
        "name image",
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.invoice?.invoiceNumber) {
      return res.status(404).json({
        success: false,
        message: "Invoice has not been generated",
      });
    }

    return res.status(200).json({
      success: true,
      invoice: order.invoice,
      order,
    });
  } catch (error) {
    console.error(
      "GET INVOICE ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get invoice",
    });
  }
};

// ==========================================
// DOWNLOAD INVOICE PDF
// GET /api/invoices/:orderId/pdf
// CUSTOMER + ADMIN
// ==========================================

export const downloadInvoicePdf = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate(
        "orderItems.productId",
        "name image",
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // AUTHORIZATION
    // ==========================================

    const isAdmin = req.user?.role === "admin";

    const isOwner =
      order.user?._id?.toString() ===
      req.user?._id?.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this invoice",
      });
    }

    // ==========================================
    // PAYMENT / DELIVERY VALIDATION
    // ==========================================

    if (
      order.paymentMethod === "razorpay" &&
      !order.isPaid
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invoice cannot be downloaded before payment is completed",
      });
    }

    if (
      order.paymentMethod === "cod" &&
      order.orderStatus !== "Delivered"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "COD invoice is available after delivery",
      });
    }

    // ==========================================
    // INVOICE MUST EXIST
    // ==========================================

    if (!order.invoice?.invoiceNumber) {
      return res.status(404).json({
        success: false,
        message:
          "Invoice has not been generated yet",
      });
    }

    // ==========================================
    // GENERATE PDF
    // ==========================================

    const pdfBuffer =
      await generateInvoicePdf(order);

    const invoiceNumber =
      order.invoice.invoiceNumber;

    // ==========================================
    // RESPONSE HEADERS
    // ==========================================

    res.setHeader(
      "Content-Type",
      "application/pdf",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoiceNumber}.pdf"`,
    );

    res.setHeader(
      "Content-Length",
      pdfBuffer.length,
    );

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error(
      "DOWNLOAD INVOICE PDF ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate invoice PDF",
    });
  }
};