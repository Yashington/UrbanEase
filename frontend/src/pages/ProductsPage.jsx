import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";

// Use backend REST API (MongoDB)
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/products`;

// Request everything from the server (we do client-side pagination)
const FETCH_LIMIT = 1000;

const PRODUCTS_PER_PAGE = 6;
const PLACEHOLDER_IMG =
  "https://via.placeholder.com/600x400/edf2f7/111111?text=No+Image";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const { addToCart } = useCart();
  const searchInputRef = useRef(null);

  // Price range filter
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Pagination state
  const [page, setPage] = useState(1);

  // Fetch products from backend (MongoDB) with abort support
  const fetchProducts = useCallback((signal) => {
    setLoading(true);
    setError("");

    // Ask server to include EXTERNAL products too and return a large batch.
    // Backend must support includeExternal=true to merge external sources.
    const url = `${API_URL}?includeExternal=true&limit=${FETCH_LIMIT}`;

    fetch(url, { signal })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.data?.products || data?.products || [];
        setProducts(Array.isArray(list) ? list : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError("Failed to load products.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    document.title = "Product Listing - UrbanEase";
    if (searchInputRef.current) searchInputRef.current.focus();
    const ac = new AbortController();
    fetchProducts(ac.signal);
    return () => ac.abort();
  }, [fetchProducts]);

  // Compute categories dynamically from products
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  // Get price extremes from products
  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map((p) => Number(p.price) || 0);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setMinPrice(min);
      setMaxPrice(max);
      setPriceRange([min, max]);
    } else {
      setMinPrice(0);
      setMaxPrice(1000);
      setPriceRange([0, 1000]);
    }
  }, [products]);

  const handleAddToCart = useCallback(
    (product) => {
      const normalized = { ...product, id: product._id || product.id };
      addToCart(normalized);
    },
    [addToCart]
  );

  // Filter products by search, category, stock, price range
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const title = String(product.title || "").toLowerCase();
      const matchesSearch = title.includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ? true : product.category === selectedCategory;

      // Use real stock if available; default to in stock when undefined
      const inStock =
        typeof product.stock === "number" ? product.stock > 0 : true;

      const price = Number(product.price) || 0;
      const inPriceRange = price >= priceRange[0] && price <= priceRange[1];

      return (
        matchesSearch &&
        matchesCategory &&
        (!showOnlyInStock || inStock) &&
        inPriceRange
      );
    });
  }, [products, search, selectedCategory, showOnlyInStock, priceRange]);

  // Sorting
  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    if (sortBy === "price-high") {
      sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "price-low") {
      sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "name-az") {
      sorted.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return sortedProducts.slice(start, end);
  }, [sortedProducts, page]);

  const totalPages = useMemo(
    () => Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE),
    [sortedProducts]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, sortBy, showOnlyInStock, priceRange]);

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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-lg"
            aria-label="Search products"
          />
        </div>

        {/* Dynamic categories */}
        <div className="mb-8">
          <h4 className="font-bold text-lg text-[#22223B] mb-3">Category</h4>
          <ul>
            {categories.map((cat) => (
              <li
                key={cat}
                className={`mb-2 cursor-pointer text-[#51546E] hover:text-[#3E8ED0] text-md ${
                  selectedCategory === cat ? "font-bold text-[#3E8ED0]" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
                tabIndex={0}
                aria-label={`Filter by category ${cat}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedCategory(cat);
                }}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>

        {/* In-stock filter */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="inStock"
            checked={showOnlyInStock}
            onChange={(e) => setShowOnlyInStock(e.target.checked)}
            aria-checked={showOnlyInStock}
            aria-label="Show only in-stock products"
          />
          <label htmlFor="inStock" className="text-[#22223B] text-md cursor-pointer">
            Only show in-stock
          </label>
        </div>

        {/* Price range filter */}
        <div className="mb-6">
          <h4 className="font-bold text-lg text-[#22223B] mb-3">Price Range</h4>
          <div className="flex items-center gap-2 mb-2">
            <span>₹{priceRange[0]}</span>
            <input
              type="range"
              min={minPrice}
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              aria-label="Minimum price"
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>₹{priceRange[1]}</span>
            <input
              type="range"
              min={priceRange[0]}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              aria-label="Maximum price"
              className="flex-1"
            />
          </div>
          <div className="text-sm mt-2 text-[#51546E]">
            Showing: ₹{priceRange[0]} - ₹{priceRange[1]}
          </div>
        </div>

        <button
          className="border border-[#3E8ED0] text-[#3E8ED0] px-4 py-2 rounded mt-4 hover:bg-[#e6f3fb] transition"
          onClick={() => {
            setSelectedCategory("All");
            setSearch("");
            setShowOnlyInStock(false);
            setPriceRange([minPrice, maxPrice]);
          }}
          aria-label="Clear Filters"
        >
          Clear Filters
        </button>
      </aside>

      {/* Products Grid/List */}
      <main className="flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
          <h2 className="serif-heading text-3xl mb-8 sm:mb-0">All Products</h2>
          <div className="flex items-center gap-2 text-[#51546E]">
            <span className="mr-2 text-lg">
              <i className="fas fa-filter" /> Sort by
            </span>
            <select
              className="py-1 px-3 rounded border text-lg border-gray-300 focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="">None</option>
              <option value="price-high">Price (High-Low)</option>
              <option value="price-low">Price (Low-High)</option>
              <option value="name-az">Name (A-Z)</option>
            </select>
            {/* Grid/List toggle */}
            <button
              className={`ml-4 px-3 py-1 border rounded text-lg transition ${
                showGrid ? "bg-blue-600 text-white" : "bg-gray-200 text-[#22223B]"
              }`}
              aria-label="Show grid view"
              onClick={() => setShowGrid(true)}
              disabled={showGrid}
            >
              Grid
            </button>
            <button
              className={`px-3 py-1 border rounded text-lg transition ${
                !showGrid ? "bg-blue-600 text-white" : "bg-gray-200 text-[#22223B]"
              }`}
              aria-label="Show list view"
              onClick={() => setShowGrid(false)}
              disabled={!showGrid}
            >
              List
            </button>
          </div>
        </div>

        {loading ? (
          <div
            className={
              showGrid
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
                : "flex flex-col gap-6"
            }
          >
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
                <Skeleton height={288} />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <Skeleton height={28} width={180} />
                  <Skeleton height={22} width={120} />
                  <Skeleton height={30} width={90} style={{ marginTop: "1rem" }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 flex flex-col items-center gap-4">
            <span>Error: {error}</span>
            <button
              onClick={() => {
                const ac = new AbortController();
                fetchProducts(ac.signal);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              aria-label="Retry loading products"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Grid/List render */}
            <div
              className={
                showGrid
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
                  : "flex flex-col gap-6"
              }
            >
              {paginatedProducts.map((product) => {
                const key = product._id || product.id;
                const productId = product._id || product.id;
                const inStock =
                  typeof product.stock === "number" ? product.stock > 0 : true;

                const imgSrc = product.image || PLACEHOLDER_IMG;

                return showGrid ? (
                  // Grid Item
                  <div
                    key={key}
                    className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition flex flex-col group"
                  >
                    <div className="relative">
                      <Link
                        to={`/products/${productId}`}
                        className="block"
                        aria-label={`View details for ${product.title}`}
                      >
                        <img
                          src={imgSrc}
                          alt={product.title}
                          className="w-full h-72 object-cover"
                          onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
                        />
                      </Link>
                      <span
                        className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold ${
                          inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                        aria-label={inStock ? "In stock" : "Out of stock"}
                      >
                        {inStock ? "In stock" : "Out of stock"}
                      </span>
                      <button
                        className="absolute bottom-0 left-0 w-full py-3 bg-black bg-opacity-85 text-white text-lg opacity-0 group-hover:opacity-100 transition duration-300 font-semibold tracking-wider"
                        onClick={() => handleAddToCart(product)}
                        aria-label={`Add ${product.title} to cart`}
                        disabled={!inStock}
                        style={inStock ? {} : { opacity: 0.5, cursor: "not-allowed" }}
                      >
                        ADD TO CART
                      </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <Link to={`/products/${productId}`}>
                          <h3 className="text-xl font-semibold text-[#22223B]">
                            {product.title}
                          </h3>
                        </Link>
                        <div className="text-md text-[#51546E] mb-2">
                          {product.category}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="font-bold text-[#22223B] text-lg">
                          ₹{Number(product.price || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List Item
                  <div
                    key={key}
                    className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition flex flex-row group"
                  >
                    <Link
                      to={`/products/${productId}`}
                      className="block w-44 h-44 shrink-0"
                      aria-label={`View details for ${product.title}`}
                    >
                      <img
                        src={imgSrc}
                        alt={product.title}
                        className="w-full h-full object-contain p-6"
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
                      />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between p-6">
                      <div>
                        <Link to={`/products/${productId}`}>
                          <h3 className="text-xl font-semibold text-[#22223B]">
                            {product.title}
                          </h3>
                        </Link>
                        <div className="text-md text-[#51546E] mb-2">
                          {product.category}
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${
                            inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                          aria-label={inStock ? "In stock" : "Out of stock"}
                        >
                          {inStock ? "In stock" : "Out of stock"}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-2">
                        <div className="font-bold text-[#22223B] text-lg">
                          ₹{Number(product.price || 0).toFixed(2)}
                        </div>
                        <button
                          className="px-4 py-2 bg-black text-white rounded font-semibold tracking-wider disabled:opacity-50"
                          onClick={() => handleAddToCart(product)}
                          aria-label={`Add ${product.title} to cart`}
                          disabled={!inStock}
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!loading && paginatedProducts.length === 0 && (
                <div className="col-span-3 text-center text-xl text-[#51546E] mt-10">
                  No products found matching your filters.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="flex justify-center mt-8 gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 rounded border bg-gray-200 text-[#22223B] disabled:opacity-50"
                  aria-label="Previous page"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx + 1)}
                    className={`px-3 py-1 rounded border ${
                      page === idx + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-[#22223B]"
                    }`}
                    aria-label={`Go to page ${idx + 1}`}
                    aria-current={page === idx + 1 ? "page" : undefined}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setPage(idx + 1);
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 rounded border bg-gray-200 text-[#22223B] disabled:opacity-50"
                  aria-label="Next page"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ProductsPage;