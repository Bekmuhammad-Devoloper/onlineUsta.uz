"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronDown } from "lucide-react";
import { getCategoryGif } from "@/lib/categoryGifs";

interface Category { id: string; nameUz: string; name: string; icon: string | null; }

export default function BecomeMasterPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [bio, setBio] = useState("");
  const [services, setServices] = useState("");
  const [passportSeries, setPassportSeries] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportJSHIR, setPassportJSHIR] = useState("");
  const [bankCardNumber, setBankCardNumber] = useState("");
  const [bankCardHolder, setBankCardHolder] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("COMMISSION");
  const [loading, setLoading] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { toast.error("Kategoriyani tanlang"); return; }
    if (!passportSeries || !passportNumber || !passportJSHIR) { toast.error("Pasport ma'lumotlarini kiriting"); return; }
    if (!bankCardNumber || !bankCardHolder) { toast.error("Bank karta ma'lumotlarini kiriting"); return; }

    setLoading(true);
    try {
      await api.post("/users/become-master", {
        categoryId,
        bio: bio || undefined,
        services: services ? services.split(",").map((s) => s.trim()) : undefined,
        passportSeries,
        passportNumber,
        passportJSHIR,
        bankCardNumber,
        bankCardHolder,
        subscriptionType,
      });
      toast.success("Ariza yuborildi! Admin tekshiruvidan so'ng tasdiqlanadi.");
      router.push("/profile");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 mb-4 block">← Orqaga</button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Usta bo&apos;lish uchun ariza</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategoriya *</label>
            <div className="relative" ref={catRef}>
              <button
                type="button"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left transition"
              >
                {categoryId ? (
                  <>
                    <img
                      src={getCategoryGif(categories.find((c) => c.id === categoryId)?.nameUz || "")}
                      alt=""
                      className="w-7 h-7 object-contain shrink-0"
                    />
                    <span className="flex-1 truncate font-medium text-gray-900 dark:text-white">
                      {categories.find((c) => c.id === categoryId)?.nameUz || categories.find((c) => c.id === categoryId)?.name}
                    </span>
                  </>
                ) : (
                  <span className="flex-1 text-gray-400">Kategoriyani tanlang...</span>
                )}
                <ChevronDown className={"w-4 h-4 text-gray-400 shrink-0 transition-transform " + (catDropdownOpen ? "rotate-180" : "")} />
              </button>
              {catDropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { setCategoryId(""); setCatDropdownOpen(false); }}
                    className={"w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition text-left border-b border-gray-100 dark:border-gray-800 " + (!categoryId ? "bg-blue-50 dark:bg-gray-800" : "")}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">O&apos;zingiz haqingizda</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tajribangiz, malakangiz..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Xizmat turlari (vergul bilan)</label>
            <input
              type="text"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="Kran ta'mirlash, Truba almashtirish"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Obuna turi */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Obuna turi *</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Qaysi turdagi obuna bilan ishlashni tanlang</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: "WEEKLY", label: "Haftalik", price: "50,000 so'm/hafta", desc: "Har hafta to'lov, cheksiz buyurtma", emoji: "📅" },
                { value: "MONTHLY", label: "Oylik", price: "150,000 so'm/oy", desc: "Eng arzon variant, oylik to'lov", emoji: "🗓️" },
                { value: "COMMISSION", label: "Foizli", price: "Har ishdan 12%", desc: "Oldindan to'lovsiz, ishdan foiz", emoji: "💰" },
              ].map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  onClick={() => setSubscriptionType(plan.value)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all ${subscriptionType === plan.value ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/30" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600"}`}
                >
                  {subscriptionType === plan.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                  <span className="text-xl mb-1 block">{plan.emoji}</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{plan.label}</p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">{plan.price}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-[11px] mt-1">{plan.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Pasport ma&apos;lumotlari</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seriya *</label>
                <input
                  type="text"
                  value={passportSeries}
                  onChange={(e) => setPassportSeries(e.target.value.toUpperCase())}
                  placeholder="AA"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raqami *</label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="1234567"
                  maxLength={7}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">JSHIR *</label>
              <input
                type="text"
                value={passportJSHIR}
                onChange={(e) => setPassportJSHIR(e.target.value)}
                placeholder="12345678901234"
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Bank karta</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Karta raqami *</label>
              <input
                type="text"
                value={bankCardNumber}
                onChange={(e) => setBankCardNumber(e.target.value)}
                placeholder="8600123456789012"
                maxLength={16}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Karta egasi *</label>
              <input
                type="text"
                value={bankCardHolder}
                onChange={(e) => setBankCardHolder(e.target.value.toUpperCase())}
                placeholder="ALISHER KARIMOV"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Yuborilmoqda..." : "Ariza yuborish"}
          </button>
        </form>
      </main>
    </div>
  );
}
