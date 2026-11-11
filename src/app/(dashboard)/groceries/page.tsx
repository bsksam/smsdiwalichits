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
  Sparkles,
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <PackageOpen className="h-6 w-6 text-amber-400" />
            <span>{t.groceries}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "தீபாவளி சிட் மளிகைப் பொருட்கள் சரக்கு இருப்பு & விலை நிர்ணயம்"
              : "Manage supermarket products, unit quantities, purchase & festival chit rates"}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{language === "ta" ? "+ புதிய மளிகைப் பொருள்" : "+ Add Grocery Item"}</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 maroon-card p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-amber-400/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === "ta" ? "மளிகைப் பொருள் பெயர், பார்கோடு அல்லது வகை..." : "Search product name, barcode, unit..."}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
        >
          <option value="">All Categories (அனைத்தும்)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {language === "ta" && c.tamil_name ? c.tamil_name : c.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-xs font-bold text-amber-300 cursor-pointer bg-[#200004] px-3.5 py-2 rounded-xl border border-amber-500/30 whitespace-nowrap">
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
            className="rounded border-amber-500 text-amber-500 focus:ring-amber-400"
          />
          <span>{language === "ta" ? "குறைந்த இருப்பு மட்டும்" : "Low Stock Only"}</span>
        </label>
      </div>

      {/* Products Table */}
      <div className="maroon-card rounded-3xl overflow-hidden shadow-xl border border-amber-500/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-[#240005]">
            <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Product Name (Tamil & English)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Standard Unit</th>
                <th className="py-3 px-4 text-right">Chit Value (₹)</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-amber-300/60 font-serif">
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-amber-300/60 font-serif">
                    No grocery items found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stock_quantity <= p.min_stock_alert;

                  return (
                    <tr key={p.id} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {p.product_code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-amber-100 text-sm">
                          {p.tamil_name || p.name}
                        </div>
                        {p.tamil_name && (
                          <div className="text-[11px] text-amber-300/70 font-sans">
                            {p.name}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-amber-200/80">
                        {language === "ta" && p.category_tamil ? p.category_tamil : p.category_name}
                      </td>
                      <td className="py-3 px-4 font-semibold text-amber-300 font-mono">
                        {p.unit_quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-amber-300 text-sm">
                        {formatINR(p.selling_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border font-mono ${
                            isLow
                              ? "bg-rose-950/80 border-rose-500/40 text-rose-300"
                              : "bg-amber-500/15 border-amber-500/30 text-amber-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg erp-modal-box overflow-hidden my-8 shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  {language === "ta" ? "புதிய மளிகைப் பொருள் சேர்க்க" : "Add Grocery Product"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-amber-300 mb-1 font-serif">
                    பொருள் தமிழ் பெயர் (Tamil Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                    placeholder="e.g. உளுத்தம் பருப்பு / Toor Dal"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-amber-300 mb-1 font-serif">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Urad Dal Premium"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Unit Quantity *</label>
                  <input
                    type="text"
                    required
                    value={formData.unitQuantity}
                    onChange={(e) => setFormData({ ...formData, unitQuantity: e.target.value })}
                    placeholder="e.g. 1 kg, 500 gm, 1 litre"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Selling Value in Chit (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-black text-amber-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="gold-gradient-btn px-5 py-2 font-black text-[#1a0004] rounded-xl shadow-md transition-all"
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
