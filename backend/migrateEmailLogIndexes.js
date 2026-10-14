import dotenv from "dotenv";
import mongoose from "mongoose";
import EmailLog from "./models/emailLogModel.js";

dotenv.config();

const migrateIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    const collection = EmailLog.collection;
    const indexes = await collection.indexes();

    const oldIndex = indexes.find(
      (index) => index.name === "unique_order_email",
    );

    if (oldIndex) {
      const hasPartialFilter = Boolean(oldIndex.partialFilterExpression);

      if (!hasPartialFilter) {
        console.log("Removing the outdated order email index...");
        await collection.dropIndex("unique_order_email");
      } else {
        console.log("Order email index already has a partial filter.");
      }
    }

    const refreshedIndexes = await collection.indexes();

    if (!refreshedIndexes.some((index) => index.name === "unique_order_email")) {
      console.log("Creating the corrected order email index...");

      await collection.createIndex(
        { order: 1, type: 1, recipient: 1 },
        {
          unique: true,
          name: "unique_order_email",
          partialFilterExpression: {
            order: { $type: "objectId" },
          },
        },
      );
    }

    const currentIndexes = await collection.indexes();

    if (!currentIndexes.some((index) => index.name === "unique_user_email")) {
      console.log("Creating the user email index...");

      await collection.createIndex(
        { user: 1, type: 1, recipient: 1 },
        {
          unique: true,
          name: "unique_user_email",
          partialFilterExpression: {
            user: { $type: "objectId" },
          },
        },
      );
    }

    console.log("\nEmailLog indexes after migration:");
    console.dir(await collection.indexes(), { depth: null });
    console.log("\nIndex migration completed.");
  } catch (error) {
    console.error("Index migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

migrateIndexes();
