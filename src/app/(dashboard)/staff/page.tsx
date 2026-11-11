"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import {
  Building2,
  Users,
  Plus,
  ShieldCheck,
  Receipt,
  Phone,
  MapPin,
  Lock,
  User,
  X,
  AlertCircle,
  Briefcase,
} from "lucide-react";

export default function StaffPage() {
  const { t, language } = useLanguage();
  const [staff, setStaff] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"staff" | "branches">("staff");

  // Add Staff Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    mobile: "",
    role: "cashier",
    branchId: 1,
  });

  // Add Branch Modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchFormData, setBranchFormData] = useState({
    name: "",
    address: "",
    city: "Salem",
    district: "Salem",
    pincode: "636001",
    phone: "",
    email: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [sRes, bRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/branches"),
      ]);
      const sData = await sRes.json();
      const bData = await bRes.json();
      setStaff(sData.staff || []);
      setBranches(bData.branches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create staff");
      }

      setIsStaffModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to create staff");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create branch");
      }

      setIsBranchModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to create branch");
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
            {t.staff}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "பணியாளர்கள், வசூல் முகவர்கள் & கிளை அலுவலகங்கள் மேலாண்மை"
              : "Manage staff roles, collection agents, access permissions and branch locations"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "staff" ? (
            <button
              onClick={() => {
                setStaffFormData({
                  username: "",
                  password: "",
                  fullName: "",
                  mobile: "",
                  role: "cashier",
                  branchId: branches[0]?.id || 1,
                });
                setError(null);
                setIsStaffModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-900/20"
            >
              <Plus className="h-4 w-4" />
              <span>{language === "ta" ? "+ புதிய பணியாளர்" : "+ Add Staff User"}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setBranchFormData({
                  name: "",
                  address: "",
                  city: "Salem",
                  district: "Salem",
                  pincode: "636001",
                  phone: "",
                  email: "",
                });
                setError(null);
                setIsBranchModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>{language === "ta" ? "+ புதிய கிளை" : "+ Add Branch"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "staff"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Staff Accounts ({staff.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("branches")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "branches"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Branches ({branches.length})</span>
        </button>
      </div>

      {activeTab === "staff" ? (
        /* Staff Users Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-blue-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                    {u.full_name ? u.full_name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">{u.full_name}</h3>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">@{u.username}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(u.status)}`}>
                  {u.status}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                    <span>Role:</span>
                  </span>
                  <span className="font-bold text-amber-800 uppercase text-[11px] bg-amber-50 px-2 py-0.5 rounded">
                    {u.role.replace("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-brand-blue" />
                    <span>Branch:</span>
                  </span>
                  <span className="font-medium text-slate-800">{u.branch_name || "Main Branch"}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>Mobile:</span>
                  </span>
                  <span className="font-mono text-slate-800 font-semibold">{u.mobile}</span>
                </div>
              </div>

              {/* Collections stats badge */}
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <span className="text-emerald-800 font-medium">Collections:</span>
                <span className="font-extrabold text-emerald-900">
                  {formatINR(u.total_collected)} ({u.collection_count} Receipts)
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Branches Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {b.code}
                  </span>
                  <h3 className="text-base font-extrabold text-brand-blue mt-1">{b.name}</h3>
                </div>
                {b.is_main_branch ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                    HEAD OFFICE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    Branch
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600">
                {b.address}, {b.city}, {b.district} - {b.pincode}
              </p>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>Phone: <span className="font-mono text-slate-800 font-bold">{b.phone}</span></span>
                <span className="font-bold text-brand-blue">{b.customer_count || 0} Customers</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 bg-brand-blue text-white">
              <h3 className="text-base font-bold">Register Staff Account</h3>
              <button onClick={() => setIsStaffModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffFormData.fullName}
                  onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                  placeholder="e.g. K. Priya"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={staffFormData.username}
                    onChange={(e) => setStaffFormData({ ...staffFormData, username: e.target.value })}
                    placeholder="e.g. priya"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={staffFormData.password}
                    onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile *</label>
                  <input
                    type="text"
                    required
                    value={staffFormData.mobile}
                    onChange={(e) => setStaffFormData({ ...staffFormData, mobile: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="collection_agent">Collection Agent</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Branch</label>
                <select
                  value={staffFormData.branchId}
                  onChange={(e) => setStaffFormData({ ...staffFormData, branchId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold bg-brand-blue hover:bg-blue-800 text-white rounded-xl shadow-md"
                >
                  {submitting ? "Saving..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 bg-amber-600 text-white">
              <h3 className="text-base font-bold">Register New Branch</h3>
              <button onClick={() => setIsBranchModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchFormData.name}
                  onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                  placeholder="e.g. நாமக்கல் கிளை (Namakkal Branch)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={branchFormData.address}
                  onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                  placeholder="Street / Road address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.city}
                    onChange={(e) => setBranchFormData({ ...branchFormData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.phone}
                    onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md"
                >
                  {submitting ? "Saving..." : "Register Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
