const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Available routes:");
    console.log("- POST /api/auth/login");
    console.log("- POST /api/auth/signup");
    console.log("- GET/POST /api/cart/:userId");
    console.log("- POST /api/orders");
    console.log("- GET /api/orders/:userId");
  });
})
.catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});