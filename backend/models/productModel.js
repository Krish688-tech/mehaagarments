import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    // ==========================================
    // BASIC PRODUCT INFORMATION
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // PRODUCT IMAGES
    // ==========================================

    image: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    // ==========================================
    // PRICING
    // ==========================================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // NORMAL PRODUCT CATEGORY
    // ==========================================

    category: {
      type: String,
      required: false,
      default: "",
      lowercase: true,
      trim: true,
      index: true,
    },

    // ==========================================
    // OUR UNIQUE COLLECTIONS
    // ==========================================

    uniqueCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UniqueCategory",
      },
    ],

    // ==========================================
    // SAREE SPECIFICATIONS
    // ==========================================

    sareeType: {
      type: String,
      default: "",
      trim: true,
    },

    fabric: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    work: {
      type: String,
      default: "",
      trim: true,
    },

    occasion: {
      type: String,
      default: "",
      trim: true,
    },

    blousePiece: {
      type: String,
      default: "",
      trim: true,
    },

    sareeLength: {
      type: String,
      default: "",
      trim: true,
    },

    washCare: {
      type: String,
      default: "",
      trim: true,
    },

    countryOfOrigin: {
      type: String,
      default: "India",
      trim: true,
    },

    // ==========================================
    // INVENTORY
    // ==========================================

    stock: {
      type: Number,
      default: 1,
      min: 0,
    },

    // ==========================================
    // SHIPPING / PACKAGE INFORMATION
    // ==========================================

    shipping: {
      weightKg: {
        type: Number,
        required: true,
        min: 0.01,
      },

      lengthCm: {
        type: Number,
        required: true,
        min: 1,
      },

      breadthCm: {
        type: Number,
        required: true,
        min: 1,
      },

      heightCm: {
        type: Number,
        required: true,
        min: 1,
      },
    },

    // ==========================================
    // RATINGS
    // ==========================================

    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // PRODUCT STATUS
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ==========================================
    // SALES / DISCOVERY
    // ==========================================

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },

    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
