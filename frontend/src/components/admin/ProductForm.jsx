import React, { useMemo, useState } from "react";

export default function ProductForm({ initial, onCancel, onSubmit, categories = [] }) {
  const uniqueCats = useMemo(
    () => Array.from(new Set((categories || []).filter(Boolean))).sort(),
    [categories]
  );

  const initialCat = initial?.category || uniqueCats[0] || "";
  const [useCustomCat, setUseCustomCat] = useState(initialCat === "" ? true : false);

  const [form, setForm] = useState({
    title: initial?.title || "",
    price: initial?.price ?? "",
    category: initialCat,
    image: initial?.image || "",
    description: initial?.description || "",
    stock: initial?.stock ?? "",
    active: initial?.active ?? true,
    customCategory: "",
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const price = Number(form.price);
    const stock = form.stock === "" ? undefined : Number(form.stock);
    const category = useCustomCat ? (form.customCategory || "").trim() : form.category;
    onSubmit({ ...form, price, stock, category });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">Title</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Price (₹)</label>
        <input
          type="number"
          step="0.01"
          className="w-full border rounded px-3 py-2"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Category</label>
        {!useCustomCat ? (
          <div className="flex gap-2">
            <select
              className="w-full border rounded px-3 py-2"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {uniqueCats.length === 0 && <option value="">Select</option>}
              {uniqueCats.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={() => setUseCustomCat(true)}
            >
              Other
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="w-full border rounded px-3 py-2"
              value={form.customCategory}
              onChange={(e) => update("customCategory", e.target.value)}
              placeholder="Type category"
            />
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={() => {
                setUseCustomCat(false);
                update("customCategory", "");
              }}
            >
              Use list
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Stock</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={form.stock}
          onChange={(e) => update("stock", e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-gray-700 mb-1">Image URL</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.image}
          onChange={(e) => update("image", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-2 justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={!!form.active}
            onChange={(e) => update("active", e.target.checked)}
          />
          Active
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {initial ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
}