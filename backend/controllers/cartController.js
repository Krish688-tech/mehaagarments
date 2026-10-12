import mongoose from "mongoose";

import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// ======================================================
// GET USER CART
// GET /api/cart
// ======================================================

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select:
        "name image images price oldPrice stock category description",
    });

    // Create empty cart if user doesn't have one yet
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    // Remove products that no longer exist
    cart.items = cart.items.filter((item) => item.product);

    await cart.save();

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch cart",
    });
  }
};

// ======================================================
// ADD PRODUCT TO CART
// POST /api/cart
// ======================================================

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const { productId, quantity = 1 } = req.body;

    // ------------------------------------------
    // VALIDATE PRODUCT ID
    // ------------------------------------------

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // ------------------------------------------
    // VALIDATE QUANTITY
    // ------------------------------------------

    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // ------------------------------------------
    // FIND PRODUCT
    // ------------------------------------------

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ------------------------------------------
    // CHECK STOCK
    // ------------------------------------------

    if (Number(product.stock || 0) <= 0) {
      return res.status(400).json({
        success: false,
        message: "This product is currently out of stock",
      });
    }

    // ------------------------------------------
    // FIND USER CART
    // ------------------------------------------

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // ------------------------------------------
    // CHECK EXISTING ITEM
    // ------------------------------------------

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + requestedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available in stock`,
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.addedAt = new Date();
    } else {
      if (requestedQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available in stock`,
        });
      }

      cart.items.push({
        product: productId,
        quantity: requestedQuantity,
        addedAt: new Date(),
      });
    }

    await cart.save();

    // ------------------------------------------
    // POPULATE PRODUCT DETAILS
    // ------------------------------------------

    await cart.populate({
      path: "items.product",
      select:
        "name image images price oldPrice stock category description",
    });

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add product to cart",
    });
  }
};

// ======================================================
// UPDATE CART ITEM QUANTITY
// PUT /api/cart/:productId
// ======================================================

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;

    const { productId } = req.params;
    const { quantity } = req.body;

    // ------------------------------------------
    // VALIDATE PRODUCT ID
    // ------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // ------------------------------------------
    // VALIDATE QUANTITY
    // ------------------------------------------

    const updatedQuantity = Number(quantity);

    if (!Number.isInteger(updatedQuantity) || updatedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // ------------------------------------------
    // FIND PRODUCT
    // ------------------------------------------

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ------------------------------------------
    // CHECK STOCK
    // ------------------------------------------

    if (updatedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available in stock`,
      });
    }

    // ------------------------------------------
    // FIND CART
    // ------------------------------------------

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // ------------------------------------------
    // FIND CART ITEM
    // ------------------------------------------

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart",
      });
    }

    cartItem.quantity = updatedQuantity;

    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "name image images price oldPrice stock category description",
    });

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update cart",
    });
  }
};

// ======================================================
// REMOVE PRODUCT FROM CART
// DELETE /api/cart/:productId
// ======================================================

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString(),
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart",
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "name image images price oldPrice stock category description",
    });

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to remove product from cart",
    });
  }
};

// ======================================================
// CLEAR ENTIRE CART
// DELETE /api/cart
// ======================================================

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
        cart: {
          user: userId,
          items: [],
        },
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to clear cart",
    });
  }
};