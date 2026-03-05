"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft, Phone, MapPin, Calendar, ShieldBan, ShieldCheck,
  Star, ClipboardList, CheckCircle2, XCircle, Bell, Clock,
  UserCircle, Wrench, Package, Wifi, WifiOff, Eye,
  TrendingUp, Hash, ChevronRight, Navigation,
} from "lucide-react";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const roleBadge: Record<string, string> = {
  ADMIN: "bg-white/20 text-white border border-white/30",
  MASTER: "bg-white/20 text-white border border-white/30",
  USER: "bg-white/20 text-white border border-white/30",
};
const statusBadge: Record<string, string> = {
  ACTIVE: "bg-emerald-400/20 text-emerald-100 border border-emerald-400/30",
  BLOCKED: "bg-red-400/20 text-red-100 border border-red-400/30",
  PENDING: "bg-amber-400/20 text-amber-100 border border-amber-400/30",
};
const orderStatusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda", ACCEPTED: "Qabul qilingan", IN_PROGRESS: "Bajarilmoqda",
  COMPLETED: "Bajarilgan", CANCELLED: "Bekor qilingan", CONTRACT_SENT: "Shartnoma",
  PAYMENT_PENDING: "To'lov kutilmoqda", PAYMENT_DONE: "To'lov qilingan",
};
const orderStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACCEPTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CONTRACT_SENT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  PAYMENT_PENDING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  PAYMENT_DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/users/${id}`).then(r => setUser(r.data)).catch(() => toast.error("Foydalanuvchi topilmadi")).finally(() => setLoading(false));
  }, [id]);

  // Init map when user data loaded
  useEffect(() => {
    if (!user || !mapContainerRef.current || mapRef.current) return;
    const lat = user.latitude;
    const lon = user.longitude;
    if (!lat || !lon) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([lat, lon], 15);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const avatarUrl = user.avatar;
    const userIcon = L.divIcon({
      className: "",
      html: avatarUrl
        ? `<div style="width:44px;height:44px;border-radius:50%;border:3px solid #2563EB;box-shadow:0 2px 10px rgba(37,99,235,0.4);overflow:hidden;background:white;">
            <img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />
          </div>`
        : `<div style="width:44px;height:44px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
    marker.bindPopup(`<b>${user.name || "Foydalanuvchi"}</b><br/>${user.location || ""}`);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [user]);

  const handleBlock = async () => {
    if (!confirm("Bloklashni tasdiqlaysizmi?")) return;
    try { await api.patch(`/admin/users/${id}/block`); toast.success("Bloklandi"); const r = await api.get(`/admin/users/${id}`); setUser(r.data); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };
  const handleUnblock = async () => {
    try { await api.patch(`/admin/users/${id}/unblock`); toast.success("Blokdan chiqarildi"); const r = await api.get(`/admin/users/${id}`); setUser(r.data); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[60vh]"><LoadingSpinner /></div>;
  if (!user) return <div className="p-8 text-center text-gray-500">Foydalanuvchi topilmadi</div>;

  const totalOrders = user.stats?.totalOrders || 0;
  const completedOrders = user.stats?.completedOrders || 0;
  const cancelledOrders = user.stats?.cancelledOrders || 0;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header navigation */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Orqaga">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Foydalanuvchi profili</h1>
          <p className="text-sm text-gray-500">ID: {user.id?.slice(0, 8)}...</p>
        </div>
        <div className="flex gap-2">
          {user.role !== "ADMIN" && (user.status === "ACTIVE" ? (
            <button onClick={handleBlock} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-red-600/20">
              <ShieldBan className="w-4 h-4" /> Bloklash
            </button>
          ) : user.status === "BLOCKED" ? (
            <button onClick={handleUnblock} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-green-600/20">
              <ShieldCheck className="w-4 h-4" /> Blokdan chiqarish
            </button>
          ) : null)}
          {user.master && (
            <button onClick={() => router.push(`/admin/masters/${user.master.id}`)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
              <Eye className="w-4 h-4" /> Usta profili
            </button>
          )}
        </div>
      </div>

      {/* HERO PROFILE CARD */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Gradient banner with Online Usta logo */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>
          {/* Online Usta logo watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img src="/logo.png" alt="" className="w-60 sm:w-72 h-auto opacity-[0.12] select-none" draggable={false} />
          </div>
          {/* Role + Status badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md ${roleBadge[user.role] || roleBadge.USER}`}>{user.role}</span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md ${statusBadge[user.status] || statusBadge.ACTIVE}`}>{user.status === "ACTIVE" ? "Faol" : user.status === "BLOCKED" ? "Bloklangan" : user.status}</span>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/70" />
            <span className="text-xs text-white/80 font-medium">{new Date(user.createdAt).toLocaleDateString("uz")}</span>
          </div>
        </div>

        {/* Profile info below banner */}
        <div className="px-6 pb-6 -mt-14 sm:-mt-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <UserCircle className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white dark:border-gray-900 ${user.status === "ACTIVE" ? "bg-emerald-400" : user.status === "BLOCKED" ? "bg-red-400" : "bg-yellow-400"}`} />
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{user.name || "Nomsiz foydalanuvchi"}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" />{user.id?.slice(0, 8)}</span>
                {user.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{user.phone}</span>}
              </div>
            </div>
          </div>

          {/* Info grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg flex items-center justify-center"><Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              <div className="min-w-0"><p className="text-[11px] text-blue-600/60 dark:text-blue-400/60 font-medium uppercase tracking-wider">Telefon</p><p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.phone || "—"}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
              <div className="min-w-0"><p className="text-[11px] text-emerald-600/60 dark:text-emerald-400/60 font-medium uppercase tracking-wider">Joylashuv</p><p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.location || "Noma&apos;lum"}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-900/30">
              <div className="w-10 h-10 bg-violet-500/10 dark:bg-violet-400/10 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
              <div className="min-w-0"><p className="text-[11px] text-violet-600/60 dark:text-violet-400/60 font-medium uppercase tracking-wider">Ro&apos;yxatdan o&apos;tgan</p><p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString("uz")}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-400/10 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
              <div className="min-w-0"><p className="text-[11px] text-amber-600/60 dark:text-amber-400/60 font-medium uppercase tracking-wider">Oxirgi kirish</p><p className="text-sm font-bold text-gray-900 dark:text-white">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("uz") : "—"}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2"><ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-medium">Jami buyurtmalar</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <div className="w-11 h-11 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-2"><CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
          <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-medium">Bajarilgan</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500" />
          <div className="w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-2"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
          <p className="text-2xl font-bold text-red-600">{cancelledOrders}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-medium">Bekor qilingan</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-2"><TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
          <p className="text-2xl font-bold text-indigo-600">{completionRate}%</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-medium">Bajarish %</p>
        </div>
      </div>

      {/* LOCATION MAP */}
      {(user.latitude && user.longitude) && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center"><Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
              Oxirgi manzil
            </h3>
            <span className="text-xs text-gray-400">{user.location || ""}</span>
          </div>
          <div ref={mapContainerRef} className="h-64 sm:h-80 w-full z-0" />
        </div>
      )}

      {/* TWO-COLUMN: Master info + Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {user.master && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                  Usta profili
                </h3>
                <button onClick={() => router.push(`/admin/masters/${user.master.id}`)} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-0.5">Batafsil <ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Kategoriya</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.master.category?.nameUz || "—"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Reyting</p>
                    <p className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1"><Star className="w-4 h-4 fill-amber-400" />{(user.master.rating || 0).toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Holat</p>
                    <p className={`text-sm font-bold ${user.master.isVerified ? "text-green-600" : "text-yellow-600"}`}>{user.master.isVerified ? "Tasdiqlangan" : "Kutilmoqda"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Online</p>
                    <div className="flex items-center justify-center gap-1.5">
                      {user.master.isOnline ? (<><Wifi className="w-4 h-4 text-green-500" /><p className="text-sm font-bold text-green-600">Ha</p></>) : (<><WifiOff className="w-4 h-4 text-gray-400" /><p className="text-sm font-bold text-gray-400">Yo&apos;q</p></>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.notifications?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center"><Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" /></div>
                  Oxirgi bildirishnomalar
                  <span className="ml-auto text-xs font-normal bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">{user.notifications.length}</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-72 overflow-y-auto">
                {user.notifications.map((n: any) => (
                  <div key={n.id} className="px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? "bg-gray-300 dark:bg-gray-600" : "bg-blue-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                        {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(n.createdAt).toLocaleString("uz")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Orders */}
        <div className="space-y-5">
          {user.ordersAsUser?.length > 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-violet-600 dark:text-violet-400" /></div>
                  Oxirgi buyurtmalar
                  <span className="ml-auto text-xs font-normal bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-full">{user.ordersAsUser.length}</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[440px] overflow-y-auto">
                {user.ordersAsUser.map((o: any) => (
                  <div key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition group">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-gray-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{o.description || "Buyurtma"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{o.category?.nameUz || "—"} &bull; {new Date(o.createdAt).toLocaleDateString("uz")}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${orderStatusColors[o.status] || "bg-gray-100 text-gray-600"}`}>{orderStatusLabels[o.status] || o.status}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3"><Package className="w-7 h-7 text-gray-300 dark:text-gray-600" /></div>
              <p className="text-sm text-gray-500">Buyurtmalar mavjud emas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
