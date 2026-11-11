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
  Sparkles,
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

  const handleOpenRedeemModal = (member: any) => {
    setSelectedMember(member);
    if (packages.length > 0) {
      const matchingPkg = packages.find((p) => p.scheme_id === member.scheme_id);
      setSelectedPackageId(String(matchingPkg?.id || packages[0].id));
    }
    setCustomerAcknowledged(true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleProcessRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedPackageId) return;
    if (!customerAcknowledged) {
      setError("Please check customer acknowledgement before issuing.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember.id,
          packageId: Number(selectedPackageId),
          redemptionType,
          cashAmount: redemptionType === "cash" ? Number(cashAmount) : 0,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process redemption");
      }

      setIsModalOpen(false);
      setViewingInvoice(data.redemption);
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
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <Gift className="h-6 w-6 text-amber-400" />
            <span>{t.redemptions}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "தீபாவளி பண்டிகை மளிகைப் பரிசு தொகுப்பு விநியோகம் & இருப்பு கழித்தல்"
              : "Verify scheme completion, issue Diwali hampers, reduce live stock & print delivery invoices"}
          </p>
        </div>
      </div>

      {/* Eligible Members Ready for Redemption */}
      <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-amber-300 font-serif">
              {language === "ta" ? "பரிசு பெற தகுதியான சந்தாதாரர்கள்" : "Eligible Members for Diwali Hamper Redemption"}
            </h3>
            <p className="text-xs text-amber-200/60">
              {language === "ta" ? "முழு தவணைகளையும் செலுத்தி முடித்த வாடிக்கையாளர்கள்" : "Members who completed all installments & passbook ready"}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
            {eligibleMembers.length} Eligible
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eligibleMembers.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-amber-300/60 font-serif text-xs">
              No pending eligible members right now. All eligible hampers have been distributed!
            </div>
          ) : (
            eligibleMembers.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[#1e0004] border border-amber-500/25 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm text-amber-100">{m.customer_name}</h4>
                      <p className="text-xs text-amber-400 font-mono font-bold">{m.passbook_number}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Paid 12/12
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-amber-200/80 space-y-0.5">
                    <p>Scheme: <span className="font-semibold text-amber-300">{m.scheme_name}</span></p>
                    <p>Package Value: <span className="font-black text-amber-400 font-serif">{formatINR(m.grocery_package_value)}</span></p>
                    <p className="text-[11px] text-amber-400/60">Mobile: {m.customer_mobile}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenRedeemModal(m)}
                  className="w-full gold-gradient-btn text-[#1a0004] py-2 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Gift className="h-3.5 w-3.5" />
                  <span>{language === "ta" ? "மளிகை தொகுப்பு வழங்குக" : "Issue Grocery Hamper"}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Redemptions History */}
      <div className="maroon-card rounded-3xl overflow-hidden shadow-xl border border-amber-500/25">
        <div className="p-5 border-b border-amber-500/20">
          <h3 className="font-black text-sm text-amber-300 font-serif">
            {language === "ta" ? "வழங்கப்பட்ட பரிசு விநியோக வரலாறு" : "Completed Hamper Deliveries & Redemptions"}
          </h3>
          <p className="text-xs text-amber-200/60">Official stock deduction log & delivery receipts</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-[#240005]">
            <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer & Passbook</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">Package Issued</th>
                <th className="py-3 px-4 text-right">Package Value</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-amber-300/60 font-serif">
                    Loading redemption history...
                  </td>
                </tr>
              ) : redemptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-amber-300/60 font-serif">
                    No redemption deliveries recorded yet.
                  </td>
                </tr>
              ) : (
                redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {r.redemption_number}
                    </td>
                    <td className="py-3 px-4 text-amber-200/80">
                      {formatDate(r.redemption_date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-amber-100">{r.customer_name}</div>
                      <div className="font-mono text-[10px] text-amber-400">{r.passbook_number}</div>
                    </td>
                    <td className="py-3 px-4 text-amber-200/80">
                      {r.scheme_name}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-300">
                      {r.package_tamil_name || r.package_name || "Special Diwali Hamper"}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-300 text-sm">
                      {formatINR(r.total_package_value)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setViewingInvoice(r)}
                        className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-500/15 border border-amber-500/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg erp-modal-box overflow-hidden shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  Issue Diwali Grocery Hamper
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRedemption} className="p-6 space-y-4 text-xs bg-[#240005]">
              {error && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {error}
                </div>
              )}

              {/* Member Summary Box */}
              <div className="p-3.5 bg-[#1e0004] rounded-2xl border border-amber-500/30 space-y-1.5">
                <div className="flex justify-between font-bold text-amber-100">
                  <span>Customer: {selectedMember.customer_name}</span>
                  <span className="font-mono text-amber-400">{selectedMember.passbook_number}</span>
                </div>
                <div className="flex justify-between text-amber-300/80 text-[11px]">
                  <span>Scheme: {selectedMember.scheme_name}</span>
                  <span className="font-bold text-amber-300">
                    Paid: {selectedMember.completed_installments}/{selectedMember.total_months} Months
                  </span>
                </div>
                <div className="pt-1 text-right font-black text-amber-300 text-sm font-serif">
                  Package Value: {formatINR(selectedMember.grocery_package_value)}
                </div>
              </div>

              {/* Package selection */}
              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">
                  Select Grocery Package Template *
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
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
              <div className="p-3 bg-[#1e0004] rounded-xl border border-amber-500/25 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="ack"
                  checked={customerAcknowledged}
                  onChange={(e) => setCustomerAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-amber-500 text-amber-500 focus:ring-amber-400"
                  required
                />
                <label htmlFor="ack" className="text-[11px] font-semibold text-amber-200">
                  வாடிக்கையாளர் அசல் பாஸ்புக் சமர்ப்பித்து அனைத்து மளிகைப் பொருட்களையும் நல்ல நிலையில் பெற்றுக்கொண்டதை உறுதிப்படுத்துகிறேன் (Customer Acknowledged).
                </label>
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
                  {submitting ? "Processing..." : "Confirm Delivery & Deduct Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Receipt / Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg erp-modal-box overflow-hidden shadow-2xl border border-amber-500/40">
            <div className="p-6 border-b border-dashed border-amber-500/30 text-center space-y-1 bg-[#1e0004]">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                DIWALI GROCERY REDEMPTION INVOICE
              </span>
              <h2 className="text-lg font-black text-amber-300 font-serif">ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்</h2>
              <p className="text-xs font-bold text-amber-200">SRI LAKSHMI SUPERMARKET</p>
              <p className="text-[10px] text-amber-400/60">Salem - 636001 | Phone: 98765 43210</p>
            </div>

            <div className="p-6 space-y-3 text-xs bg-[#240005]">
              <div className="flex justify-between border-b border-amber-500/15 pb-2">
                <span className="text-amber-400/70">Invoice No:</span>
                <span className="font-mono font-bold text-amber-300">{viewingInvoice.redemption_number}</span>
              </div>
              <div className="flex justify-between border-b border-amber-500/15 pb-2">
                <span className="text-amber-400/70">Customer:</span>
                <span className="font-bold text-amber-100">{viewingInvoice.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-amber-500/15 pb-2">
                <span className="text-amber-400/70">Scheme & Passbook:</span>
                <span className="font-semibold text-amber-200">{viewingInvoice.scheme_name} ({viewingInvoice.passbook_number})</span>
              </div>
              <div className="flex justify-between border-b border-amber-500/15 pb-2">
                <span className="text-amber-400/70">Issued Package:</span>
                <span className="font-bold text-amber-300">{viewingInvoice.package_tamil_name || viewingInvoice.package_name}</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm font-black text-amber-300">
                <span>TOTAL GROCERY PACKAGE VALUE:</span>
                <span className="text-lg font-serif">{formatINR(viewingInvoice.total_package_value)}</span>
              </div>

              <div className="pt-8 grid grid-cols-2 text-center text-[10px] text-amber-300/80">
                <div>
                  <div className="border-t border-amber-500/30 pt-1 font-bold">
                    Customer Signature / ஒப்புகை
                  </div>
                </div>
                <div>
                  <div className="border-t border-amber-500/30 pt-1 font-bold">
                    Authorized Supermarket Seal
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#1e0004] border-t border-amber-500/20 flex justify-end gap-2">
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="gold-gradient-btn px-5 py-2 text-[#1a0004] font-black text-xs rounded-xl shadow-md flex items-center gap-1.5"
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
