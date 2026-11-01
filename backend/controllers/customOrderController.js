
import CustomOrder from "../models/CustomOrder.js";
import { createAdminNotification } from "../services/notificationService.js";

// ==========================================
// CUSTOMER: SUBMIT CUSTOM SAREE REQUEST
// ==========================================

export const createCustomOrder = async (req, res) => {
  try {
    const {
      zariType,
      preferredColor,
      occasion,
      designDescription,
      referenceImages = [],
    } = req.body;

    if (!["gold", "silver"].includes(zariType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid zari preference.",
      });
    }

    if (
      typeof designDescription !== "string" ||
      designDescription.trim().length < 20 ||
      designDescription.trim().length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "Design description must contain 20 to 5000 characters.",
      });
    }

    if (!Array.isArray(referenceImages) || referenceImages.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 5 reference images.",
      });
    }

    const validImages = referenceImages.every(
      (image) =>
        image &&
        typeof image.url === "string" &&
        image.url.startsWith("https://res.cloudinary.com/") &&
        typeof image.publicId === "string"
    );

    if (!validImages) {
      return res.status(400).json({
        success: false,
        message: "Invalid reference image information.",
      });
    }

    const allowedOccasions = [
      "Wedding",
      "Reception",
      "Festival",
      "Traditional Event",
      "Other",
      "",
    ];

    if (occasion && !allowedOccasions.includes(occasion)) {
      return res.status(400).json({
        success: false,
        message: "Invalid occasion selected.",
      });
    }

    const customOrder = await CustomOrder.create({
      customer: req.user._id,
      zariType,
      preferredColor: preferredColor?.trim() || "",
      occasion: occasion || "",
      designDescription: designDescription.trim(),
      referenceImages,
    });

    // Notify admin after successful database save.
    try {
      await createAdminNotification({
        type: "CUSTOM_ORDER",
        title: "New Custom Saree Request",
        message: `${req.user.name || "A customer"} submitted a new ${
          zariType === "gold" ? "Gold Zari" : "Silver Zari"
        } Pattu saree design request.`,
        customOrderId: customOrder._id,
      });
    } catch (notificationError) {
      console.error(
        "Custom order notification error:",
        notificationError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Your custom saree request has been submitted successfully. Our team will contact you soon.",
      customOrder,
    });
  } catch (error) {
    console.error("Create custom order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your custom saree request.",
    });
  }
};

// ==========================================
// CUSTOMER: GET OWN CUSTOM ORDERS
// ==========================================

export const getMyCustomOrders = async (req, res) => {
  try {
    const customOrders = await CustomOrder.find({
      customer: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      customOrders,
    });
  } catch (error) {
    console.error("Get customer custom orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your custom orders.",
    });
  }
};

// ==========================================
// ADMIN: GET ALL CUSTOM ORDERS
// ==========================================

export const getAllCustomOrders = async (req, res) => {
  try {
    const customOrders = await CustomOrder.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      customOrders,
    });
  } catch (error) {
    console.error("Get all custom orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch custom orders.",
    });
  }
};

// ==========================================
// ADMIN: GET SINGLE CUSTOM ORDER
// ==========================================

export const getCustomOrderById = async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id)
      .populate("customer", "name email");

    if (!customOrder) {
      return res.status(404).json({
        success: false,
        message: "Custom order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      customOrder,
    });
  } catch (error) {
    console.error("Get custom order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch custom order details.",
    });
  }
};

// ==========================================
// ADMIN: UPDATE STATUS AND NOTES
// ==========================================

export const updateCustomOrder = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const allowedStatuses = [
      "NEW_REQUEST",
      "UNDER_REVIEW",
      "CONTACTED",
      "QUOTATION_SENT",
      "APPROVED",
      "IN_PRODUCTION",
      "COMPLETED",
      "REJECTED",
    ];

    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      return res.status(404).json({
        success: false,
        message: "Custom order not found.",
      });
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid custom order status.",
        });
      }

      customOrder.status = status;
    }

    if (adminNotes !== undefined) {
      if (
        typeof adminNotes !== "string" ||
        adminNotes.length > 3000
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid admin notes.",
        });
      }

      customOrder.adminNotes = adminNotes.trim();
    }

    await customOrder.save();

    return res.status(200).json({
      success: true,
      message: "Custom order updated successfully.",
      customOrder,
    });
  } catch (error) {
    console.error("Update custom order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update custom order.",
    });
  }
};
