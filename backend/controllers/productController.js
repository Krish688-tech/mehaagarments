import Product from "../models/productModel.js";
import UniqueCategory from "../models/uniqueCategoryModel.js";

// =====================================================
// HELPER
// =====================================================

// Normalize unique category IDs safely
const normalizeUniqueCategories = (uniqueCategories) => {
  if (!Array.isArray(uniqueCategories)) {
    return [];
  }

  return [
    ...new Set(
      uniqueCategories
        .filter((id) => typeof id === "string" && id.trim())
        .map((id) => id.trim()),
    ),
  ];
};

// Validate that all supplied UniqueCategory IDs exist
const validateUniqueCategories = async (uniqueCategoryIds) => {
  if (!uniqueCategoryIds.length) {
    return [];
  }

  const categories = await UniqueCategory.find({
    _id: { $in: uniqueCategoryIds },
    isActive: true,
  }).select("_id");

  const validIds = categories.map((category) => category._id.toString());

  const invalidIds = uniqueCategoryIds.filter(
    (id) => !validIds.includes(id.toString()),
  );

  if (invalidIds.length > 0) {
    const error = new Error(
      "One or more selected unique collections are invalid or inactive.",
    );

    error.statusCode = 400;

    throw error;
  }

  return categories.map((category) => category._id);
};

// Validate and normalize shipping/package information
const normalizeShipping = (shipping) => {
  if (!shipping || typeof shipping !== "object") {
    const error = new Error("Shipping package information is required.");

    error.statusCode = 400;

    throw error;
  }

  const weightKg = Number(shipping.weightKg);
  const lengthCm = Number(shipping.lengthCm);
  const breadthCm = Number(shipping.breadthCm);
  const heightCm = Number(shipping.heightCm);

  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    const error = new Error("Package weight must be greater than 0.");

    error.statusCode = 400;

    throw error;
  }

  if (!Number.isFinite(lengthCm) || lengthCm <= 0) {
    const error = new Error("Package length must be greater than 0.");

    error.statusCode = 400;

    throw error;
  }

  if (!Number.isFinite(breadthCm) || breadthCm <= 0) {
    const error = new Error("Package width must be greater than 0.");

    error.statusCode = 400;

    throw error;
  }

  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    const error = new Error("Package height must be greater than 0.");

    error.statusCode = 400;

    throw error;
  }

  return {
    weightKg,
    lengthCm,
    breadthCm,
    heightCm,
  };
};

// =====================================================
// GET ALL ACTIVE PRODUCTS
// GET /api/products
// PUBLIC
// =====================================================

export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      uniqueCategory,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      isActive: true,
    };

    // -----------------------------------------
    // SEARCH
    // -----------------------------------------

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { fabric: searchRegex },
        { color: searchRegex },
        { sareeType: searchRegex },
      ];
    }

    // -----------------------------------------
    // NORMAL CATEGORY
    // -----------------------------------------

    if (category && category.trim()) {
      filter.category = category.trim().toLowerCase();
    }

    // -----------------------------------------
    // UNIQUE CATEGORY
    // -----------------------------------------

    if (uniqueCategory && uniqueCategory.trim()) {
      const uniqueCollection = await UniqueCategory.findOne({
        slug: uniqueCategory.trim().toLowerCase(),
        isActive: true,
      }).select("_id");

      if (!uniqueCollection) {
        return res.status(404).json({
          success: false,
          message: "Unique collection not found.",
        });
      }

      filter.uniqueCategories = uniqueCollection._id;
    }

    // -----------------------------------------
    // PRICE FILTER
    // -----------------------------------------

    if (minPrice !== undefined && minPrice !== "") {
      const min = Number(minPrice);

      if (!Number.isNaN(min) && min >= 0) {
        filter.price = {
          ...(filter.price || {}),
          $gte: min,
        };
      }
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      const max = Number(maxPrice);

      if (!Number.isNaN(max) && max >= 0) {
        filter.price = {
          ...(filter.price || {}),
          $lte: max,
        };
      }
    }

    // -----------------------------------------
    // SORTING
    // -----------------------------------------

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "price-low":
        sortOption = { price: 1 };
        break;

      case "price-high":
        sortOption = { price: -1 };
        break;

      case "best-selling":
        sortOption = { salesCount: -1, createdAt: -1 };
        break;

      case "trending":
        sortOption = {
          salesCount: -1,
          rating: -1,
          createdAt: -1,
        };
        break;

      case "newest":
        sortOption = { createdAt: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    // -----------------------------------------
    // PAGINATION
    // -----------------------------------------

    const currentPage = Math.max(Number(page) || 1, 1);
    const itemsPerPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * itemsPerPage;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("uniqueCategories", "name slug description image")
        .sort(sortOption)
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage,
        limit: itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch products.",
    });
  }
};

// =====================================================
// GET SINGLE ACTIVE PRODUCT
// GET /api/products/:id
// PUBLIC
// =====================================================

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("uniqueCategories", "name slug description image");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
};

// =====================================================
// GET ADMIN PRODUCTS
// GET /api/products/admin/all
// ADMIN
// =====================================================

export const getAdminProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      uniqueCategory,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // -----------------------------------------
    // SEARCH
    // -----------------------------------------

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { fabric: searchRegex },
        { color: searchRegex },
        { sareeType: searchRegex },
      ];
    }

    // -----------------------------------------
    // NORMAL CATEGORY
    // -----------------------------------------

    if (category && category.trim()) {
      filter.category = category.trim().toLowerCase();
    }

    // -----------------------------------------
    // STATUS
    // -----------------------------------------

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    // -----------------------------------------
    // UNIQUE CATEGORY
    // -----------------------------------------

    if (uniqueCategory && uniqueCategory.trim()) {
      const uniqueCollection = await UniqueCategory.findOne({
        slug: uniqueCategory.trim().toLowerCase(),
      }).select("_id");

      if (!uniqueCollection) {
        return res.status(404).json({
          success: false,
          message: "Unique collection not found.",
        });
      }

      filter.uniqueCategories = uniqueCollection._id;
    }

    // -----------------------------------------
    // PAGINATION
    // -----------------------------------------

    const currentPage = Math.max(Number(page) || 1, 1);

    const itemsPerPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * itemsPerPage;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("uniqueCategories", "name slug description image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage,
        limit: itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get admin products error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch admin products.",
    });
  }
};

// =====================================================
// GET ADMIN SINGLE PRODUCT
// GET /api/products/admin/:id
// ADMIN
// =====================================================

export const getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "uniqueCategories",
      "name slug description image",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get admin product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
};

// =====================================================
// CREATE PRODUCT
// POST /api/products
// ADMIN
// =====================================================

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      images,
      price,
      oldPrice,
      category,
      uniqueCategories,
      shipping,
      sareeType,
      fabric,
      color,
      work,
      occasion,
      blousePiece,
      sareeLength,
      washCare,
      countryOfOrigin,
      stock,
      isActive,
      isFeatured,
      isBestSeller,
      salesCount,
    } = req.body;

    // -----------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------

    if (!name || !image || price === undefined || oldPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, image, price, old price are required.",
      });
    }

    // -----------------------------------------
    // NORMALIZE UNIQUE COLLECTIONS
    // -----------------------------------------

    const uniqueCategoryIds = normalizeUniqueCategories(uniqueCategories);

    if (!category?.trim() && uniqueCategoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Product must belong to a normal category or at least one unique collection.",
      });
    }

    // -----------------------------------------
    // VALIDATE UNIQUE COLLECTIONS
    // -----------------------------------------

    const validatedUniqueCategories =
      await validateUniqueCategories(uniqueCategoryIds);

    const validatedShipping = normalizeShipping(shipping);

    // -----------------------------------------
    // CREATE PRODUCT
    // -----------------------------------------

    const product = await Product.create({
      name: name.trim(),

      slug: slug && slug.trim() ? slug.trim().toLowerCase() : undefined,

      description: description?.trim() || "",

      image: image.trim(),

      images: Array.isArray(images)
        ? images.filter((item) => typeof item === "string" && item.trim())
        : [],

      price: Number(price),

      oldPrice: Number(oldPrice),

      category: category?.trim() ? category.trim().toLowerCase() : "",

      uniqueCategories: validatedUniqueCategories,

      shipping: validatedShipping,

      sareeType: sareeType?.trim() || "",

      fabric: fabric?.trim() || "",

      color: color?.trim() || "",

      work: work?.trim() || "",

      occasion: occasion?.trim() || "",

      blousePiece: blousePiece?.trim() || "",

      sareeLength: sareeLength?.trim() || "",

      washCare: washCare?.trim() || "",

      countryOfOrigin: countryOfOrigin?.trim() || "India",

      stock: stock !== undefined ? Number(stock) : 1,

      isActive: isActive !== undefined ? Boolean(isActive) : true,

      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,

      isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : false,

      salesCount: salesCount !== undefined ? Number(salesCount) : 0,
    });

    // -----------------------------------------
    // POPULATE RESPONSE
    // -----------------------------------------

    await product.populate("uniqueCategories", "name slug description image");

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A product with this slug already exists.",
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create product.",
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ADMIN
// =====================================================

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const {
      name,
      slug,
      description,
      image,
      images,
      price,
      oldPrice,
      category,
      uniqueCategories,
      shipping,
      sareeType,
      fabric,
      color,
      work,
      occasion,
      blousePiece,
      sareeLength,
      washCare,
      countryOfOrigin,
      stock,
      isActive,
      isFeatured,
      isBestSeller,
      salesCount,
    } = req.body;

    // -----------------------------------------
    // BASIC FIELDS
    // -----------------------------------------

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (slug !== undefined) {
      product.slug = slug?.trim() ? slug.trim().toLowerCase() : undefined;
    }

    if (description !== undefined) {
      product.description = description?.trim() || "";
    }

    if (image !== undefined) {
      product.image = image.trim();
    }

    if (images !== undefined) {
      product.images = Array.isArray(images)
        ? images.filter((item) => typeof item === "string" && item.trim())
        : [];
    }

    // -----------------------------------------
    // PRICING
    // -----------------------------------------

    if (price !== undefined) {
      product.price = Number(price);
    }

    if (oldPrice !== undefined) {
      product.oldPrice = Number(oldPrice);
    }

    // -----------------------------------------
    // NORMAL CATEGORY
    // -----------------------------------------

    if (category !== undefined) {
      product.category = category.trim().toLowerCase();
    }

    // -----------------------------------------
    // UNIQUE COLLECTIONS
    // -----------------------------------------

    if (uniqueCategories !== undefined) {
      const uniqueCategoryIds = normalizeUniqueCategories(uniqueCategories);

      product.uniqueCategories =
        await validateUniqueCategories(uniqueCategoryIds);
    }

    // -----------------------------------------
    // SAREE SPECIFICATIONS
    // -----------------------------------------

    if (sareeType !== undefined) {
      product.sareeType = sareeType?.trim() || "";
    }

    if (fabric !== undefined) {
      product.fabric = fabric?.trim() || "";
    }

    if (color !== undefined) {
      product.color = color?.trim() || "";
    }

    if (work !== undefined) {
      product.work = work?.trim() || "";
    }

    if (occasion !== undefined) {
      product.occasion = occasion?.trim() || "";
    }

    if (blousePiece !== undefined) {
      product.blousePiece = blousePiece?.trim() || "";
    }

    if (sareeLength !== undefined) {
      product.sareeLength = sareeLength?.trim() || "";
    }

    if (washCare !== undefined) {
      product.washCare = washCare?.trim() || "";
    }

    if (countryOfOrigin !== undefined) {
      product.countryOfOrigin = countryOfOrigin?.trim() || "India";
    }

    // -----------------------------------------
    // INVENTORY
    // -----------------------------------------

    if (stock !== undefined) {
      product.stock = Number(stock);
    }

    // -----------------------------------------
    // SHIPPING / PACKAGE INFORMATION
    // -----------------------------------------

    if (shipping !== undefined) {
      product.shipping = normalizeShipping(shipping);
    }

    // -----------------------------------------
    // RATINGS
    // -----------------------------------------

    // -----------------------------------------
    // STATUS / DISCOVERY
    // -----------------------------------------

    if (isActive !== undefined) {
      product.isActive = Boolean(isActive);
    }

    if (isFeatured !== undefined) {
      product.isFeatured = Boolean(isFeatured);
    }

    if (isBestSeller !== undefined) {
      product.isBestSeller = Boolean(isBestSeller);
    }

    if (salesCount !== undefined) {
      product.salesCount = Number(salesCount);
    }

    // -----------------------------------------
    // SAVE
    // -----------------------------------------

    await product.save();

    // -----------------------------------------
    // POPULATE RESPONSE
    // -----------------------------------------

    await product.populate("uniqueCategories", "name slug description image");

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A product with this slug already exists.",
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update product.",
    });
  }
};

// =====================================================
// DELETE / DEACTIVATE PRODUCT
// DELETE /api/products/:id
// ADMIN
// =====================================================

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Soft delete
    product.isActive = false;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to deactivate product.",
    });
  }
};


/**
 * GENERATE DYNAMIC PRODUCT SITEMAP
 * GET /api/products/sitemap.xml
 * PUBLIC
 */
export const getProductSitemap = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      category: { $exists: true, $ne: "" },
    })
      .select("_id category updatedAt createdAt")
      .sort({ _id: 1 })
      .lean();

    const escapeXml = (value = "") =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const urls = products
      .map((product) => {
        const category = String(product.category || "")
          .trim()
          .toLowerCase();

        if (!category) return "";

        const loc =
          `https://mehaagarments.in/collection/` +
          `${encodeURIComponent(category)}/specification/${product._id}`;

        const lastModified = product.updatedAt || product.createdAt;

        return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${
      lastModified && !Number.isNaN(new Date(lastModified).getTime())
        ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>`
        : ""
    }
  </url>`;
      })
      .filter(Boolean)
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    res.status(200);
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=300");
    return res.send(xml);
  } catch (error) {
    console.error("Generate product sitemap error:", error);

    return res.status(500).type("text/plain").send(
      "Unable to generate product sitemap.",
    );
  }
};

