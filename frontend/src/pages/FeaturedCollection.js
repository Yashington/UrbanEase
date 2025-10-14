import React from "react";
import { useNavigate } from "react-router-dom";
import NewsletterSubscription from "../components/NewsletterSubscription";

// Sample featured collection data
const featuredProducts = [
  {
    id: 1,
    name: "Wool Blend Oversized Coat",
    category: "Women's Outerwear",
    price: "$289",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Tailored Linen Blazer",
    category: "Men's Formal",
    price: "$199",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Silk Slip Dress",
    category: "Women's Dresses",
    price: "$159",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Cashmere Sweater",
    category: "Men's Knitwear",
    price: "$179",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
  },
];

function FeaturedCollection() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Featured Collection Section (styling unchanged) */}
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 px-0 md:px-20 py-14 flex flex-col items-center">
        <h1 className="text-4xl font-[Montserrat] font-semibold text-[#22223B] tracking-widest mb-2 text-center">
          FEATURED COLLECTION
        </h1>
        <p className="text-lg text-[#2563eb] mb-12 text-center">
          Explore our carefully curated selection of this season's most coveted pieces.
        </p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 w-full mb-10">
          {featuredProducts.map((product, idx) => (
            <div key={product.id} className="flex flex-col items-center w-[290px]">
              <div className="group relative w-full h-[370px] overflow-hidden rounded shadow-lg bg-white">
                <img
                  src={product.img}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  className="absolute bottom-0 left-0 w-full py-3 bg-black bg-opacity-85 text-white text-lg opacity-0 group-hover:opacity-100 transition duration-300 font-semibold tracking-wider"
                  onClick={() => alert(`Added ${product.name} to cart!`)}
                >
                  ADD TO CART
                </button>
              </div>
              <div className="mt-7 text-center">
                <div className="text-base text-gray-500 mb-1 font-medium">{product.category}</div>
                <div className="font-bold text-lg text-[#22223B] mb-1">{product.name}</div>
                <div className="text-md text-[#2563eb] font-semibold">{product.price}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          className="border border-[#2563eb] rounded px-7 py-3 text-[#2563eb] font-semibold tracking-wide hover:bg-[#2563eb] hover:text-white transition text-lg"
          onClick={() => navigate("/products")}
        >
          VIEW ALL PRODUCTS
        </button>
      </div>
      {/* Newsletter Subscription Section added below, outside and after the collection */}
      <NewsletterSubscription />
    </div>
  );
}

export default FeaturedCollection;