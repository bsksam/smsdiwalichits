"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, getStatusBadge } from "@/lib/utils";
import {
  PackageOpen,
  Search,
  Plus,
  Edit,
  AlertTriangle,
  Boxes,
  Barcode,
  Layers,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";

export default function GroceriesPage() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Add Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    tamilName: "",
    categoryId: 1,
    brand: "Lakshmi Supermarket",
    unit: "kg",
    unitQuantity: "1 kg",
    purchasePrice: 50,
    sellingPrice: 65,
    stockQuantity: 100,
    minStockAlert: 15,
    barcode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroceries = async () => {
    try {
      let url = `/api/groceries?search=${encodeURIComponent(searchTerm)}`;
      if (categoryFilter) url += `&categoryId=${categoryFilter}`;
      if (lowStockFilter) url += `&lowStock=true`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroceries();
  }, [searchTerm, categoryFilter, lowStockFilter]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      tamilName: "",
      categoryId: categories[0]?.id || 1,
      brand: "Lakshmi Supermarket",
      unit: "kg",
      unitQuantity: "1 kg",
      purchasePrice: 50,
      sellingPrice: 65,
      stockQuantity: 100,
      minStockAlert: 15,
      barcode: "",
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/groceries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      setIsModalOpen(false);
      fetchGroceries();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {t.groceries}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "தீபாவளி சிட் மளிகைப் பொருட்கள், இருப்பு மேலாண்மை & பார் குறியீடுகள்"
              : "Manage supermarket grocery catalog, stock levels, wholesale prices and barcodes"}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-900/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{language === "ta" ? "+ புதிய மளிகைப் பொருள்" : "+ Add Grocery Item"}</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === "ta" ? "மளிகைப் பொருள் பெயர், தமிழ் பெயர் அல்லது பார் கோடு..." : "Search product by English or Tamil name, barcode..."}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.tamil_name})
            </option>
          ))}
        </select>

        <button
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            lowStockFilter
              ? "bg-rose-600 text-white shadow-md shadow-rose-900/20"
              : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span>Low Stock Only</span>
        </button>
      </div>

      {/* Grocery Products Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Tamil Name & Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Qty</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No grocery items found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stock_quantity <= p.min_stock_alert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">
                        {p.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {p.tamil_name}
                        </div>
                        <div className="text-slate-500 text-[11px] font-medium">
                          {p.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {p.category_name}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {p.unit_quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {formatINR(p.purchase_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                        {formatINR(p.selling_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-0.5 rounded-full text-xs ${
                            isLow
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isLow && <AlertTriangle className="h-3 w-3 inline" />}
                          {p.stock_quantity} {p.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-brand-blue text-white">
              <h3 className="text-base font-bold">
                {language === "ta" ? "புதிய மளிகைப் பொருள் சேர்க்க" : "Add Grocery Product"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    பொருள் தமிழ் பெயர் (Tamil Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                    placeholder="e.g. உளுத்தம் பருப்பு / Toor Dal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Urad Dal Premium"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Quantity *</label>
                  <input
                    type="text"
                    required
                    value={formData.unitQuantity}
                    onChange={(e) => setFormData({ ...formData, unitQuantity: e.target.value })}
                    placeholder="e.g. 1 kg, 500 gm, 1 litre"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Value in Chit (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-brand-blue"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold bg-brand-blue hover:bg-blue-800 text-white rounded-xl shadow-md"
                >
                  {submitting ? "Saving..." : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
