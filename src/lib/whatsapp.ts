export function getWhatsAppShareUrl(mobile: string, message: string): string {
  // Clean mobile number (strip +91, dashes, spaces)
  let cleanMobile = mobile.replace(/[^0-9]/g, "");
  if (cleanMobile.length === 10) {
    cleanMobile = "91" + cleanMobile;
  }
  return `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
}

export function generatePaymentReceiptWhatsAppMessage(data: {
  customerName: string;
  schemeName: string;
  receiptNumber: string;
  installmentNumber: number;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  shopName: string;
  shopPhone: string;
}): string {
  return `🪔 *${data.shopName}*
*தீபாவளி சிட் தவணை ரசீது (Payment Receipt)*
------------------------------------
வணக்கம் திரு/திருமதி. *${data.customerName}*,

உங்கள் தவணைத் தொகை வெற்றிகரமாக பெறப்பட்டது!

📄 *ரசீது எண்:* ${data.receiptNumber}
🏷️ *திட்டம்:* ${data.schemeName}
🔢 *தவணை எண்:* ${data.installmentNumber}
💰 *செலுத்திய தொகை:* ₹${data.amount.toLocaleString("en-IN")}
💳 *செலுத்திய முறை:* ${data.paymentMode.toUpperCase()}
📅 *தேதி:* ${data.paymentDate}
------------------------------------
இனிய தீபாவளி நல்வாழ்த்துகள்! 
📞 தொடர்பு: ${data.shopPhone}`;
}

export function generateDueReminderWhatsAppMessage(data: {
  customerName: string;
  schemeName: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  shopName: string;
  shopPhone: string;
}): string {
  return `🪔 *${data.shopName}*
*தீபாவளி சிட் தவணை நினைவூட்டல் (Due Reminder)*
------------------------------------
வணக்கம் திரு/திருமதி. *${data.customerName}*,

உங்கள் தீபாவளி சேமிப்புத் திட்டத்தின் மாதத் தவணை விவரம்:

🏷️ *திட்டம்:* ${data.schemeName}
🔢 *தவணை எண்:* ${data.installmentNumber}
💰 *செலுத்த வேண்டிய தொகை:* ₹${data.amount.toLocaleString("en-IN")}
🗓️ *கடைசி தேதி:* ${data.dueDate}
------------------------------------
தவணைத் தொகையை உடனடியாக செலுத்தி கூடுதல் போனஸ் பரிசுகளை பெறுங்கள்!
📞 உதவிக்கு: ${data.shopPhone}`;
}
