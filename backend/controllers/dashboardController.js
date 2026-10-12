import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import User from "../models/User.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      totalCustomers,
      totalOrders,
      paidOrders,
      pendingOrders,
      revenueResult,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      // ================================
      // PRODUCTS
      // ================================

      Product.countDocuments(),

      Product.countDocuments({
        isActive: true,
      }),

      Product.countDocuments({
        isActive: false,
      }),

      Product.countDocuments({
        isActive: true,
        stock: { $lte: 5 },
      }),

      // ================================
      // CUSTOMERS
      // ================================

      User.countDocuments({
        role: "customer",
      }),

      // ================================
      // ORDERS
      // ================================

      Order.countDocuments(),

      // ================================
      // PAID ORDERS
      // ================================

      Order.countDocuments({
        paymentStatus: "paid",
      }),

      // ================================
      // PENDING ORDERS
      // ================================

      Order.countDocuments({
        orderStatus: "Pending",
      }),

      // ================================
      // TOTAL REVENUE
      // Only paid orders
      // ================================

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalPrice",
            },
          },
        },
      ]),

      // ================================
      // RECENT ORDERS
      // ================================

      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // ================================
      // TOP PRODUCTS
      // Only paid orders
      // ================================

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $unwind: "$orderItems",
        },
        {
          $group: {
            _id: "$orderItems.productId",
            name: { $first: "$orderItems.name" },
            price: { $first: "$orderItems.price" },
            totalSold: {
              $sum: "$orderItems.quantity",
            },
          },
        },
        {
          $sort: {
            totalSold: -1,
          },
        },
        {
          $limit: 5,
        },
      ]),
    ]);

    // ================================
    // TOTAL REVENUE
    // ================================

    const totalRevenue = revenueResult[0]?.total || 0;

    // ================================
    // RESPONSE
    // ================================

    res.json({
      success: true,

      statistics: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        lowStockProducts,
        totalCustomers,
        totalOrders,
        paidOrders,
        pendingOrders,
        totalRevenue,
      },

      recentOrders,

      topProducts,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};