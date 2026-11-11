"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { formatINR } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import {
  FileImage,
  Printer,
  Download,
  Share2,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Eye,
  Edit3,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PosterGeneratorPage() {
  const { t, language } = useLanguage();
  const posterRef = useRef<HTMLDivElement>(null);

  const [schemes, setSchemes] = useState<any[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable Poster Fields
  const [titleTa, setTitleTa] = useState("தீபாவளி மங்கள மளிகை சேமிப்புத் திட்டம் - 2026");
  const [titleEn, setTitleEn] = useState("DIWALI MANGALA GROCERY SAVINGS SCHEME - 2026");
  const [shopNameTa, setShopNameTa] = useState("ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்");
  const [shopNameEn, setShopNameEn] = useState("SRI LAKSHMI SUPERMARKET");
  const [addressTa, setAddressTa] = useState("எண். 124, பஜார் மெயின் ரோடு, மணிக்கூண்டு அருகில், சேலம் - 636 001");
  const [phones, setPhones] = useState("98765 43210 / 94432 10987");
  const [monthlyAmount, setMonthlyAmount] = useState(700);
  const [durationMonths, setDurationMonths] = useState(12);
  const [totalValHighlight, setTotalValHighlight] = useState("மொத்த சந்தா: ₹8,400 (மாதம் ₹700 x 12) | பொருட்கள் மதிப்பு: ₹10,000/-");
  const [bonusHighlight, setBonusHighlight] = useState("உங்களுக்கு ₹1,600 மதிப்புள்ள போனஸ் இலவச மளிகைப் பொருட்கள்!");
  const [footerNotice, setFooterNotice] = useState("முன்பதிவு செய்ய உடனே தொடர்பு கொள்ளவும். குறைவான சந்தாதாரர்களுக்கு மட்டுமே அனுமதி!");

  // Left conditions
  const [conditionsTa, setConditionsTa] = useState<string[]>([
    "மாதம் தோறும் ₹700 வீதம் 12 மாதங்கள் செலுத்த வேண்டும்.",
    "ஒவ்வொரு மாதமும் 10-ஆம் தேதிக்குள் தவணைத் தொகை செலுத்தப்பட வேண்டும்.",
    "முன்கூட்டியே செலுத்தும் சந்தாதாரர்களுக்கு சிறப்பு குலுக்கல் பரிசு உண்டு.",
    "தவணை தவறியவர்களுக்கு பண்டிகையின் போது பொருட்கள் மட்டுமே வழங்கப்படும்; எந்தவித அபராதமும் வசூலிக்கப்பட மாட்டாது.",
    "அனைத்து மளிகைப் பொருட்களும் A1 முதல் தரமான பிராண்டட் பொருட்கள் மட்டுமே.",
    "பொருட்கள் தீபாவளி பண்டிகைக்கு 10 நாட்களுக்கு முன்பாக நேரில் வழங்கப்படும்.",
    "பொருட்கள் பெறும்போது அசல் பாஸ்புக் மற்றும் ரசீதுகள் கட்டாயம் சமர்ப்பிக்கப்பட வேண்டும்.",
  ]);

  // Right grocery list
  const [groceries, setGroceries] = useState<
    { sNo: number; nameTa: string; nameEn: string; qty: string }[]
  >([
    { sNo: 1, nameTa: "பொன்னி புழுங்கல் அரிசி", nameEn: "Ponni Boiled Rice", qty: "10 KG" },
    { sNo: 2, nameTa: "துவரம் பருப்பு (A1 தரம்)", nameEn: "Toor Dal (Premium)", qty: "2 KG" },
    { sNo: 3, nameTa: "உளுத்தம் பருப்பு (வெள்ளை)", nameEn: "Urad Dal (White)", qty: "2 KG" },
    { sNo: 4, nameTa: "பாசிப் பருப்பு", nameEn: "Moong Dal", qty: "1 KG" },
    { sNo: 5, nameTa: "கடலைப் பருப்பு", nameEn: "Chana Dal", qty: "1 KG" },
    { sNo: 6, nameTa: "சமையல் எண்ணெய் (சன்ஃபிளவர்)", nameEn: "Refined Sunflower Oil", qty: "2 Ltr" },
    { sNo: 7, nameTa: "மரச்செக்கு கடலை எண்ணெய்", nameEn: "Cold Pressed Groundnut Oil", qty: "1 Ltr" },
    { sNo: 8, nameTa: "சக்கி பிரெஷ் கோதுமை மாவு", nameEn: "Chakki Fresh Wheat Flour", qty: "5 KG" },
    { sNo: 9, nameTa: "தூய வெள்ளை சர்க்கரை", nameEn: "Pure White Sugar", qty: "3 KG" },
    { sNo: 10, nameTa: "வறுத்த ரவை (சூஜி)", nameEn: "Roasted Sooji / Rava", qty: "1 KG" },
    { sNo: 11, nameTa: "கடலை மாவு (Besan)", nameEn: "Besan / Gram Flour", qty: "1 KG" },
    { sNo: 12, nameTa: "குலாப் ஜாமூன் மிக்ஸ்", nameEn: "Gulab Jamun Mix", qty: "2 Pkts" },
    { sNo: 13, nameTa: "பஜ்ஜி போண்டா மிக்ஸ்", nameEn: "Bajji Bonda Mix", qty: "2 Pkts" },
    { sNo: 14, nameTa: "மைதா மாவு", nameEn: "Refined Maida", qty: "500 GM" },
    { sNo: 15, nameTa: "அரிசி மாவு (இடியாப்ப மாவு)", nameEn: "Rice Flour", qty: "500 GM" },
    { sNo: 16, nameTa: "கொட்டை இல்லாத புளி", nameEn: "Seedless Tamarind", qty: "500 GM" },
    { sNo: 17, nameTa: "மஞ்சள் தூள்", nameEn: "Turmeric Powder", qty: "100 GM" },
    { sNo: 18, nameTa: "தூய கல் உப்பு", nameEn: "Crystal Salt", qty: "2 KG" },
    { sNo: 19, nameTa: "தீபாவளி சிறப்பு ஸ்வீட் பாக்ஸ்", nameEn: "Diwali Sweet Combo", qty: "500 GM" },
  ]);

  // Active view tab (Editor vs Live Poster)
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");

  const fetchConfig = async (schemeId: number) => {
    try {
      const res = await fetch(`/api/poster?schemeId=${schemeId}`);
      const data = await res.json();
      if (data.config) {
        setTitleTa(data.config.title_tamil || titleTa);
        setTitleEn(data.config.title_english || titleEn);
        setShopNameTa(data.config.shop_name_tamil || shopNameTa);
        setShopNameEn(data.config.shop_name_english || shopNameEn);
        setAddressTa(data.config.shop_address_tamil || addressTa);
        setPhones(data.config.phone_numbers || phones);
        setTotalValHighlight(data.config.total_value_highlight || totalValHighlight);
        setBonusHighlight(data.config.bonus_highlight || bonusHighlight);
        setFooterNotice(data.config.footer_notice_tamil || footerNotice);
        if (data.config.leftConditionsTamil?.length) {
          setConditionsTa(data.config.leftConditionsTamil);
        }
        if (data.config.groceryList?.length) {
          setGroceries(data.config.groceryList);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/schemes")
      .then((res) => res.json())
      .then((data) => {
        setSchemes(data.schemes || []);
        if (data.schemes?.length) {
          setSelectedSchemeId(data.schemes[0].id);
          fetchConfig(data.schemes[0].id);
        }
      });
  }, []);

  const handleSchemeChange = (id: number) => {
    setSelectedSchemeId(id);
    const sch = schemes.find((s) => s.id === id);
    if (sch) {
      setMonthlyAmount(Number(sch.monthly_amount));
      setDurationMonths(Number(sch.total_months));
      const totalCont = Number(sch.monthly_amount) * Number(sch.total_months);
      const pkgVal = Number(sch.grocery_package_value);
      setTotalValHighlight(
        `மொத்த சந்தா: ₹${totalCont.toLocaleString("en-IN")} (மாதம் ₹${sch.monthly_amount} x ${sch.total_months}) | பொருட்கள் மதிப்பு: ₹${pkgVal.toLocaleString("en-IN")}/-`
      );
      setBonusHighlight(
        `உங்களுக்கு ₹${(pkgVal - totalCont).toLocaleString("en-IN")} மதிப்புள்ள போனஸ் இலவச மளிகைப் பொருட்கள்!`
      );
    }
    fetchConfig(id);
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      await fetch("/api/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeId: selectedSchemeId,
          titleTamil: titleTa,
          titleEnglish: titleEn,
          shopNameTamil: shopNameTa,
          shopNameEnglish: shopNameEn,
          shopAddressTamil: addressTa,
          shopAddressEnglish: addressTa,
          phoneNumbers: phones,
          leftConditionsTamil: conditionsTa,
          leftConditionsEnglish: conditionsTa,
          groceryList: groceries,
          totalValueHighlight: totalValHighlight,
          bonusHighlight: bonusHighlight,
          footerNoticeTamil: footerNotice,
        }),
      });
      setSuccessMsg("Poster configuration saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Diwali_Chit_Supermarket_Poster_${monthlyAmount}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Diwali_Chit_Poster_A4_${monthlyAmount}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const shareViaWhatsApp = () => {
    const text = `🪔 *${shopNameTa}* (${shopNameEn})\n*${titleTa}*\n------------------------------------\n💰 *மாதத் தவணை:* ₹${monthlyAmount} (12 மாதங்கள்)\n🎁 *மளிகைப் பேக்கேஜ் மதிப்பு:* ₹${(monthlyAmount * 12 + 1600).toLocaleString("en-IN")}\n✨ *போனஸ் பலன்கள்:* 19 வகையான உயர்தர பிராண்டட் மளிகைப் பொருட்கள்!\n📞 *முன்பதிவு செய்ய:* ${phones}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <span>{t.posterGenerator}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {language === "ta"
              ? "தமிழ் சூப்பர் மார்க்கெட் தீபாவளி சிட் போஸ்டர் (A4 அச்சு வடிவம் & நேரலை மாதிரி)"
              : "Classic Tamil Supermarket Chit Poster Generator with live preview, A4 print, PDF and PNG export"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scheme selector */}
          <select
            value={selectedSchemeId}
            onChange={(e) => handleSchemeChange(Number(e.target.value))}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-brand-blue"
          >
            {schemes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tamil_name} ({formatINR(s.monthly_amount)}/mo)
              </option>
            ))}
          </select>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Save className="h-4 w-4 text-amber-400" />
            <span>{saving ? "Saving..." : "Save Poster"}</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>PNG</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md shadow-rose-900/20 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Print A4</span>
          </button>

          <button
            onClick={shareViaWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm"
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs: Live Poster Preview vs Field Editor */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "preview"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Live Poster Preview (நேரலை போஸ்டர்)</span>
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "edit"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit Poster Content (விவரங்கள் திருத்து)</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "edit" ? (
        /* Poster Field Editor */
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <h3 className="text-sm font-extrabold text-slate-800 border-b pb-2">
            போஸ்டர் தகவல்கள் & தலைப்புகள் (Poster Details & Titles)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">திட்டத் தலைப்பு (Tamil Title)</label>
              <input
                type="text"
                value={titleTa}
                onChange={(e) => setTitleTa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Scheme Title (English)</label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">கடை பெயர் (Shop Name - Tamil)</label>
              <input
                type="text"
                value={shopNameTa}
                onChange={(e) => setShopNameTa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-brand-blue"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Shop Name (English)</label>
              <input
                type="text"
                value={shopNameEn}
                onChange={(e) => setShopNameEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">கடை முகவரி (Address)</label>
              <input
                type="text"
                value={addressTa}
                onChange={(e) => setAddressTa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">தொடர்பு எண்கள் (Phone Numbers)</label>
              <input
                type="text"
                value={phones}
                onChange={(e) => setPhones(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">மாதத் தவணைத் தொகை (Monthly Installment ₹)</label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
              />
            </div>
          </div>

          {/* Left conditions editor */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-800 text-xs">
              இடது பக்க விதிமுறைகள் (Left Section Conditions)
            </h4>
            {conditionsTa.map((cond, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={cond}
                  onChange={(e) => {
                    const next = [...conditionsTa];
                    next[idx] = e.target.value;
                    setConditionsTa(next);
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => setConditionsTa(conditionsTa.filter((_, i) => i !== idx))}
                  className="text-rose-500 hover:text-rose-700 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setConditionsTa([...conditionsTa, "புதிய விதிமுறை வரி சேர்க்கப்பட்டது"])}
              className="text-xs font-bold text-brand-blue hover:underline pt-1 inline-block"
            >
              + விதிமுறை வரி சேர்க்க
            </button>
          </div>
        </div>
      ) : (
        /* LIVE POSTER PREVIEW (Tamil Supermarket Chit Poster Layout) */
        <div className="flex justify-center overflow-x-auto pb-12">
          {/* A4 Container */}
          <div
            ref={posterRef}
            className="w-[794px] min-h-[1123px] bg-white border-4 border-amber-500 shadow-2xl rounded-none p-5 relative overflow-hidden flex flex-col justify-between font-sans"
            style={{
              backgroundImage: "radial-gradient(#fffbeb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            {/* Poster Header Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-brand-blue via-rose-700 to-amber-600 p-4 text-white text-center shadow-lg border-2 border-amber-300">
              <div className="flex items-center justify-between px-2 mb-1">
                <Logo size="md" showText={false} />
                <span className="text-[12px] font-extrabold text-amber-200 uppercase tracking-widest bg-black/20 px-3 py-0.5 rounded-full">
                  🌟 தீபாவளி திருநாள் சிறப்பு மளிகை சேமிப்புத் திட்டம் - 2026 🌟
                </span>
                <Logo size="md" showText={false} />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-amber-300 drop-shadow-md">
                {shopNameTa}
              </h1>
              <h2 className="text-sm font-extrabold text-white tracking-widest">
                {shopNameEn}
              </h2>
              <p className="text-[11px] text-amber-100 font-semibold mt-1">
                {addressTa} • 📞 {phones}
              </p>

              {/* Scheme Title Badge */}
              <div className="mt-2 inline-block bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900 font-black text-sm px-6 py-1 rounded-full shadow-md uppercase tracking-wider">
                {titleTa}
              </div>
            </div>

            {/* Poster Body: Left Conditions & Right Grocery Table */}
            <div className="grid grid-cols-12 gap-4 my-4 flex-1">
              {/* LEFT SECTION (4.5 columns) */}
              <div className="col-span-5 bg-gradient-to-b from-blue-50/90 via-amber-50/60 to-rose-50/60 rounded-2xl border-2 border-brand-blue/30 p-3.5 flex flex-col justify-between text-slate-800 shadow-sm">
                <div>
                  {/* Highlight Due Box */}
                  <div className="bg-gradient-to-r from-brand-blue to-blue-900 text-white rounded-xl p-3 text-center shadow-md mb-3 border border-amber-300">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">மாதத் தவணைத் தொகை</span>
                    <span className="text-2xl font-black text-amber-400 block tracking-tight">
                      {formatINR(monthlyAmount)}
                    </span>
                    <span className="text-[10px] text-blue-100 font-semibold block mt-0.5">
                      (12 மாதங்கள் மட்டும் • Total 12 Months)
                    </span>
                    <div className="mt-1 pt-1 border-t border-white/20 text-[10px] font-bold text-amber-200">
                      🗓️ ஒவ்வொரு மாதமும் 10-ஆம் தேதிக்குள்!
                    </div>
                  </div>

                  <h3 className="text-xs font-black text-brand-blue uppercase tracking-wider border-b-2 border-brand-blue pb-1 mb-2">
                    📋 திட்ட விதிமுறைகள் & பயன்கள்:
                  </h3>

                  <ul className="space-y-1.5 text-[10px] font-medium leading-relaxed">
                    {conditionsTa.map((cond, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-black text-xs shrink-0">✦</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lucky Draw Box */}
                <div className="mt-3 bg-gradient-to-r from-amber-500 to-rose-600 text-white p-2.5 rounded-xl text-center shadow-md border border-amber-200">
                  <span className="text-[11px] font-black block">🎁 பம்பர் குலுக்கல் பரிசுகள்! 🎁</span>
                  <span className="text-[9px] block text-amber-100">
                    முன்கூட்டியே தவணை செலுத்துவோருக்கு மிக்சி, கிரைண்டர், ஹாட்பாக்ஸ் குலுக்கல் பரிசுகள் உண்டு!
                  </span>
                </div>
              </div>

              {/* RIGHT SECTION (7.5 columns) - Grocery Products Table */}
              <div className="col-span-7 bg-white rounded-2xl border-2 border-amber-400 p-3 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b-2 border-amber-500 pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <h3 className="text-xs font-black text-rose-900 uppercase tracking-wide">
                        தீபாவளிக்கு வழங்கப்படும் மளிகைப் பொருட்கள் விபரம்
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full">
                      A1 முதல் தரம்
                    </span>
                  </div>

                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-amber-100/70 text-slate-800 font-bold uppercase border border-amber-300">
                      <tr>
                        <th className="py-1 px-1.5 text-center w-6">எண்</th>
                        <th className="py-1 px-2">மளிகைப் பொருள் (பொருட்கள் விபரம்)</th>
                        <th className="py-1 px-2 text-right">அளவு</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 font-medium">
                      {groceries.map((item, idx) => (
                        <tr
                          key={item.sNo || idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/30"}
                        >
                          <td className="py-1 px-1.5 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-2">
                            <span className="font-bold text-slate-900">{item.nameTa}</span>
                            <span className="text-[9px] text-slate-400 ml-1.5">({item.nameEn})</span>
                          </td>
                          <td className="py-1 px-2 text-right font-black text-rose-800 font-mono">
                            {item.qty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-2 text-[9px] text-slate-500 text-center italic bg-slate-50 py-1 rounded">
                  * சந்தை நிலவரப்படி பொருட்கள் தரம் குறையாமல் அதே மதிப்பில் வழங்கப்படும்.
                </div>
              </div>
            </div>

            {/* Poster Bottom Highlight Section */}
            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 p-3 text-center shadow-md space-y-1">
              <div className="text-xs sm:text-sm font-black text-rose-900 tracking-tight">
                {totalValHighlight}
              </div>
              <div className="text-sm font-black text-emerald-800 tracking-tight">
                {bonusHighlight}
              </div>
              <div className="text-[10px] font-bold text-slate-700 pt-0.5">
                {footerNotice}
              </div>
            </div>

            {/* Poster Footer Address Strip */}
            <div className="mt-2 pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-semibold px-2">
              <span>{shopNameTa} • சேலம்</span>
              <span className="font-mono">தொடர்புக்கு: {phones}</span>
              <span>பதிவு எண்: TN/SLM/2026/CHIT/8892</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
