import User from "../models/User.js";
import Order from "../models/orderModel.js";
import bcrypt from "bcryptjs";

// ============================================
// GET USER PROFILE
// GET /api/users/profile
// Protected
// ============================================

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};


// ============================================
// UPDATE USER PROFILE
// PUT /api/users/profile
// Protected
// ============================================

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, address } = req.body;

    // -----------------------------
    // Update Name
    // -----------------------------

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (trimmedName.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must contain at least 2 characters",
        });
      }

      if (trimmedName.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name cannot exceed 50 characters",
        });
      }

      user.name = trimmedName;
    }

    // -----------------------------
    // Update Address
    // -----------------------------

    if (address !== undefined) {
      if (typeof address !== "object" || address === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid address data",
        });
      }

      user.address = {
        ...user.address?.toObject?.(),
        ...address,
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error("Update User Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ============================================
// SAVE USER ADDRESS
// PUT /api/users/save-address
// Protected
// ============================================

export const saveUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      phone,
      address,
      apartment,
      city,
      state,
      pincode,
      country,
    } = req.body;

    // ----------------------------------------
    // Required fields
    // ----------------------------------------

    if (
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required address fields",
      });
    }

    // ----------------------------------------
    // Normalize values
    // ----------------------------------------

    const cleanPhone = String(phone).trim();
    const cleanAddress = String(address).trim();
    const cleanApartment = apartment
      ? String(apartment).trim()
      : "";
    const cleanCity = String(city).trim();
    const cleanState = String(state).trim();
    const cleanPincode = String(pincode).trim();
    const cleanCountry = String(country).trim();

    // ----------------------------------------
    // Phone validation
    // ----------------------------------------

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    // ----------------------------------------
    // Pincode validation
    // ----------------------------------------

    if (!/^[0-9]{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit pincode",
      });
    }

    // ----------------------------------------
    // Save only allowed address fields
    // ----------------------------------------

    user.address = {
      ...user.address?.toObject?.(),

      phone: cleanPhone,
      address: cleanAddress,
      apartment: cleanApartment,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      country: cleanCountry,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address saved successfully",
      address: user.address,
    });
  } catch (error) {
    console.error("Save Address Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};


// ============================================
// CHANGE PASSWORD
// PUT /api/users/change-password
// Protected
// ============================================

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // -----------------------------
    // Validate required fields
    // -----------------------------

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // -----------------------------
    // Validate new password
    // -----------------------------

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters",
      });
    }

    // -----------------------------
    // Get user WITH password
    // -----------------------------

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------
    // Verify current password
    // -----------------------------

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // -----------------------------
    // Prevent same password
    // -----------------------------

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from the current password",
      });
    }

    // -----------------------------
    // Hash new password
    // -----------------------------

    user.password = await bcrypt.hash(newPassword, 12);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ============================================
// ADMIN - GET ALL CUSTOMERS
// GET /api/users/admin/all
// Protected + Admin
// ============================================

export const getAdminCustomers = async (req, res) => {
  try {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 10,
        1,
      ),
      50,
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status.trim()
        : "all";

    const filter = {
      role: "customer",
    };

    // ==========================================
    // SEARCH
    // ==========================================

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    // ==========================================
    // STATUS FILTER
    // ==========================================

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [customers, totalCustomers] =
      await Promise.all([
        User.find(filter)
          .select(
            "_id name email role isActive address createdAt updatedAt",
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        User.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,

      customers,

      pagination: {
        page,
        limit,
        total: totalCustomers,
        totalPages: Math.ceil(
          totalCustomers / limit,
        ),
        hasNextPage:
          page <
          Math.ceil(
            totalCustomers / limit,
          ),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN CUSTOMERS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customers",
    });
  }
};

// ============================================
// ADMIN - GET SINGLE CUSTOMER
// GET /api/users/admin/:id
// Protected + Admin
// ============================================

export const getAdminCustomerById = async (
  req,
  res,
) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    })
      .select(
        "_id name email role isActive address createdAt updatedAt",
      )
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ==========================================
    // CUSTOMER ORDER STATISTICS
    // ==========================================

    const orderStats =
      await Order.aggregate([
        {
          $match: {
            user: customer._id,
          },
        },
        {
          $group: {
            _id: null,

            totalOrders: {
              $sum: 1,
            },

            totalSpent: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$paymentStatus",
                      "paid",
                    ],
                  },
                  "$totalPrice",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
    };

    return res.status(200).json({
      success: true,

      customer,

      statistics: {
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN CUSTOMER ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer",
    });
  }
};

// ============================================
// ADMIN - GET CUSTOMER ORDERS
// GET /api/users/admin/:id/orders
// Protected + Admin
// ============================================

export const getAdminCustomerOrders = async (
  req,
  res,
) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    })
      .select("_id name email")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const orders = await Order.find({
      user: customer._id,
    })
      .populate(
        "orderItems.productId",
        "name image price",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,

      customer,

      orders,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER ORDERS ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer orders",
    });
  }
};

// ============================================
// ADMIN - UPDATE CUSTOMER STATUS
// PATCH /api/users/admin/:id/status
// Protected + Admin
// ============================================

export const updateAdminCustomerStatus =
  async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be a boolean",
        });
      }

      const customer =
        await User.findOne({
          _id: req.params.id,
          role: "customer",
        });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      customer.isActive = isActive;

      await customer.save();

      return res.status(200).json({
        success: true,

        message: isActive
          ? "Customer activated successfully"
          : "Customer deactivated successfully",

        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          role: customer.role,
          isActive: customer.isActive,
        },
      });
    } catch (error) {
      console.error(
        "UPDATE CUSTOMER STATUS ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update customer status",
      });
    }
  };