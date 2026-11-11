"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import { getWhatsAppShareUrl, generateDueReminderWhatsAppMessage } from "@/lib/whatsapp";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ShieldAlert,
  ArrowLeft,
  Printer,
  Share2,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Gift,
  X,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const { t, language } = useLanguage();

  const [customer, setCustomer] = useState<any>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reversal Modal
  const [reversalModalOpen, setReversalModalOpen] = useState(false);
  const [selectedPaymentToReverse, setSelectedPaymentToReverse] = useState<any>(null);
  const [reversalReason, setReversalReason] = useState("");
  const [reversing, setReversing] = useState(false);
  const [reversalError, setReversalError] = useState<string | null>(null);

  // Enroll Scheme Modal
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [availableSchemes, setAvailableSchemes] = useState<any[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const data = await res.json();
      if (res.ok) {
        setCustomer(data.customer);
        setSchemes(data.schemes || []);
        setPayments(data.payments || []);
        setInstallments(data.installments || []);
        setRedemptions(data.redemptions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const handleOpenEnroll = async () => {
    setEnrollError(null);
    try {
      const res = await fetch("/api/schemes");
      const data = await res.json();
      setAvailableSchemes(data.schemes || []);
      if (data.schemes && data.schemes.length > 0) {
        setSelectedSchemeId(String(data.schemes[0].id));
      }
      setEnrollModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeId) return;
    setEnrolling(true);
    setEnrollError(null);

    try {
      const res = await fetch(`/api/schemes/${selectedSchemeId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          joiningAmount: 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to enroll customer in scheme");
      }

      setEnrollModalOpen(false);
      fetchCustomerData();
    } catch (err: any) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleOpenReverse = (payment: any) => {
    setSelectedPaymentToReverse(payment);
    setReversalReason("");
    setReversalError(null);
    setReversalModalOpen(true);
  };

  const handleReverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentToReverse) return;
    if (!reversalReason.trim()) {
      setReversalError("A mandatory explanation is required for reversing this financial payment.");
      return;
    }

    setReversing(true);
    setReversalError(null);

    try {
      const res = await fetch("/api/payments/reverse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedPaymentToReverse.id,
          reason: reversalReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reverse transaction");
      }

      setReversalModalOpen(false);
      fetchCustomerData();
    } catch (err: any) {
      setReversalError(err.message);
    } finally {
      setReversing(false);
    }
  };

  const handleWhatsAppReminder = (scheme: any) => {
    const text = generateDueReminderWhatsAppMessage({
      customerName: customer.full_name,
      schemeName: scheme.scheme_name,
      installmentNumber: (scheme.completed_installments || 0) + 1,
      amount: scheme.monthly_amount,
      dueDate: "5th of this month",
      shopName: "SRI LAKSHMI SUPERMARKET",
      shopPhone: "+91 98765 43210",
    });
    const url = getWhatsAppShareUrl(customer.mobile, text);
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <span className="text-xs font-bold text-amber-300">Loading Customer Profile...</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="maroon-card p-8 rounded-3xl text-center space-y-4">
        <p className="text-sm font-bold text-amber-200">Customer record not found.</p>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 gold-gradient-btn text-xs font-bold px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2.5 rounded-xl border border-amber-500/30 bg-[#250005] hover:bg-amber-500/10 text-amber-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
                {customer.full_name}
              </h1>
              <span className="font-mono text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                {customer.customer_code}
              </span>
            </div>
            <p className="text-xs text-amber-200/70 mt-0.5">Registered on {formatDate(customer.registration_date)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/customers/print-card/${customer.id}`}
            className="flex items-center gap-2 bg-[#250005] border border-amber-500/30 hover:bg-amber-500/10 text-amber-200 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>{language === "ta" ? "பாஸ்புக் அச்சிடு" : "Print Passbook Card"}</span>
          </Link>

          <button
            onClick={handleOpenEnroll}
            className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{language === "ta" ? "புதிய திட்டத்தில் சேர்" : "Enroll in Scheme"}</span>
          </button>
        </div>
      </div>

      {/* Customer Info Card & Nominee Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 maroon-card rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-amber-300 font-serif border-b border-amber-500/20 pb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-amber-400" />
            <span>{language === "ta" ? "சந்தாதாரர் தனிப்பட்ட விவரங்கள்" : "Customer Personal Details"}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-amber-400/70 block font-semibold">Full Name</span>
              <span className="font-bold text-amber-100 text-sm">{customer.full_name}</span>
            </div>
            <div>
              <span className="text-amber-400/70 block font-semibold">Father / Husband</span>
              <span className="font-semibold text-amber-200">{customer.father_husband_name || "-"}</span>
            </div>
            <div>
              <span className="text-amber-400/70 block font-semibold">Primary Mobile</span>
              <span className="font-bold text-amber-300 font-mono">{customer.mobile}</span>
            </div>
            <div>
              <span className="text-amber-400/70 block font-semibold">Alternate Mobile</span>
              <span className="font-semibold text-amber-200 font-mono">{customer.alt_mobile || "-"}</span>
            </div>
            <div>
              <span className="text-amber-400/70 block font-semibold">Aadhaar Ref (Last 4)</span>
              <span className="font-semibold text-amber-200 font-mono">
                {customer.aadhaar_ref ? `XXXX-XXXX-${customer.aadhaar_ref}` : "Not Provided"}
              </span>
            </div>
            <div>
              <span className="text-amber-400/70 block font-semibold">Branch</span>
              <span className="font-semibold text-amber-200">{customer.branch_name || "Salem Main"}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-500/20 text-xs">
            <span className="text-amber-400/70 block font-semibold mb-1">Residential Address</span>
            <p className="font-medium text-amber-100">
              {customer.address}, {customer.city}, {customer.district} - {customer.pincode}
            </p>
          </div>
        </div>

        {/* Nominee Details Card */}
        <div className="maroon-card rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-amber-300 font-serif border-b border-amber-500/20 pb-3 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>{language === "ta" ? "வாரிசுதாரர் விவரங்கள்" : "Nominee Details"}</span>
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-amber-400/70 block">Nominee Name</span>
                <span className="font-bold text-amber-100 text-sm">{customer.nominee_name || "Not Appointed"}</span>
              </div>
              <div>
                <span className="text-amber-400/70 block">Relationship</span>
                <span className="font-semibold text-amber-200">{customer.nominee_relation || "-"}</span>
              </div>
              <div>
                <span className="text-amber-400/70 block">Nominee Contact</span>
                <span className="font-semibold text-amber-300 font-mono">{customer.nominee_mobile || "-"}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-amber-500/20 text-[11px] text-amber-300/80 bg-[#200004]/70 p-3 rounded-xl border border-amber-500/20">
            {language === "ta"
              ? "தீபாவளி சிட் விதிமுறைகளின்படி முதிர்வின் போது பாஸ்புக் சமர்ப்பிக்கப்பட வேண்டும்."
              : "Passbook must be produced by nominee in case of unforeseen claims."}
          </div>
        </div>
      </div>

      {/* Enrolled Schemes Section */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-amber-300 font-serif">
          {language === "ta" ? "சேர்ந்துள்ள திட்டங்கள் (Enrolled Chit Schemes)" : "Enrolled Chit Schemes"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemes.map((s) => (
            <div
              key={s.id}
              className="maroon-card rounded-3xl p-5 shadow-lg space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-sm text-amber-200 font-serif">
                    {language === "ta" && s.scheme_tamil_name ? s.scheme_tamil_name : s.scheme_name}
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    Passbook: <span className="font-mono font-bold text-amber-400">{s.passbook_number}</span>
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(s.status)}`}>
                  {s.status}
                </span>
              </div>

              {/* Progress and numbers */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#1e0004] rounded-2xl text-center text-xs border border-amber-500/20">
                <div>
                  <span className="text-[10px] text-amber-400/70 block">Monthly Due</span>
                  <span className="font-bold text-amber-100">{formatINR(s.monthly_amount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-400/70 block">Installments</span>
                  <span className="font-bold text-amber-300">{s.completed_installments} / {s.total_months}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-400/70 block">Package Value</span>
                  <span className="font-bold text-amber-400">{formatINR(s.grocery_package_value)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-amber-300/80 mb-1">
                  <span>Paid: {formatINR(s.total_paid_amount)}</span>
                  <span>Pending: {formatINR(s.total_pending_amount)}</span>
                </div>
                <div className="w-full bg-[#180003] h-2.5 rounded-full overflow-hidden border border-amber-500/20">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round(((s.completed_installments || 0) / (s.total_months || 12)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleWhatsAppReminder(s)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Share2 className="h-3 w-3" />
                  <span>Send WhatsApp Due Alert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History Table with Reversal capability */}
      <div className="maroon-card rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-sm sm:text-base text-amber-300 font-serif">
              {language === "ta" ? "தவணை செலுத்திய வரலாறு & ரசீதுகள்" : "Payment Collection History & Receipts"}
            </h3>
            <p className="text-xs text-amber-200/60">Audited financial transactions</p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full w-fit">
            Total Paid: {formatINR(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.total_amount), 0))}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-amber-500/20">
          <table className="w-full text-left text-xs bg-[#240005]">
            <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-3">Receipt No</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Scheme & Installment</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-amber-300/60">
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {p.receipt_number}
                    </td>
                    <td className="py-3 px-3 text-amber-200/80">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="py-3 px-3 text-amber-100 font-medium">
                      {p.scheme_name} <span className="text-amber-400 font-bold">#{p.installment_number}</span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-amber-300">
                      {p.payment_mode}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-amber-300">
                      {formatINR(p.total_amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.status === "completed" && (
                          <button
                            onClick={() => handleOpenReverse(p)}
                            title="Reverse Transaction with Audit"
                            className="px-2.5 py-1 text-[10px] font-bold text-rose-300 hover:bg-rose-950/80 rounded-lg border border-rose-500/40 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>{t.reverse}</span>
                          </button>
                        )}
                        {p.status === "reversed" && (
                          <span className="text-[10px] text-amber-300/50 italic" title={p.reversal_reason}>
                            Reversed ({p.reversal_reason?.slice(0, 15)}...)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll in Scheme Modal (Styled in Photo 2 Deep Maroon & Gold) */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  {language === "ta" ? "புதிய திட்டத்தில் சேர்க்கவும்" : "Enroll Customer in Scheme"}
                </h3>
              </div>
              <button
                onClick={() => setEnrollModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {enrollError && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {enrollError}
                </div>
              )}
              <div>
                <label className="block font-bold text-amber-300 mb-2 font-serif text-xs">
                  {language === "ta" ? "சீட்டு திட்டத்தை தேர்ந்தெடுக்கவும் *" : "Select Chit Scheme *"}
                </label>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200 text-xs focus:ring-2 focus:ring-amber-400"
                >
                  {availableSchemes.map((sc) => (
                    <option key={sc.id} value={sc.id} className="bg-[#240005] text-amber-200 py-1.5">
                      {sc.name} ({sc.tamil_name}) - {formatINR(sc.monthly_amount)}/mo (Pkg: {formatINR(sc.grocery_package_value)})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-amber-200/70 bg-[#1a0003] p-3 rounded-xl border border-amber-500/20">
                Enrolling will automatically generate the 12-month installment schedule and assign a unique passbook number.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-4 py-2 text-amber-300/80 hover:bg-amber-500/10 rounded-xl font-semibold border border-amber-500/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrolling}
                  className="gold-gradient-btn px-5 py-2 rounded-xl font-black text-[#1a0004] shadow-md transition-all"
                >
                  {enrolling ? "Enrolling..." : "Confirm Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Reversal Modal (Styled in Photo 2 Deep Maroon & Gold) */}
      {reversalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-rose-500/50">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#4d0210] to-[#2b0006] text-amber-200 border-b border-rose-500/40">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-bold font-serif">Reverse Transaction</h3>
              </div>
              <button
                onClick={() => setReversalModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleReverseSubmit} className="p-6 space-y-4 text-xs bg-[#240005]">
              {reversalError && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {reversalError}
                </div>
              )}
              <div className="p-3 bg-[#180003] rounded-xl border border-amber-500/20 space-y-1 text-xs">
                <p className="font-bold text-amber-200">Receipt: {selectedPaymentToReverse?.receipt_number}</p>
                <p className="text-amber-300/80">Amount: {formatINR(selectedPaymentToReverse?.total_amount)}</p>
                <p className="text-amber-300/80">Date: {formatDate(selectedPaymentToReverse?.payment_date)}</p>
              </div>
              <div>
                <label className="block font-bold text-amber-300 mb-1 font-serif">
                  Mandatory Reason for Reversal *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Accidental duplicate entry, wrong customer selected by cashier..."
                  className="w-full px-3 py-2 bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <p className="text-[10px] text-rose-400 font-semibold bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20">
                Warning: Reversing will restore the installment schedule to pending, deduct the paid total, and log an immutable financial audit trail.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setReversalModalOpen(false)}
                  className="px-4 py-2 text-amber-300/80 hover:bg-amber-500/10 rounded-xl font-semibold border border-amber-500/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversing}
                  className="px-5 py-2 bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-white rounded-xl font-bold shadow-md shadow-rose-950/50"
                >
                  {reversing ? "Reversing..." : "Confirm Reversal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
