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
  Phone,
  Share2,
  BookOpen,
  Filter,
  Download,
} from "lucide-react";
import Link from "next/link";
import { generateRedemptionInvoicePDF, shareOrDownloadPDF, printPDF } from "@/lib/pdf";
import { generateRedemptionInvoiceWhatsAppMessage } from "@/lib/whatsapp";

export default function RedemptionsPage() {
  const { t, language } = useLanguage();
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [eligibleMembers, setEligibleMembers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all"); // all, eligible, in_progress, redeemed

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
  const [sharingPdf, setSharingPdf] = useState(false);

  // App Master Settings
  const [appSettings, setAppSettings] = useState<any>({
    shop_name: "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட் (SRI LAKSHMI SUPERMARKET)",
    shop_address: "2a PP NAGAR MADURAI, MADURAI - 625016, Tamil Nadu",
    shop_phone: "+91 96009 01937 / +91 91502 80795",
    shop_gst: "33bsops67891zq",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) setAppSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const handleDownloadInvoicePDF = (invoice: any) => {
    if (!invoice) return;
    const doc = generateRedemptionInvoicePDF(invoice, appSettings);
    doc.save(`Invoice_${invoice.redemption_number || "Redemption"}.pdf`);
  };

  const handleShareInvoiceWhatsAppPDF = async (invoice: any) => {
    if (!invoice) return;
    setSharingPdf(true);
    try {
      const doc = generateRedemptionInvoicePDF(invoice, appSettings);
      const text = generateRedemptionInvoiceWhatsAppMessage({
        customerName: invoice.customer_name || "Customer",
        schemeName: invoice.scheme_name || "Diwali Chit",
        passbookNumber: invoice.passbook_number || "PB-SCH",
        invoiceNumber: invoice.redemption_number || "RED-INV",
        packageName: invoice.package_tamil_name || invoice.package_name || "Diwali Grocery Hamper",
        packageValue: Number(invoice.total_package_value) || 0,
        shopName: appSettings.shop_name || "SRI LAKSHMI SUPERMARKET",
        shopAddress: appSettings.shop_address || "2a PP NAGAR MADURAI",
        shopPhone: appSettings.shop_phone || "+91 96009 01937",
      });

      await shareOrDownloadPDF(
        doc,
        `Invoice_${invoice.redemption_number || "Redemption"}.pdf`,
        `Diwali Grocery Redemption Invoice - ${invoice.customer_name}`,
        invoice.customer_mobile,
        text
      );
    } finally {
      setSharingPdf(false);
    }
  };

  const handlePrintInvoice = (invoice: any) => {
    if (!invoice) return;
    try {
      const doc = generateRedemptionInvoicePDF(invoice, appSettings);
      printPDF(doc);
    } catch {
      window.print();
    }
  };

  const fetchData = async () => {
    try {
      let redUrl = `/api/redemptions?search=${encodeURIComponent(searchTerm.trim())}`;
      if (filterType && filterType !== "all") redUrl += `&filter=${filterType}`;

      const [redRes, pkgRes] = await Promise.all([
        fetch(redUrl),
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
    const timer = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, filterType]);

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

      {/* CALL & SEARCH BAR (Mobile, Name, Scheme No/Passbook) */}
      <div className="maroon-card rounded-3xl p-5 shadow-xl border border-amber-500/30 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-amber-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Mobile (e.g. 9600901937), Customer Name, Scheme No/Amount (1500, 700), or Passbook..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#180003] border border-amber-500/40 rounded-2xl text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-amber-400/60 hover:text-amber-200 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {[
              { id: "all", label: "All Schemes / Memberships" },
              { id: "eligible", label: "Eligible (12/12 Months)" },
              { id: "in_progress", label: "In Progress" },
              { id: "redeemed", label: "Already Redeemed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === tab.id
                    ? "gold-gradient-btn text-[#1a0004] font-black shadow-md"
                    : "bg-[#1f0004] text-amber-200/80 border border-amber-500/30 hover:bg-amber-500/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {searchTerm && (
          <div className="flex items-center justify-between text-xs text-amber-300/80 bg-[#1e0004] p-2.5 rounded-xl border border-amber-500/20">
            <span>
              Searching results for: <span className="font-bold text-amber-300 font-mono">"{searchTerm}"</span>
            </span>
            <span className="font-bold text-amber-400">Found {eligibleMembers.length} scheme membership(s)</span>
          </div>
        )}
      </div>

      {/* Eligible Members Ready for Redemption */}
      <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-amber-300 font-serif flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{language === "ta" ? "பரிசு பெற தகுதியான சந்தாதாரர்கள் & திட்டங்கள்" : "Enrolled Schemes Ready for Hamper Distribution"}</span>
            </h3>
            <p className="text-xs text-amber-200/60">
              Each scheme joined by a customer is listed separately with its own passbook and delivery status.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full w-fit">
            {eligibleMembers.length} Scheme Membership(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-8 text-amber-300 font-serif text-xs">
              Searching registered schemes & members...
            </div>
          ) : eligibleMembers.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-amber-300/60 font-serif text-xs">
              No scheme members found matching your search term. Try searching by mobile number (e.g. 9600901937) or customer name.
            </div>
          ) : (
            eligibleMembers.map((m) => {
              const isEligible = Number(m.completed_installments) >= Number(m.total_months);
              const isRedeemed = Boolean(m.is_redeemed && Number(m.is_redeemed) > 0);

              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between space-y-3.5 transition-all shadow-md ${
                    isRedeemed
                      ? "bg-[#180003]/80 border-amber-500/15 opacity-80"
                      : isEligible
                      ? "bg-[#250005] border-amber-400 ring-1 ring-amber-400/20"
                      : "bg-[#200004] border-amber-500/30"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Name, Passbook, Status */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link
                          href={`/customers/${m.customer_id}`}
                          className="font-black text-sm text-amber-100 hover:text-amber-300 transition-colors"
                        >
                          {m.customer_name}
                        </Link>
                        <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                          Passbook: <span className="bg-black/40 px-1.5 py-0.5 rounded">{m.passbook_number}</span>
                        </p>
                      </div>

                      {isRedeemed ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                          ✓ Hamper Issued
                        </span>
                      ) : isEligible ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          🏆 Ready to Redeem
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#300008] text-amber-300/80 border border-amber-500/20">
                          Paid {m.completed_installments}/{m.total_months}
                        </span>
                      )}
                    </div>

                    {/* Direct Call & WhatsApp row */}
                    <div className="flex items-center gap-2 pt-1 border-t border-amber-500/15">
                      <a
                        href={`tel:${m.customer_mobile}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 rounded-xl text-[11px] font-bold transition-all shadow-sm"
                        title="Click to Call Customer"
                      >
                        <Phone className="h-3 w-3" />
                        <span>Call: {m.customer_mobile}</span>
                      </a>

                      <a
                        href={`https://wa.me/91${m.customer_mobile.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm"
                        title="Chat on WhatsApp"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {/* Scheme Details & Value */}
                    <div className="p-3 bg-[#160002] rounded-2xl text-xs space-y-1.5 border border-amber-500/20">
                      <div className="flex justify-between">
                        <span className="text-amber-400/70">Scheme:</span>
                        <span className="font-bold text-amber-200">{m.scheme_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-400/70">Monthly Due:</span>
                        <span className="font-mono font-bold text-amber-300">{formatINR(m.monthly_amount)}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-400/70">Installments:</span>
                        <span className="font-bold text-amber-300">
                          {m.completed_installments} of {m.total_months} Months Paid
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-amber-500/15 font-black text-amber-300">
                        <span>Hamper Value:</span>
                        <span className="font-serif text-sm text-amber-400">{formatINR(m.grocery_package_value)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2 pt-2 border-t border-amber-500/20">
                    {!isRedeemed ? (
                      <button
                        onClick={() => handleOpenRedeemModal(m)}
                        className="w-full gold-gradient-btn text-[#1a0004] py-2.5 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Gift className="h-4 w-4" />
                        <span>{language === "ta" ? "மளிகை தொகுப்பு வழங்குக" : "Issue Grocery Hamper"}</span>
                      </button>
                    ) : (
                      <div className="text-center py-2 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                        Delivered ({m.redemption_number})
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <Link
                        href={`/customers/${m.customer_id}`}
                        className="text-amber-300/80 hover:text-amber-100 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>View Scheme Ledger</span>
                      </Link>

                      <Link
                        href={`/customers/print-card/${m.customer_id}?memberId=${m.id}`}
                        className="text-amber-400 hover:text-amber-200 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Printer className="h-3 w-3" />
                        <span>Print Passbook</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Completed Redemptions History */}
      <div className="maroon-card rounded-3xl overflow-hidden shadow-xl border border-amber-500/25">
        <div className="p-5 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-sm text-amber-300 font-serif">
              {language === "ta" ? "வழங்கப்பட்ட பரிசு விநியோக வரலாறு" : "Completed Hamper Deliveries & Redemptions"}
            </h3>
            <p className="text-xs text-amber-200/60">Official stock deduction log & delivery receipts</p>
          </div>
          <span className="font-mono font-bold text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full w-fit">
            Total Distributed: {redemptions.length} Hampers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-[#240005]">
            <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer & Mobile</th>
                <th className="py-3 px-4">Scheme & Passbook</th>
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
                    No redemption deliveries found matching your search.
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
                      <a href={`tel:${r.customer_mobile}`} className="font-mono text-[11px] text-emerald-400 hover:underline">
                        {r.customer_mobile}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-amber-200/80">
                      <div>{r.scheme_name}</div>
                      <div className="font-mono text-[10px] text-amber-400 font-bold">{r.passbook_number}</div>
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
                  Hamper Value: {formatINR(selectedMember.grocery_package_value)}
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
              <h2 className="text-lg font-black text-amber-300 font-serif">
                {appSettings.shop_name?.split("(")[0]?.trim() || "ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்"}
              </h2>
              <p className="text-xs font-bold text-amber-200">
                {appSettings.shop_name?.includes("(")
                  ? appSettings.shop_name.split("(")[1].replace(")", "").trim()
                  : appSettings.shop_name || "SRI LAKSHMI SUPERMARKET"}
              </p>
              <p className="text-[11px] text-amber-200/90 font-medium">
                {appSettings.shop_address || "2a PP NAGAR MADURAI, MADURAI - 625016, Tamil Nadu"}
              </p>
              <p className="text-[10px] text-amber-400 font-mono font-bold">
                Phone: {appSettings.shop_phone || "+91 96009 01937"} {appSettings.shop_gst ? `| GST: ${appSettings.shop_gst}` : ""}
              </p>
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

            <div className="p-4 bg-[#1e0004] border-t border-amber-500/20 flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-3.5 py-2 text-xs font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
              >
                Close
              </button>

              {/* WhatsApp Share PDF Button */}
              <button
                onClick={() => handleShareInvoiceWhatsAppPDF(viewingInvoice)}
                disabled={sharingPdf}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                title="Share PDF Invoice directly via WhatsApp"
              >
                <Share2 className="h-4 w-4" />
                <span>{sharingPdf ? "Sharing..." : "WhatsApp Share PDF"}</span>
              </button>

              {/* Download PDF Button */}
              <button
                onClick={() => handleDownloadInvoicePDF(viewingInvoice)}
                className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                title="Download Official PDF Invoice"
              >
                <Download className="h-4 w-4 text-amber-400" />
                <span>Download PDF</span>
              </button>

              {/* Print Invoice Button */}
              <button
                onClick={() => handlePrintInvoice(viewingInvoice)}
                className="gold-gradient-btn px-4 py-2 text-[#1a0004] font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 hover:scale-105 transition-all"
                title="Print Official Invoice"
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
