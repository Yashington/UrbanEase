import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/api";
import ProductForm from "./ProductForm";

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/products");
      const list = res.data?.products || res.products || res.data || res;
      setProducts(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products]
  );

  const onCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (p) => {
    setEditing(p);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      alert("Product deleted");
    } catch (e) {
      alert(e.message || "Failed to delete");
    }
  };

  const onSubmit = async (form) => {
    try {
      if (editing) {
        const res = await apiFetch(`/api/products/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        const updated = res.data?.product || res.product || res.data;
        setProducts((prev) => prev.map((p) => (p._id === editing._id ? updated : p)));
        alert("Product updated");
      } else {
        const res = await apiFetch(`/api/products`, {
          method: "POST",
          body: JSON.stringify(form),
        });
        const created = res.data?.product || res.product || res.data;
        setProducts((prev) => [created, ...prev]);
        alert("Product created");
      }
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      alert(e.message || "Failed to save product");
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#1e3a8a]">Products</h2>
        <div className="flex gap-2">
          <button
            onClick={loadProducts}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded"
          >
            Refresh
          </button>
          <button
            onClick={onCreate}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded"
          >
            Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
          <ProductForm
            initial={editing}
            categories={categories}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSubmit={onSubmit}
          />
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Image</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">₹{Number(p.price || 0).toFixed(2)}</td>
                <td className="p-3">{p.stock ?? "-"}</td>
                <td className="p-3">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p._id)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}