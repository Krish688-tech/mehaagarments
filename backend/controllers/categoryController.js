import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

// ==========================================
// PUBLIC
// GET /api/categories
// ==========================================

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({
      displayOrder: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ==========================================
// PUBLIC
// GET /api/categories/:slug
// ==========================================

export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get Category By Slug Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ==========================================
// ADMIN
// GET /api/categories/admin/all
// ==========================================

export const getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort({
        displayOrder: 1,
        name: 1,
      })
      .lean();

    const categoryNames = categories.map((category) =>
      category.name.toLowerCase(),
    );

    const productCounts = await Product.aggregate([
      {
        $match: {
          category: {
            $exists: true,
            $ne: "",
          },
        },
      },
      {
        $group: {
          _id: {
            $toLower: "$category",
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const countMap = new Map(
      productCounts.map((item) => [
        item._id,
        item.count,
      ]),
    );

    const categoriesWithCounts = categories.map(
      (category) => ({
        ...category,
        productCount:
          countMap.get(
            category.name.toLowerCase(),
          ) || 0,
      }),
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    console.error(
      "Get Admin Categories Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ==========================================
// ADMIN
// GET /api/categories/admin/:id
// ==========================================

export const getAdminCategoryById = async (
  req,
  res,
) => {
  try {
    const category = await Category.findById(
      req.params.id,
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({
      category: category.name,
    });

    res.status(200).json({
      success: true,
      category: {
        ...category.toObject(),
        productCount,
      },
    });
  } catch (error) {
    console.error(
      "Get Admin Category Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ==========================================
// ADMIN
// POST /api/categories/admin
// ==========================================

export const createCategory = async (req, res) => {
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
          "Name, slug, and image are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanSlug = String(slug)
      .trim()
      .toLowerCase();

    const existingCategory =
      await Category.findOne({
        $or: [
          { name: cleanName },
          { slug: cleanSlug },
        ],
      });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message:
          "A category with this name or slug already exists",
      });
    }

    const category = await Category.create({
      name: cleanName,
      slug: cleanSlug,
      description:
        description
          ? String(description).trim()
          : "",
      image: String(image).trim(),
      displayOrder:
        Number.isFinite(Number(displayOrder))
          ? Number(displayOrder)
          : 0,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error(
      "Create Category Error:",
      error,
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Category name or slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ==========================================
// ADMIN
// PUT /api/categories/admin/:id
// ==========================================

export const updateCategory = async (req, res) => {
  try {
    const category =
      await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      slug,
      description,
      image,
      displayOrder,
    } = req.body;

    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      category.name = cleanName;
    }

    if (slug !== undefined) {
      const cleanSlug = String(slug)
        .trim()
        .toLowerCase();

      if (!cleanSlug) {
        return res.status(400).json({
          success: false,
          message: "Category slug is required",
        });
      }

      category.slug = cleanSlug;
    }

    if (description !== undefined) {
      category.description =
        String(description).trim();
    }

    if (image !== undefined) {
      const cleanImage = String(image).trim();

      if (!cleanImage) {
        return res.status(400).json({
          success: false,
          message: "Category image is required",
        });
      }

      category.image = cleanImage;
    }

    if (displayOrder !== undefined) {
      const order = Number(displayOrder);

      if (!Number.isInteger(order) || order < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Display order must be a non-negative integer",
        });
      }

      category.displayOrder = order;
    }

    const duplicateCategory =
      await Category.findOne({
        _id: { $ne: category._id },
        $or: [
          { name: category.name },
          { slug: category.slug },
        ],
      });

    if (duplicateCategory) {
      return res.status(409).json({
        success: false,
        message:
          "Another category with this name or slug already exists",
      });
    }

    const updatedCategory =
      await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(
      "Update Category Error:",
      error,
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Category name or slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ==========================================
// ADMIN
// PATCH /api/categories/admin/:id/status
// ==========================================

export const updateCategoryStatus = async (
  req,
  res,
) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be a boolean value",
      });
    }

    const category =
      await Category.findByIdAndUpdate(
        req.params.id,
        {
          isActive,
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: isActive
        ? "Category activated successfully"
        : "Category deactivated successfully",
      category,
    });
  } catch (error) {
    console.error(
      "Update Category Status Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ==========================================
// ADMIN
// DELETE /api/categories/admin/:id
// ==========================================

export const deleteCategory = async (
  req,
  res,
) => {
  try {
    const category =
      await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount =
      await Product.countDocuments({
        category: category.name,
      });

    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This category cannot be deleted because products are still assigned to it",
        productCount,
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Category Error:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};