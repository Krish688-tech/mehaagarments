import mongoose from "mongoose";
import Order from "../models/orderModel.js";

// =====================================================
// GET ALL ORDERS
// =====================================================

export const getAdminOrders = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      payment = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);

    const query = {};

    // =================================================
    // ORDER STATUS FILTER
    // =================================================

    if (status) {
      query.orderStatus = status;
    }

    // =================================================
    // PAYMENT FILTER
    // =================================================

    if (payment === "paid") {
      query.isPaid = true;
    }

    if (payment === "pending") {
      query.isPaid = false;
    }

    if (payment === "razorpay") {
      query.paymentMethod = "razorpay";
    }

    if (payment === "cod") {
      query.paymentMethod = "cod";
    }

    // =================================================
    // SEARCH
    // =================================================

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      const searchConditions = [
        {
          "shippingAddress.firstName": searchRegex,
        },
        {
          "shippingAddress.lastName": searchRegex,
        },
        {
          "shippingAddress.email": searchRegex,
        },
      ];

      if (mongoose.Types.ObjectId.isValid(search.trim())) {
        searchConditions.push({
          _id: search.trim(),
        });
      }

      const matchingOrders = await Order.find({
        $or: searchConditions,
      }).select("_id");

      query._id = {
        $in: matchingOrders.map((order) => order._id),
      };
    }

    // =================================================
    // COUNT
    // =================================================

    const totalOrders = await Order.countDocuments(query);

    // =================================================
    // ORDERS
    // =================================================

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      success: true,

      orders,

      pagination: {
        currentPage,
        totalPages: Math.ceil(totalOrders / perPage),
        totalOrders,
        limit: perPage,
      },
    });
  } catch (error) {
    console.error("Get admin orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// =====================================================

export const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("orderItems.productId", "name price images image")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get admin order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

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

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent changing a delivered order
    // back to an earlier state.
    if (
      order.orderStatus === "Delivered" &&
      orderStatus !== "Delivered"
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be moved backwards",
      });
    }

    // Prevent changing cancelled orders
    if (
      order.orderStatus === "Cancelled" &&
      orderStatus !== "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot be reopened",
      });
    }

    order.orderStatus = orderStatus;

    const updatedOrder = await order.save();

    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate("user", "name email")
      .lean();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Update admin order status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};