const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// List all products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get single product
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ msg: "Product not found" });
  res.json(product);
});

// Add product (for admin/demo)
router.post("/", async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

module.exports = router;