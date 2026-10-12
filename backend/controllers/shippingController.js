import mongoose from "mongoose";

import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

import {
  createShiprocketOrder,
  getCourierServiceability,
  assignCourierAndGenerateAWB,
  generatePickup,
} from "../services/shiprocketService.js";

// ============================================================
// SHIPPING CONTROLLER
// Shiprocket fulfillment integration
// ============================================================

const PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION?.trim();

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;

  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const positiveNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : null;
};

const cleanString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const formatShiprocketOrderDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value || "";

  return `${get("year")}-${get("month")}-${get("day")} ${get(
    "hour",
  )}:${get("minute")}`;
};

const getMerchantOrderId = (order) => {
  return `MG-${order._id.toString()}`;
};

// ------------------------------------------------------------
// Validate customer shipping address
// ------------------------------------------------------------

const validateShippingAddress = (address) => {
  if (!address) {
    throw new Error("Customer shipping address is missing");
  }

  const requiredFields = [
    "firstName",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
    "country",
  ];

  for (const field of requiredFields) {
    if (!cleanString(address[field])) {
      throw new Error(`Shipping address field "${field}" is required`);
    }
  }

  const pincode = cleanString(address.pincode);

  if (!/^\d{6}$/.test(pincode)) {
    throw new Error(
      "Customer shipping pincode must be a valid 6-digit Indian pincode",
    );
  }

  const phone = cleanString(address.phone).replace(/\D/g, "");

  if (phone.length < 10) {
    throw new Error("Customer shipping phone number is invalid");
  }
};

// ------------------------------------------------------------
// Validate payment eligibility
// ------------------------------------------------------------

const validateOrderForShipping = (order) => {
  if (order.orderStatus === "Cancelled") {
    throw new Error("Cancelled orders cannot be shipped");
  }

  if (!order.orderItems?.length) {
    throw new Error("Order does not contain any products");
  }

  if (order.paymentMethod === "razorpay") {
    if (order.paymentStatus !== "paid" || order.isPaid !== true) {
      throw new Error(
        "Razorpay order must be fully paid before shipment creation",
      );
    }

    return;
  }

  if (order.paymentMethod === "cod") {
    if (order.paymentStatus !== "cod_pending" || order.isPaid === true) {
      throw new Error("COD order is not in a valid state for shipping");
    }

    return;
  }

  throw new Error("Unsupported payment method for shipping");
};

// ------------------------------------------------------------
// Validate optional admin-entered package dimensions
//
// Admin may send:
//
// {
//   "package": {
//      "weightKg": 1.2,
//      "lengthCm": 32,
//      "breadthCm": 25,
//      "heightCm": 10
//   }
// }
//
// This is useful when multiple sarees are packed together.
// ------------------------------------------------------------

const validatePackageOverride = (packageData) => {
  if (!packageData) {
    return null;
  }

  const weightKg = positiveNumber(packageData.weightKg);

  const lengthCm = positiveNumber(packageData.lengthCm);

  const breadthCm = positiveNumber(packageData.breadthCm);

  const heightCm = positiveNumber(packageData.heightCm);

  if (!weightKg || !lengthCm || !breadthCm || !heightCm) {
    throw new Error(
      "Package weight, length, breadth and height must all be greater than 0",
    );
  }

  return {
    weightKg: round(weightKg, 3),
    lengthCm: round(lengthCm),
    breadthCm: round(breadthCm),
    heightCm: round(heightCm),
  };
};

// ------------------------------------------------------------
// Load trusted Product documents
//
// We never trust product dimensions sent from the frontend.
// ------------------------------------------------------------

const loadShippingProducts = async (order) => {
  const productIds = [
    ...new Set(
      order.orderItems
        .map((item) => (item.productId ? item.productId.toString() : null))
        .filter(Boolean),
    ),
  ];

  if (!productIds.length) {
    throw new Error("Order products are missing product references");
  }

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  }).select("_id name shipping isActive");

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  for (const item of order.orderItems) {
    if (!item.productId) {
      throw new Error(`Product reference is missing for "${item.name}"`);
    }

    const product = productMap.get(item.productId.toString());

    if (!product) {
      throw new Error(`Product "${item.name}" no longer exists`);
    }

    if (!product.shipping) {
      throw new Error(`Shipping dimensions are missing for "${product.name}"`);
    }

    const weightKg = positiveNumber(product.shipping.weightKg);

    const lengthCm = positiveNumber(product.shipping.lengthCm);

    const breadthCm = positiveNumber(product.shipping.breadthCm);

    const heightCm = positiveNumber(product.shipping.heightCm);

    if (!weightKg || !lengthCm || !breadthCm || !heightCm) {
      throw new Error(`Invalid shipping dimensions for "${product.name}"`);
    }
  }

  return productMap;
};

// ------------------------------------------------------------
// Calculate package automatically from product shipping data
//
// Weight:
//   sum of product weight × quantity
//
// Dimensions:
//   assumes saree packages are stacked.
//
//   length  = largest package length
//   breadth = largest package breadth
//   height  = combined stacked height
//
// Admin package override should be used whenever the actual
// packed parcel differs from this estimate.
// ------------------------------------------------------------

const calculatePackage = (order, productMap) => {
  let weightKg = 0;
  let lengthCm = 0;
  let breadthCm = 0;
  let heightCm = 0;

  for (const item of order.orderItems) {
    const product = productMap.get(item.productId.toString());

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity for "${item.name}"`);
    }

    const shipping = product.shipping;

    weightKg += Number(shipping.weightKg) * quantity;

    lengthCm = Math.max(lengthCm, Number(shipping.lengthCm));

    breadthCm = Math.max(breadthCm, Number(shipping.breadthCm));

    heightCm += Number(shipping.heightCm) * quantity;
  }

  return {
    weightKg: round(weightKg, 3),
    lengthCm: round(lengthCm),
    breadthCm: round(breadthCm),
    heightCm: round(heightCm),
  };
};

// ------------------------------------------------------------
// Build Shiprocket order items
// ------------------------------------------------------------

const buildShiprocketItems = (order) => {
  return order.orderItems.map((item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity for "${item.name}"`);
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Invalid price for "${item.name}"`);
    }

    return {
      name: cleanString(item.name),
      sku: item.productId.toString(),
      units: quantity,
      selling_price: round(price),
      discount: 0,
      tax: 0,
      hsn: "",
    };
  });
};

// ------------------------------------------------------------
// Build complete Shiprocket payload
// ------------------------------------------------------------

const buildShiprocketPayload = ({ order, packageData }) => {
  const address = order.shippingAddress;

  const customerName = cleanString(address.firstName) || "Customer";

  const lastName = cleanString(address.lastName);

  const phone = cleanString(address.phone).replace(/\D/g, "");

  const paymentMethod = order.paymentMethod === "cod" ? "COD" : "Prepaid";

  return {
    order_id: getMerchantOrderId(order),

    order_date: formatShiprocketOrderDate(order.createdAt || new Date()),

    pickup_location: PICKUP_LOCATION,

    comment: "Mehaa Garments website order",

    billing_customer_name: customerName,

    billing_last_name: lastName,

    billing_address: cleanString(address.address),

    billing_address_2: cleanString(address.apartment),

    billing_city: cleanString(address.city),

    billing_pincode: cleanString(address.pincode),

    billing_state: cleanString(address.state),

    billing_country: cleanString(address.country) || "India",

    billing_email: cleanString(address.email),

    billing_phone: phone,

    shipping_is_billing: true,

    order_items: buildShiprocketItems(order),

    payment_method: paymentMethod,

    shipping_charges: 0,

    giftwrap_charges: 0,

    transaction_charges: 0,

    total_discount: 0,

    sub_total: round(order.totalPrice),

    length: packageData.lengthCm,

    breadth: packageData.breadthCm,

    height: packageData.heightCm,

    weight: packageData.weightKg,
  };
};

// ============================================================
// CREATE SHIPROCKET SHIPMENT
//
// POST /api/admin/shipping/:orderId/create
//
// Optional body:
//
// {
//   "package": {
//     "weightKg": 1.2,
//     "lengthCm": 32,
//     "breadthCm": 25,
//     "heightCm": 10
//   }
// }
// ============================================================

export const createShipment = async (req, res) => {
  const { orderId } = req.params;

  let shipmentLockAcquired = false;

  try {
    // --------------------------------------------------------
    // 1. Validate MongoDB ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // --------------------------------------------------------
    // 2. Make sure Shiprocket configuration exists
    // --------------------------------------------------------

    if (!PICKUP_LOCATION) {
      console.error("SHIPROCKET_PICKUP_LOCATION is not configured");

      return res.status(500).json({
        success: false,
        message: "Shipping service is not configured correctly",
      });
    }

    // --------------------------------------------------------
    // 3. Load order
    // --------------------------------------------------------

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // --------------------------------------------------------
    // 4. Prevent duplicate Shiprocket shipment creation
    // --------------------------------------------------------

    if (order.shipping?.shiprocketOrderId || order.shipping?.shipmentId) {
      return res.status(409).json({
        success: false,
        message: "Shiprocket shipment already exists for this order",
        shipping: order.shipping,
      });
    }

    const currentShippingStatus = order.shipping?.status || "not_created";

    if (currentShippingStatus !== "not_created") {
      return res.status(409).json({
        success: false,
        message:
          currentShippingStatus === "creating"
            ? "Shipment creation is already in progress"
            : `Shipment cannot be created while shipping status is "${currentShippingStatus}"`,
        shipping: order.shipping,
      });
    }

    // --------------------------------------------------------
    // 5. Validate order/payment/address before external API call
    // --------------------------------------------------------

    validateOrderForShipping(order);

    validateShippingAddress(order.shippingAddress);

    // --------------------------------------------------------
    // 6. Load trusted product shipping information
    // --------------------------------------------------------

    const productMap = await loadShippingProducts(order);

    // --------------------------------------------------------
    // 7. Determine final package
    //
    // Admin-entered packed measurements take precedence.
    // Otherwise derive them from trusted Product data.
    // --------------------------------------------------------

    const packageOverride = validatePackageOverride(req.body?.package);

    const packageData = packageOverride || calculatePackage(order, productMap);

    // --------------------------------------------------------
    // 8. Acquire atomic shipment-creation lock
    //
    // This is critical.
    //
    // Two admin clicks / two browser requests cannot both
    // proceed to Shiprocket.
    // --------------------------------------------------------

    const lockedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,

        "shipping.status": "not_created",

        "shipping.shiprocketOrderId": null,

        "shipping.shipmentId": null,
      },
      {
        $set: {
          "shipping.provider": "shiprocket",

          "shipping.status": "creating",

          "shipping.lastError": null,
        },

        $inc: {
          "shipping.creationAttempts": 1,
        },
      },
      {
        new: true,
      },
    );

    if (!lockedOrder) {
      const latestOrder = await Order.findById(orderId);

      return res.status(409).json({
        success: false,
        message:
          "Shipment creation has already started or the order shipping state changed",
        shipping: latestOrder?.shipping || null,
      });
    }

    shipmentLockAcquired = true;

    // --------------------------------------------------------
    // 9. Build Shiprocket payload
    // --------------------------------------------------------

    const shiprocketPayload = buildShiprocketPayload({
      order: lockedOrder,
      packageData,
    });

    // --------------------------------------------------------
    // 10. Create order in Shiprocket
    // --------------------------------------------------------

    const shiprocketResponse = await createShiprocketOrder(shiprocketPayload);

    // --------------------------------------------------------
    // 11. Validate Shiprocket response
    // --------------------------------------------------------

    const shiprocketOrderId = shiprocketResponse?.order_id;

    const shipmentId = shiprocketResponse?.shipment_id;

    if (!shiprocketOrderId || !shipmentId) {
      throw new Error(
        "Shiprocket did not return a valid order ID and shipment ID",
      );
    }

    // --------------------------------------------------------
    // 12. Persist Shiprocket identifiers
    // --------------------------------------------------------

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,

        "shipping.status": "creating",

        "shipping.shiprocketOrderId": null,

        "shipping.shipmentId": null,
      },
      {
        $set: {
          "shipping.provider": "shiprocket",

          "shipping.shiprocketOrderId": String(shiprocketOrderId),

          "shipping.shipmentId": String(shipmentId),

          "shipping.status": "created",

          "shipping.createdAt": new Date(),

          "shipping.lastError": null,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedOrder) {
      // Important:
      // Shiprocket shipment exists at this point.
      //
      // Never automatically call Shiprocket again here,
      // otherwise we could create a duplicate shipment.

      console.error(
        `CRITICAL: Shiprocket shipment created but local order update failed. Order: ${order._id}, Shiprocket Order: ${shiprocketOrderId}, Shipment: ${shipmentId}`,
      );

      return res.status(500).json({
        success: false,
        message:
          "Shipment was created with the shipping provider but the local order could not be updated. Do not retry shipment creation automatically.",
      });
    }

    // --------------------------------------------------------
    // 13. Success
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,

      message: "Shiprocket shipment created successfully",

      shipping: updatedOrder.shipping,

      package: packageData,
    });
  } catch (error) {
    console.error("Create shipment error:", error.response || error.message);

    // --------------------------------------------------------
    // Release local state into FAILED only when we had
    // successfully acquired the creation lock.
    //
    // We deliberately do NOT automatically retry here.
    //
    // A timeout can be ambiguous:
    // Shiprocket may have created the shipment even though
    // our server did not receive the response.
    // --------------------------------------------------------

    if (shipmentLockAcquired) {
      try {
        await Order.findOneAndUpdate(
          {
            _id: orderId,
            "shipping.status": "creating",
          },
          {
            $set: {
              "shipping.status": "failed",

              "shipping.lastError": cleanString(error.message).slice(0, 500),
            },
          },
          {
            runValidators: true,
          },
        );
      } catch (databaseError) {
        console.error(
          "Failed to update shipment failure state:",
          databaseError.message,
        );
      }
    }

    const status = error.status === 400 || error.status === 422 ? 400 : 500;

    return res.status(status).json({
      success: false,

      message:
        status === 400
          ? error.message
          : "Unable to create shipment. Please check the order shipping state before retrying.",
    });
  }
};

// ============================================================
// ASSIGN COURIER + GENERATE AWB
//
// POST /api/admin/shipping/:orderId/awb
//
// Optional body:
//
// {
//   "courierId": 123
// }
//
// If courierId is omitted, Shiprocket can use its courier
// assignment logic for the shipment.
// ============================================================

export const assignAWB = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { courierId = null } = req.body || {};

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
    // Find Order
    // ------------------------------------------
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ------------------------------------------
    // Validate Shiprocket shipment
    // ------------------------------------------
    if (!order.shipping?.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: "Shiprocket order has not been created yet",
      });
    }

    if (!order.shipping?.shipmentId) {
      return res.status(400).json({
        success: false,
        message: "Shiprocket shipment ID is missing",
      });
    }

    // ------------------------------------------
    // Prevent duplicate AWB assignment
    // ------------------------------------------
    if (order.shipping?.awb) {
      return res.status(409).json({
        success: false,
        message: "AWB has already been assigned",
        awb: order.shipping.awb,
      });
    }

    // ------------------------------------------
    // Shipping must be in "created" state
    // ------------------------------------------
    if (order.shipping.status !== "created") {
      return res.status(400).json({
        success: false,
        message: `AWB cannot be generated while shipping status is "${order.shipping.status}"`,
      });
    }

    // ------------------------------------------
    // Validate optional courier ID
    // ------------------------------------------
    let normalizedCourierId = null;

    if (
      courierId !== null &&
      courierId !== undefined &&
      courierId !== ""
    ) {
      normalizedCourierId = Number(courierId);

      if (
        !Number.isInteger(normalizedCourierId) ||
        normalizedCourierId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid courier ID",
        });
      }
    }

    // ------------------------------------------
    // ATOMIC AWB GENERATION LOCK
    //
    // created → awb_generating
    // ------------------------------------------
    const lockedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        "shipping.status": "created",
        "shipping.awb": null,
        "shipping.shipmentId": {
          $ne: null,
        },
      },
      {
        $set: {
          "shipping.status": "awb_generating",
          "shipping.lastError": null,
        },
      },
      {
        new: true,
      },
    );

    if (!lockedOrder) {
      return res.status(409).json({
        success: false,
        message:
          "AWB generation is already being processed or shipment status has changed",
      });
    }

    // ------------------------------------------
    // Call Shiprocket
    // ------------------------------------------
    let awbResponse;

    try {
      awbResponse = await assignCourierAndGenerateAWB({
        shipmentId: order.shipping.shipmentId,
        courierId: normalizedCourierId,
      });
    } catch (shiprocketError) {
      console.error(
        "Shiprocket AWB generation failed:",
        shiprocketError.response || shiprocketError.message,
      );

      // Restore state
      await Order.findByIdAndUpdate(order._id, {
        $set: {
          "shipping.status": "created",
          "shipping.lastError":
            shiprocketError.message ||
            "Failed to generate AWB",
        },
      });

      return res.status(shiprocketError.status || 502).json({
        success: false,
        message:
          shiprocketError.message ||
          "Failed to generate AWB with Shiprocket",
      });
    }

    // ------------------------------------------
    // Extract AWB
    // ------------------------------------------
    const awb =
      awbResponse?.response?.data?.awb_code ||
      awbResponse?.awb_code ||
      awbResponse?.awb ||
      null;

    // ------------------------------------------
    // Extract courier information
    // ------------------------------------------
    const responseCourierId =
      awbResponse?.response?.data?.courier_company_id ||
      awbResponse?.response?.data?.courier_id ||
      awbResponse?.courier_company_id ||
      awbResponse?.courier_id ||
      normalizedCourierId ||
      null;

    const responseCourierName =
      awbResponse?.response?.data?.courier_name ||
      awbResponse?.courier_name ||
      null;

    // ------------------------------------------
    // Shiprocket must return an AWB
    // ------------------------------------------
    if (!awb) {
      console.error(
        `CRITICAL: Shiprocket AWB assignment returned no AWB for order ${order._id}`,
        awbResponse,
      );

      await Order.findByIdAndUpdate(order._id, {
        $set: {
          "shipping.status": "created",
          "shipping.lastError":
            "Shiprocket did not return an AWB number",
        },
      });

      return res.status(502).json({
        success: false,
        message:
          "Shiprocket did not return an AWB number",
      });
    }

    // ------------------------------------------
    // Save AWB locally
    // ------------------------------------------
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          "shipping.status": "awb_assigned",
          "shipping.awb": String(awb),
          "shipping.courierId": responseCourierId
            ? Number(responseCourierId)
            : null,
          "shipping.courierName":
            responseCourierName || null,
          "shipping.lastError": null,
        },
      },
      {
        new: true,
      },
    );

    // ------------------------------------------
    // CRITICAL:
    // Shiprocket succeeded but local DB failed
    // ------------------------------------------
    if (!updatedOrder) {
      console.error(
        `CRITICAL: Shiprocket AWB ${awb} was generated but order ${order._id} could not be updated locally.`,
      );

      return res.status(500).json({
        success: false,
        message:
          "AWB was generated with Shiprocket, but the local order could not be updated. Do not retry automatically.",
      });
    }

    // ------------------------------------------
    // Admin notification
    // ------------------------------------------
    await createAdminNotification({
      type: "SHIPPING",
      title: "AWB Assigned",
      message: `AWB ${awb} assigned for order ${order._id}`,
      orderId: order._id,
    });

    // ------------------------------------------
    // Response
    // ------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Courier assigned and AWB generated successfully",
      order: updatedOrder,
      awb,
      courierId: responseCourierId,
      courierName: responseCourierName,
      shiprocketResponse: awbResponse,
    });
  } catch (error) {
    console.error(
      "Assign AWB error:",
      error.response || error.message,
    );

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to assign courier and generate AWB",
    });
  }
};

// ==========================================
// SCHEDULE SHIPMENT PICKUP
// ADMIN ONLY
// ==========================================
export const schedulePickup = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { pickupDate = null } = req.body || {};

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
    // Validate optional pickup date
    // Expected format: YYYY-MM-DD
    // ------------------------------------------
    let normalizedPickupDate = null;

    if (
      pickupDate !== null &&
      pickupDate !== undefined &&
      pickupDate !== ""
    ) {
      if (
        typeof pickupDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)
      ) {
        return res.status(400).json({
          success: false,
          message: "Pickup date must be in YYYY-MM-DD format",
        });
      }

      const parsedDate = new Date(
        `${pickupDate}T00:00:00.000Z`,
      );

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid pickup date",
        });
      }

      // ------------------------------------------
      // Prevent past pickup dates
      // ------------------------------------------
      const indiaToday = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      if (pickupDate < indiaToday) {
        return res.status(400).json({
          success: false,
          message: "Pickup date cannot be in the past",
        });
      }

      normalizedPickupDate = pickupDate;
    }

    // ------------------------------------------
    // Find Order
    // ------------------------------------------
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ------------------------------------------
    // Validate Shiprocket order
    // ------------------------------------------
    if (!order.shipping?.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: "Shiprocket order has not been created yet",
      });
    }

    // ------------------------------------------
    // Validate shipment ID
    // ------------------------------------------
    if (!order.shipping?.shipmentId) {
      return res.status(400).json({
        success: false,
        message: "Shiprocket shipment ID is missing",
      });
    }

    // ------------------------------------------
    // AWB required
    // ------------------------------------------
    if (!order.shipping?.awb) {
      return res.status(400).json({
        success: false,
        message: "AWB must be assigned before scheduling pickup",
      });
    }

    // ------------------------------------------
    // Prevent duplicate scheduling
    // ------------------------------------------
    if (order.shipping.status === "pickup_scheduled") {
      return res.status(409).json({
        success: false,
        message: "Pickup has already been scheduled",
        pickupScheduledAt:
          order.shipping.pickupScheduledAt,
      });
    }

    // ------------------------------------------
    // Correct starting state
    // ------------------------------------------
    if (order.shipping.status !== "awb_assigned") {
      return res.status(400).json({
        success: false,
        message:
          `Pickup cannot be scheduled while shipping status is "${order.shipping.status}"`,
      });
    }

    // ------------------------------------------
    // ATOMIC PICKUP SCHEDULING LOCK
    //
    // awb_assigned → pickup_scheduling
    // ------------------------------------------
    const lockedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        "shipping.status": "awb_assigned",
        "shipping.awb": {
          $ne: null,
        },
        "shipping.shipmentId": {
          $ne: null,
        },
      },
      {
        $set: {
          "shipping.status": "pickup_scheduling",
          "shipping.lastError": null,
        },
      },
      {
        new: true,
      },
    );

    if (!lockedOrder) {
      return res.status(409).json({
        success: false,
        message:
          "Pickup scheduling is already being processed or shipment status has changed",
      });
    }

    // ------------------------------------------
    // Call Shiprocket
    // ------------------------------------------
    let pickupResponse;

    try {
      pickupResponse = await generatePickup({
        shipmentId: order.shipping.shipmentId,
        pickupDate: normalizedPickupDate,
      });
    } catch (shiprocketError) {
      console.error(
        "Shiprocket pickup scheduling failed:",
        shiprocketError.response ||
          shiprocketError.message,
      );

      // ------------------------------------------
      // Restore previous state
      // ------------------------------------------
      await Order.findByIdAndUpdate(order._id, {
        $set: {
          "shipping.status": "awb_assigned",
          "shipping.lastError":
            shiprocketError.message ||
            "Failed to schedule pickup",
        },
      });

      return res.status(
        shiprocketError.status || 502,
      ).json({
        success: false,
        message:
          shiprocketError.message ||
          "Failed to schedule pickup with Shiprocket",
      });
    }

    // ------------------------------------------
    // Extract pickup scheduled date
    // ------------------------------------------
    const shiprocketPickupDate =
      pickupResponse?.pickup_scheduled_date ||
      pickupResponse?.response?.pickup_scheduled_date ||
      pickupResponse?.response?.data?.pickup_scheduled_date ||
      normalizedPickupDate ||
      null;

    // ------------------------------------------
    // Prepare final update
    // ------------------------------------------
    const updateData = {
      "shipping.status": "pickup_scheduled",
      "shipping.lastError": null,
    };

    if (shiprocketPickupDate) {
      const parsedPickupDate = new Date(
        shiprocketPickupDate,
      );

      if (!Number.isNaN(parsedPickupDate.getTime())) {
        updateData["shipping.pickupScheduledAt"] =
          parsedPickupDate;
      }
    }

    // ------------------------------------------
    // Save final state
    // ------------------------------------------
    const updatedOrder =
      await Order.findByIdAndUpdate(
        order._id,
        {
          $set: updateData,
        },
        {
          new: true,
        },
      );

    // ------------------------------------------
    // CRITICAL:
    // Shiprocket succeeded but local DB update failed
    // ------------------------------------------
    if (!updatedOrder) {
      console.error(
        `CRITICAL: Shiprocket pickup was scheduled for order ${order._id}, but the local order could not be updated.`,
      );

      return res.status(500).json({
        success: false,
        message:
          "Pickup was scheduled with Shiprocket, but the local order could not be updated. Do not retry automatically.",
      });
    }

    // ------------------------------------------
    // Admin notification
    // ------------------------------------------
    await createAdminNotification({
      type: "SHIPPING",
      title: "Pickup Scheduled",
      message:
        `Pickup scheduled for order ${order._id}`,
      orderId: order._id,
    });

    // ------------------------------------------
    // Response
    // ------------------------------------------
    return res.status(200).json({
      success: true,
      message:
        "Shipment pickup scheduled successfully",
      order: updatedOrder,
      shiprocketResponse: pickupResponse,
    });
  } catch (error) {
    console.error(
      "Schedule pickup error:",
      error.response || error.message,
    );

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to schedule shipment pickup",
    });
  }
};

// ============================================================
// GET COURIER SERVICEABILITY
//
// GET /api/admin/shipping/:orderId/couriers
//
// Returns couriers available for the order's destination.
//
// This is a READ operation.
// It does NOT assign a courier or generate an AWB.
// ============================================================

export const getAvailableCouriers = async (req, res) => {
  const { orderId } = req.params;

  try {
    // --------------------------------------------------------
    // 1. Validate MongoDB order ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // --------------------------------------------------------
    // 2. Validate Shiprocket pickup configuration
    // --------------------------------------------------------

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE?.trim();

    if (!pickupPincode) {
      console.error("SHIPROCKET_PICKUP_PINCODE is not configured");

      return res.status(500).json({
        success: false,
        message: "Shipping pickup pincode is not configured",
      });
    }

    if (!/^\d{6}$/.test(pickupPincode)) {
      console.error("Invalid SHIPROCKET_PICKUP_PINCODE configuration");

      return res.status(500).json({
        success: false,
        message: "Shipping pickup pincode configuration is invalid",
      });
    }

    // --------------------------------------------------------
    // 3. Find order
    // --------------------------------------------------------

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // --------------------------------------------------------
    // 4. Validate shipment
    //
    // Serviceability is checked after creating the
    // Shiprocket shipment and before AWB assignment.
    // --------------------------------------------------------

    if (!order.shipping?.shipmentId) {
      return res.status(409).json({
        success: false,
        message:
          "Create the Shiprocket shipment before checking courier availability",
      });
    }

    if (!order.shipping?.shiprocketOrderId) {
      return res.status(409).json({
        success: false,
        message: "Shiprocket Order ID is missing for this shipment",
      });
    }

    // --------------------------------------------------------
    // 5. Prevent courier lookup after AWB assignment
    // --------------------------------------------------------

    if (order.shipping?.awb) {
      return res.status(409).json({
        success: false,
        message:
          "Courier has already been assigned and an AWB has been generated",
        shipping: order.shipping,
      });
    }

    // --------------------------------------------------------
    // 6. Validate shipping status
    // --------------------------------------------------------

    if (order.shipping.status !== "created") {
      return res.status(409).json({
        success: false,
        message: `Courier serviceability cannot be checked while shipping status is "${order.shipping.status}"`,
        shipping: order.shipping,
      });
    }

    // --------------------------------------------------------
    // 7. Validate destination pincode
    // --------------------------------------------------------

    const deliveryPincode = String(order.shippingAddress?.pincode || "").trim();

    if (!/^\d{6}$/.test(deliveryPincode)) {
      return res.status(400).json({
        success: false,
        message: "Customer delivery pincode is invalid",
      });
    }

    // --------------------------------------------------------
    // 8. Determine COD / Prepaid
    //
    // Shiprocket:
    //
    // COD     = 1
    // Prepaid = 0
    // --------------------------------------------------------

    const cod = order.paymentMethod === "cod" ? 1 : 0;

    // --------------------------------------------------------
    // 9. Ask Shiprocket for courier serviceability
    //
    // We use the Shiprocket order ID because the shipment
    // already exists in Shiprocket.
    //
    // Pickup and delivery pincodes are still supplied so
    // the route is explicit.
    // --------------------------------------------------------

    const response = await getCourierServiceability({
      pickup_postcode: Number(pickupPincode),

      delivery_postcode: Number(deliveryPincode),

      order_id: Number(order.shipping.shiprocketOrderId),

      cod,
    });

    // --------------------------------------------------------
    // 10. Extract courier list
    // --------------------------------------------------------

    const availableCouriers = Array.isArray(
      response?.data?.available_courier_companies,
    )
      ? response.data.available_courier_companies
      : [];

    // --------------------------------------------------------
    // 11. Normalize courier information
    //
    // We only expose fields our admin UI actually needs.
    // --------------------------------------------------------

    const couriers = availableCouriers
      .map((courier) => ({
        courierId: courier.courier_company_id ?? null,

        courierName: courier.courier_name ?? null,

        rate: Number.isFinite(Number(courier.rate))
          ? Number(courier.rate)
          : null,

        freightCharge: Number.isFinite(Number(courier.freight_charge))
          ? Number(courier.freight_charge)
          : null,

        etd: courier.etd ?? courier.etd_hours ?? null,

        estimatedDeliveryDate: courier.estimated_delivery_date ?? null,

        chargeWeight: Number.isFinite(Number(courier.charge_weight))
          ? Number(courier.charge_weight)
          : null,

        deliveryPerformance: Number.isFinite(
          Number(courier.delivery_performance),
        )
          ? Number(courier.delivery_performance)
          : null,

        pickupPerformance: Number.isFinite(Number(courier.pickup_performance))
          ? Number(courier.pickup_performance)
          : null,

        rating: Number.isFinite(Number(courier.rating))
          ? Number(courier.rating)
          : null,

        realtimeTracking: courier.realtime_tracking ?? null,

        podAvailable: courier.pod_available ?? null,

        blocked: Boolean(courier.blocked),
      }))
      .filter((courier) => courier.courierId && courier.courierName);

    // --------------------------------------------------------
    // 12. No courier available
    // --------------------------------------------------------

    if (!couriers.length) {
      return res.status(200).json({
        success: true,

        message: "No courier is currently serviceable for this shipment",

        recommendedCourierId:
          response?.data?.recommended_courier_company_id ?? null,

        couriers: [],
      });
    }

    // --------------------------------------------------------
    // 13. Recommended courier
    // --------------------------------------------------------

    const recommendedCourierId =
      response?.data?.recommended_courier_company_id ??
      response?.data?.shiprocket_recommended_courier_id ??
      null;

    // --------------------------------------------------------
    // 14. Return serviceability information
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      orderId: order._id,

      shiprocketOrderId: order.shipping.shiprocketOrderId,

      shipmentId: order.shipping.shipmentId,

      pickupPincode,

      deliveryPincode,

      paymentMethod: order.paymentMethod,

      cod,

      recommendedCourierId,

      couriers,
    });
  } catch (error) {
    console.error(
      "Courier serviceability error:",
      error.response || error.message,
    );

    const status =
      error.status === 400 || error.status === 422
        ? 400
        : error.status === 404
          ? 404
          : 500;

    return res.status(status).json({
      success: false,

      message:
        status === 400
          ? error.message
          : "Unable to check courier serviceability",
    });
  }
};
