"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, ChevronDown, MapPin, Phone, Calendar, Clock, ImagePlus, X, Navigation } from "lucide-react";
import { getCategoryGif } from "@/lib/categoryGifs";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), { ssr: false });

interface Category { id: string; name: string; nameUz?: string; }

const uzbekistanLocations = [
  "Toshkent shahri, Chilonzor tumani",
  "Toshkent shahri, Yunusobod tumani",
  "Toshkent shahri, Mirzo Ulug'bek tumani",
  "Toshkent shahri, Sergeli tumani",
  "Toshkent shahri, Yakkasaroy tumani",
  "Toshkent shahri, Shayxontohur tumani",
  "Toshkent shahri, Olmazor tumani",
  "Toshkent shahri, Uchtepa tumani",
  "Toshkent shahri, Mirobod tumani",
  "Toshkent shahri, Bektemir tumani",
  "Toshkent shahri, Yashnobod tumani",
  "Toshkent viloyati, Chirchiq shahri",
  "Toshkent viloyati, Olmaliq shahri",
  "Toshkent viloyati, Angren shahri",
  "Toshkent viloyati, Nurafshon shahri",
  "Samarqand viloyati, Samarqand shahri",
  "Samarqand viloyati, Kattaqo'rg'on shahri",
  "Buxoro viloyati, Buxoro shahri",
  "Buxoro viloyati, Kogon shahri",
  "Andijon viloyati, Andijon shahri",
  "Andijon viloyati, Asaka shahri",
  "Farg'ona viloyati, Farg'ona shahri",
  "Farg'ona viloyati, Marg'ilon shahri",
  "Farg'ona viloyati, Quvasoy shahri",
  "Farg'ona viloyati, Qo'qon shahri",
  "Namangan viloyati, Namangan shahri",
  "Namangan viloyati, Chust tumani",
  "Xorazm viloyati, Urganch shahri",
  "Xorazm viloyati, Xiva shahri",
  "Surxondaryo viloyati, Termiz shahri",
  "Surxondaryo viloyati, Denov tumani",
  "Qashqadaryo viloyati, Qarshi shahri",
  "Qashqadaryo viloyati, Shahrisabz shahri",
  "Navoiy viloyati, Navoiy shahri",
  "Navoiy viloyati, Zarafshon shahri",
  "Jizzax viloyati, Jizzax shahri",
  "Jizzax viloyati, Zomin tumani",
  "Sirdaryo viloyati, Guliston shahri",
  "Sirdaryo viloyati, Yangiyer shahri",
  "Qoraqalpog'iston, Nukus shahri",
  "Qoraqalpog'iston, Mo'ynoq tumani",
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
  const [showMap, setShowMap] = useState(false);
  const [latitude, setLatitude] = useState(41.2995);
  const [longitude, setLongitude] = useState(69.2401);
  const [gettingLocation, setGettingLocation] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (addressRef.current && !addressRef.current.contains(e.target as Node)) setShowAddressSuggestions(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (val.length >= 2) {
      const filtered = uzbekistanLocations.filter((loc) => loc.toLowerCase().includes(val.toLowerCase()));
      setAddressSuggestions(filtered);
      setShowAddressSuggestions(filtered.length > 0);
    } else {
      setShowAddressSuggestions(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi"); return; }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); setShowMap(true); setGettingLocation(false); },
      () => { toast.error("Joylashuvni aniqlab bo'lmadi"); setShowMap(true); setGettingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapLocationChange = (lat: number, lng: number) => { setLatitude(lat); setLongitude(lng); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 5) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length && images.length + i < 5; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await api.post("/upload/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
        setImages((prev) => [...prev, res.data.url]);
      }
    } catch { toast.error("Rasm yuklashda xatolik"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { toast.error("Tavsifni kiriting"); return; }
    if (!address.trim()) { toast.error("Manzilni kiriting"); return; }
    if (!/^\+998\d{9}$/.test(contactPhone)) { toast.error("Telefon raqamini to'g'ri kiriting (+998XXXXXXXXX)"); return; }
    setLoading(true);
    try {
      const body: Record<string, unknown> = { description, address, contactPhone, images };
      if (categoryId) body.categoryId = categoryId;
      if (preferredDate) body.preferredDate = new Date(preferredDate).toISOString();
      if (preferredTime) body.preferredTime = preferredTime;
      if (showMap) { body.latitude = latitude; body.longitude = longitude; }
      await api.post("/orders", body);
      toast.success("Buyurtma yaratildi!");
      router.push("/orders");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally { setLoading(false); }
  };

  const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();
  const formatDate = (d: string) => { if (!d) return ""; const dt = new Date(d); return dt.getDate() + " " + months[dt.getMonth()] + " " + dt.getFullYear(); };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  const selectedCat = categories.find((c) => c.id === categoryId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Buyurtma yaratish</h1>
        </div>

        {/* Single unified card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

          {/* Section 1: Category + Description */}
          <div className="p-4 space-y-3">
            {/* Category */}
            <div className="relative" ref={catRef}>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kategoriya</label>
              <button
                type="button"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                className="w-full mt-1 flex items-center gap-2.5 px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left transition"
              >
                {selectedCat ? (
                  <>
                    <img src={getCategoryGif(selectedCat.nameUz || "")} alt="" className="w-6 h-6 object-contain shrink-0" />
                    <span className="flex-1 truncate text-sm font-medium text-gray-900 dark:text-white">{selectedCat.nameUz || selectedCat.name}</span>
                  </>
                ) : (
                  <span className="flex-1 text-sm text-gray-400">Tanlang...</span>
                )}
                <ChevronDown className={"w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform " + (catDropdownOpen ? "rotate-180" : "")} />
              </button>
              {catDropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                  <button type="button" onClick={() => { setCategoryId(""); setCatDropdownOpen(false); }} className={"w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 transition text-left border-b border-gray-100 dark:border-gray-800 " + (!categoryId ? "bg-blue-50 dark:bg-gray-800" : "")}>
                    <span className="text-xs text-gray-400">Tanlang...</span>
                  </button>
                  {categories.map((c) => (
                    <button key={c.id} type="button" onClick={() => { setCategoryId(c.id); setCatDropdownOpen(false); }} className={"w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 transition text-left " + (categoryId === c.id ? "bg-blue-50 dark:bg-gray-800" : "")}>
                      <img src={getCategoryGif(c.nameUz || c.name)} alt="" className="w-5 h-5 object-contain shrink-0" />
                      <span className="text-sm text-gray-900 dark:text-white">{c.nameUz || c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Muammo tavsifi <span className="text-red-400">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Masalan: Kran oqyapti, tuzatish kerak..."
                className="w-full mt-1 px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Section 2: Phone + Address + Map */}
          <div className="p-4 space-y-3">
            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Telefon raqami <span className="text-red-400">*</span></label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+998901234567"
                  maxLength={13}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Manzil <span className="text-red-400">*</span></label>
              <div className="relative mt-1" ref={addressRef}>
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => { if (address.length >= 2) setShowAddressSuggestions(addressSuggestions.length > 0); }}
                  placeholder="Viloyat, tuman yoki shahar..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
                {showAddressSuggestions && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                    {addressSuggestions.map((loc, i) => (
                      <button key={i} type="button" onClick={() => { setAddress(loc); setShowAddressSuggestions(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 transition text-left">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-200">{loc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Map toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { if (!showMap) getCurrentLocation(); else setShowMap(false); }}
                className={"flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition border " + (showMap ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800")}
              >
                {gettingLocation ? <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                {showMap ? "Yopish" : "Xaritadan"}
              </button>
              {!showMap && (
                <button type="button" onClick={() => setShowMap(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition border bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <MapPin className="w-3.5 h-3.5" />
                  Qo&apos;lda
                </button>
              )}
            </div>

            {/* Map */}
            {showMap && (
              <div>
                <LocationPickerMap latitude={latitude} longitude={longitude} onLocationChange={handleMapLocationChange} />
                <p className="text-[10px] text-blue-500 mt-1 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />Bosing yoki markerni suring</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Section 3: Date + Time (inline) */}
          <div className="p-4">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Qulay vaqt</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {/* Date Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setDatePickerOpen(!datePickerOpen); setTimePickerOpen(false); }}
                  className="w-full flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className={"flex-1 text-xs truncate " + (preferredDate ? "text-gray-900 dark:text-white font-medium" : "text-gray-400")}>{preferredDate ? formatDate(preferredDate) : "Sana"}</span>
                </button>
                {datePickerOpen && (
                  <div className="absolute z-50 top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-3 w-[268px]">
                    <div className="flex items-center justify-between mb-2">
                      <button type="button" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300">&lsaquo;</button>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{months[calMonth]} {calYear}</span>
                      <button type="button" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300">&rsaquo;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                      {["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"].map((d) => (
                        <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-0.5">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: (getFirstDay(calMonth, calYear) + 6) % 7 }).map((_, i) => (<div key={"e-" + i} />))}
                      {Array.from({ length: getDaysInMonth(calMonth, calYear) }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = calYear + "-" + String(calMonth + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
                        const isToday = dateStr === today.toISOString().split("T")[0];
                        const isSelected = dateStr === preferredDate;
                        const isPast = new Date(dateStr) < new Date(today.toISOString().split("T")[0]);
                        return (
                          <button key={day} type="button" disabled={isPast} onClick={() => { setPreferredDate(dateStr); setDatePickerOpen(false); }}
                            className={"w-8 h-8 rounded-lg text-xs font-medium transition flex items-center justify-center "
                              + (isPast ? "text-gray-300 dark:text-gray-600 cursor-not-allowed " : "hover:bg-blue-50 dark:hover:bg-gray-800 ")
                              + (isSelected ? "!bg-blue-600 !text-white shadow " : "")
                              + (isToday && !isSelected ? "ring-1.5 ring-blue-400 text-blue-600 font-bold " : "text-gray-700 dark:text-gray-200 ")
                            }>{day}</button>
                        );
                      })}
                    </div>
                    {preferredDate && (
                      <button type="button" onClick={() => { setPreferredDate(""); setDatePickerOpen(false); }} className="w-full mt-1.5 text-[10px] text-red-500 hover:text-red-600 transition">Tozalash</button>
                    )}
                  </div>
                )}
              </div>

              {/* Time Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setTimePickerOpen(!timePickerOpen); setDatePickerOpen(false); }}
                  className="w-full flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left transition"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className={"flex-1 text-xs " + (preferredTime ? "text-gray-900 dark:text-white font-medium" : "text-gray-400")}>{preferredTime || "Soat"}</span>
                </button>
                {timePickerOpen && (
                  <div className="absolute z-50 top-full right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-2.5 w-44">
                    <div className="grid grid-cols-3 gap-1">
                      {timeSlots.map((t) => (
                        <button key={t} type="button" onClick={() => { setPreferredTime(t); setTimePickerOpen(false); }}
                          className={"py-1.5 rounded-lg text-xs font-medium transition " + (preferredTime === t ? "bg-blue-600 text-white shadow" : "hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200")}
                        >{t}</button>
                      ))}
                    </div>
                    {preferredTime && (
                      <button type="button" onClick={() => { setPreferredTime(""); setTimePickerOpen(false); }} className="w-full mt-1.5 text-[10px] text-red-500 hover:text-red-600 transition">Tozalash</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Section 4: Images (compact) */}
          <div className="p-4">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rasmlar <span className="text-gray-400 normal-case font-normal">(max 5)</span></label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {images.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[8px] opacity-0 group-hover:opacity-100 transition shadow">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition">
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4 text-gray-400" />
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Submit inside card */}
          <div className="p-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-600/25 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Yaratilmoqda...
                </span>
              ) : "\uD83D\uDCCB Buyurtma yaratish"}
            </button>
          </div>
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
