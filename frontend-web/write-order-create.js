const fs = require('fs');
const path = require('path');

const content = `"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Phone, Calendar, Clock, ImagePlus, X, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { getCategoryGif } from "@/lib/categoryGifs";

interface Category { id: string; nameUz: string; name: string; icon: string | null; }

// O'zbekiston viloyatlari va tumanlari
const uzbekistanLocations = [
  "Toshkent shahar, Bektemir tumani",
  "Toshkent shahar, Chilonzor tumani",
  "Toshkent shahar, Mirobod tumani",
  "Toshkent shahar, Mirzo Ulug\\'bek tumani",
  "Toshkent shahar, Olmazor tumani",
  "Toshkent shahar, Sergeli tumani",
  "Toshkent shahar, Shayxontohur tumani",
  "Toshkent shahar, Uchtepa tumani",
  "Toshkent shahar, Yakkasaroy tumani",
  "Toshkent shahar, Yashnobod tumani",
  "Toshkent shahar, Yunusobod tumani",
  "Toshkent viloyati, Angren shahri",
  "Toshkent viloyati, Olmaliq shahri",
  "Toshkent viloyati, Chirchiq shahri",
  "Toshkent viloyati, Bekobod shahri",
  "Toshkent viloyati, Zangiota tumani",
  "Toshkent viloyati, Qibray tumani",
  "Toshkent viloyati, Bo\\'stonliq tumani",
  "Samarqand shahar",
  "Samarqand viloyati, Urgut tumani",
  "Samarqand viloyati, Kattaqo\\'rg\\'on tumani",
  "Samarqand viloyati, Bulung\\'ur tumani",
  "Buxoro shahar",
  "Buxoro viloyati, Kogon shahri",
  "Buxoro viloyati, G\\'ijduvon tumani",
  "Andijon shahar",
  "Andijon viloyati, Asaka tumani",
  "Andijon viloyati, Xo\\'jaobod tumani",
  "Farg\\'ona shahar",
  "Farg\\'ona viloyati, Marg\\'ilon shahri",
  "Farg\\'ona viloyati, Quva tumani",
  "Farg\\'ona viloyati, Rishton tumani",
  "Namangan shahar",
  "Namangan viloyati, Chortoq tumani",
  "Namangan viloyati, Pop tumani",
  "Xorazm viloyati, Urganch shahri",
  "Xorazm viloyati, Xiva shahri",
  "Surxondaryo viloyati, Termiz shahri",
  "Surxondaryo viloyati, Denov tumani",
  "Qashqadaryo viloyati, Qarshi shahri",
  "Qashqadaryo viloyati, Shahrisabz shahri",
  "Navoiy shahar",
  "Navoiy viloyati, Zarafshon shahri",
  "Jizzax shahar",
  "Jizzax viloyati, Zomin tumani",
  "Sirdaryo viloyati, Guliston shahri",
  "Sirdaryo viloyati, Yangiyer shahri",
  "Qoraqalpog\\'iston, Nukus shahri",
  "Qoraqalpog\\'iston, Mo\\'ynoq tumani",
];

function CreateOrderForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("+998");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (addressRef.current && !addressRef.current.contains(e.target as Node)) {
        setShowAddressSuggestions(false);
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (val.length >= 2) {
      const filtered = uzbekistanLocations.filter((loc) =>
        loc.toLowerCase().includes(val.toLowerCase())
      );
      setAddressSuggestions(filtered);
      setShowAddressSuggestions(filtered.length > 0);
    } else {
      setShowAddressSuggestions(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 5) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length && images.length + i < 5; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setImages((prev) => [...prev, res.data.url]);
      }
    } catch {
      toast.error("Rasm yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { toast.error("Tavsifni kiriting"); return; }
    if (!address.trim()) { toast.error("Manzilni kiriting"); return; }
    if (!/^\\+998\\d{9}$/.test(contactPhone)) { toast.error("Qo'shimcha telefon raqamini to'g'ri kiriting (+998XXXXXXXXX)"); return; }
    setLoading(true);
    try {
      const body: Record<string, unknown> = { description, address, contactPhone, images };
      if (categoryId) body.categoryId = categoryId;
      if (preferredDate) body.preferredDate = new Date(preferredDate).toISOString();
      if (preferredTime) body.preferredTime = preferredTime;
      await api.post("/orders", body);
      toast.success("Buyurtma yaratildi!");
      router.push("/orders");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Date helpers
  const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();

  const formatDate = (d: string) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.getDate() + " " + months[dt.getMonth()] + " " + dt.getFullYear();
  };

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Buyurtma yaratish</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kategoriya (ixtiyoriy)</label>
            <div className="relative" ref={catRef}>
              <button
                type="button"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left transition"
              >
                {categoryId ? (
                  <>
                    <img
                      src={getCategoryGif(categories.find((c) => c.id === categoryId)?.nameUz || "")}
                      alt=""
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <span className="flex-1 truncate font-medium text-gray-900 dark:text-white">
                      {categories.find((c) => c.id === categoryId)?.nameUz || categories.find((c) => c.id === categoryId)?.name}
                    </span>
                  </>
                ) : (
                  <span className="flex-1 text-gray-400">Kategoriyani tanlang...</span>
                )}
                <ChevronDown className={"w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 " + (catDropdownOpen ? "rotate-180" : "")} />
              </button>
              {catDropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { setCategoryId(""); setCatDropdownOpen(false); }}
                    className={"w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 transition text-left border-b border-gray-100 dark:border-gray-800 " + (!categoryId ? "bg-blue-50 dark:bg-gray-800" : "")}
                  >
                    <span className="text-sm text-gray-400">Tanlang...</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setCategoryId(c.id); setCatDropdownOpen(false); }}
                      className={"w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition text-left " + (categoryId === c.id ? "bg-blue-50 dark:bg-gray-800" : "")}
                    >
                      <img
                        src={getCategoryGif(c.nameUz || c.name)}
                        alt={c.nameUz || c.name}
                        className="w-7 h-7 object-contain shrink-0"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{c.nameUz || c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Muammo tavsifi *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Masalan: Kran oqyapti, tuzatish kerak..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Contact Phone */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Bog&apos;lanish uchun telefon raqami *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+998901234567"
                maxLength={13}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Usta siz bilan bog&apos;lanish uchun ishlatadi</p>
          </div>

          {/* Address with suggestions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Manzil *</label>
            <div className="relative" ref={addressRef}>
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => { if (address.length >= 2) setShowAddressSuggestions(addressSuggestions.length > 0); }}
                placeholder="Viloyat, tuman yoki shahar nomini yozing..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
              {showAddressSuggestions && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                  {addressSuggestions.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setAddress(loc); setShowAddressSuggestions(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition text-left"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{loc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Aniq manzilni kiriting (uy, ko&apos;cha, mo&apos;ljal)</p>
          </div>

          {/* Date & Time */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Qulay vaqt (ixtiyoriy)</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Modern Date Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setDatePickerOpen(!datePickerOpen); setTimePickerOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left transition"
                >
                  <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className={"flex-1 text-sm truncate " + (preferredDate ? "text-gray-900 dark:text-white font-medium" : "text-gray-400")}>
                    {preferredDate ? formatDate(preferredDate) : "Sana tanlang"}
                  </span>
                </button>
                {datePickerOpen && (
                  <div className="absolute z-50 top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 w-72">
                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-3">
                      <button type="button" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300">
                        &lsaquo;
                      </button>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{months[calMonth]} {calYear}</span>
                      <button type="button" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300">
                        &rsaquo;
                      </button>
                    </div>
                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"].map((d) => (
                        <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                      ))}
                    </div>
                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: (getFirstDay(calMonth, calYear) + 6) % 7 }).map((_, i) => (
                        <div key={"e-" + i} />
                      ))}
                      {Array.from({ length: getDaysInMonth(calMonth, calYear) }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = calYear + "-" + String(calMonth + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
                        const isToday = dateStr === today.toISOString().split("T")[0];
                        const isSelected = dateStr === preferredDate;
                        const isPast = new Date(dateStr) < new Date(today.toISOString().split("T")[0]);
                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={isPast}
                            onClick={() => { setPreferredDate(dateStr); setDatePickerOpen(false); }}
                            className={"w-9 h-9 rounded-xl text-sm font-medium transition flex items-center justify-center "
                              + (isPast ? "text-gray-300 dark:text-gray-600 cursor-not-allowed " : "hover:bg-blue-50 dark:hover:bg-gray-800 ")
                              + (isSelected ? "!bg-blue-600 !text-white shadow-md " : "")
                              + (isToday && !isSelected ? "ring-2 ring-blue-400 text-blue-600 font-bold " : "text-gray-700 dark:text-gray-200 ")
                            }
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {preferredDate && (
                      <button type="button" onClick={() => { setPreferredDate(""); setDatePickerOpen(false); }} className="w-full mt-2 text-xs text-red-500 hover:text-red-600 transition">
                        Tozalash
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Modern Time Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setTimePickerOpen(!timePickerOpen); setDatePickerOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left transition"
                >
                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className={"flex-1 text-sm " + (preferredTime ? "text-gray-900 dark:text-white font-medium" : "text-gray-400")}>
                    {preferredTime || "Soat tanlang"}
                  </span>
                </button>
                {timePickerOpen && (
                  <div className="absolute z-50 top-full right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-3 w-48">
                    <div className="grid grid-cols-3 gap-1.5">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setPreferredTime(t); setTimePickerOpen(false); }}
                          className={"py-2 rounded-lg text-sm font-medium transition "
                            + (preferredTime === t ? "bg-blue-600 text-white shadow-md" : "hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200")
                          }
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {preferredTime && (
                      <button type="button" onClick={() => { setPreferredTime(""); setTimePickerOpen(false); }} className="w-full mt-2 text-xs text-red-500 hover:text-red-600 transition">
                        Tozalash
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Rasmlar (ixtiyoriy, max 5)</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Rasm</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-blue-600/30 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Yaratilmoqda...
              </span>
            ) : (
              "\\uD83D\\uDCCB Buyurtma yaratish"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Yuklanmoqda...</div>}>
      <CreateOrderForm />
    </Suspense>
  );
}
`;

const filePath = path.join(__dirname, 'src/app/orders/create/page.tsx');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Written:', filePath, '- Lines:', content.split('\\n').length);
