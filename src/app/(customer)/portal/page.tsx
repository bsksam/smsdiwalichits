"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import { getWhatsAppShareUrl } from "@/lib/whatsapp";
import {
  Sparkles,
  BookOpen,
  Plus,
  Printer,
  CheckCircle2,
  Calendar,
  Gift,
  Phone,
  Share2,
  LogOut,
  User,
  ShieldCheck,
  Receipt,
  ArrowRight,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import Link from "next/link";

export default function CustomerPortalPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [enrolledSchemes, setEnrolledSchemes] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [availableSchemes, setAvailableSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active scheme passbook selection
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);

  // Join Scheme Modal
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedSchemeToJoin, setSelectedSchemeToJoin] = useState<any>(null);
  const [joining, setJoining] = useState(false);
  const [joinSuccessMsg, setJoinSuccessMsg] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    try {
      const res = await fetch("/api/customer/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setCustomer(data.customer);
        const enrolled = data.enrolledSchemes || [];
        setEnrolledSchemes(enrolled);
        setInstallments(data.installments || []);
        setPayments(data.payments || []);
        setAvailableSchemes(data.availableSchemes || []);

        if (enrolled.length > 0 && selectedSchemeId === null) {
          setSelectedSchemeId(enrolled[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/customer/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenJoinModal = (scheme: any) => {
    setSelectedSchemeToJoin(scheme);
    setJoinError(null);
    setJoinSuccessMsg(null);
    setJoinModalOpen(true);
  };

  const handleConfirmJoin = async () => {
    if (!selectedSchemeToJoin) return;
    setJoining(true);
    setJoinError(null);

    try {
      const res = await fetch("/api/customer/join-scheme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeId: selectedSchemeToJoin.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join scheme");
      }

      setJoinSuccessMsg(data.message || "Enrolled successfully!");
      fetchCustomerData();
      setTimeout(() => {
        setJoinModalOpen(false);
        setJoinSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setJoinError(err.message || "Failed to enroll in scheme");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#240005] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <span className="text-xs font-bold text-amber-300">Loading Your Diwali Chit Passbook...</span>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const activeScheme = enrolledSchemes.find((s) => s.id === selectedSchemeId) || enrolledSchemes[0];
  const activeInstallments = activeScheme
    ? installments.filter((i) => i.member_id === activeScheme.id)
    : [];

  return (
    <div className="min-h-screen bg-[#220005] text-amber-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#350109]/95 backdrop-blur-md border-b border-amber-500/30 px-4 sm:px-8 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-amber-400 flex items-center justify-center shadow-md">
              <img src="/logo.png" alt="smstreat Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-amber-300 font-serif tracking-wide leading-tight">
                DIWALI CHIT
              </h1>
              <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                Customer Self-Service Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-amber-100">{customer.full_name}</span>
              <span className="text-[10px] text-amber-400 font-mono">{customer.customer_code} • {customer.mobile}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold transition-all shadow-sm"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Customer Welcome Banner */}
        <div className="maroon-card rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-amber-500/35">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-2">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Supermarket Savings Chit Fund</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-amber-300 font-serif">
                வணக்கம், {customer.full_name}!
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-xl">
                Track your monthly installments, view digital passbooks, and check your eligible Diwali festival grocery hampers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="tel:9876543210"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/40 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 text-xs font-bold transition-all"
              >
                <Phone className="h-4 w-4" />
                <span>Call Store Help</span>
              </a>

              <a
                href={getWhatsAppShareUrl("9876543210", `Hello Sri Lakshmi Supermarket, I am ${customer.full_name} (${customer.customer_code}). I would like to inquire about my Diwali Chit balance.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span>WhatsApp Store</span>
              </a>
            </div>
          </div>
        </div>

        {/* Section 1: Enrolled Schemes & Passbooks */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-amber-300 font-serif flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-400" />
                <span>எனது சேமிப்புத் திட்டங்கள் (My Enrolled Schemes)</span>
              </h3>
              <p className="text-xs text-amber-200/70">
                You have joined {enrolledSchemes.length} chit scheme(s). Select a scheme to view its 12-month passbook ledger.
              </p>
            </div>
          </div>

          {enrolledSchemes.length === 0 ? (
            <div className="maroon-card rounded-3xl p-8 text-center space-y-4 border border-amber-500/30">
              <Gift className="h-10 w-10 text-amber-400 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-amber-200 font-serif">You have not joined any scheme yet!</h4>
                <p className="text-xs text-amber-300/70 mt-1">
                  Choose from our attractive Diwali grocery chit schemes below and enroll instantly with a digital passbook.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enrolled Scheme Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledSchemes.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSchemeId(s.id)}
                    className={`maroon-card rounded-3xl p-5 shadow-xl cursor-pointer transition-all border flex flex-col justify-between space-y-4 ${
                      selectedSchemeId === s.id
                        ? "border-amber-400 ring-2 ring-amber-400/30 bg-[#350008]"
                        : "border-amber-500/25 hover:border-amber-500/50 bg-[#250005]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-xs font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded">
                            {s.passbook_number}
                          </span>
                          <h4 className="font-black text-base text-amber-100 font-serif mt-1.5">
                            {s.scheme_tamil_name || s.scheme_name}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-3 bg-[#180003] rounded-2xl text-center text-xs border border-amber-500/20 mt-3">
                        <div>
                          <span className="text-[10px] text-amber-400/70 block">Monthly</span>
                          <span className="font-bold text-amber-200 text-sm">{formatINR(s.monthly_amount)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-400/70 block">Installments</span>
                          <span className="font-bold text-amber-300 text-sm">{s.completed_installments}/12</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-400/70 block">Hamper</span>
                          <span className="font-bold text-amber-400 text-sm font-serif">{formatINR(s.grocery_package_value)}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-semibold text-amber-300/80 mb-1">
                          <span>Paid: {formatINR(s.total_paid_amount)}</span>
                          <span>Pending: {formatINR(s.total_pending_amount)}</span>
                        </div>
                        <div className="w-full bg-[#180003] h-2 rounded-full overflow-hidden border border-amber-500/20">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.round(((s.completed_installments || 0) / 12) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-amber-500/20 text-xs">
                      <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{selectedSchemeId === s.id ? "Viewing Ledger" : "Click to View"}</span>
                      </span>

                      <Link
                        href={`/customers/print-card/${customer.id}?memberId=${s.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="text-amber-400 hover:text-amber-200 font-bold flex items-center gap-1 text-[11px]"
                      >
                        <Printer className="h-3 w-3" />
                        <span>Print Passbook</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dedicated 12-Month Installment Ledger for Selected Scheme */}
              {activeScheme && (
                <div className="maroon-card rounded-3xl p-6 shadow-2xl border border-amber-500/35 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                    <div>
                      <h4 className="text-base font-black text-amber-300 font-serif">
                        தவணை அட்டவணை & ரசீதுகள் (12 Months Payment Ledger)
                      </h4>
                      <p className="text-xs text-amber-200/70">
                        Scheme: <span className="font-bold text-amber-200">{activeScheme.scheme_name}</span> • Passbook: <span className="font-mono font-bold text-amber-400">{activeScheme.passbook_number}</span>
                      </p>
                    </div>

                    <Link
                      href={`/customers/print-card/${customer.id}?memberId=${activeScheme.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 gold-gradient-btn text-[#1a0004] px-4 py-2 rounded-xl text-xs font-black shadow-md"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Passbook Card (A4)</span>
                    </Link>
                  </div>

                  {/* 12-Month Table */}
                  <div className="overflow-x-auto rounded-2xl border border-amber-500/20">
                    <table className="w-full text-left text-xs bg-[#240005]">
                      <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
                        <tr>
                          <th className="py-3 px-4 text-center">Month #</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4 text-right">Installment Amount</th>
                          <th className="py-3 px-4 text-right">Paid Amount</th>
                          <th className="py-3 px-4">Paid Date</th>
                          <th className="py-3 px-4">Receipt #</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/10">
                        {activeInstallments.map((inst) => {
                          const isPaid = inst.status === "paid";
                          return (
                            <tr key={inst.id} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                              <td className="py-3 px-4 text-center font-bold font-mono text-amber-400">
                                Month {inst.installment_number}
                              </td>
                              <td className="py-3 px-4 text-amber-200/90 font-mono">
                                {formatDate(inst.due_date)}
                              </td>
                              <td className="py-3 px-4 text-right font-black text-amber-200">
                                {formatINR(inst.amount)}
                              </td>
                              <td className="py-3 px-4 text-right font-black text-emerald-400">
                                {inst.paid_amount > 0 ? formatINR(inst.paid_amount) : "-"}
                              </td>
                              <td className="py-3 px-4 text-amber-200/80">
                                {inst.paid_date ? formatDate(inst.paid_date) : "-"}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-amber-400">
                                {inst.receipt_number || "-"}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(inst.status)}`}>
                                  {inst.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Available Chit Schemes to Join */}
        <div className="space-y-4 pt-4 border-t border-amber-500/20">
          <div>
            <h3 className="text-lg font-black text-amber-300 font-serif flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>புதிய திட்டத்தில் சேர (Join a New Chit Scheme)</span>
            </h3>
            <p className="text-xs text-amber-200/70">
              Select any of our festival savings schemes below to enroll instantly and obtain your digital passbook.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSchemes.map((sc) => (
              <div
                key={sc.id}
                className="maroon-card rounded-3xl p-6 shadow-2xl border border-amber-500/30 flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase mb-2">
                    {sc.scheme_code}
                  </div>
                  <h4 className="text-lg font-black text-amber-200 font-serif">
                    {sc.name}
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-0.5">{sc.tamil_name}</p>

                  <div className="mt-4 p-4 bg-[#180003] rounded-2xl border border-amber-500/20 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400/70">Monthly Installment:</span>
                      <span className="text-base font-black text-amber-300 font-mono">{formatINR(sc.monthly_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400/70">Duration:</span>
                      <span className="font-bold text-amber-100">{sc.total_months} Months</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400/70">Total Savings:</span>
                      <span className="font-bold text-amber-100">{formatINR(sc.monthly_amount * sc.total_months)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-amber-500/20 font-black text-amber-300">
                      <span>Diwali Hamper Value:</span>
                      <span className="text-base text-amber-400 font-serif">{formatINR(sc.grocery_package_value)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenJoinModal(sc)}
                  className="w-full gold-gradient-btn text-[#1a0004] py-3 rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>இந்த திட்டத்தில் சேர (Join This Scheme)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Join Scheme Confirmation Modal */}
      {joinModalOpen && selectedSchemeToJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  Confirm Scheme Enrollment
                </h3>
              </div>
              <button
                onClick={() => setJoinModalOpen(false)}
                className="text-amber-400/80 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs bg-[#240005]">
              {joinError && (
                <div className="p-3 bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  {joinError}
                </div>
              )}
              {joinSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 text-emerald-300 rounded-xl border border-emerald-500/40 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{joinSuccessMsg}</span>
                </div>
              )}

              <div className="p-4 bg-[#180003] rounded-2xl border border-amber-500/30 space-y-2">
                <span className="text-[10px] text-amber-400/70 font-serif uppercase tracking-wider block">Selected Scheme:</span>
                <p className="font-bold text-amber-100 text-sm">{selectedSchemeToJoin.name}</p>
                <p className="text-amber-300/80">{selectedSchemeToJoin.tamil_name}</p>
                <div className="pt-2 border-t border-amber-500/20 text-xs flex justify-between font-bold">
                  <span>Monthly Installment:</span>
                  <span className="text-amber-400 font-mono">{formatINR(selectedSchemeToJoin.monthly_amount)}/mo</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Diwali Hamper Value:</span>
                  <span className="text-amber-400 font-serif">{formatINR(selectedSchemeToJoin.grocery_package_value)}</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-200/70 bg-[#1e0004] p-3 rounded-xl border border-amber-500/20">
                Joining will instantly allocate your unique Passbook Number and generate your 12-month installment schedule. You can pay your installments directly at our supermarket counter or via UPI.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="px-4 py-2 font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmJoin}
                  disabled={joining}
                  className="gold-gradient-btn px-5 py-2 font-black text-[#1a0004] rounded-xl shadow-md transition-all"
                >
                  {joining ? "Enrolling..." : "Confirm & Get Passbook"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-amber-500/20 text-center text-xs text-amber-300/60 bg-[#1a0003]">
        <p className="font-bold text-amber-300">ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட் • SRI LAKSHMI SUPERMARKET</p>
        <p className="text-[11px] mt-1">124, Bazaar Main Road, Salem - 636001 | Customer Helpline: +91 98765 43210</p>
      </footer>
    </div>
  );
}
