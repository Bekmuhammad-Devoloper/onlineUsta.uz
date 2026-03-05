"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  Wrench, User, ArrowLeft, MapPin, Phone, CreditCard, IdCard,
  ChevronRight, ChevronDown, ShieldCheck, Briefcase, Calendar,
} from "lucide-react";
import { getCategoryGif } from "@/lib/categoryGifs";

interface Category {
  id: string;
  nameUz: string;
  name: string;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yuklanmoqda...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "master" ? "MASTER" : "USER";

  const [role, setRole] = useState<"USER" | "MASTER">(initialRole);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("+998");
  const [birthYear, setBirthYear] = useState("");
  // Master-specific
  const [categoryId, setCategoryId] = useState("");
  const [passportSeries, setPassportSeries] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportJSHIR, setPassportJSHIR] = useState("");
  const [bankCardNumber, setBankCardNumber] = useState("");
  const [bankCardHolder, setBankCardHolder] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("COMMISSION");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = role select, 2 = form
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const router = useRouter();
  const { sendOtp } = useAuth();

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Ismingizni kiriting");
    if (!/^\+998\d{9}$/.test(phone)) return toast.error("Telefon raqamini to'g'ri kiriting");
    if (role === "MASTER") {
      if (!categoryId) return toast.error("Kategoriyani tanlang");
      if (!passportSeries || !passportNumber) return toast.error("Pasport ma'lumotlarini kiriting");
      if (!passportJSHIR || passportJSHIR.length !== 14) return toast.error("JSHIR 14 raqam bo'lishi kerak");
      if (!bankCardNumber || bankCardNumber.replace(/\s/g, "").length < 16) return toast.error("Bank karta raqamini kiriting (16 raqam)");
      if (!bankCardHolder.trim()) return toast.error("Karta egasining ismini kiriting");
    }
    setLoading(true);
    try {
      // Store registration data in sessionStorage for after OTP
      const regData: Record<string, string> = { name, location, role };
      if (birthYear) regData.birthYear = birthYear;
      if (role === "MASTER") {
        regData.categoryId = categoryId;
        regData.passportSeries = passportSeries;
        regData.passportNumber = passportNumber;
        regData.passportJSHIR = passportJSHIR;
        regData.bankCardNumber = bankCardNumber.replace(/\s/g, "");
        regData.bankCardHolder = bankCardHolder.trim().toUpperCase();
        regData.subscriptionType = subscriptionType;
      }
      sessionStorage.setItem("regData", JSON.stringify(regData));

      const res = await sendOtp(phone);
      toast.success("SMS kod yuborildi!");
      // Backend returns OTP code — pass to OTP page via URL
      if (res?.code) {
        router.push(`/auth/otp?phone=${encodeURIComponent(phone)}&register=1&code=${res.code}`);
        return;
      }
      router.push(`/auth/otp?phone=${encodeURIComponent(phone)}&register=1`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-register.png')" }}
      />
      <div className="absolute inset-0 bg-black/25" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-full flex items-center justify-center">
              <img src="/logo.png" alt="Online Usta" width={56} height={40} className="object-contain h-10 w-auto drop-shadow-lg logo-white" />
            </div>
            <span className="font-bold text-xl text-white text-shadow-lg whitespace-nowrap">Online Usta</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          {/* ===== STEP 1: Role Selection ===== */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Ro&apos;yxatdan o&apos;tish</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">Kim sifatida ro&apos;yxatdan o&apos;tmoqchisiz?</p>

              <div className="space-y-3">
                {/* User option */}
                <button
                  onClick={() => { setRole("USER"); setStep(2); }}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left hover:border-blue-400 hover:bg-blue-50/40 ${
                    role === "USER" ? "border-blue-500 bg-blue-50/50" : "border-white/40 bg-white dark:bg-gray-900/30"
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">Foydalanuvchi</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">Usta chaqirish va xizmatlardan foydalanish</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Master option */}
                <button
                  onClick={() => { setRole("MASTER"); setStep(2); }}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left hover:border-orange-400 hover:bg-orange-50/40 ${
                    role === "MASTER" ? "border-orange-500 bg-orange-50/50" : "border-white/40 bg-white dark:bg-gray-900/30"
                  }`}
                >
                  <div className="w-12 h-12 bg-orange-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">Usta</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">Buyurtmalar qabul qilish va daromad olish</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
                Allaqachon hisobingiz bormi?{" "}
                <Link href="/auth/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                  Kirish
                </Link>
              </p>
            </div>
          )}

          {/* ===== STEP 2: Registration Form ===== */}
          {step === 2 && (
            <div className="p-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white mb-4 transition font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Orqaga
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm ${
                  role === "MASTER" ? "bg-orange-500/20 text-orange-600" : "bg-blue-500/20 text-blue-600"
                }`}>
                  {role === "MASTER" ? <Wrench className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {role === "MASTER" ? "Usta sifatida ro'yxatdan o'tish" : "Foydalanuvchi sifatida ro'yxatdan o'tish"}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Ma&apos;lumotlaringizni to&apos;ldiring</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">To&apos;liq ism *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alisher Karimov"
                      className="w-full pl-10 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Telefon raqami *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998901234567"
                      maxLength={13}
                      className="w-full pl-10 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Birth Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Tug&apos;ilgan yili</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <select
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      title="Tug'ilgan yilni tanlang"
                      className="w-full pl-10 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-900 dark:text-white"
                    >
                      <option value="">Yilni tanlang</option>
                      {Array.from({ length: 76 }, (_, i) => 2015 - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Manzil</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Toshkent, Yunusobod tumani"
                      className="w-full pl-10 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* ===== MASTER-SPECIFIC FIELDS ===== */}
                {role === "MASTER" && (
                  <>
                    <div className="border-t border-gray-300/50 pt-4 mt-2">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-bold text-gray-800">Usta ma&apos;lumotlari</span>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">Xizmat turi *</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                          className="w-full flex items-center gap-3 pl-3 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white text-left"
                        >
                          {categoryId ? (
                            <>
                              <img
                                src={getCategoryGif(categories.find((c) => c.id === categoryId)?.nameUz || "")}
                                alt=""
                                className="w-7 h-7 object-contain shrink-0"
                              />
                              <span className="flex-1 truncate">{categories.find((c) => c.id === categoryId)?.nameUz || categories.find((c) => c.id === categoryId)?.name}</span>
                            </>
                          ) : (
                            <>
                              <Briefcase className="w-5 h-5 text-gray-400 shrink-0" />
                              <span className="flex-1 text-gray-400">Kategoriyani tanlang</span>
                            </>
                          )}
                          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${catDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {catDropdownOpen && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                            {categories.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => { setCategoryId(c.id); setCatDropdownOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition text-left ${categoryId === c.id ? "bg-blue-50 dark:bg-gray-800" : ""}`}
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

                    {/* Passport */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Pasport seriya *</label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <input
                            type="text"
                            value={passportSeries}
                            onChange={(e) => setPassportSeries(e.target.value.toUpperCase())}
                            placeholder="AA"
                            maxLength={2}
                            className="w-full pl-10 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Pasport raqami *</label>
                        <input
                          type="text"
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value)}
                          placeholder="1234567"
                          maxLength={7}
                          className="w-full px-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* JSHIR */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">JSHIR *</label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <input
                          type="text"
                          value={passportJSHIR}
                          onChange={(e) => setPassportJSHIR(e.target.value.replace(/\D/g, ""))}
                          placeholder="14 raqamli JSHIR"
                          maxLength={14}
                          className="w-full pl-10 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* Bank card number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">Bank karta raqami *</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <input
                          type="text"
                          value={bankCardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                            setBankCardNumber(val.replace(/(\d{4})(?=\d)/g, "$1 "));
                          }}
                          placeholder="8600 1234 5678 9012"
                          maxLength={19}
                          className="w-full pl-10 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* Bank card holder */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">Karta egasining ismi *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <input
                          type="text"
                          value={bankCardHolder}
                          onChange={(e) => setBankCardHolder(e.target.value.toUpperCase())}
                          placeholder="ALISHER KARIMOV"
                          className="w-full pl-10 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* Obuna turi */}
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Obuna turi *</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "WEEKLY", label: "Haftalik", price: "50,000/hafta", emoji: "📅" },
                          { value: "MONTHLY", label: "Oylik", price: "150,000/oy", emoji: "🗓️" },
                          { value: "COMMISSION", label: "Foizli", price: "Har ishdan 12%", emoji: "💰" },
                        ].map((plan) => (
                          <button
                            key={plan.value}
                            type="button"
                            onClick={() => setSubscriptionType(plan.value)}
                            className={`text-left p-3 rounded-xl border-2 transition-all ${subscriptionType === plan.value ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-white/30 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 hover:border-white/60"}`}
                          >
                            <span className="text-lg">{plan.emoji}</span>
                            <p className="font-semibold text-gray-900 dark:text-white text-xs mt-1">{plan.label}</p>
                            <p className="text-orange-600 dark:text-orange-400 text-[10px] font-bold">{plan.price}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-white shadow-lg ${
                    role === "MASTER"
                      ? "bg-orange-500 hover:bg-orange-600 disabled:opacity-50 shadow-orange-500/30"
                      : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-blue-600/30"
                  }`}
                >
                  {loading ? "Yuborilmoqda..." : "SMS kod olish"}
                  {!loading && <ChevronRight className="w-4 h-4" />}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-5">
                Allaqachon hisobingiz bormi?{" "}
                <Link href="/auth/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                  Kirish
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
