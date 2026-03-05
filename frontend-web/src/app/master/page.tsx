"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import {
  Wifi, WifiOff, Clock, CheckCircle2, Pin, ClipboardList,
  Package, BarChart3, UserCircle, Star, DollarSign, CreditCard,
  AlertTriangle, Hand, Camera, Upload,
} from "lucide-react";

import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { getCategoryGif } from "@/lib/categoryGifs";

export default function MasterHomePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) { router.replace("/auth/login"); return; }
    if (user && user.role !== "MASTER") { router.replace("/"); return; }
  }, [token, user, router]);

  useEffect(() => {
    api.get("/masters/stats")
      .then((r) => {
        setStats(r.data);
        setIsOnline(r.data.isOnline || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ==== DOIMIY GPS JOYLASHUV YUBORISH (har 30 soniyada) ====
  const geoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<{ lat: number; lon: number; time: number }>({ lat: 0, lon: 0, time: 0 });

  const sendLocation = useCallback((lat: number, lon: number) => {
    const now = Date.now();
    const last = lastSentRef.current;
    // 25 soniyadan kam oraliqda yubormaslik
    if (now - last.time < 25000 && Math.abs(lat - last.lat) < 0.0001 && Math.abs(lon - last.lon) < 0.0001) return;
    lastSentRef.current = { lat, lon, time: now };
    api.post("/masters/location", { latitude: lat, longitude: lon }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOnline || loading) return;

    // GPS watch boshlash
    if ("geolocation" in navigator) {
      // Birinchi marta joylashuvni olish
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );

      // Har 30 soniyada joylashuv yuborish
      geoIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
          () => {},
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }, 30000);

      // watchPosition ham qo'shamiz - harakat bo'lganda darhol
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true, maximumAge: 15000 }
      );
    }

    return () => {
      if (geoIntervalRef.current) clearInterval(geoIntervalRef.current);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isOnline, loading, sendLocation]);

  const toggleOnline = async () => {
    try {
      await api.patch("/masters/toggle-online", { isOnline: !isOnline });
      setIsOnline(!isOnline);
      toast.success(!isOnline ? "Online holatga o'tdingiz" : "Offline holatga o'tdingiz");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllarini yuklash mumkin");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const avatarUrl = uploadRes.data.url;
      await api.patch("/users/profile", { avatar: avatarUrl });
      // Refresh stats
      const r = await api.get("/masters/stats");
      setStats(r.data);
      toast.success("Rasm muvaffaqiyatli yuklandi!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Rasm yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  if (!token) return null;

  const subLabel = stats?.subscriptionType === "COMMISSION"
    ? "Komissiya (12%)"
    : stats?.subscriptionType === "DAILY"
      ? "Kunlik tarif"
      : stats?.subscriptionType === "WEEKLY"
        ? "Haftalik tarif"
        : stats?.subscriptionType === "MONTHLY"
          ? "Oylik tarif"
          : "—";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-5xl mx-auto px-4 py-6 pb-20">
        {loading ? <LoadingSpinner /> : (
          <>
            {/* Avatar required blocker */}
            {stats?.needsAvatar && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-100 dark:border-gray-800">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Rasm yuklash majburiy</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Usta sifatida ishlash uchun profil rasmingizni yuklashingiz shart. Mijozlar sizni ko&apos;rishi kerak.
                  </p>
                  <label className={`w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <Upload className="w-5 h-5" />
                    {uploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Salom, {user?.name}! <Hand className="w-6 h-6 text-yellow-500" /></h1>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  {stats?.category ? (
                    <>
                      <img src={getCategoryGif(stats.category.nameUz || stats.category.name)} alt="" className="w-5 h-5 object-contain" />
                      {stats.category.nameUz || stats.category.name}
                    </>
                  ) : "Usta paneli"}
                </p>
              </div>
              <button
                onClick={toggleOnline}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  isOnline ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {isOnline ? <><Wifi className="w-4 h-4" /> Online</> : <><WifiOff className="w-4 h-4" /> Offline</>}
              </button>
            </div>

            {/* Verification warning */}
            {stats && !stats.isVerified && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Hisobingiz hali tasdiqlanmagan. Admin tasdiqlashini kuting.
                </p>
              </div>
            )}

            {/* Active order */}
            {stats?.activeOrder && (
              <Link href={`/master/orders/${stats.activeOrder.id}`}
                className="block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-1 flex items-center gap-1.5"><Pin className="w-4 h-4" /> Faol buyurtma</p>
                <p className="text-gray-800 dark:text-gray-200 font-semibold">{stats.activeOrder.description}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Holat: {stats.activeOrder.status} → Batafsil ko&apos;rish</p>
              </Link>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Jami buyurtmalar</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalOrders || 0}</p>
                <p className="text-xs text-green-500 mt-0.5 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Tugallangan: {stats?.completedOrders || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Reyting</p>
                <p className="text-2xl font-bold text-yellow-500 flex items-center gap-1"><Star className="w-5 h-5" /> {stats?.rating?.toFixed(1) || "0.0"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stats?.totalReviews || 0} ta baho</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Daromad</p>
                <p className="text-2xl font-bold text-green-600">{Number(stats?.totalEarnings || 0).toLocaleString()} <span className="text-sm font-normal">so&apos;m</span></p>
                <p className="text-xs text-emerald-500 mt-0.5">Oylik: {Number(stats?.monthlyEarnings || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Obuna</p>
                <p className="text-lg font-bold text-blue-600">{subLabel}</p>
                {stats?.activeSubscription && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    gacha: {new Date(stats.activeSubscription.endDate).toLocaleDateString("uz")}
                  </p>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/master/available" className="bg-blue-600 text-white rounded-xl p-5 hover:bg-blue-700 transition">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Mavjud buyurtmalar</h3>
                <p className="text-blue-100 text-sm">Yangi ishlarni ko&apos;ring va qabul qiling</p>
              </Link>
              <Link href="/master/orders" className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 flex items-center gap-2"><Package className="w-5 h-5" /> Mening buyurtmalarim</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Qabul qilgan buyurtmalaringiz</p>
              </Link>
              <Link href="/master/stats" className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Statistika</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Batafsil statistika va tahlil</p>
              </Link>
              <Link href="/master/profile" className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 flex items-center gap-2"><UserCircle className="w-5 h-5" /> Profil</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Usta profilingizni boshqaring</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
