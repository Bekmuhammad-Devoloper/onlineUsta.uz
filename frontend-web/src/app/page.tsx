"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthProvider";
import api from "@/lib/api";
import {
  ShieldCheck, Star, MapPin, ArrowRight, CheckCircle2, Users,
  ClipboardList, LogIn, UserPlus, Phone,
  Award, Menu, X,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  icon: string | null;
  _count?: { masters: number };
}

// Kategoriya nomiga mos GIF icon mapping
const categoryGifs: Record<string, string> = {
  "Santexnika": "/plumber.gif",
  "Elektrik": "/electric.gif",
  "Duradgor": "/carpentry.gif",
  "Konditsioner": "/air-conditioner.gif",
  "Qurilish": "/encryption.gif",
  "Bo'yoqchi": "/paint-roller.gif",
  "Gazchi": "/gas worker.gif",
  "Uy ta'mirlash": "/home repair.gif",
  "Deraza o'rnatish": "/window installation.gif",
  "Tom yopish": "/roofing.gif",
  "Plitka yotqizish": "/laying tiles.gif",
  "Gipsokarton": "/plasterboard.gif",
  "Suvoq ishlari": "/trowel.gif",
  "Pol yotqizish": "/floor laying.gif",
  "Issiqlik tizimi": "/heating system.gif",
  "Eshik o'rnatish": "/carpentry.gif",
  "Suv tozalash": "/water purification.gif",
  "Kamera o'rnatish": "/camera installation.gif",
  "Devor qog'ozi": "/wallpaper.gif",
  "Parda o'rnatish": "/curtain installation.gif",
  "Payvandlash": "/welding.gif",
  "Loyiha va smeta": "/project and estimate.gif",
  "Hovuz qurilishi": "/pool pennies.gif",
  "Maishiy texnika": "/home-appliance.gif",
  "Tozalash": "/cleaning.gif",
  "Kalit usta": "/encryption.gif",
  "Dezinfeksiya": "/cleaning.gif",
  "Mebel yig'ish": "/carpentry.gif",
  "Ko'chirish": "/home repair.gif",
  "Lift ta'mirlash": "/home repair.gif",
  "Internet va tarmoq": "/camera installation.gif",
  "Kompyuter ta'mirlash": "/home-appliance.gif",
  "Telefon ta'mirlash": "/home-appliance.gif",
  "Avtomobil ta'mirlash": "/home repair.gif",
  "Bog' ishlari": "/cleaning.gif",
};

function getCategoryGif(name: string): string {
  return categoryGifs[name] || "/home repair.gif";
}

const defaultServices = [
  { id: "santexnika", nameUz: "Santexnika", gif: "/plumber.gif", desc: "Kran, truba, kanalizatsiya" },
  { id: "elektrik", nameUz: "Elektrik", gif: "/electric.gif", desc: "Rozetka, simlar, avtomat" },
  { id: "konditsioner", nameUz: "Konditsioner", gif: "/air-conditioner.gif", desc: "O'rnatish, tozalash, ta'mirlash" },
  { id: "duradgor", nameUz: "Duradgor", gif: "/carpentry.gif", desc: "Eshik, mebel, yog'och ishlari" },
  { id: "qurilish", nameUz: "Qurilish", gif: "/encryption.gif", desc: "Ta'mirlash, suvoq, g'isht" },
  { id: "boyoqchi", nameUz: "Bo'yoqchi", gif: "/paint-roller.gif", desc: "Devor, shift, fasad bo'yash" },
  { id: "gazchi", nameUz: "Gazchi", gif: "/gas worker.gif", desc: "Gaz plita, kotel, quvur" },
  { id: "uyTamir", nameUz: "Uy ta'mirlash", gif: "/home repair.gif", desc: "Umumiy remont ishlari" },
];

const completedWorks = [
  { title: "Kran almashtirish", master: "Sardor U.", category: "Santexnika", rating: 5, location: "Toshkent, Chilonzor" },
  { title: "Rozetka o'rnatish", master: "Jasur K.", category: "Elektrik", rating: 5, location: "Toshkent, Yunusobod" },
  { title: "Devor bo'yash", master: "Rustam M.", category: "Remont", rating: 4, location: "Samarqand" },
  { title: "Konditsioner ta'mirlash", master: "Sherzod T.", category: "Konditsioner", rating: 5, location: "Toshkent, Mirzo Ulug'bek" },
  { title: "Truba tuzatish", master: "Otabek N.", category: "Santexnika", rating: 5, location: "Buxoro" },
  { title: "Qulf almashtirish", master: "Bobur A.", category: "Umumiy", rating: 4, location: "Namangan" },
];

const stats = [
  { label: "Ustalar", value: "500+", icon: "/plumber.gif" },
  { label: "Bajarilgan ishlar", value: "10,000+", icon: "/home repair.gif" },
  { label: "Shaharlarda", value: "14", icon: "/encryption.gif" },
  { label: "O'rtacha baho", value: "4.8", icon: "/electric.gif" },
];

export default function LandingPage() {
  const { user, token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Online Usta" className="object-contain h-9 w-auto logo-dark" />
            <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">Online Usta</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#categories" className="hover:text-blue-600 transition">Xizmatlar</a>
            <a href="#works" className="hover:text-blue-600 transition">Bajarilgan ishlar</a>
            <a href="#how" className="hover:text-blue-600 transition">Qanday ishlaydi</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {token && user ? (
              <Link href={user.role === "ADMIN" ? "/admin" : user.role === "MASTER" ? "/master" : "/home"} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                <ClipboardList className="w-4 h-4" />
                Kabinetga kirish
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-xl text-sm font-medium transition">
                  <LogIn className="w-4 h-4" /> Kirish
                </Link>
                <Link href="/auth/register" className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                  <UserPlus className="w-4 h-4" /> Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/95 backdrop-blur-lg pb-4 pt-2 px-4 space-y-1">
            <a href="#categories" onClick={() => setMobileMenu(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Xizmatlar</a>
            <a href="#works" onClick={() => setMobileMenu(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Bajarilgan ishlar</a>
            <a href="#how" onClick={() => setMobileMenu(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Qanday ishlaydi</a>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2 space-y-1">
              {token && user ? (
                <Link href={user.role === "ADMIN" ? "/admin" : user.role === "MASTER" ? "/master" : "/home"} onClick={() => setMobileMenu(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800">
                  <ClipboardList className="w-4 h-4" /> Kabinetga kirish
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenu(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <LogIn className="w-4 h-4" /> Kirish
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenu(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800">
                    <UserPlus className="w-4 h-4" /> Ro'yxatdan o'tish
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20 lg:py-28 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <ShieldCheck className="w-4 h-4" /> Ishonchli va tezkor xizmat
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 sm:mb-4">
              Ishonchli usta &mdash; <br />bir necha daqiqada
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 max-w-lg">
              O&apos;zbekiston bo&apos;ylab 500+ ta tasdiqlangan usta. Santexnik, elektrik, ta&apos;mirlovchi &mdash; har qanday muammoga yechim topamiz.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg shadow-blue-900/20 text-sm sm:text-base">
                Buyurtma berish <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/register?role=master" className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/25 transition border border-white/20 text-sm sm:text-base">
                <img src="/plumber.gif" alt="" className="w-5 h-5" /> Usta sifatida ishlash
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <img src={s.icon} alt={s.label} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section id="categories" className="bg-gray-50 dark:bg-gray-950 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Xizmat turlari</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">O&apos;zingizga kerakli sohani tanlang</p>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.id}`} className="group bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-200 text-center border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 rounded-2xl flex items-center justify-center transition overflow-hidden">
                    <img src={getCategoryGif(cat.nameUz || cat.name)} alt={cat.nameUz || cat.name} className="w-10 h-10 sm:w-11 sm:h-11 object-contain" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{cat.nameUz || cat.name}</h3>
                  {cat._count && <p className="text-xs text-gray-400 mt-1">{cat._count.masters} ta usta</p>}
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {defaultServices.map((svc) => (
                <Link key={svc.id} href="/categories" className="group bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mb-2 sm:mb-3 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 group-hover:from-blue-100 group-hover:to-indigo-100 rounded-2xl flex items-center justify-center transition overflow-hidden">
                    <img src={svc.gif} alt={svc.nameUz} className="w-10 h-10 sm:w-11 sm:h-11 object-contain" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm text-center">{svc.nameUz}</h3>
                  <p className="text-xs text-gray-400 mt-1 text-center">{svc.desc}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="bg-white dark:bg-gray-900 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Qanday ishlaydi?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">3 oddiy qadam</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: "01", gif: "/electric.gif", title: "Ro'yxatdan o'ting", desc: "Telefon raqamingiz bilan tez va oson ro'yxatdan o'ting" },
              { step: "02", gif: "/project and estimate.gif", title: "Buyurtma bering", desc: "Muammoni yozing, rasm yuklang va qulay vaqtni tanlang" },
              { step: "03", gif: "/plumber.gif", title: "Usta keladi", desc: "Tasdiqlangan usta sizning manzilingizga keladi va muammoni hal qiladi" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img src={item.gif} alt={item.title} className="w-14 h-14 object-contain" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Qadam {item.step}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPLETED WORKS ===== */}
      <section id="works" className="bg-gray-50 dark:bg-gray-950 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">So&apos;nggi bajarilgan ishlar</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Mijozlarimizning muvaffaqiyatli buyurtmalari</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {completedWorks.map((w, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tugallangan
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(w.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{w.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{w.category}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {w.master}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {w.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Tayyor? Hoziroq boshlang!</h2>
          <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-base">
            Ro&apos;yxatdan o&apos;ting va daqiqalar ichida ishonchli usta toping yoki o&apos;zingiz usta sifatida ishlang.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:bg-blue-50 transition shadow-lg text-sm sm:text-base">
              <UserPlus className="w-5 h-5" /> Ro&apos;yxatdan o&apos;tish
            </Link>
            <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:bg-white/25 transition border border-white/20 text-sm sm:text-base">
              <LogIn className="w-5 h-5" /> Kirish
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Online Usta" className="object-contain h-8 w-auto logo-white" />
            <span className="font-bold text-white">Online Usta</span>
          </div>
          <p className="text-sm text-center">&copy; 2026 Online Usta. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4 text-sm">
            <a href="#" className="hover:text-white transition">Foydalanish shartlari</a>
            <a href="#" className="hover:text-white transition">Aloqa</a>
          </div>
        </div>
      </footer>
    </div>
  );
}