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
        groceryProducts.slice(0, 6).map((g) => ({
          productId: g.id,
          quantity: 1,
          unitValue: Number(g.selling_price) || 50,
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
    setPackageItems([
      ...packageItems,
      {
        productId: groceryProducts[0].id,
        quantity: 1,
        unitValue: Number(groceryProducts[0].selling_price) || 50,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setPackageItems(packageItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...packageItems];
    if (field === "productId") {
      const prod = groceryProducts.find((p) => p.id === Number(val));
      updated[index].productId = Number(val);
      if (prod) {
        updated[index].unitValue = Number(prod.selling_price) || 50;
      }
    } else if (field === "quantity") {
      updated[index].quantity = Number(val);
    } else if (field === "unitValue") {
      updated[index].unitValue = Number(val);
    }
    setPackageItems(updated);
  };

  const calculatedItemsTotal = packageItems.reduce(
    (sum, item) => sum + item.quantity * item.unitValue,
    0
  );
  const calculatedGrandTotal = calculatedItemsTotal + Number(bonusAmount || 0);

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (packageItems.length === 0) {
      setError("Please add at least one grocery product to the package.");
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
          bonusAmount: Number(bonusAmount),
          items: packageItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create package");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save package");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <Boxes className="h-6 w-6 text-amber-400" />
            <span>{t.packages}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "தீபாவளி சிறப்பு மளிகைப் பரிசு தொகுப்புகள் & போனஸ் பொருட்கள் சேர்க்கை"
              : "Build custom supermarket hampers, festival grocery packages and bonus allocations"}
          </p>
        </div>

        <button
          onClick={handleOpenBuilder}
          className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{language === "ta" ? "புதிய தொகுப்பு உருவாக்கு" : "Build Grocery Package"}</span>
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="maroon-card rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-amber-400/50 transition-all space-y-4"
          >
            <div>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-amber-400/80 uppercase tracking-widest block">
                    {pkg.code}
                  </span>
                  <h3 className="font-black text-base text-amber-200 font-serif mt-0.5">
                    {language === "ta" && pkg.tamil_name ? pkg.tamil_name : pkg.name}
                  </h3>
                  <p className="text-xs text-amber-300/70">{pkg.name}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {pkg.scheme_name || "All Schemes"}
                </span>
              </div>

              {/* Total Value Banner */}
              <div className="my-4 p-4 rounded-2xl bg-[#1e0004] border border-amber-500/25 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400/70 tracking-wider block">
                    {language === "ta" ? "மொத்த பரிசு மதிப்பு" : "Total Package Value"}
                  </span>
                  <span className="text-2xl font-black text-amber-300 font-serif">
                    {formatINR(pkg.net_package_value || pkg.total_items_value)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-400/70 tracking-wider block">
                    {language === "ta" ? "பொருட்கள்" : "Total Items"}
                  </span>
                  <span className="text-base font-black text-amber-200 font-serif">
                    {pkg.items?.length || 0} Products
                  </span>
                </div>
              </div>

              {/* Grocery Item list preview */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-amber-300/80 block mb-1">
                  Hamper Contents:
                </span>
                {pkg.items && pkg.items.length > 0 ? (
                  pkg.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs py-1 px-2.5 rounded-lg bg-[#240005] border border-amber-500/15 text-amber-100"
                    >
                      <span className="font-semibold truncate max-w-[170px]">
                        {item.tamil_name || item.product_name}
                      </span>
                      <span className="font-mono text-amber-400 font-bold shrink-0">
                        {item.quantity} {item.unit || "unit"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-amber-300/50 italic">No products assigned.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-[11px] text-amber-400/80 font-bold">
                Bonus Goods: +{formatINR(pkg.bonus_amount || 0)}
              </span>
              <span className="text-[11px] text-amber-300 font-medium">
                Standard Diwali Pack
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Package Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl erp-modal-box overflow-hidden my-8 shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  Grocery Package Builder
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPackage} className="p-6 space-y-4 text-xs bg-[#240005]">
              {error && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Package Name (Tamil) *</label>
                  <input
                    type="text"
                    required
                    value={packageTamilName}
                    onChange={(e) => setPackageTamilName(e.target.value)}
                    placeholder="e.g. தீபாவளி மெகா பம்பர் பேக்கேஜ்"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Package Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="e.g. Diwali Mega Bumper Package"
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 font-serif">Assign to Chit Scheme</label>
                  <select
                    value={selectedSchemeId}
                    onChange={(e) => setSelectedSchemeId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
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
              <div className="space-y-2 pt-2 border-t border-amber-500/20">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-amber-300 font-serif text-sm">Grocery Products in Package</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-100 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add Product Row</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {packageItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-[#1e0004] p-2.5 rounded-xl border border-amber-500/25"
                    >
                      <div className="col-span-5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                          className="w-full px-2 py-1.5 bg-[#180003] border border-amber-500/30 rounded-lg text-xs font-bold text-amber-200"
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
                          className="w-full px-2 py-1.5 bg-[#180003] border border-amber-500/30 rounded-lg text-xs font-bold text-center text-amber-100"
                          title="Quantity"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unitValue}
                          onChange={(e) => handleItemChange(idx, "unitValue", e.target.value)}
                          className="w-full px-2 py-1.5 bg-[#180003] border border-amber-500/30 rounded-lg text-xs font-bold text-right font-mono text-amber-300"
                          title="Unit Value"
                        />
                      </div>

                      <div className="col-span-2 text-right font-extrabold text-amber-300">
                        {formatINR(item.quantity * item.unitValue)}
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="bg-[#1e0004] p-4 rounded-2xl border border-amber-500/30 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-amber-400/70 block">Items Subtotal: {formatINR(calculatedItemsTotal)}</span>
                  <span className="text-[11px] text-amber-300 font-bold block">+ Festival Bonus Gift: {formatINR(bonusAmount)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400/80 block">Total Calculated Hamper Value:</span>
                  <span className="text-xl font-black text-amber-300 font-serif">
                    {formatINR(calculatedGrandTotal)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="gold-gradient-btn px-5 py-2 font-black text-[#1a0004] rounded-xl shadow-md transition-all"
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
