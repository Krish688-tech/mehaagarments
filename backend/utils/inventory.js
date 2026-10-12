import Product from "../models/productModel.js";

// ==========================================
// REDUCE INVENTORY SAFELY
// REQUIRES MONGODB SESSION
// ==========================================

export const reduceInventory = async (
  orderItems,
  session,
) => {
  if (!session) {
    throw new Error(
      "MongoDB session is required for inventory reduction",
    );
  }

  if (
    !Array.isArray(orderItems) ||
    orderItems.length === 0
  ) {
    throw new Error("Order items are required");
  }

  // ==========================================
  // COMBINE DUPLICATE PRODUCTS
  // ==========================================

  const inventoryMap = new Map();

  for (const item of orderItems) {
    const productId = item.productId?.toString();
    const quantity = Number(item.quantity);

    if (
      !productId ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error(
        "Invalid inventory information",
      );
    }

    const existingQuantity =
      inventoryMap.get(productId) || 0;

    inventoryMap.set(
      productId,
      existingQuantity + quantity,
    );
  }

  // ==========================================
  // ATOMIC STOCK REDUCTION
  // ==========================================

  const updatedProducts = [];

  for (const [
    productId,
    quantity,
  ] of inventoryMap.entries()) {
    const product =
      await Product.findOneAndUpdate(
        {
          _id: productId,
          isActive: true,
          stock: {
            $gte: quantity,
          },
        },
        {
          $inc: {
            stock: -quantity,
            salesCount: quantity,
          },
        },
        {
          new: true,
          session,
        },
      );

    // ==========================================
    // STOCK UNAVAILABLE
    // ==========================================

    if (!product) {
      throw new Error(
        `Insufficient stock for product: ${productId}`,
      );
    }

    updatedProducts.push({
      productId: product._id,
      quantity,
      remainingStock: product.stock,
    });
  }

  return updatedProducts;
};