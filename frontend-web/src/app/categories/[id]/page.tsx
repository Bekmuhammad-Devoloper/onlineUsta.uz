"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import {
  ArrowLeft, Star, MapPin, Phone, ChevronRight, CheckCircle2,
  Wrench, Zap, Paintbrush, Droplets, Wind, Tv, Hammer, Sparkles, UserCheck,
} from "lucide-react";
import { getCategoryGif } from "@/lib/categoryGifs";

interface Master {
  id: string;
  bio: string | null;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  isOnline: boolean;
  services: string[];
  user: { name: string; avatar: string | null; location: string | null };
}

interface CategoryDetail {
  id: string;
  name: string;
  nameUz: string;
  description: string | null;
  icon: string | null;
  _count?: { masters: number; orders: number };
}


const catColors: Record<string, { text: string; light: string; gradient: string }> = {
  "Santexnika": { text: "text-blue-600", light: "bg-blue-50", gradient: "from-blue-500 to-blue-600" },
  "Elektrik": { text: "text-yellow-600", light: "bg-yellow-50", gradient: "from-yellow-500 to-amber-600" },
  "Duradgor": { text: "text-amber-600", light: "bg-amber-50", gradient: "from-amber-500 to-amber-600" },
  "Konditsioner": { text: "text-cyan-600", light: "bg-cyan-50", gradient: "from-cyan-500 to-cyan-600" },
  "Qurilish": { text: "text-orange-600", light: "bg-orange-50", gradient: "from-orange-500 to-orange-600" },
  "Bo'yoqchi": { text: "text-pink-600", light: "bg-pink-50", gradient: "from-pink-500 to-pink-600" },
  "Maishiy texnika": { text: "text-purple-600", light: "bg-purple-50", gradient: "from-purple-500 to-purple-600" },
  "Tozalash": { text: "text-green-600", light: "bg-green-50", gradient: "from-green-500 to-green-600" },
  "Gazchi": { text: "text-red-600", light: "bg-red-50", gradient: "from-red-500 to-red-600" },
  "Uy ta'mirlash": { text: "text-indigo-600", light: "bg-indigo-50", gradient: "from-indigo-500 to-indigo-600" },
  "Deraza o'rnatish": { text: "text-sky-600", light: "bg-sky-50", gradient: "from-sky-500 to-sky-600" },
  "Tom yopish": { text: "text-stone-600", light: "bg-stone-50", gradient: "from-stone-500 to-stone-600" },
  "Plitka yotqizish": { text: "text-teal-600", light: "bg-teal-50", gradient: "from-teal-500 to-teal-600" },
  "Gipsokarton": { text: "text-slate-600", light: "bg-slate-50", gradient: "from-slate-500 to-slate-600" },
  "Suvoq ishlari": { text: "text-lime-600", light: "bg-lime-50", gradient: "from-lime-500 to-lime-600" },
  "Pol yotqizish": { text: "text-emerald-600", light: "bg-emerald-50", gradient: "from-emerald-500 to-emerald-600" },
  "Issiqlik tizimi": { text: "text-rose-600", light: "bg-rose-50", gradient: "from-rose-500 to-rose-600" },
  "Eshik o'rnatish": { text: "text-amber-600", light: "bg-amber-50", gradient: "from-amber-500 to-amber-600" },
  "Suv tozalash": { text: "text-cyan-600", light: "bg-cyan-50", gradient: "from-cyan-500 to-cyan-600" },
  "Kamera o'rnatish": { text: "text-violet-600", light: "bg-violet-50", gradient: "from-violet-500 to-violet-600" },
  "Devor qog'ozi": { text: "text-fuchsia-600", light: "bg-fuchsia-50", gradient: "from-fuchsia-500 to-fuchsia-600" },
  "Parda o'rnatish": { text: "text-pink-600", light: "bg-pink-50", gradient: "from-pink-400 to-pink-600" },
  "Payvandlash": { text: "text-orange-600", light: "bg-orange-50", gradient: "from-orange-500 to-red-600" },
  "Loyiha va smeta": { text: "text-blue-600", light: "bg-blue-50", gradient: "from-blue-400 to-blue-600" },
  "Hovuz qurilishi": { text: "text-sky-600", light: "bg-sky-50", gradient: "from-sky-400 to-blue-600" },
  // --- Qo'shimcha kategoriyalar ---
  "Kalit usta": { text: "text-amber-600", light: "bg-amber-50", gradient: "from-amber-500 to-yellow-600" },
  "Dezinfeksiya": { text: "text-red-600", light: "bg-red-50", gradient: "from-red-500 to-rose-600" },
  "Mebel yig'ish": { text: "text-amber-600", light: "bg-amber-50", gradient: "from-amber-400 to-amber-600" },
  "Ko'chirish": { text: "text-indigo-600", light: "bg-indigo-50", gradient: "from-indigo-500 to-indigo-700" },
  "Lift ta'mirlash": { text: "text-gray-600", light: "bg-gray-50", gradient: "from-gray-500 to-gray-700" },
  "Internet va tarmoq": { text: "text-blue-600", light: "bg-blue-50", gradient: "from-blue-500 to-cyan-600" },
  "Kompyuter ta'mirlash": { text: "text-violet-600", light: "bg-violet-50", gradient: "from-violet-500 to-purple-600" },
  "Telefon ta'mirlash": { text: "text-emerald-600", light: "bg-emerald-50", gradient: "from-emerald-500 to-teal-600" },
  "Avtomobil ta'mirlash": { text: "text-slate-600", light: "bg-slate-50", gradient: "from-slate-500 to-slate-700" },
  "Bog' ishlari": { text: "text-green-600", light: "bg-green-50", gradient: "from-green-500 to-emerald-600" },
};

const defaultColor = { text: "text-blue-600", light: "bg-blue-50", gradient: "from-blue-500 to-blue-600" };

// Services for each category type
const categoryServices: Record<string, string[]> = {
  "Santexnika": ["Truba ta'mirlash", "Kran o'rnatish", "Kanalizatsiya tozalash", "Suv isitgich o'rnatish", "Unitaz o'rnatish", "Suv filtr o'rnatish"],
  "Elektrik": ["Sim tortish", "Rozetka o'rnatish", "Elektr panel ta'mirlash", "LED yoritgich", "Avtomat o'rnatish", "Yerga ulash"],
  "Duradgor": ["Mebel yasash", "Eshik o'rnatish", "Deraza ta'mirlash", "Shkaf yasash", "Parket yotqizish", "Pol ta'mirlash"],
  "Konditsioner": ["Konditsioner o'rnatish", "Tozalash", "Freon to'ldirish", "Ta'mirlash", "Texnik xizmat", "Demontaj"],
  "Qurilish": ["G'isht terish", "Suvoq ishlari", "Tom yopish", "Fundament quyish", "Plitka yotqizish", "Fasad ishlari"],
  "Bo'yoqchi": ["Devor bo'yash", "Shpaklyovka", "Oboi yopish", "Dekorativ bo'yoq", "Fasad bo'yash", "Lak urish"],
  "Maishiy texnika": ["Kir yuvish mashinasi", "Muzlatgich ta'mir", "Televizor ta'mir", "Pech ta'mirlash", "Changyutgich ta'mir", "Quritgich ta'mir"],
  "Tozalash": ["Uy tozalash", "Ofis tozalash", "Oyna yuvish", "Gilam tozalash", "Fasad yuvish", "Chuqur tozalash"],
  "Gazchi": ["Gaz plitasi o'rnatish", "Gaz quvurlari", "Kotel o'rnatish", "Gaz uskunalari", "Texnik xizmat", "Diagnostika"],
  "Uy ta'mirlash": ["Kosmetik ta'mir", "Yevro remont", "To'liq ta'mirlash", "Dizayn loyiha", "Suvoq", "Bo'yash"],
  "Deraza o'rnatish": ["Plastik deraza", "Shisha almashtirish", "Balkon oynalash", "Deraza ta'mirlash", "Vitraj", "Jaluzlar"],
  "Tom yopish": ["Tom yopish", "Tom ta'mirlash", "Gidroizolyatsiya", "Suv oqishini to'xtatish", "Yomg'ir tarnov", "Issiqlik izolyatsiya"],
  "Plitka yotqizish": ["Pol plitka", "Devor plitka", "Mozaika", "Granit o'rnatish", "Marmar", "Keramogranit"],
  "Gipsokarton": ["Gips devor", "Gips shift", "Archa yasash", "Nisha", "Dekorativ ishlari", "Montaj"],
  "Suvoq ishlari": ["Devor suvoqi", "Dekorativ suvoq", "Fasad suvoqi", "Mexanizatsiyalashgan", "Shift suvoqi", "Tekislash"],
  "Pol yotqizish": ["Laminat", "Parket", "Linoleum", "Kovrolin", "Pol tekislash", "Styajka"],
  "Issiqlik tizimi": ["Radiator o'rnatish", "Pol isitish", "Kotel ta'mirlash", "Isitish tizimi", "Quvurlar", "Nasos"],
  "Payvandlash": ["Metall payvandlash", "Darvoza yasash", "Panjara", "To'r yasash", "Metall kesish", "Konstruktsiya"],
  "Hovuz qurilishi": ["Hovuz qurish", "Hovuz ta'mirlash", "Suv tozalash", "Hammom ishlari", "Filtr tizimi", "Gidroizolyatsiya"],
  // --- Qo'shimcha kategoriyalar ---
  "Eshik o'rnatish": ["Kirish eshigi", "Ichki eshiklar", "Shluz eshik", "Eshik ta'mirlash", "Qulf o'rnatish", "Furnitura almashtirish"],
  "Suv tozalash": ["Suv filtri o'rnatish", "Filtr almashtirish", "Suv yumshatgich", "Osmoz tizimi", "Suv tekshirish", "Texnik xizmat"],
  "Kamera o'rnatish": ["CCTV kamera", "IP kamera", "Wifi kamera", "DVR/NVR o'rnatish", "Kabel tortish", "Kamera ta'mirlash"],
  "Devor qog'ozi": ["Oboi yopish", "Vinil oboi", "Flizelin oboi", "Fotooboi", "Eski oboi yechish", "Devor tayyorlash"],
  "Parda o'rnatish": ["Parda krepleni", "Shtora o'rnatish", "Jaluzlar", "Roletka", "Karniz o'rnatish", "Parda tikish"],
  "Loyiha va smeta": ["Loyiha tuzish", "Smeta hisoblash", "3D vizualizatsiya", "Arxitektura", "Dizayn loyiha", "Texnik nazorat"],
  "Kalit usta": ["Qulf ochish", "Qulf almashtirish", "Kalit yasash", "Avtomobil qulfi", "Eshik qulfi", "Seyf ochish"],
  "Dezinfeksiya": ["Hasharot yo'qotish", "Sichqon yo'qotish", "Tarakan yo'qotish", "Virusga qarshi", "Bug' dezinfeksiya", "Profilaktika"],
  "Mebel yig'ish": ["Shkaf yig'ish", "Krovat yig'ish", "Oshxona mebeli", "Ofis mebeli", "Mebel ta'mirlash", "Mebel demontaji"],
  "Ko'chirish": ["Uy ko'chirish", "Ofis ko'chirish", "Yuk tashish", "Mebel ko'chirish", "Qadoqlash", "Yuk ortish"],
  "Lift ta'mirlash": ["Lift montaji", "Lift ta'mirlash", "Texnik xizmat", "Lift modernizatsiya", "Ehtiyot qismlar", "Shoshilinch ta'mir"],
  "Internet va tarmoq": ["Wifi o'rnatish", "Tarmoq sozlash", "Kabel tortish", "Router o'rnatish", "Server sozlash", "Tarmoq ta'mirlash"],
  "Kompyuter ta'mirlash": ["Kompyuter ta'mirlash", "Dastur o'rnatish", "Virus tozalash", "Qattiq disk almashtirish", "RAM kengaytirish", "Ekran ta'mir"],
  "Telefon ta'mirlash": ["Ekran almashtirish", "Batareya almashtirish", "Dasturiy ta'mir", "Suv tushgan telefon", "Kamera ta'mir", "Zaryadka port"],
  "Avtomobil ta'mirlash": ["Motor ta'mirlash", "Tormoz tizimi", "Moy almashtirish", "Elektr tizimi", "Kuzov ta'mirlash", "Diagnostika"],
  "Bog' ishlari": ["Daraxt kesish", "Gazon o'rnatish", "Gul ekish", "Sug'orish tizimi", "Landshaft dizayn", "Bog' tozalash"],
};

export default function CategoryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/categories/${id}`),
      api.get(`/categories/${id}/masters`),
    ])
      .then(([catRes, mastersRes]) => {
        setCategory(catRes.data);
        setMasters(mastersRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Kategoriya topilmadi</p>
      </div>
    );
  }

  const color = catColors[category.nameUz || ""] || defaultColor;
  const services = categoryServices[category.nameUz || ""] || [];

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        {/* Back button */}
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kategoriyalar
        </Link>

        {/* Category Header Card */}
        <div className={`bg-gradient-to-r ${color.gradient} rounded-2xl p-5 mb-5 text-white`}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white dark:bg-gray-900/20 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden">
              <img src={getCategoryGif(category.nameUz || category.name)} alt={category.nameUz || category.name} className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{category.nameUz || category.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
                {category._count && (
                  <>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      {category._count.masters} ta usta
                    </span>
                    <span>•</span>
                    <span>{category._count.orders} ta buyurtma</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {category.description && (
            <p className="mt-3 text-white/90 text-sm leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Services Section */}
        {services.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Xizmat turlari</h2>
            <div className="grid grid-cols-2 gap-2">
              {services.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800/80 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-gray-700"
                >
                  <CheckCircle2 className={`w-4 h-4 ${color.text} flex-shrink-0`} />
                  <span className="text-sm text-gray-800 dark:text-gray-100 font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Masters Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Eng yaxshi ustalar
            </h2>
            <span className="text-xs text-gray-400">
              Reyting bo&apos;yicha
            </span>
          </div>

          {masters.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Bu kategoriyada hozircha usta yo&apos;q</p>
              <p className="text-gray-400 text-sm mt-1">Tez orada ustalar qo&apos;shiladi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {masters.map((m, index) => (
                <Link
                  key={m.id}
                  href={`/masters/${m.id}`}
                  className="group block bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 hover:border-blue-200"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {m.user.avatar ? (
                        <img
                          src={m.user.avatar}
                          alt={m.user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(m.user.name)}
                        </div>
                      )}
                      {/* Online indicator */}
                      {m.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                      {/* Rank badge */}
                      {index < 3 && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-bold text-yellow-900 border border-yellow-500">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{m.user.name}</h3>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition flex-shrink-0" />
                      </div>

                      {/* Rating row */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.round(m.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-200 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({m.totalReviews} baho)</span>
                      </div>

                      {/* Location */}
                      {m.user.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {m.user.location}
                        </div>
                      )}

                      {/* Bio */}
                      {m.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 line-clamp-1">{m.bio}</p>
                      )}

                      {/* Services tags */}
                      {m.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.services.slice(0, 3).map((s, i) => (
                            <span
                              key={i}
                              className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-200 dark:border-blue-800"
                            >
                              {s}
                            </span>
                          ))}
                          {m.services.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                              +{m.services.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
