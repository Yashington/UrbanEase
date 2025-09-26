import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Use your backend REST API instead of fakestoreapi
const API_URL = "http://localhost:5000/api/products";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product details from backend
  const fetchProduct = () => {
    setLoading(true);
    setError("");
    fetch(`${API_URL}/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load product.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <button onClick={() => navigate(-1)} className="mb-6 px-3 py-2 bg-gray-200 rounded text-[#22223B] hover:bg-gray-300">
        ← Back
      </button>
      {loading ? (
        <Skeleton height={400} />
      ) : error ? (
        <div className="text-red-500 flex flex-col items-center gap-4">
          <span>Error: {error}</span>
          <button
            onClick={fetchProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : product ? (
        <div className="bg-white rounded-xl shadow p-8 flex flex-col md:flex-row gap-8">
          <img src={product.image} alt={product.title} className="w-80 h-80 object-contain mb-6 md:mb-0" />
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#22223B] mb-3">{product.title}</h2>
              <div className="text-md text-[#51546E] mb-2">{product.category}</div>
              <p className="mb-5 text-[#51546E]">{product.description}</p>
            </div>
            <div className="mt-4 flex items-center gap-8">
              <div className="font-bold text-[#22223B] text-2xl">${product.price}</div>
              {/* Add to cart button could go here */}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProductDetailPage;