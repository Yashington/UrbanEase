// Simple external product aggregator with in-memory caching.
// Default source: Fake Store API. You can add more sources via config below.

const axios = require("axios");

const DEFAULT_TIMEOUT_MS = Number(process.env.EXTERNAL_TIMEOUT_MS || 7000);
const CACHE_TTL_MS = Number(process.env.EXTERNAL_CACHE_MS || 60_000); // 1 minute cache

// Register external sources here.
// key: stable key used in IDs and detail lookup
// listUrl: returns an array
// itemUrl: function(id) that returns detail URL
// normalize(item): convert to your common product shape
const sources = {
  fakestore: {
    listUrl: "https://fakestoreapi.com/products",
    itemUrl: (id) => `https://fakestoreapi.com/products/${id}`,
    normalize: (item) => ({
      // Prefix ID so we don't collide with Mongo _id
      _id: `ext:fakestore:${item.id}`,
      title: item.title || "Untitled",
      price: Number(item.price) || 0,
      category: item.category || "Misc",
      image: item.image || "",
      description: item.description || "",
      stock: 10, // external APIs often don't have stock; pick a sensible default
      active: true,
      // Mark as external for UI/debugging if needed
      source: "fakestore",
      createdAt: new Date().toISOString(),
    }),
  },
};

// In-memory cache per source
const cache = {
  list: new Map(), // key -> { data, ts }
  item: new Map(), // `${key}:${id}` -> { data, ts }
};

function getFromCache(map, key) {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL_MS) {
    map.delete(key);
    return null;
  }
  return hit.data;
}

function setCache(map, key, data) {
  map.set(key, { data, ts: Date.now() });
}

async function fetchListForSource(key) {
  const src = sources[key];
  if (!src) return [];
  const cacheKey = `list:${key}`;
  const cached = getFromCache(cache.list, cacheKey);
  if (cached) return cached;

  const res = await axios.get(src.listUrl, { timeout: DEFAULT_TIMEOUT_MS });
  const arr = Array.isArray(res.data) ? res.data : [];
  const norm = arr.map((it) => src.normalize(it));
  setCache(cache.list, cacheKey, norm);
  return norm;
}

async function fetchItemForSource(key, id) {
  const src = sources[key];
  if (!src) return null;
  const cacheKey = `item:${key}:${id}`;
  const cached = getFromCache(cache.item, cacheKey);
  if (cached) return cached;

  const res = await axios.get(src.itemUrl(id), { timeout: DEFAULT_TIMEOUT_MS });
  const norm = src.normalize(res.data);
  setCache(cache.item, cacheKey, norm);
  return norm;
}

// Fetch all externals across registered sources
async function fetchAllExternalProducts() {
  const keys = Object.keys(sources);
  const results = await Promise.allSettled(keys.map((k) => fetchListForSource(k)));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

// Parse external id format: ext:<sourceKey>:<id>
function parseExternalId(externalId) {
  if (typeof externalId !== "string") return null;
  if (!externalId.startsWith("ext:")) return null;
  const parts = externalId.split(":");
  if (parts.length < 3) return null;
  const [, sourceKey, ...rest] = parts;
  const id = rest.join(":");
  return { sourceKey, id };
}

module.exports = {
  fetchAllExternalProducts,
  fetchItemForSource,
  parseExternalId,
};