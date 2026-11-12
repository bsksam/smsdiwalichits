"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import { getWhatsAppShareUrl } from "@/lib/whatsapp";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Share2,
  X,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function CustomersPage() {
  const { t, language } = useLanguage();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    fatherOrHusbandName: "",
    mobile: "",
    altMobile: "",
    address: "",
    city: "Salem",
    district: "Salem",
    pincode: "636001",
    aadhaarRef: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeMobile: "",
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Quick Enroll Scheme Modal State
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollCustomer, setEnrollCustomer] = useState<any>(null);
  const [availableSchemes, setAvailableSchemes] = useState<any[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      let url = `/api/customers?search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: "",
      fatherOrHusbandName: "",
      mobile: "",
      altMobile: "",
      address: "",
      city: "Salem",
      district: "Salem",
      pincode: "636001",
      aadhaarRef: "",
      nomineeName: "",
      nomineeRelation: "",
      nomineeMobile: "",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCustomer(c);
    setFormData({
      fullName: c.full_name || "",
      fatherOrHusbandName: c.father_husband_name || "",
      mobile: c.mobile || "",
      altMobile: c.alt_mobile || "",
      address: c.address || "",
      city: c.city || "Salem",
      district: c.district || "Salem",
      pincode: c.pincode || "636001",
      aadhaarRef: c.aadhaar_ref || "",
      nomineeName: c.nominee_name || "",
      nomineeRelation: c.nominee_relation || "",
      nomineeMobile: c.nominee_mobile || "",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError(null);

    try {
      const url = editingCustomer
        ? `/api/customers/${editingCustomer.id}`
        : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save customer record");
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleOpenEnroll = async (cust: any) => {
    setEnrollCustomer(cust);
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
    if (!enrollCustomer || !selectedSchemeId) return;
    setEnrolling(true);
    setEnrollError(null);

    try {
      const res = await fetch(`/api/schemes/${selectedSchemeId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: enrollCustomer.id,
          joiningAmount: 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to enroll customer in scheme");
      }

      setEnrollModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(language === "ta" ? "இந்த வாடிக்கையாளரை முடக்க விரும்புகிறீர்களா?" : "Are you sure you want to deactivate/delete this customer?")) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportToExcel = () => {
    const exportData = customers.map((c) => ({
      "Customer ID": c.customer_code,
      "Full Name": c.full_name,
      "Father/Husband": c.father_husband_name || "",
      Mobile: c.mobile,
      "Alt Mobile": c.alt_mobile || "",
      City: c.city,
      District: c.district,
      Pincode: c.pincode,
      "Active Schemes": c.active_schemes_count || 0,
      "Total Paid (₹)": c.total_paid || 0,
      Status: c.status,
      "Registration Date": formatDate(c.registration_date),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, `Diwali_Chit_Customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 font-serif tracking-wide drop-shadow flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-400" />
            <span>{t.customers}</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === "ta"
              ? "தீபாவளி சீட்டு சந்தாதாரர்கள் மேலாண்மை, பாஸ்புக் & கணக்கு விவரங்கள்"
              : "Comprehensive customer directory, scheme ledgers & digital passbooks"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-[#250005] border border-amber-500/30 hover:bg-amber-500/10 text-amber-200 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Excel Export</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 gold-gradient-btn text-[#1a0004] text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addCustomer}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 maroon-card p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-amber-400/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === "ta" ? "பெயர், மொபைல், ஐடி, திட்டம் (1500, 700), அல்லது பாஸ்புக்..." : "Search by name, mobile, ID, scheme (1500, 700), or passbook..."}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl font-bold text-amber-200"
        >
          <option value="">{language === "ta" ? "அனைத்து நிலைகளும்" : "All Statuses"}</option>
          <option value="active">Active (செயலில் உள்ளது)</option>
          <option value="blocked">Blocked / Inactive</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="maroon-card rounded-3xl overflow-hidden shadow-xl border border-amber-500/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-[#240005]">
            <thead className="bg-[#380109] text-amber-300 font-serif border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Name & Father/Husband</th>
                <th className="py-3 px-4">Mobile Numbers</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Enrolled Schemes & Passbooks</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-amber-300/60 font-serif">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-amber-300/60 font-serif">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-500/5 transition-colors text-amber-100">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      <Link href={`/customers/${c.id}`} className="hover:underline">
                        {c.customer_code}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/customers/${c.id}`} className="font-bold text-amber-100 hover:text-amber-300 transition-colors">
                        {c.full_name}
                      </Link>
                      {c.father_husband_name && (
                        <div className="text-[11px] text-amber-300/70">
                          c/o {c.father_husband_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-amber-300 font-mono">{c.mobile}</div>
                      {c.alt_mobile && (
                        <div className="text-[10px] text-amber-400/60 font-mono">{c.alt_mobile}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-amber-200/80">
                      <div>{c.city}</div>
                      <div className="text-[10px] text-amber-400/60">{c.district} - {c.pincode}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {c.enrolled_schemes && c.enrolled_schemes.length > 0 ? (
                        <div className="flex flex-col items-center gap-1.5">
                          {c.enrolled_schemes.map((es: any) => (
                            <Link
                              key={es.member_id}
                              href={`/customers/${c.id}`}
                              title={`${es.scheme_name} (${es.passbook_number}) - Click to open ledger`}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/20 hover:bg-amber-400 hover:text-[#1a0004] text-amber-200 border border-amber-500/35 transition-colors"
                            >
                              <span className="font-bold text-amber-300">{formatINR(es.monthly_amount)}</span>
                              <span className="font-mono text-[9px] bg-black/40 px-1 py-0.2 rounded text-amber-300 font-bold">{es.passbook_number}</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-300/40 italic">Not Enrolled</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-300">
                      {formatINR(c.total_paid)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Quick Enroll Scheme Button */}
                        <button
                          onClick={() => handleOpenEnroll(c)}
                          title={language === "ta" ? "திட்டத்தில் சேர்க்க" : "Enroll in Scheme"}
                          className="px-2.5 py-1 rounded-lg text-amber-200 hover:text-[#1a0004] hover:bg-amber-400 bg-amber-500/20 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1 transition-all"
                        >
                          <Plus className="h-3 w-3 text-amber-400" />
                          <span>{language === "ta" ? "திட்டம்" : "+ Scheme"}</span>
                        </button>

                        <Link
                          href={`/customers/${c.id}`}
                          title="View Ledger & Passbook"
                          className="p-1.5 rounded-lg text-amber-300 hover:text-amber-100 hover:bg-amber-500/15 border border-amber-500/20"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/customers/print-card/${c.id}`}
                          title="Print Member Card / Passbook"
                          className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-500/15 border border-amber-500/20"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Delete / Block"
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Enroll Scheme Modal */}
      {enrollModalOpen && enrollCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md erp-modal-box overflow-hidden shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  {language === "ta" ? "சந்தாதாரரை திட்டத்தில் சேர்க்கவும்" : "Enroll Customer in Chit Scheme"}
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

              <div className="p-3 bg-[#180003] rounded-xl border border-amber-500/30 space-y-1">
                <span className="text-[10px] text-amber-400/70 font-serif uppercase tracking-wider block">Customer Selected:</span>
                <p className="font-bold text-amber-100 text-sm">{enrollCustomer.full_name}</p>
                <p className="text-[11px] font-mono text-amber-300">{enrollCustomer.customer_code} • {enrollCustomer.mobile}</p>
              </div>

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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl erp-modal-box overflow-hidden my-8 shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#3e010b] via-[#4d0210] to-[#2b0006] text-amber-200 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold font-serif tracking-wide">
                  {editingCustomer
                    ? (language === "ta" ? "வாடிக்கையாளர் திருத்தம்" : "Edit Customer Details")
                    : (language === "ta" ? "புதிய வாடிக்கையாளர் பதிவு" : "Register New Customer")}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-amber-400/80 hover:bg-amber-500/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 bg-[#240005]">
              {modalError && (
                <div className="flex items-center gap-2 p-3 text-xs bg-rose-950/80 text-rose-300 rounded-xl border border-rose-500/40">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    முழுப் பெயர் (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. S. Murugesan"
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    தந்தை / கணவர் பெயர் (Father / Husband)
                  </label>
                  <input
                    type="text"
                    value={formData.fatherOrHusbandName}
                    onChange={(e) => setFormData({ ...formData, fatherOrHusbandName: e.target.value })}
                    placeholder="e.g. Subramanian"
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    கைபேசி எண் (Mobile Number) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    கூடுதல் மொபைல் (Alternate Mobile)
                  </label>
                  <input
                    type="text"
                    value={formData.altMobile}
                    onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                    placeholder="Optional second number"
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    முகவரி (Door No, Street Address) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 15/2, Gandhi Road, Suramangalam"
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 placeholder-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    ஊர் / நகரம் (City)
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    மாவட்டம் (District) & அஞ்சல் குறியீடு (Pincode)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Salem"
                      className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                    />
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="636001"
                      className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    ஆதார் எண் (Aadhaar Reference - Last 4 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.aadhaarRef}
                    onChange={(e) => setFormData({ ...formData, aadhaarRef: e.target.value })}
                    placeholder="e.g. 8892"
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    வாரிசுதாரர் பெயர் (Nominee Name)
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeName}
                    onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                    placeholder="Nominee full name"
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    வாரிசுதாரர் உறவுமுறை (Nominee Relationship)
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeRelation}
                    onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                    placeholder="Wife / Son / Daughter"
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 font-serif">
                    வாரிசுதாரர் மொபைல் (Nominee Mobile)
                  </label>
                  <input
                    type="text"
                    value={formData.nomineeMobile}
                    onChange={(e) => setFormData({ ...formData, nomineeMobile: e.target.value })}
                    placeholder="Nominee contact"
                    className="w-full px-3 py-2 text-xs bg-[#180003] border border-amber-500/40 rounded-xl text-amber-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-amber-300/80 hover:bg-amber-500/10 rounded-xl border border-amber-500/20 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="gold-gradient-btn px-5 py-2 text-xs font-black text-[#1a0004] rounded-xl shadow-md transition-all"
                >
                  {modalSubmitting ? "Saving..." : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
