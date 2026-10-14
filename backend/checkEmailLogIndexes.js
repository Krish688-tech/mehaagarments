import dotenv from "dotenv";
import mongoose from "mongoose";
import EmailLog from "./models/emailLogModel.js";

dotenv.config();

const checkIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("\nConnected to MongoDB.");
    console.log("\nExisting EmailLog indexes:");

    const indexes = await EmailLog.collection.indexes();

    console.dir(indexes, { depth: null });
  } catch (error) {
    console.error("Index check failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

checkIndexes();
