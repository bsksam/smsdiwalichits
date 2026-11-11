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
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to enroll customer");
      }
      setEnrollModalOpen(false);
      fetchCustomerData();
    } catch (err: any) {
      setEnrollError(err.message || "Enrollment failed");
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
    if (!reversalReason.trim() || reversalReason.trim().length < 5) {
      setReversalError("Please provide a mandatory detailed reason (at least 5 characters).");
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
        throw new Error(data.error || "Reversal failed");
      }
      setReversalModalOpen(false);
      fetchCustomerData();
    } catch (err: any) {
      setReversalError(err.message || "Failed to reverse transaction");
    } finally {
      setReversing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Customer not found.</p>
        <Link href="/customers" className="mt-3 inline-block text-xs font-bold text-brand-blue">
          ← Back to Customers
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
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                {customer.full_name}
              </h1>
              <span className="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                {customer.customer_code}
              </span>
            </div>
            <p className="text-xs text-slate-500">Registered on {formatDate(customer.registration_date)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/customers/print-card/${customer.id}`}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <Printer className="h-4 w-4 text-slate-600" />
            <span>{language === "ta" ? "பாஸ்புக் அச்சிடு" : "Print Passbook Card"}</span>
          </Link>

          <button
            onClick={handleOpenEnroll}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-900/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{language === "ta" ? "புதிய திட்டத்தில் சேர்" : "Enroll in Scheme"}</span>
          </button>
        </div>
      </div>

      {/* Customer Info Card & Nominee Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">
            {language === "ta" ? "சந்தாதாரர் தனிப்பட்ட விவரங்கள்" : "Customer Personal Details"}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Full Name</span>
              <span className="font-bold text-slate-800 text-sm">{customer.full_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Father / Husband</span>
              <span className="font-semibold text-slate-700">{customer.father_husband_name || "-"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Primary Mobile</span>
              <span className="font-semibold text-slate-800 font-mono">{customer.mobile}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Alternate Mobile</span>
              <span className="font-semibold text-slate-600 font-mono">{customer.alt_mobile || "-"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Aadhaar Ref (Last 4)</span>
              <span className="font-semibold text-slate-700 font-mono">
                {customer.aadhaar_ref ? `XXXX-XXXX-${customer.aadhaar_ref}` : "Not Provided"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Branch</span>
              <span className="font-semibold text-slate-700">{customer.branch_name || "Salem Main"}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 block font-medium mb-1">Residential Address</span>
            <p className="font-semibold text-slate-800">
              {customer.address}, {customer.city}, {customer.district} - {customer.pincode}
            </p>
          </div>
        </div>

        {/* Nominee Details Card */}
        <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-amber-900 border-b border-amber-200 pb-2 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>{language === "ta" ? "வாரிசுதாரர் விவரங்கள்" : "Nominee Details"}</span>
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Nominee Name</span>
                <span className="font-bold text-slate-800 text-sm">{customer.nominee_name || "Not Appointed"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Relationship</span>
                <span className="font-semibold text-slate-700">{customer.nominee_relation || "-"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nominee Contact</span>
                <span className="font-semibold text-slate-700 font-mono">{customer.nominee_mobile || "-"}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-200/60 text-[11px] text-amber-800 bg-amber-100/50 p-2.5 rounded-xl">
            {language === "ta"
              ? "தீபாவளி சிட் விதிமுறைகளின்படி முதிர்வின் போது பாஸ்புக் சமர்ப்பிக்கப்பட வேண்டும்."
              : "Passbook must be produced by nominee in case of unforeseen claims."}
          </div>
        </div>
      </div>

      {/* Enrolled Schemes Section */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-800">
          {language === "ta" ? "சேர்ந்துள்ள திட்டங்கள் (Enrolled Chit Schemes)" : "Enrolled Chit Schemes"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemes.map((s) => (
            <div
              key={s.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-300 transition-all space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    {language === "ta" && s.scheme_tamil_name ? s.scheme_tamil_name : s.scheme_name}
                  </h4>
                  <p className="text-xs text-slate-500">Passbook: <span className="font-mono font-bold text-amber-700">{s.passbook_number}</span></p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(s.status)}`}>
                  {s.status}
                </span>
              </div>

              {/* Progress and numbers */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Monthly Due</span>
                  <span className="font-bold text-slate-800">{formatINR(s.monthly_amount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Installments</span>
                  <span className="font-bold text-emerald-700">{s.completed_installments} / {s.total_months}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Package Value</span>
                  <span className="font-bold text-brand-blue">{formatINR(s.grocery_package_value)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span>Paid: {formatINR(s.total_paid_amount)}</span>
                  <span>Pending: {formatINR(s.total_pending_amount)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round(((s.completed_installments || 0) / (s.total_months || 12)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History Table with Reversal capability */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
              {language === "ta" ? "தவணை செலுத்திய வரலாறு & ரசீதுகள்" : "Payment Collection History & Receipts"}
            </h3>
            <p className="text-xs text-slate-500">Audited financial transactions</p>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full">
            Total Paid: {formatINR(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.total_amount), 0))}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">Receipt No</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Scheme & Installment</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                      {p.receipt_number}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {p.scheme_name} <span className="text-slate-400 font-bold">#{p.installment_number}</span>
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-600">
                      {p.payment_mode}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">
                      {formatINR(p.total_amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.status === "completed" && (
                          <button
                            onClick={() => handleOpenReverse(p)}
                            title="Reverse Transaction with Audit"
                            className="px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>{t.reverse}</span>
                          </button>
                        )}
                        {p.status === "reversed" && (
                          <span className="text-[10px] text-slate-400 italic" title={p.reversal_reason}>
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

      {/* Enroll in Scheme Modal */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-brand-blue text-white">
              <h3 className="text-sm font-bold">Enroll Customer in Scheme</h3>
              <button onClick={() => setEnrollModalOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-xs">
              {enrollError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {enrollError}
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Chit Scheme</label>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {availableSchemes.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} ({sc.tamil_name}) - {formatINR(sc.monthly_amount)}/mo (Pkg: {formatINR(sc.grocery_package_value)})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500">
                Enrolling will automatically generate the 12-month installment schedule and assign a unique passbook number.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrolling}
                  className="px-5 py-2 bg-brand-blue text-white rounded-xl font-bold shadow-md"
                >
                  {enrolling ? "Enrolling..." : "Confirm Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Reversal Modal */}
      {reversalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-rose-700 text-white">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <h3 className="text-sm font-bold">Reverse Transaction</h3>
              </div>
              <button onClick={() => setReversalModalOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleReverseSubmit} className="p-6 space-y-4 text-xs">
              {reversalError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {reversalError}
                </div>
              )}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">Receipt: {selectedPaymentToReverse?.receipt_number}</p>
                <p className="text-slate-600">Amount: {formatINR(selectedPaymentToReverse?.total_amount)}</p>
                <p className="text-slate-600">Date: {formatDate(selectedPaymentToReverse?.payment_date)}</p>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mandatory Reason for Reversal *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Accidental duplicate entry, wrong customer selected by cashier..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <p className="text-[10px] text-rose-600 font-semibold">
                Warning: Reversing will restore the installment schedule to pending, deduct the paid total, and log an immutable financial audit trail.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReversalModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversing}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-md shadow-rose-900/20"
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
