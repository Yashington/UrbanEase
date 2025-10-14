const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutesFn = require("./routes/orders"); // orders exports a function that accepts io

const app = express();
const server = http.createServer(app);

// Use env for frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Make io available elsewhere if needed
app.set("io", io);

// Enable CORS for REST API
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Basic request logger (useful while wiring new routes)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// --- Socket.IO setup for real-time communication ---
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Users join a room matching their userId for targeted notifications
  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });

  // Example broadcast event
  socket.on("chat message", (msg) => {
    console.log("💬 Message received:", msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});
// ------------------------------------------------------

// API routes (ensure these are BEFORE the 404 handler)
app.use("/api/auth", authRoutes);               // includes /signup, /login, and /signup-admin (with ADMIN_SECRET)
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutesFn(io));      // pass io so orders can emit status updates

// 404 handler (MUST be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/urbanease";

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🗄️  Database: Connected to MongoDB`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 CORS Frontend: ${FRONTEND_URL}`);
      console.log("\n📋 Available routes:");
      console.log("   - POST /api/auth/signup");
      console.log("   - POST /api/auth/signup-admin   (requires ADMIN_SECRET)");
      console.log("   - POST /api/auth/login");
      console.log("   - GET  /api/auth/profile");
      console.log("   - POST /api/orders");
      console.log("   - GET  /api/orders/my-orders");
      console.log("   - PATCH /api/orders/:id/status  (admin/moderator)");
      console.log("   - GET  /api/cart/:userId");
      console.log("🟣 Socket.IO enabled for real-time communication!");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });