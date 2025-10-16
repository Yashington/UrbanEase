/**
 * UrbanEase backend server (backend/server.js)
 * Production-ready for Render deployment + local dev
 * - Fixes MongoDB connection (works with Atlas, avoids localhost fallback)
 * - Loads .env only in development
 * - Handles CORS with regex for Vercel previews
 * - Configured for Express + Socket.IO
 */

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// ✅ Load .env only in local development (Render injects env automatically)
if (process.env.NODE_ENV !== "production") {
  let loaded = require("dotenv").config({ path: path.resolve(__dirname, ".env") });
  if (loaded?.error) {
    loaded = require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
  }
}

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutesFn = require("./routes/orders"); // exports (io) => router
const notificationsRoutes = require("./routes/notifications");
const paymentRoutes = require("./routes/payments");

const app = express();
const server = http.createServer(app);

// ✅ Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; // DO NOT FALL BACK TO localhost on Render

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in environment variables");
  process.exit(1);
}

// ✅ Allowed frontend origins
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  ...(process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((s) => s.trim())
    : []),
  /\.vercel\.app$/, // allow Vercel preview deployments
];

// ✅ Function-based CORS origin checker
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow same-origin or server-to-server requests
    const ok = allowedOrigins.some((rule) =>
      rule instanceof RegExp ? rule.test(origin) : rule === origin
    );
    cb(ok ? null : new Error("Not allowed by CORS"), ok);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

app.set("io", io);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Basic Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Health check route (used by Render)
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Server is running", time: new Date().toISOString() });
});

// ✅ Socket.IO Rooms
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(String(userId));
      console.log(`User ${userId} joined room ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutesFn(io));
app.use("/api/notifications", notificationsRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// ✅ Global error handler
app.use((err, _req, res, _next) => {
  console.error("Global error:", err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

// ✅ MongoDB Connection + Server Start
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("🗄️  MongoDB connected successfully");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Allowed Origins: ${allowedOrigins.map((o) =>
        o instanceof RegExp ? o.toString() : o
      )}`);
      console.log("🟣 Socket.IO active for real-time updates");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ✅ Handle unhandled rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
