const express = require("express");
const Product = require("../models/Product");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * External product sources (aggregated server-side to avoid CORS on the client)
 * - External items get an id like: ext:<sourceKey>:<id>
 */
const EXTERNAL_TIMEOUT_MS = Number(process.env.EXTERNAL_TIMEOUT_MS || 7000);
const EXTERNAL_CACHE_MS = Number(process.env.EXTERNAL_CACHE_MS || 60_000); // 1 minute in-memory cache

const sources = {
  fakestore: {
    listUrl: "https://fakestoreapi.com/products",
    itemUrl: (id) => `https://fakestoreapi.com/products/${id}`,
    normalize: (item) => ({
      _id: `ext:fakestore:${item.id}`,
      title: item.title || "Untitled",
      price: Number(item.price) || 0,
      category: item.category || "Misc",
      image: item.image || "",
      description: item.description || "",
      stock: 10,
      active: true,
      source: "fakestore",
      createdAt: new Date().toISOString(),
    }),
  },
};

// Simple fetch JSON with timeout using AbortController
async function fetchJSON(url, timeoutMs = EXTERNAL_TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} at ${url} ${text ? "- " + text : ""}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Simple in-memory cache for external requests
const cache = {
  list: new Map(), // key -> { data, ts }
  item: new Map(), // `${sourceKey}:${id}` -> { data, ts }
};
function getFromCache(map, key) {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > EXTERNAL_CACHE_MS) {
    map.delete(key);
    return null;
  }
  return hit.data;
}
function setCache(map, key, data) {
  map.set(key, { data, ts: Date.now() });
}

async function fetchExternalList(sourceKey) {
  const src = sources[sourceKey];
  if (!src) return [];
  const cacheKey = `list:${sourceKey}`;
  const cached = getFromCache(cache.list, cacheKey);
  if (cached) return cached;

  const arr = await fetchJSON(src.listUrl);
  const norm = Array.isArray(arr) ? arr.map((it) => src.normalize(it)) : [];
  setCache(cache.list, cacheKey, norm);
  return norm;
}
async function fetchAllExternalProducts() {
  const keys = Object.keys(sources);
  const results = await Promise.allSettled(keys.map((k) => fetchExternalList(k)));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
async function fetchExternalItemById(sourceKey, id) {
  const src = sources[sourceKey];
  if (!src) return null;
  const cacheKey = `${sourceKey}:${id}`;
  const cached = getFromCache(cache.item, cacheKey);
  if (cached) return cached;

  const data = await fetchJSON(src.itemUrl(id));
  const norm = src.normalize(data);
  setCache(cache.item, cacheKey, norm);
  return norm;
}
function parseExternalId(rawId) {
  if (typeof rawId !== "string") return null;
  if (!rawId.startsWith("ext:")) return null;
  const parts = rawId.split(":");
  if (parts.length < 3) return null;
  const [, sourceKey, ...rest] = parts;
  return { sourceKey, id: rest.join(":") };
}

// Apply same filters for external products in-memory
function filterInMemory(products, { q, category, minPrice, maxPrice, inStock, includeInactive }) {
  const qLower = q ? String(q).toLowerCase() : "";
  const cat = category && category !== "All" ? String(category) : null;
  const min = minPrice !== undefined ? Number(minPrice) : undefined;
  const max = maxPrice !== undefined ? Number(maxPrice) : undefined;
  const onlyInStock = String(inStock) === "true";
  const onlyActive = String(includeInactive) !== "true";

  return products.filter((p) => {
    if (onlyActive && p.active === false) return false;
    if (qLower) {
      const title = String(p.title || "").toLowerCase();
      if (!title.includes(qLower)) return false;
    }
    if (cat && p.category !== cat) return false;

    const price = Number(p.price) || 0;
    if (min !== undefined && price < min) return false;
    if (max !== undefined && price > max) return false;

    if (onlyInStock) {
      const stock = typeof p.stock === "number" ? p.stock : 0;
      if (stock <= 0) return false;
    }
    return true;
  });
}

// JS comparator for merged sorting
function makeComparator(sort) {
  if (sort === "price-asc") {
    return (a, b) =>
      (Number(a.price) || 0) - (Number(b.price) || 0) ||
      String(a._id).localeCompare(String(b._id));
  }
  if (sort === "price-desc") {
    return (a, b) =>
      (Number(b.price) || 0) - (Number(a.price) || 0) ||
      String(b._id).localeCompare(String(a._id));
  }
  if (sort === "name-asc") {
    return (a, b) =>
      String(a.title || "").localeCompare(String(b.title || "")) ||
      String(a._id).localeCompare(String(b._id));
  }
  return (a, b) => {
    const ad = new Date(a.createdAt || 0).getTime();
    const bd = new Date(b.createdAt || 0).getTime();
    if (bd !== ad) return bd - ad;
    return String(b._id).localeCompare(String(a._id));
  };
}

/**
 * Public: List products (local + optional external)
 */
router.get("/", async (req, res) => {
  try {
    const {
      page,
      limit,
      q,
      category,
      minPrice,
      maxPrice,
      inStock,
      includeInactive,
      includeExternal,
      sort = "newest",
    } = req.query;

    // Build local query
    const query = {};
    if (String(includeInactive) !== "true") query.active = { $ne: false };
    if (q) query.title = { $regex: q, $options: "i" };
    if (category && category !== "All") query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice) || 0;
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice) || Number.MAX_SAFE_INTEGER;
    }
    if (String(inStock) === "true") query.stock = { $gt: 0 };

    // Mongo sort
    let sortSpec = { createdAt: -1 };
    if (sort === "price-asc") sortSpec = { price: 1, _id: 1 };
    else if (sort === "price-desc") sortSpec = { price: -1, _id: -1 };
    else if (sort === "name-asc") sortSpec = { title: 1, _id: 1 };

    const wantExternal = String(includeExternal) === "true";
    const [localProducts, externalRaw] = await Promise.all([
      Product.find(query).sort(sortSpec),
      wantExternal ? fetchAllExternalProducts() : Promise.resolve([]),
    ]);

    const externalProducts = wantExternal
      ? filterInMemory(externalRaw, { q, category, minPrice, maxPrice, inStock, includeInactive })
      : [];

    const combined = [...localProducts, ...externalProducts];
    combined.sort(makeComparator(sort));

    const usePagination = page !== undefined || limit !== undefined;
    if (usePagination) {
      const pageNum = Math.max(1, parseInt(page || "1", 10));
      const pageSize = Math.min(1000, Math.max(1, parseInt(limit || "12", 10)));
      const total = combined.length;
      const start = (pageNum - 1) * pageSize;
      const items = combined.slice(start, start + pageSize);
      return res.json({
        data: {
          products: items,
          page: pageNum,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    }

    return res.json(combined);
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
 * Public: Get single product by id (local or external)
 */
router.get("/:id", async (req, res) => {
  try {
    const parsed = parseExternalId(req.params.id);
    if (parsed) {
      const item = await fetchExternalItemById(parsed.sourceKey, parsed.id);
      if (!item) {
        return res.status(404).json({ success: false, message: "External product not found" });
      }
      return res.json(item);
    }

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
