"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR } from "@/lib/utils";
import {
  Boxes,
  Plus,
  Trash2,
  CheckCircle2,
  Gift,
  Sparkles,
  ShoppingBag,
  X,
  AlertCircle,
  Tag,
} from "lucide-react";

export default function PackagesPage() {
  const { t, language } = useLanguage();
  const [packages, setPackages] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [groceryProducts, setGroceryProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Package Builder Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [packageTamilName, setPackageTamilName] = useState("");
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("");
  const [bonusAmount, setBonusAmount] = useState<number>(1600);
  const [packageItems, setPackageItems] = useState<
    { productId: number; quantity: number; unitValue: number }[]
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [pkgRes, schRes, grocRes] = await Promise.all([
        fetch("/api/packages"),
        fetch("/api/schemes"),
        fetch("/api/groceries"),
      ]);
      const pkgData = await pkgRes.json();
      const schData = await schRes.json();
      const grocData = await grocRes.json();

      setPackages(pkgData.packages || []);
      setSchemes(schData.schemes || []);
      setGroceryProducts(grocData.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenBuilder = () => {
    setPackageName("");
    setPackageTamilName("");
    setSelectedSchemeId(schemes[0]?.id ? String(schemes[0].id) : "");
    setBonusAmount(1500);

    // Pre-populate with first 5 groceries
    if (groceryProducts.length > 0) {
      setPackageItems(
        groceryProducts.slice(0, 5).map((p) => ({
          productId: p.id,
          quantity: 1,
          unitValue: Number(p.selling_price),
        }))
      );
    } else {
      setPackageItems([]);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    if (groceryProducts.length === 0) return;
    const firstProd = groceryProducts[0];
    setPackageItems([
      ...packageItems,
      {
        productId: firstProd.id,
        quantity: 1,
        unitValue: Number(firstProd.selling_price),
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setPackageItems(packageItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: "productId" | "quantity" | "unitValue",
    value: any
  ) => {
    const updated = [...packageItems];
    if (field === "productId") {
      const prod = groceryProducts.find((p) => p.id === Number(value));
      updated[index] = {
        productId: Number(value),
        quantity: updated[index].quantity,
        unitValue: prod ? Number(prod.selling_price) : updated[index].unitValue,
      };
    } else {
      updated[index][field] = Number(value);
    }
    setPackageItems(updated);
  };

  // Calculate live package total
  const calculatedItemsTotal = packageItems.reduce(
    (sum, it) => sum + it.quantity * it.unitValue,
    0
  );
  const calculatedGrandTotal = calculatedItemsTotal + Number(bonusAmount);

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName || !packageTamilName || packageItems.length === 0) {
      setError("Please fill package name and add at least one grocery item");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: packageName,
          tamilName: packageTamilName,
          schemeId: selectedSchemeId ? Number(selectedSchemeId) : null,
          items: packageItems,
          bonusAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create package");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
            {t.packages}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "தீபாவளி பண்டிகை மளிகைத் தொகுப்பு உருவாக்கம் & திட்ட இணைப்பு"
              : "Design grocery gift hampers, calculate values and assign to chit schemes"}
          </p>
        </div>

        <button
          onClick={handleOpenBuilder}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{language === "ta" ? "+ புதிய மளிகை பேக்கேஜ்" : "+ New Package Builder"}</span>
        </button>
      </div>

      {/* Package Templates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-amber-300 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-block mb-1">
                  {pkg.scheme_name ? `Assigned to: ${pkg.scheme_name}` : "General Package"}
                </span>
                <h3 className="text-lg font-black text-brand-blue">
                  {pkg.tamil_name}
                </h3>
                <h4 className="text-xs font-semibold text-slate-500">{pkg.name}</h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block">Package Total Value</span>
                <span className="text-xl font-black text-emerald-700">
                  {formatINR(pkg.net_package_value || pkg.total_package_value)}
                </span>
              </div>
            </div>

            {/* Grocery Products Table inside Package */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Item (பொருள்)</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(pkg.items || []).map((it: any, idx: number) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-800">{it.tamil_product_name}</span>
                        <span className="text-[10px] text-slate-400 block">{it.product_name}</span>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-700">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {formatINR(it.unit_value)}
                      </td>
                      <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                        {formatINR(it.total_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom summary badge */}
            <div className="flex justify-between items-center text-xs pt-2">
              <span className="font-semibold text-slate-500">
                Total {pkg.items?.length || 0} festive grocery essentials
              </span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl">
                Ready for Diwali Distribution
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Package Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-blue to-blue-900 text-white">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold">Grocery Package Builder</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPackage} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Name (Tamil) *</label>
                  <input
                    type="text"
                    required
                    value={packageTamilName}
                    onChange={(e) => setPackageTamilName(e.target.value)}
                    placeholder="e.g. தீபாவளி மெகா பம்பர் பேக்கேஜ்"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="e.g. Diwali Mega Bumper Package"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign to Chit Scheme</label>
                  <select
                    value={selectedSchemeId}
                    onChange={(e) => setSelectedSchemeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="">General (All Schemes)</option>
                    {schemes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatINR(s.monthly_amount)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 text-sm">Grocery Products in Package</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add Product Row</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {packageItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    >
                      <div className="col-span-5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        >
                          {groceryProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.tamil_name} ({p.name}) - {p.unit_quantity}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                          title="Quantity"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unitValue}
                          onChange={(e) => handleItemChange(idx, "unitValue", e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right font-mono"
                          title="Unit Value"
                        />
                      </div>

                      <div className="col-span-2 text-right font-extrabold text-slate-800">
                        {formatINR(item.quantity * item.unitValue)}
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">Items Subtotal: {formatINR(calculatedItemsTotal)}</span>
                  <span className="text-[11px] text-amber-800 font-bold block">+ Festival Bonus Gift: {formatINR(bonusAmount)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Total Calculated Hamper Value:</span>
                  <span className="text-xl font-black text-emerald-800">
                    {formatINR(calculatedGrandTotal)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md"
                >
                  {submitting ? "Saving..." : "Save Package Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
