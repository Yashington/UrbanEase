import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useCart } from "../context/CartContext"; // <-- Import your cart context

// Sample fashion and clothing product data (with real image links)
const initialProducts = [
  {
    id: 1,
    name: "Warm Up Jacket",
    brand: "Monte Carlo",
    price: 2796,
    rating: 4.4,
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
  },
  {
    id: 2,
    name: "Slim Fit Blazer",
    brand: "LEVIS",
    price: 2599,
    rating: 4.2,
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
  },
  {
    id: 3,
    name: "Animal Printed Shirt",
    brand: "Mufti",
    price: 1017,
    rating: 4.0,
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
  },
  {
    id: 4,
    name: "Knit Cream Sweater",
    brand: "MansiCollections",
    price: 996,
    rating: 3.2,
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
  },
  {
    id: 5,
    name: "Classic Denim Jacket",
    brand: "Wrangler",
    price: 1999,
    rating: 4.5,
    img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
  },
  {
    id: 6,
    name: "Summer Midi Dress",
    brand: "Zara",
    price: 1499,
    rating: 4.3,
    img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
  },
  {
    id: 7,
    name: "Retro Sunglasses",
    brand: "RayBan",
    price: 899,
    rating: 4.2,
    img: "https://images.unsplash.com/photo-1503342452485-86a097568a53?auto=format&fit=crop&w=600&q=80",
    category: "Accessories",
  },
  {
    id: 8,
    name: "Leather Boots",
    brand: "Woodland",
    price: 2399,
    rating: 4.6,
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    category: "Footwear",
  },
  {
    id: 9,
    name: "Casual White Tee",
    brand: "Uniqlo",
    price: 499,
    rating: 4.1,
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
  },
  {
    id: 10,
    name: "Formal Black Trousers",
    brand: "Arrow",
    price: 1299,
    rating: 4.0,
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
  },
  {
    id: 11,
    name: "Printed Scarf",
    brand: "H&M",
    price: 599,
    rating: 3.8,
    img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
    category: "Accessories",
  },
  {
    id: 12,
    name: "V-Neck Sweater",
    brand: "Mango",
    price: 1199,
    rating: 3.9,
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
  }
];

const categories = ["Clothing", "Accessories", "Footwear"];
const ratings = [4, 3, 2, 1];

function ProductsPage() {
  const [products] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);

  const { addToCart } = useCart();

  // useRef: for focusing search input on mount
  const searchInputRef = useRef(null);

  // useEffect: set document title and focus search input
  useEffect(() => {
    document.title = "Product Listing - UrbanEase";
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // useCallback: memoize addToCart handler
  const handleAddToCart = useCallback(
    (product) => {
      addToCart(product);
    },
    [addToCart]
  );

  // useMemo: memoize filtered products for performance
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesRating = selectedRating ? product.rating >= selectedRating : true;
      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [products, search, selectedCategory, selectedRating]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 flex gap-8">
      {/* Filters Sidebar */}
      <aside className="w-[250px]">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search"
            value={search}
            ref={searchInputRef}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-lg"
          />
        </div>
        <div className="mb-8">
          <h4 className="font-bold text-lg text-[#22223B] mb-3">Category</h4>
          <ul>
            {categories.map(cat => (
              <li
                key={cat}
                className={`mb-2 cursor-pointer text-[#51546E] hover:text-[#3E8ED0] text-md ${selectedCategory === cat ? "font-bold text-[#3E8ED0]" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-8">
          <h4 className="font-bold text-lg text-[#22223B] mb-3">Rating</h4>
          {ratings.map(rating => (
            <div key={rating} className="flex items-center mb-2 cursor-pointer" onClick={() => setSelectedRating(rating)}>
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`mr-1 text-2xl ${i < rating ? "text-[#3E8ED0]" : "text-gray-300"}`}>★</span>
              ))}
              <span className="ml-2 text-[#22223B] text-md">& up</span>
            </div>
          ))}
        </div>
        <button
          className="border border-[#3E8ED0] text-[#3E8ED0] px-4 py-2 rounded mt-4 hover:bg-[#e6f3fb] transition"
          onClick={() => {
            setSelectedCategory("");
            setSelectedRating(null);
            setSearch("");
          }}
        >
          Clear Filters
        </button>
      </aside>
      {/* Products Grid */}
      <main className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="serif-heading text-3xl mb-8">All Products</h2>
          <div className="flex items-center gap-2 text-[#51546E]">
            <span className="mr-2 text-lg"><i className="fas fa-filter" /> Sort by</span>
            <select className="py-1 px-3 rounded border text-lg border-gray-300 focus:outline-none">
              <option>Price (High-Low)</option>
              <option>Price (Low-High)</option>
              <option>Rating (High-Low)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition flex flex-col group"
            >
              <div className="relative">
                <img src={product.img} alt={product.name} className="w-full h-72 object-cover" />
                {/* Add to Cart Button on Hover */}
                <button
                  className="absolute bottom-0 left-0 w-full py-3 bg-black bg-opacity-85 text-white text-lg opacity-0 group-hover:opacity-100 transition duration-300 font-semibold tracking-wider"
                  onClick={() => handleAddToCart(product)}
                >
                  ADD TO CART
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[#22223B]">{product.name}</h3>
                  <div className="text-md text-[#51546E] mb-2">by {product.brand}</div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="font-bold text-[#22223B] text-lg">Rs {product.price}/-</div>
                  <div className="bg-[#3E8ED0] text-white px-3 py-1 rounded-lg flex items-center gap-1 font-semibold text-base shadow">
                    {product.rating} <span>★</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Show a message if no products match filters */}
          {filteredProducts.length === 0 && (
            <div className="col-span-3 text-center text-xl text-[#51546E] mt-10">
              No products found matching your filters.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProductsPage;