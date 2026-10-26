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
      // PRODUCTS
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

      // CUSTOMERS
      User.countDocuments({
        role: "customer",
      }),

      // ORDERS
      Order.countDocuments(),

      // PAID ORDERS
      Order.countDocuments({
        paymentStatus: "paid",
      }),

      // PENDING ORDERS
      Order.countDocuments({
        orderStatus: "Pending",
      }),

      // TOTAL REVENUE — PAID ORDERS ONLY
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

      // RECENT ORDERS
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // TOP PRODUCTS — PAID ORDERS ONLY
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
            image: { $first: "$orderItems.image" },
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
        {
          $lookup: {
            from: Product.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: {
            path: "$productDetails",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 1,
            name: {
              $ifNull: ["$productDetails.name", "$name"],
            },
            price: {
              $ifNull: ["$productDetails.price", "$price"],
            },
            totalSold: 1,

            // Prefer the current product image.
            // Fall back to the image saved in the order.
            image: {
              $ifNull: [
                "$productDetails.image",
                {
                  $ifNull: [
                    { $arrayElemAt: ["$productDetails.images", 0] },
                    "$image",
                  ],
                },
              ],
            },

            images: "$productDetails.images",
          },
        },
      ]),
    ]);

    // TOTAL REVENUE
    const totalRevenue = revenueResult[0]?.total || 0;

    // RESPONSE
    return res.status(200).json({
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

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};
