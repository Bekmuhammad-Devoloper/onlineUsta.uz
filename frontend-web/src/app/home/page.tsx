"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import {
  ChevronRight, Star, Clock, ArrowRight, Search,
  LayoutGrid, ClipboardList, Bell, ShieldCheck,
} from "lucide-react";
import { getCategoryGif } from "@/lib/categoryGifs";

interface Category {
  id: string;
  name: string;
  nameUz: string;
  icon: string | null;
  _count?: { masters: number };
}

interface Order {
  id: string;
  description: string;
  status: string;
  createdAt: string;
  category?: { nameUz: string; name: string; icon: string | null };
}

const colorPalette = [
  { text: "text-blue-600", bg: "bg-blue-50", darkBg: "dark:bg-blue-950/40" },
  { text: "text-yellow-600", bg: "bg-yellow-50", darkBg: "dark:bg-yellow-950/40" },
  { text: "text-amber-600", bg: "bg-amber-50", darkBg: "dark:bg-amber-950/40" },
  { text: "text-cyan-600", bg: "bg-cyan-50", darkBg: "dark:bg-cyan-950/40" },
  { text: "text-orange-600", bg: "bg-orange-50", darkBg: "dark:bg-orange-950/40" },
  { text: "text-pink-600", bg: "bg-pink-50", darkBg: "dark:bg-pink-950/40" },
  { text: "text-purple-600", bg: "bg-purple-50", darkBg: "dark:bg-purple-950/40" },
  { text: "text-green-600", bg: "bg-green-50", darkBg: "dark:bg-green-950/40" },
  { text: "text-rose-600", bg: "bg-rose-50", darkBg: "dark:bg-rose-950/40" },
  { text: "text-red-600", bg: "bg-red-50", darkBg: "dark:bg-red-950/40" },
  { text: "text-teal-600", bg: "bg-teal-50", darkBg: "dark:bg-teal-950/40" },
  { text: "text-indigo-600", bg: "bg-indigo-50", darkBg: "dark:bg-indigo-950/40" },
  { text: "text-emerald-600", bg: "bg-emerald-50", darkBg: "dark:bg-emerald-950/40" },
  { text: "text-violet-600", bg: "bg-violet-50", darkBg: "dark:bg-violet-950/40" },
  { text: "text-lime-600", bg: "bg-lime-50", darkBg: "dark:bg-lime-950/40" },
  { text: "text-fuchsia-600", bg: "bg-fuchsia-50", darkBg: "dark:bg-fuchsia-950/40" },
  { text: "text-sky-600", bg: "bg-sky-50", darkBg: "dark:bg-sky-950/40" },
];

function getCatColor(index: number) {
  return colorPalette[index % colorPalette.length];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Kutilmoqda", color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "Qabul qilindi", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "Bajarilmoqda", color: "bg-indigo-100 text-indigo-700" },
  COMPLETED: { label: "Tugallandi", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Bekor qilindi", color: "bg-red-100 text-red-700" },
};

export default function HomePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/categories").catch(() => ({ data: [] })),
      api.get("/orders").catch(() => ({ data: [] })),
    ]).then(([catRes, ordRes]) => {
      setCategories(catRes.data);
      const orders = Array.isArray(ordRes.data) ? ordRes.data : ordRes.data?.data || [];
      setRecentOrders(orders.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Xayrli tong";
    if (h < 18) return "Xayrli kun";
    return "Xayrli kech";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting()}, {user?.name || "Foydalanuvchi"} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Bugun sizga qanday yordam bera olamiz?
          </p>
        </div>

        {/* Quick Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Xizmatlar</h2>
            <Link href="/categories" className="text-blue-600 text-sm font-medium flex items-center gap-0.5 hover:underline">
              Barchasi <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {categories.slice(0, 12).map((cat, idx) => {
              const color = getCatColor(idx);
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className={`w-14 h-14 ${color.bg} ${color.darkBg} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden`}>
                    <img src={getCategoryGif(cat.nameUz || cat.name)} alt={cat.nameUz || cat.name} className="w-9 h-9 object-contain" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium line-clamp-1">
                    {cat.nameUz || cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">So&apos;nggi buyurtmalar</h2>
              <Link href="/orders" className="text-blue-600 text-sm font-medium flex items-center gap-0.5 hover:underline">
                Barchasi <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentOrders.map((order) => {
                const st = statusLabels[order.status] || statusLabels.PENDING;
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block bg-white dark:bg-gray-900 rounded-2xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img src={getCategoryGif(order.category?.nameUz || order.category?.name || "")} alt="" className="w-5 h-5 object-contain" />
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {order.category?.nameUz || order.category?.name || "Buyurtma"}
                        </span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1">{order.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tezkor havolalar</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/categories"
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Kategoriyalar</p>
              <p className="text-gray-400 text-xs mt-0.5">{categories.length} ta xizmat turi</p>
            </Link>
            <Link
              href="/orders"
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-green-50 dark:bg-green-950/40 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5 text-green-600" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Buyurtmalar</p>
              <p className="text-gray-400 text-xs mt-0.5">Buyurtmalarni boshqarish</p>
            </Link>
            <Link
              href="/notifications"
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-950/40 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Xabarnomalar</p>
              <p className="text-gray-400 text-xs mt-0.5">Yangi xabarlar</p>
            </Link>
            <Link
              href="/become-master"
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Usta bo&apos;lish</p>
              <p className="text-gray-400 text-xs mt-0.5">Ariza topshirish</p>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <h3 className="font-semibold text-lg mb-3">Online Usta statistikasi</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{categories.length}+</p>
              <p className="text-blue-100 text-xs mt-0.5">Xizmat turi</p>
            </div>
            <div>
              <p className="text-2xl font-bold">100+</p>
              <p className="text-blue-100 text-xs mt-0.5">Ustalar</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-blue-100 text-xs mt-0.5">Reyting</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
