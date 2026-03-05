"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { ChevronRight, Star, MapPin, Search } from "lucide-react";
import { getCategoryGif } from "@/lib/categoryGifs";

interface Category {
  id: string;
  name: string;
  nameUz: string;
  description: string | null;
  icon: string | null;
  _count?: { masters: number };
}

const colorPalette = [
  { text: "text-blue-600", border: "border-blue-200", light: "bg-blue-50", darkLight: "dark:bg-blue-950/40" },
  { text: "text-yellow-600", border: "border-yellow-200", light: "bg-yellow-50", darkLight: "dark:bg-yellow-950/40" },
  { text: "text-amber-600", border: "border-amber-200", light: "bg-amber-50", darkLight: "dark:bg-amber-950/40" },
  { text: "text-cyan-600", border: "border-cyan-200", light: "bg-cyan-50", darkLight: "dark:bg-cyan-950/40" },
  { text: "text-orange-600", border: "border-orange-200", light: "bg-orange-50", darkLight: "dark:bg-orange-950/40" },
  { text: "text-pink-600", border: "border-pink-200", light: "bg-pink-50", darkLight: "dark:bg-pink-950/40" },
  { text: "text-purple-600", border: "border-purple-200", light: "bg-purple-50", darkLight: "dark:bg-purple-950/40" },
  { text: "text-green-600", border: "border-green-200", light: "bg-green-50", darkLight: "dark:bg-green-950/40" },
  { text: "text-rose-600", border: "border-rose-200", light: "bg-rose-50", darkLight: "dark:bg-rose-950/40" },
  { text: "text-red-600", border: "border-red-200", light: "bg-red-50", darkLight: "dark:bg-red-950/40" },
  { text: "text-teal-600", border: "border-teal-200", light: "bg-teal-50", darkLight: "dark:bg-teal-950/40" },
  { text: "text-indigo-600", border: "border-indigo-200", light: "bg-indigo-50", darkLight: "dark:bg-indigo-950/40" },
  { text: "text-emerald-600", border: "border-emerald-200", light: "bg-emerald-50", darkLight: "dark:bg-emerald-950/40" },
  { text: "text-violet-600", border: "border-violet-200", light: "bg-violet-50", darkLight: "dark:bg-violet-950/40" },
  { text: "text-lime-600", border: "border-lime-200", light: "bg-lime-50", darkLight: "dark:bg-lime-950/40" },
  { text: "text-fuchsia-600", border: "border-fuchsia-200", light: "bg-fuchsia-50", darkLight: "dark:bg-fuchsia-950/40" },
  { text: "text-sky-600", border: "border-sky-200", light: "bg-sky-50", darkLight: "dark:bg-sky-950/40" },
];

function getCatColor(index: number) {
  return colorPalette[index % colorPalette.length];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/categories")
      .then((r) => setCategories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter((c) =>
    (c.nameUz || c.name).toLowerCase().includes(search.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xizmatlar</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kerakli xizmat turini tanlang</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Xizmat qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Hech narsa topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cat, idx) => {
              const color = getCatColor(idx);
              const masterCount = cat._count?.masters || 0;
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className={`group block bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border ${color.border} dark:border-gray-800 hover:-translate-y-0.5`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 ${color.light} ${color.darkLight} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden`}>
                      <img src={getCategoryGif(cat.nameUz || cat.name)} alt={cat.nameUz || cat.name} className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{cat.nameUz || cat.name}</h3>
                        <ChevronRight className="w-4.5 h-4.5 text-gray-300 group-hover:text-blue-500 transition flex-shrink-0" />
                      </div>
                      {cat.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 line-clamp-2">{cat.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {masterCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" /> {masterCount} ta usta
                          </span>
                        )}
                        {masterCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-yellow-500">
                            <Star className="w-3 h-3 fill-yellow-400" /> Reytingi yuqori
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
