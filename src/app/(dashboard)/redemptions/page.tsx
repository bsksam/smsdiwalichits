"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate } from "@/lib/utils";
import {
  Gift,
  CheckCircle2,
  Boxes,
  Printer,
  Search,
  AlertTriangle,
  Receipt,
  User,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";

export default function RedemptionsPage() {
  const { t, language } = useLanguage();
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [eligibleMembers, setEligibleMembers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Issue Redemption Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [redemptionType, setRedemptionType] = useState<"grocery_package" | "cash">("grocery_package");
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [customerAcknowledged, setCustomerAcknowledged] = useState(true);
  const [remarks, setRemarks] = useState("Festival Diwali grocery distribution");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Viewing invoice modal
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [redRes, pkgRes] = await Promise.all([
        fetch("/api/redemptions"),
        fetch("/api/packages"),
      ]);
      const redData = await redRes.json();
      const pkgData = await pkgRes.json();

      setRedemptions(redData.redemptions || []);
      setEligibleMembers(redData.eligibleMembers || []);
      setPackages(pkgData.packages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRedemption = (member: any) => {
    setSelectedMember(member);
    setSelectedPackageId(String(member.default_package_id || packages[0]?.id || ""));
    setRedemptionType("grocery_package");
    setCashAmount(Number(member.grocery_package_value));
    setError(null);
    setIsModalOpen(true);
  };

  const handleProcessRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember.id,
          packageId: selectedPackageId ? Number(selectedPackageId) : null,
          redemptionType,
          cashAmount,
          customerAcknowledged,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process redemption");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to process redemption");
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
            {t.redemptions}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "தீபாவளி பண்டிகை மளிகைத் தொகுப்பு விநியோகம், இருப்பு பிடித்தம் & ஒப்புகை"
              : "Diwali festival grocery gift distribution, stock deduction and delivery receipts"}
          </p>
        </div>
      </div>

      {/* Eligible Members Ready for Redemption Section */}
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-amber-600" />
          <h2 className="text-sm sm:text-base font-extrabold text-amber-950">
            {language === "ta"
              ? "தீபாவளி பொருள் பெற தகுதியான சந்தாதாரர்கள் (Eligible Members)"
              : "Eligible Members for Diwali Package Redemption"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eligibleMembers.map((m) => {
            const isFullyPaid = m.completed_installments >= m.total_months;

            return (
              <div
                key={m.id}
                className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {m.passbook_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFullyPaid
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                      }`}
                    >
                      {isFullyPaid ? "100% Eligible" : `${m.completed_installments}/${m.total_months} Paid`}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900">{m.customer_name}</h3>
                  <p className="text-xs text-slate-500">{m.customer_mobile}</p>
                  <p className="text-xs font-semibold text-brand-blue mt-1">
                    {m.scheme_name} ({formatINR(m.monthly_amount)}/mo)
                  </p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    Grocery Hamper: {formatINR(m.grocery_package_value)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleOpenRedemption(m)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all"
                  >
                    <Gift className="h-4 w-4" />
                    <span>{language === "ta" ? "பொருட்கள் வழங்கு" : "Issue Package"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Redemptions History */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
            {language === "ta" ? "வழங்கப்பட்ட பொருட்களின் அறிக்கை (Issued Deliveries)" : "Issued Delivery Invoices"}
          </h3>
          <p className="text-xs text-slate-500">History of distributed festival grocery packages</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Scheme & Passbook</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4 text-right">Package Value</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading deliveries...</td>
                </tr>
              ) : redemptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No redemption deliveries recorded yet.
                  </td>
                </tr>
              ) : (
                redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      {r.redemption_number}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(r.redemption_date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{r.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{r.customer_mobile}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{r.scheme_name}</div>
                      <div className="text-[10px] text-amber-700 font-mono">PB: {r.passbook_number}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {r.package_tamil_name || r.package_name || "Custom Package"}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                      {formatINR(r.total_package_value)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        DELIVERED
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setViewingInvoice(r)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-brand-blue hover:bg-slate-100"
                        title="Print Delivery Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Redemption Modal */}
      {isModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-blue to-blue-900 text-white">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold">Issue Diwali Grocery Hamper</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRedemption} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              {/* Member Summary Box */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Customer: {selectedMember.customer_name}</span>
                  <span className="font-mono text-amber-800">{selectedMember.passbook_number}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Scheme: {selectedMember.scheme_name}</span>
                  <span className="font-bold text-emerald-700">
                    Paid: {selectedMember.completed_installments}/{selectedMember.total_months} Months
                  </span>
                </div>
                <div className="pt-1 text-right font-extrabold text-emerald-800">
                  Package Value: {formatINR(selectedMember.grocery_package_value)}
                </div>
              </div>

              {/* Package selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Grocery Package Template *
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.tamil_name} ({pkg.name}) - Value: {formatINR(pkg.net_package_value || pkg.total_package_value)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Acknowledgement checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="ack"
                  checked={customerAcknowledged}
                  onChange={(e) => setCustomerAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-blue"
                  required
                />
                <label htmlFor="ack" className="text-[11px] font-semibold text-slate-700">
                  வாடிக்கையாளர் அசல் பாஸ்புக் சமர்ப்பித்து அனைத்து மளிகைப் பொருட்களையும் நல்ல நிலையில் பெற்றுக்கொண்டதை உறுதிப்படுத்துகிறேன் (Customer Acknowledged).
                </label>
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
                  {submitting ? "Processing..." : "Confirm Delivery & Deduct Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Receipt / Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="p-6 border-b border-dashed border-slate-300 text-center space-y-1">
              <span className="text-xs font-black text-rose-800 uppercase tracking-widest">
                DIWALI GROCERY REDEMPTION INVOICE
              </span>
              <h2 className="text-lg font-black text-brand-blue">ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்</h2>
              <p className="text-xs font-bold text-slate-700">SRI LAKSHMI SUPERMARKET</p>
              <p className="text-[10px] text-slate-500">Salem - 636001 | Phone: 98765 43210</p>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Invoice No:</span>
                <span className="font-mono font-bold text-amber-800">{viewingInvoice.redemption_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{viewingInvoice.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Scheme & Passbook:</span>
                <span className="font-semibold text-slate-800">{viewingInvoice.scheme_name} ({viewingInvoice.passbook_number})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Issued Package:</span>
                <span className="font-bold text-brand-blue">{viewingInvoice.package_tamil_name || viewingInvoice.package_name}</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm font-black text-emerald-800">
                <span>TOTAL GROCERY PACKAGE VALUE:</span>
                <span className="text-lg">{formatINR(viewingInvoice.total_package_value)}</span>
              </div>

              <div className="pt-8 grid grid-cols-2 text-center text-[10px] text-slate-600">
                <div>
                  <div className="border-t border-slate-300 pt-1 font-bold">
                    Customer Signature / ஒப்புகை
                  </div>
                </div>
                <div>
                  <div className="border-t border-slate-300 pt-1 font-bold">
                    Authorized Supermarket Seal
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-brand-blue text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
