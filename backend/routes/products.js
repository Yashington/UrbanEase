const express = require("express");
const Product = require("../models/Product");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Public: List all products
 * Note: Returns a raw array for backward compatibility with existing frontend code.
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (e) {
    console.error("Get products error:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to get products",
      error: e.message,
    });
  }
});

/**
 * Public: Get single product by id
 * Note: Returns the raw product document to avoid breaking existing consumers.
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });
    return res.json(product);
  } catch (e) {
    console.error("Get product error:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to get product",
      error: e.message,
    });
  }
});

/**
 * Admin: Create a product
 */
router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { title, price, category, image, description, stock, active } = req.body || {};

    // Basic validation
    if (!title || typeof title !== "string")
      return res.status(400).json({ success: false, message: "Title is required" });
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0)
      return res.status(400).json({ success: false, message: "Valid price is required" });
    if (!category || typeof category !== "string")
      return res.status(400).json({ success: false, message: "Category is required" });

    const product = new Product({
      title: title.trim(),
      price: Number(price),
      category: category.trim(),
      image: image || "",
      description: description || "",
      stock: stock === undefined || stock === null ? 0 : Number(stock),
      active: typeof active === "boolean" ? active : true,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created",
      data: { product },
    });
  } catch (e) {
    console.error("Create product error:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: e.message,
    });
  }
});

/**
 * Admin: Update a product (full update)
 */
router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { title, price, category, image, description, stock, active } = req.body || {};

    // Build update object only with allowed fields
    const update = {};
    if (title !== undefined) update.title = String(title).trim();
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ success: false, message: "Price must be a non-negative number" });
      }
      update.price = Number(price);
    }
    if (category !== undefined) update.category = String(category).trim();
    if (image !== undefined) update.image = image;
    if (description !== undefined) update.description = description;
    if (stock !== undefined) {
      if (isNaN(Number(stock)) || Number(stock) < 0) {
        return res.status(400).json({ success: false, message: "Stock must be a non-negative number" });
      }
      update.stock = Number(stock);
    }
    if (active !== undefined) update.active = !!active;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    return res.json({
      success: true,
      message: "Product updated",
      data: { product },
    });
  } catch (e) {
    console.error("Update product error:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: e.message,
    });
  }
});

/**
 * Admin: Delete a product
 */
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    return res.json({
      success: true,
      message: "Product deleted",
      data: { id: req.params.id },
    });
  } catch (e) {
    console.error("Delete product error:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: e.message,
    });
  }
});

module.exports = router;