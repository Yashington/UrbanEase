const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const http = require("http");           // Import http
const { Server } = require("socket.io");// Import socket.io

// Import routes (orderRoutes will be initialized later)
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutesFn = require("./routes/orders"); // Updated for Socket.IO

const app = express();
const server = http.createServer(app);    // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Enable CORS for frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// --- Socket.IO setup for real-time communication ---
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Join user room for targeted notifications
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });

  // Example event: chat message
  socket.on("chat message", (msg) => {
    console.log("💬 Message received:", msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});
// ------------------------------------------------------

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutesFn(io)); // Pass io to orderRoutes!

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/urbanease';

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🗄️  Database: Connected to MongoDB`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log('\n📋 Available routes:');
    console.log('   - POST /api/auth/signup');
    console.log('   - POST /api/auth/login');
    console.log('   - GET  /api/auth/profile');
    console.log('   - POST /api/orders');
    console.log('   - GET  /api/orders/my-orders');
    console.log('   - GET  /api/cart/:userId');
    console.log('🟣 Socket.IO enabled for real-time communication!');
  });
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});