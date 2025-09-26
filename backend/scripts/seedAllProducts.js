const mongoose = require("mongoose");
const fetch = require("node-fetch"); // <-- Make sure node-fetch is installed
const Product = require("../models/Product"); // Adjust path if needed

const MONGO_URI = "mongodb://localhost:27017/urbanease"; // Change DB name if needed

async function seedProducts() {
  await mongoose.connect(MONGO_URI);

  // Fetch all products from fakestoreapi
  const res = await fetch("https://fakestoreapi.com/products");
  const products = await res.json();

  // Optional: Remove old products
  await Product.deleteMany({});
  // Insert new products
  await Product.insertMany(products);

  console.log("All products seeded!");
  await mongoose.disconnect();
}

seedProducts();