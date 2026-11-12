import { jsPDF } from "jspdf";
import { formatINR, formatDate } from "@/lib/utils";
import { getWhatsAppShareUrl } from "@/lib/whatsapp";

export interface ShopDetails {
  shop_name?: string;
  shop_address?: string;
  shop_phone?: string;
  shop_gst?: string;
}

const DEFAULT_SHOP: ShopDetails = {
  shop_name: "SRI LAKSHMI SUPERMARKET",
  shop_address: "2a PP NAGAR MADURAI, MADURAI - 625016, Tamil Nadu",
  shop_phone: "+91 96009 01937 / +91 91502 80795",
  shop_gst: "33bsops67891zq",
};

/**
 * Generate a professional Diwali Grocery Redemption Invoice PDF
 */
export function generateRedemptionInvoicePDF(redemption: any, shop?: ShopDetails): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
  });

  const s = { ...DEFAULT_SHOP, ...shop };
  const pageWidth = doc.internal.pageSize.getWidth();

  // Background decoration / Border
  doc.setDrawColor(180, 83, 9); // amber-700
  doc.setLineWidth(0.8);
  doc.roundedRect(6, 6, pageWidth - 12, doc.internal.pageSize.getHeight() - 12, 3, 3, "S");

  // Header banner
  doc.setFillColor(62, 1, 11); // Deep Maroon #3e010b
  doc.roundedRect(7, 7, pageWidth - 14, 28, 2, 2, "F");

  doc.setTextColor(245, 158, 11); // Gold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DIWALI GROCERY REDEMPTION INVOICE", pageWidth / 2, 13, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  const shopTitle = s.shop_name?.split("(")[0]?.trim() || "SRI LAKSHMI SUPERMARKET";
  doc.text(shopTitle, pageWidth / 2, 19, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(254, 240, 138); // light amber
  const addressText = s.shop_address || "";
  doc.text(addressText, pageWidth / 2, 25, { align: "center" });

  const phoneText = `Phone: ${s.shop_phone || ""}${s.shop_gst ? " | GSTIN: " + s.shop_gst : ""}`;
  doc.text(phoneText, pageWidth / 2, 29, { align: "center" });

  // Invoice Details Table
  let y = 42;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 250, 250);
  doc.rect(10, y, pageWidth - 20, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 10, 20);
  doc.text("INVOICE PARTICULARS", 13, y + 5.5);

  y += 12;
  const rows = [
    ["Invoice No:", redemption.redemption_number || "RED-2026-0001"],
    ["Date & Time:", redemption.created_at ? formatDate(redemption.created_at) : formatDate(new Date().toISOString())],
    ["Customer Name:", redemption.customer_name || "-"],
    ["Customer Mobile:", redemption.customer_mobile || "-"],
    ["Scheme Enrolled:", `${redemption.scheme_name || "-"} (${redemption.passbook_number || "-"})`],
    ["Total Scheme Amount:", formatINR(redemption.target_amount || redemption.total_paid_amount || 0)],
    ["Redeemed Package:", redemption.package_tamil_name || redemption.package_name || "Diwali Grocery Hamper"],
  ];

  doc.setFontSize(9);
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, 13, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(10, 10, 10);
    doc.text(String(value), 55, y);

    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.2);
    doc.line(10, y + 2, pageWidth - 10, y + 2);

    y += 7;
  });

  // Package Value Box
  y += 3;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.roundedRect(10, y, pageWidth - 20, 14, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(120, 20, 30);
  doc.text("TOTAL GROCERY PACKAGE VALUE:", 15, y + 9);

  doc.setFontSize(12);
  doc.setTextColor(180, 83, 9);
  doc.text(formatINR(redemption.total_package_value || 0), pageWidth - 15, y + 9, { align: "right" });

  // Signature Block
  y += 28;
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(15, y, 55, y);
  doc.line(pageWidth - 55, y, pageWidth - 15, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Customer Signature / ஒப்புகை", 35, y + 4, { align: "center" });
  doc.text("Authorized Supermarket Seal", pageWidth - 35, y + 4, { align: "center" });

  // Footer notes
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text("தீபாவளி மளிகை சிட் சேமிப்பில் இணைந்தமைக்கு மனமார்ந்த நன்றி! • Computer Generated Invoice", pageWidth / 2, footerY, { align: "center" });

  return doc;
}

/**
 * Generate a professional Thermal / Official Payment Receipt PDF (80mm width)
 */
export function generatePaymentReceiptPDF(payment: any, shop?: ShopDetails): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 160], // Standard 80mm thermal receipt format
  });

  const s = { ...DEFAULT_SHOP, ...shop };
  const pageWidth = 80;

  // Header
  doc.setFillColor(62, 1, 11);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const shopTitle = s.shop_name?.split("(")[0]?.trim() || "SRI LAKSHMI SUPERMARKET";
  doc.text(shopTitle, pageWidth / 2, 7, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(254, 240, 138);
  doc.text(s.shop_address || "", pageWidth / 2, 12, { align: "center" });
  doc.text(`Phone: ${s.shop_phone || ""}${s.shop_gst ? " | GST: " + s.shop_gst : ""}`, pageWidth / 2, 16, { align: "center" });

  doc.setTextColor(245, 158, 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("DIWALI CHIT FUND OFFICIAL RECEIPT", pageWidth / 2, 20, { align: "center" });

  // Receipt Details
  let y = 28;
  doc.setFontSize(7);
  const details = [
    ["Receipt Number:", payment.receipt_number || "REC-2026-0001"],
    ["Date & Time:", payment.payment_date ? formatDate(payment.payment_date) : formatDate(new Date().toISOString())],
    ["Customer Name:", payment.customer_name || "-"],
    ["Customer Mobile:", payment.customer_mobile || "-"],
    ["Scheme Name:", payment.scheme_name || "-"],
    ["Installment #:", `#${payment.installment_number || 1}`],
    ["Payment Mode:", (payment.payment_mode || "CASH").toUpperCase()],
  ];

  details.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(k, 6, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(String(v), pageWidth - 6, y, { align: "right" });

    y += 5.5;
  });

  // Amount Box
  y += 2;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(6, y, pageWidth - 12, 12, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 10, 20);
  doc.text("AMOUNT COLLECTED:", 9, y + 7.5);

  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9);
  doc.text(formatINR(payment.total_amount || 0), pageWidth - 9, y + 7.5, { align: "right" });

  // Footer notes
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for saving with us! • தீபாவளி நல்வாழ்த்துகள்!", pageWidth / 2, y, { align: "center" });
  doc.text("Computer Generated Receipt • Valid without signature", pageWidth / 2, y + 4, { align: "center" });

  return doc;
}

/**
 * Generate a professional Passbook / Chit Card PDF
 */
export function generatePassbookPDF(customer: any, scheme: any, installments: any[], shop?: ShopDetails): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const s = { ...DEFAULT_SHOP, ...shop };
  const pageWidth = doc.internal.pageSize.getWidth();

  // Outer Border
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.8);
  doc.roundedRect(8, 8, pageWidth - 16, doc.internal.pageSize.getHeight() - 16, 4, 4, "S");

  // Header Banner
  doc.setFillColor(62, 1, 11);
  doc.roundedRect(10, 10, pageWidth - 20, 32, 3, 3, "F");

  doc.setTextColor(245, 158, 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("OFFICIAL DIWALI CHIT PASSBOOK / SAVINGS CARD", pageWidth / 2, 17, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  const shopTitle = s.shop_name?.split("(")[0]?.trim() || "SRI LAKSHMI SUPERMARKET";
  doc.text(shopTitle, pageWidth / 2, 24, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(254, 240, 138);
  doc.text(s.shop_address || "", pageWidth / 2, 31, { align: "center" });
  doc.text(`Helpline: ${s.shop_phone || ""}${s.shop_gst ? " | GST: " + s.shop_gst : ""}`, pageWidth / 2, 36, { align: "center" });

  // Member Specification Table
  let y = 48;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, y, pageWidth - 24, 26, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 20, 30);
  doc.text("MEMBER & SCHEME PARTICULARS", 16, y + 6);

  y += 11;
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text("Member Name:", 16, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(customer.full_name || "-", 42, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Passbook No:", pageWidth / 2 + 5, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9);
  doc.text(scheme.passbook_number || "PB-PENDING", pageWidth / 2 + 32, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Mobile:", 16, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(customer.mobile || "-", 42, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Scheme Name:", pageWidth / 2 + 5, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(scheme.scheme_name || "-", pageWidth / 2 + 32, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Address:", 16, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const addr = `${customer.address || ""}, ${customer.city || ""}`.trim();
  doc.text(addr || "-", 42, y);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Target Total:", pageWidth / 2 + 5, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text(formatINR(scheme.target_amount || scheme.total_paid_amount || 0), pageWidth / 2 + 32, y);

  // Installments Table Header
  y += 14;
  doc.setFillColor(62, 1, 11);
  doc.rect(12, y, pageWidth - 24, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(254, 240, 138);
  doc.text("Inst #", 16, y + 5.5);
  doc.text("Due Date", 32, y + 5.5);
  doc.text("Due Amount", 65, y + 5.5);
  doc.text("Paid Amount", 98, y + 5.5);
  doc.text("Paid Date", 130, y + 5.5);
  doc.text("Status", 165, y + 5.5);

  // Installment Rows
  y += 8;
  const instList = installments.length > 0 ? installments : [];
  let totalPaid = 0;

  for (let idx = 0; idx < Math.max(12, instList.length); idx++) {
    const inst = instList[idx] || {
      installment_number: idx + 1,
      due_date: `Month ${idx + 1}`,
      amount: scheme.monthly_amount || 700,
      paid_amount: 0,
      status: "pending",
    };

    if (inst.status === "paid") {
      totalPaid += Number(inst.paid_amount || inst.amount);
    }

    const rowHeight = 7.5;
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, y, pageWidth - 24, rowHeight, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`#${inst.installment_number}`, 16, y + 5);

    doc.setFont("helvetica", "normal");
    doc.text(inst.due_date ? formatDate(inst.due_date) : "-", 32, y + 5);
    doc.text(formatINR(inst.amount), 65, y + 5);
    doc.text(inst.status === "paid" ? formatINR(inst.paid_amount || inst.amount) : "₹0", 98, y + 5);
    doc.text(inst.paid_date ? formatDate(inst.paid_date) : "-", 130, y + 5);

    if (inst.status === "paid") {
      doc.setTextColor(5, 150, 105);
      doc.setFont("helvetica", "bold");
      doc.text("PAID", 165, y + 5);
    } else {
      doc.setTextColor(180, 83, 9);
      doc.setFont("helvetica", "normal");
      doc.text("PENDING", 165, y + 5);
    }

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(12, y + rowHeight, pageWidth - 12, y + rowHeight);

    y += rowHeight;
  }

  // Summary Box
  y += 4;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(12, y, pageWidth - 24, 12, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(80, 20, 30);
  doc.text(`TOTAL PAID SO FAR: ${formatINR(totalPaid)}`, 16, y + 7.5);
  doc.text(`TARGET MATURITY: ${formatINR(scheme.target_amount || 0)}`, pageWidth - 16, y + 7.5, { align: "right" });

  // Signatures
  y += 24;
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(20, y, 70, y);
  doc.line(pageWidth - 70, y, pageWidth - 20, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Customer Signature / சந்தாதாரர் கையொப்பம்", 45, y + 4, { align: "center" });
  doc.text("Authorized Signature & Shop Seal", pageWidth - 45, y + 4, { align: "center" });

  // Footer Note
  const footerY = doc.internal.pageSize.getHeight() - 14;
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("இணைந்தமைக்கு நன்றி! • ஒவ்வொரு மாதமும் தவறாமல் தவணை செலுத்தி முழு மளிகைப் பலனைப் பெறுங்கள்.", pageWidth / 2, footerY, { align: "center" });

  return doc;
}

/**
 * Universal WhatsApp PDF Share & Download Handler
 */
export async function shareOrDownloadPDF(
  doc: jsPDF,
  filename: string,
  shareTitle: string,
  customerMobile?: string,
  whatsAppText?: string
) {
  const pdfBlob = doc.output("blob");
  const pdfFile = new File([pdfBlob], filename, { type: "application/pdf" });

  // Try Native Web Share API with File (Android / iOS native share directly opens WhatsApp!)
  if (typeof navigator !== "undefined" && (navigator as any).canShare && (navigator as any).canShare({ files: [pdfFile] })) {
    try {
      await (navigator as any).share({
        title: shareTitle,
        text: whatsAppText || shareTitle,
        files: [pdfFile],
      });
      return { shared: true, mode: "native_share" };
    } catch (e: any) {
      // User cancelled or share error; continue to fallback
      if (e.name === "AbortError") return { shared: false, cancelled: true };
    }
  }

  // Fallback 1: Download PDF to device
  doc.save(filename);

  // Fallback 2: If customer mobile is provided, open WhatsApp with the message
  if (customerMobile && whatsAppText) {
    const waUrl = getWhatsAppShareUrl(customerMobile, whatsAppText);
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
  }

  return { shared: true, mode: "download_and_whatsapp" };
}

/**
 * Print a jsPDF directly across desktop and mobile without page style distortion
 */
export function printPDF(doc: jsPDF) {
  const blobUrl = String(doc.output("bloburl"));
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.src = blobUrl;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        // Fallback: open in new window
        window.open(blobUrl, "_blank");
      }
    }, 300);
  };
}
