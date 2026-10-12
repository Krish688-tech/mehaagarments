import UniqueCategory from "../models/uniqueCategoryModel.js";
import Product from "../models/productModel.js";

// ==========================================
// GET ACTIVE UNIQUE CATEGORIES
// GET /api/unique-categories
// PUBLIC
// ==========================================

export const getUniqueCategories = async (req, res) => {
  try {
    const categories = await UniqueCategory.find({
      isActive: true,
    })
      .populate(
        "products",
        "name slug image price oldPrice category stock isActive",
      )
      .sort({
        displayOrder: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(
      "GET UNIQUE CATEGORIES ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get unique categories",
    });
  }
};

// ==========================================
// GET SINGLE UNIQUE CATEGORY
// GET /api/unique-categories/:slug
// PUBLIC
// ==========================================

export const getUniqueCategoryBySlug = async (
  req,
  res,
) => {
  try {
    const category = await UniqueCategory.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate(
      "products",
      "name slug image price oldPrice category stock isActive",
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Unique category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "GET UNIQUE CATEGORY ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get unique category",
    });
  }
};

// ==========================================
// ADMIN - GET ALL UNIQUE CATEGORIES
// GET /api/unique-categories/admin
// ADMIN ONLY
// ==========================================

export const getAdminUniqueCategories = async (req, res) => {
  try {
    const categories = await UniqueCategory.find({})
      .populate(
        "products",
        "name slug image price oldPrice category stock isActive",
      )
      .sort({
        displayOrder: 1,
        createdAt: -1,
      });

    const formattedCategories = categories.map((category) => ({
      ...category.toObject(),
      productCount: category.products?.length || 0,
    }));

    return res.status(200).json({
      success: true,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error(
      "GET ADMIN UNIQUE CATEGORIES ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get unique categories",
    });
  }
};

// ==========================================
// ADMIN - CREATE UNIQUE CATEGORY
// POST /api/unique-categories/admin
// ADMIN ONLY
// ==========================================

export const createUniqueCategory = async (
  req,
  res,
) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      displayOrder,
    } = req.body;

    if (!name || !slug || !image) {
      return res.status(400).json({
        success: false,
        message:
          "Name, slug and image are required",
      });
    }

    const existingCategory =
      await UniqueCategory.findOne({
        slug: slug.toLowerCase().trim(),
      });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message:
          "A unique category with this slug already exists",
      });
    }

    const category =
      await UniqueCategory.create({
        name: name.trim(),
        slug: slug.toLowerCase().trim(),
        description: description?.trim() || "",
        image,
        displayOrder:
          Number.isFinite(Number(displayOrder))
            ? Number(displayOrder)
            : 0,
      });

    return res.status(201).json({
      success: true,
      message:
        "Unique category created successfully",
      category,
    });
  } catch (error) {
    console.error(
      "CREATE UNIQUE CATEGORY ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create unique category",
    });
  }
};

// ==========================================
// ADMIN - UPDATE UNIQUE CATEGORY
// PUT /api/unique-categories/admin/:id
// ADMIN ONLY
// ==========================================

export const updateUniqueCategory = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    const category =
      await UniqueCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Unique category not found",
      });
    }

    const {
      name,
      slug,
      description,
      image,
      displayOrder,
      isActive,
    } = req.body;

    if (name !== undefined) {
      category.name = name.trim();
    }

    if (slug !== undefined) {
      const cleanSlug = slug
        .toLowerCase()
        .trim();

      const existingCategory =
        await UniqueCategory.findOne({
          slug: cleanSlug,
          _id: { $ne: id },
        });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message:
            "Another unique category already uses this slug",
        });
      }

      category.slug = cleanSlug;
    }

    if (description !== undefined) {
      category.description =
        description.trim();
    }

    if (image !== undefined) {
      category.image = image;
    }

    if (displayOrder !== undefined) {
      category.displayOrder =
        Number(displayOrder);
    }

    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message:
        "Unique category updated successfully",
      category,
    });
  } catch (error) {
    console.error(
      "UPDATE UNIQUE CATEGORY ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update unique category",
    });
  }
};

// ==========================================
// ADMIN - DELETE UNIQUE CATEGORY
// DELETE /api/unique-categories/admin/:id
// ADMIN ONLY
// ==========================================

export const deleteUniqueCategory = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    const category =
      await UniqueCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Unique category not found",
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Unique category deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE UNIQUE CATEGORY ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete unique category",
    });
  }
};

// ==========================================
// ADMIN - ADD PRODUCT
// POST /api/unique-categories/admin/:id/products
// ADMIN ONLY
// ==========================================

export const addProductToUniqueCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const category = await UniqueCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Unique category not found",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const alreadyAdded = category.products.some(
      (existingProductId) =>
        existingProductId.toString() === productId.toString(),
    );

    if (alreadyAdded) {
      return res.status(409).json({
        success: false,
        message: "Product is already in this unique category",
      });
    }

    // Add product to unique category
    category.products.push(product._id);

    // Add unique category to product
    if (!Array.isArray(product.uniqueCategories)) {
      product.uniqueCategories = [];
    }

    const alreadyLinked = product.uniqueCategories.some(
      (categoryId) =>
        categoryId.toString() === category._id.toString(),
    );

    if (!alreadyLinked) {
      product.uniqueCategories.push(category._id);
    }

    await Promise.all([
      category.save(),
      product.save(),
    ]);

    await category.populate(
      "products",
      "name slug image price oldPrice category stock isActive",
    );

    return res.status(200).json({
      success: true,
      message: "Product added to unique category",
      category,
    });
  } catch (error) {
    console.error(
      "ADD PRODUCT TO UNIQUE CATEGORY ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add product to unique category",
    });
  }
};

// ==========================================
// ADMIN - REMOVE PRODUCT
// DELETE /api/unique-categories/admin/:id/products/:productId
// ADMIN ONLY
// ==========================================

export const removeProductFromUniqueCategory = async (req, res) => {
  try {
    const { id, productId } = req.params;

    const category = await UniqueCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Unique category not found",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Remove product from unique category
    category.products = category.products.filter(
      (existingProductId) =>
        existingProductId.toString() !== productId.toString(),
    );

    // Remove unique category from product
    product.uniqueCategories = (
      product.uniqueCategories || []
    ).filter(
      (categoryId) =>
        categoryId.toString() !== id.toString(),
    );

    await Promise.all([
      category.save(),
      product.save(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Product removed from unique category",
      category,
    });
  } catch (error) {
    console.error(
      "REMOVE PRODUCT FROM UNIQUE CATEGORY ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from unique category",
    });
  }
};