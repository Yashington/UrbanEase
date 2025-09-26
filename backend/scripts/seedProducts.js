const mongoose = require("mongoose");
const Product = require("../models/Product");

// Example products (copy more from fakestoreapi if needed)
const products = [
  {
    title: "Men's T-Shirt",
    description: "A cool cotton t-shirt.",
    price: 20,
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
  },
  {
    title: "Women's Dress",
    description: "Elegant summer dress.",
    price: 35,
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"
  },
  // Add more products here...
];

mongoose.connect("mongodb://localhost:27017/urbanease", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("Products seeded!");
    mongoose.disconnect();
  })
  .catch(err => console.error(err));