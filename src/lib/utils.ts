import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency format in Indian Rupees (₹)
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Date format: DD-MM-YYYY
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateString;
  }
}

// Get Badge CSS for statuses
export function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
    case "active":
    case "completed":
    case "issued":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "partial":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "overdue":
    case "cancelled":
    case "reversed":
    case "blocked":
      return "bg-rose-100 text-rose-800 border-rose-300";
    case "advance":
      return "bg-purple-100 text-purple-800 border-purple-300";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
}
