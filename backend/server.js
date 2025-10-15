/**
 * UrbanEase backend server (backend/server.js)
 * - Route imports fixed to use ./routes/*
 * - Loads .env from backend/.env or falls back to ../.env
 * - Uses FRONTEND_URL(S) for CORS and Socket.IO
 * - Uses MONGO_URI (defaults to local 127.0.0.1 to avoid IPv6 issues)
 * - Wires Orders, Products, Auth, Cart, Notifications, and Payments routes
 */

const path = require("path");

// Load env from backend/.env, else try parent ../.env
let loaded = require("dotenv").config({ path: path.resolve(__dirname, ".env") });
if (loaded?.error) {
  loaded = require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Import routes from backend/routes (relative to this file)
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutesFn = require("./routes/orders"); // exports a function (io) => router
const notificationsRoutes = require("./routes/notifications"); // NEW
const paymentRoutes = require("./routes/payments"); // NEW

const app = express();
const server = http.createServer(app);

// Env
const PORT = Number(process.env.PORT) || 5000;
// Support comma-separated origins via FRONTEND_URL or FRONTEND_URLS
const ORIGINS_ENV = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:3000";
const ALLOWED_ORIGINS = ORIGINS_ENV.split(",").map((s) => s.trim());
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/urbanease";

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Expose io if needed elsewhere (used by payments route and others)
app.set("io", io);

// CORS for REST API
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Basic logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Server is running", timestamp: new Date().toISOString() });
});

// Socket rooms
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(String(userId));
    console.log(`User ${userId} joined room ${userId}`);
  });
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutesFn(io));
app.use("/api/notifications", notificationsRoutes); // NEW
app.use("/api/payments", paymentRoutes); // NEW

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

// Start server after DB connects
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("🗄️  MongoDB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 CORS Frontend Origins: ${ALLOWED_ORIGINS.join(", ")}`);
      console.log("\n📋 Available routes:");
      console.log("   Auth:");
      console.log("     - POST /api/auth/signup");
      console.log("     - POST /api/auth/signup-admin   (requires ADMIN_SECRET)");
      console.log("     - POST /api/auth/login");
      console.log("     - GET  /api/auth/profile");
      console.log("   Products:");
      console.log("     - GET  /api/products                        (?includeExternal=true to merge external)");
      console.log("     - GET  /api/products/:id");
      console.log("   Cart:");
      console.log("     - GET  /api/cart/:userId");
      console.log("     - POST /api/cart/:userId/items");
      console.log("   Orders:");
      console.log("     - POST /api/orders");
      console.log("     - GET  /api/orders/my-orders");
      console.log("     - GET  /api/orders/:id");
      console.log("     - PATCH /api/orders/:id/status              (admin/moderator)");
      console.log("   Notifications:");
      console.log("     - GET  /api/notifications                   (?page=&limit=&userId= for admins)");
      console.log("     - GET  /api/notifications/unread-count");
      console.log("     - PATCH /api/notifications/:id/read");
      console.log("     - POST /api/notifications/mark-all-read");
      console.log("   Payments (mock):");
      console.log("     - POST /api/payments/initiate               (body: { orderId })");
      console.log("     - POST /api/payments/confirm                (body: { orderId, method, reference?, proofDataUrl? })");
      console.log("     - POST /api/payments/decline                (body: { orderId })");
      console.log("     - POST /api/payments/select-cod             (body: { orderId })");
      console.log("🟣 Socket.IO enabled for real-time communication!");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Avoid silent exits during dev
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});