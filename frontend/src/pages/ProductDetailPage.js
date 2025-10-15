import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useCart } from "../context/CartContext";

// Use env-based backend URL for easy local/prod switching
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/products`;
const PLACEHOLDER_IMG =
  "https://via.placeholder.com/600x600/edf2f7/111111?text=No+Image";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product details from backend (supports multiple response shapes)
  const fetchProduct = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/${id}`, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const item = data?.data?.product || data?.product || data || null;
        setProduct(item);
      } catch (err) {
        if (err?.name === "AbortError") return; // ignore canceled fetches
        console.error("Product fetch failed:", err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const ac = new AbortController();
    fetchProduct(ac.signal);
    return () => ac.abort();
  }, [fetchProduct]);

  const price = Number(product?.price || 0);
  const priceText = useMemo(
    () =>
      price.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }),
    [price]
  );

  const inStock =
    typeof product?.stock === "number" ? product.stock > 0 : true;

  const handleAddToCart = () => {
    if (!product) return;
    const normalized = { ...product, id: product._id || product.id };
    addToCart(normalized);
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-3 py-2 bg-gray-200 rounded text-[#22223B] hover:bg-gray-300"
      >
        ← Back
      </button>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-8">
          <Skeleton height={420} />
        </div>
      ) : error ? (
        <div className="text-red-500 flex flex-col items-center gap-4">
          <span>Error: {error}</span>
          <button
            onClick={() => fetchProduct()}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : product ? (
        <div className="bg-white rounded-xl shadow p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <img
            src={product.image || PLACEHOLDER_IMG}
            alt={product.title}
            className="w-full h-[400px] object-contain rounded"
            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
          />
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#22223B] mb-3">
                {product.title}
              </h1>
              {product.category && (
                <div className="text-md text-[#51546E] mb-2">
                  {product.category}
                </div>
              )}
              {product.description && (
                <p className="mb-5 text-[#51546E]">{product.description}</p>
              )}
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {inStock ? "In stock" : "Out of stock"}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-6">
              <div className="font-bold text-[#22223B] text-2xl">
                {priceText}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="px-5 py-2 rounded bg-black text-white font-semibold tracking-wide disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProductDetailPage;