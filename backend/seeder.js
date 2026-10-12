import mongoose from "mongoose";
import dotenv from "dotenv";

import products from "./data/products.js";
import categories from "./data/categories.js";

import Product from "./models/productModel.js";
import Category from "./models/categoryModel.js";

dotenv.config();

const importData = async () => {
  try {
    // CONNECT DATABASE
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // CLEAR EXISTING DATA
    await Product.deleteMany();
    await Category.deleteMany();

    console.log("Old products and categories removed");

    // INSERT CATEGORIES
    await Category.insertMany(categories);

    console.log(`${categories.length} categories imported`);

    // INSERT PRODUCTS
    await Product.insertMany(products);

    console.log(`${products.length} products imported`);

    console.log("Database seeded successfully");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Seeder Error:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

importData();