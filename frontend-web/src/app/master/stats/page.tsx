"use client";
import { useEffect, useState } from "react";
import {
  Wifi, WifiOff, CheckCircle2, Clock, Star, Pin, MapPin,
  ShieldCheck, Hourglass,
} from "lucide-react";

import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { getCategoryGif } from "@/lib/categoryGifs";

export default function MasterStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/masters/stats").then((r) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><LoadingSpinner /></div>;

  const sub = stats?.activeSubscription;
  const subLabel = stats?.subscriptionType === "COMMISSION"
    ? "Komissiya (12%)"
    : stats?.subscriptionType === "DAILY"
      ? "Kunlik"
      : stats?.subscriptionType === "WEEKLY"
        ? "Haftalik"
        : stats?.subscriptionType === "MONTHLY"
          ? "Oylik"
          : stats?.subscriptionType || "—";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Statistika</h1>

        {/* Status */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            stats?.isOnline ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}>
            {stats?.isOnline ? <><Wifi className="w-3.5 h-3.5" /> Online</> : <><WifiOff className="w-3.5 h-3.5" /> Offline</>}
          </span>
          {stats?.isVerified ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Tasdiqlangan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Hourglass className="w-3.5 h-3.5" /> Tekshiruvda
            </span>
          )}
          {stats?.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              <img src={getCategoryGif(stats.category.nameUz || stats.category.name)} alt="" className="w-5 h-5 object-contain" />
              {stats.category.nameUz || stats.category.name}
            </span>
          )}
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Jami buyurtmalar</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalOrders || 0}</p>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-green-600 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> {stats?.completedOrders || 0}</span>
              <span className="text-blue-500 flex items-center gap-0.5"><Clock className="w-3 h-3" /> {stats?.pendingOrders || 0}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Reyting</p>
            <p className="text-3xl font-bold text-yellow-500 flex items-center gap-1"><Star className="w-6 h-6" /> {stats?.rating?.toFixed(1) || "0.0"}</p>
            <p className="text-xs text-gray-400 mt-1">{stats?.totalReviews || 0} ta baho</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Jami daromad</p>
            <p className="text-3xl font-bold text-green-600">{Number(stats?.totalEarnings || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400">so&apos;m</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Oylik daromad</p>
            <p className="text-3xl font-bold text-emerald-500">{Number(stats?.monthlyEarnings || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400">so&apos;m</p>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Bekor qilishlar</p>
            <p className="text-2xl font-bold text-red-500">{stats?.cancellationCount || 0}</p>
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              <span>Haftalik: <span className={`font-semibold ${(stats?.weeklyCancellations || 0) >= 3 ? "text-red-500" : "text-gray-600 dark:text-gray-300"}`}>{stats?.weeklyCancellations || 0}</span></span>
              <span>Oylik: <span className={`font-semibold ${(stats?.monthlyCancellations || 0) >= 10 ? "text-red-500" : "text-gray-600 dark:text-gray-300"}`}>{stats?.monthlyCancellations || 0}</span></span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Obuna turi</p>
            <p className="text-lg font-bold text-blue-600">{subLabel}</p>
            {sub && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(sub.startDate).toLocaleDateString("uz")} — {new Date(sub.endDate).toLocaleDateString("uz")}
              </p>
            )}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Baholar soni</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalReviews || 0}</p>
          </div>
        </div>

        {/* Active order */}
        {stats?.activeOrder && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-1.5"><Pin className="w-4 h-4" /> Faol buyurtma</p>
            <p className="text-gray-800 dark:text-gray-200 font-semibold">{stats.activeOrder.description}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Holat: {stats.activeOrder.status}</p>
          </div>
        )}

        {/* Region */}
        {stats?.region && (
          <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Hudud</p>
            <p className="text-gray-900 dark:text-white font-medium">{stats.region}</p>
          </div>
        )}
      </main>
    </div>
  );
}
