import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import jwt from "jsonwebtoken";
import User from "./models/User.js";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import uniqueCategoryRoutes from "./routes/uniqueCategoryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

import { setSocketIO } from "./services/notificationService.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";

dotenv.config();

connectDB();

const app = express();

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// ==========================================
// HTTP SERVER
// ==========================================

const httpServer = createServer(app);

// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Make Socket.IO available to notification service
setSocketIO(io);

// ==========================================
// SOCKET.IO AUTHENTICATION
// ==========================================

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(
        new Error("Authentication required"),
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    const user = await User.findById(decoded.id).select(
      "-password",
    );

    if (!user) {
      return next(
        new Error("User no longer exists"),
      );
    }

    if (!user.isActive) {
      return next(
        new Error("Account is inactive"),
      );
    }

    // ==========================================
    // SOCKET USER
    // ==========================================

    socket.user = user;

    next();
  } catch (error) {
    console.error(
      "Socket authentication failed:",
      error.message,
    );

    next(new Error("Not authorized"));
  }
});

// ==========================================
// SOCKET.IO CONNECTION
// ==========================================

io.on("connection", (socket) => {
  const user = socket.user;

  // ==========================================
  // ADMIN SOCKET
  // ==========================================

  if (user.role === "admin") {
    socket.join("admins");

    console.log(
      `Admin socket connected: ${user.name} (${socket.id})`,
    );
  }

  // ==========================================
  // CUSTOMER SOCKET
  // ==========================================

  if (user.role !== "admin") {
    const customerRoom = `customer:${user._id.toString()}`;

    socket.join(customerRoom);

    console.log(
      `Customer socket connected: ${user.name} (${socket.id})`,
    );

    console.log(
      `Customer joined room: ${customerRoom}`,
    );
  }

  // ==========================================
  // DISCONNECT
  // ==========================================

  socket.on("disconnect", (reason) => {
    if (user.role === "admin") {
      console.log(
        `Admin socket disconnected: ${socket.id}`,
        reason,
      );
    } else {
      console.log(
        `Customer socket disconnected: ${socket.id}`,
        reason,
      );
    }
  });
});

// ==========================================
// RAZORPAY WEBHOOK
// IMPORTANT:
// MUST COME BEFORE express.json()
// ==========================================

app.use(
  "/api/webhooks",
  express.raw({
    type: "application/json",
  }),
  webhookRoutes,
);

// ==========================================
// NORMAL JSON API
// ==========================================

app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/unique-categories", uniqueCategoryRoutes);

app.use("/api/uploads", uploadRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/admin/orders", adminOrderRoutes);

app.use("/api/admin/notifications", notificationRoutes);

app.use("/api/admin/shipping", shippingRoutes);

app.use("/api/invoices", invoiceRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/cart", cartRoutes);

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO running on port ${PORT}`);
});