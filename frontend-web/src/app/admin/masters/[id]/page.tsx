"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCategoryGif } from "@/lib/categoryGifs";
import {
  ArrowLeft, UserCircle, Phone, MapPin, Calendar, Star, Wifi, WifiOff,
  CheckCircle2, XCircle, Clock, CreditCard, Shield, ShieldBan, ShieldCheck,
  Package, Wrench, DollarSign, AlertTriangle, FileText, Navigation,
  TrendingUp, Award, Eye, ChevronRight, Briefcase, Hash,
} from "lucide-react";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const statusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda", ACCEPTED: "Qabul qilingan", IN_PROGRESS: "Bajarilmoqda",
  COMPLETED: "Bajarilgan", CANCELLED: "Bekor qilingan", CONTRACT_SENT: "Shartnoma",
  PAYMENT_PENDING: "To'lov kutilmoqda", PAYMENT_DONE: "To'lov qilingan",
};
const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACCEPTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CONTRACT_SENT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  PAYMENT_PENDING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  PAYMENT_DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function AdminMasterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [master, setMaster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgTab, setImgTab] = useState<"front" | "back">("front");

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/masters/${id}/detail`).then(r => setMaster(r.data)).catch(() => toast.error("Usta topilmadi")).finally(() => setLoading(false));
  }, [id]);

  // Init map
  useEffect(() => {
    if (!master || !containerRef.current || mapRef.current) return;
    const loc = master.lastLocation;
    const userLoc = master.user;
    const lat = loc?.latitude || userLoc?.latitude || 41.3111;
    const lon = loc?.longitude || userLoc?.longitude || 69.2797;
    const hasLocation = !!(loc?.latitude || userLoc?.latitude);

    const map = L.map(containerRef.current, { zoomControl: false }).setView([lat, lon], hasLocation ? 15 : 10);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19,
    }).addTo(map);

    if (hasLocation) {
      const avatarUrl = master.user?.avatar;
      const masterIcon = L.divIcon({
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
        iconSize: [44, 44], iconAnchor: [22, 22],
      });
      const marker = L.marker([lat, lon], { icon: masterIcon }).addTo(map);
      const timeStr = loc?.timestamp ? new Date(loc.timestamp).toLocaleString("uz") : "—";
      marker.bindPopup(`<b>${master.user?.name || "Usta"}</b><br/>Oxirgi: ${timeStr}`);

      if (master.activeOrder?.latitude && master.activeOrder?.longitude) {
        const orderIcon = L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;justify-content:center;">
            <svg width="30" height="40" viewBox="0 0 40 52" fill="none"><path d="M20 0C8.954 0 0 8.954 0 20c0 14.667 20 32 20 32s20-17.333 20-32C40 8.954 31.046 0 20 0z" fill="#EF4444"/><circle cx="20" cy="20" r="7" fill="white"/></svg>
          </div>`,
          iconSize: [30, 40], iconAnchor: [15, 40],
        });
        L.marker([master.activeOrder.latitude, master.activeOrder.longitude], { icon: orderIcon }).addTo(map)
          .bindPopup(`<b>Buyurtma joyi</b><br/>${master.activeOrder.description?.slice(0, 50) || ""}`);
        L.polyline([[lat, lon], [master.activeOrder.latitude, master.activeOrder.longitude]], {
          color: "#2563EB", weight: 2, dashArray: "8, 6", opacity: 0.6,
        }).addTo(map);
        map.fitBounds([[lat, lon], [master.activeOrder.latitude, master.activeOrder.longitude]], { padding: [50, 50] });
      }
    }

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [master]);

  const handleVerify = async () => {
    try { await api.patch(`/admin/masters/${id}/verify`); toast.success("Tasdiqlandi!"); const r = await api.get(`/admin/masters/${id}/detail`); setMaster(r.data); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[60vh]"><LoadingSpinner /></div>;
  if (!master) return <div className="p-8 text-center text-gray-500">Usta topilmadi</div>;

  const u = master.user;
  const loc = master.lastLocation;
  const locTime = loc?.timestamp ? new Date(loc.timestamp).toLocaleString("uz") : null;
  const completionRate = master.orderStats?.total > 0
    ? Math.round((master.orderStats.completed / master.orderStats.total) * 100)
    : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Orqaga">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Usta profili</h1>
          <p className="text-sm text-gray-500">ID: {master.id?.slice(0, 8)}...</p>
        </div>
        <div className="flex gap-2">
          {!master.isVerified && (
            <button onClick={handleVerify} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-lg shadow-green-600/20">
              <CheckCircle2 className="w-4 h-4" /> Tasdiqlash
            </button>
          )}
          <button onClick={() => router.push(`/admin/users/${u?.id}`)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
            <Eye className="w-4 h-4" /> User profili
          </button>
        </div>
      </div>

      {/* Hero profile card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Gradient banner */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
          {/* Abstract pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>
          {/* Category badge */}
          {master.category && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-2">
              <img src={getCategoryGif(master.category.nameUz || master.category.name)} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span className="text-sm text-white font-semibold">{master.category.nameUz}</span>
            </div>
          )}
          {/* Online badge */}
          <div className="absolute top-4 left-4">
            {master.isOnline ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-green-500/80 backdrop-blur px-3 py-1.5 rounded-full shadow"><Wifi className="w-3.5 h-3.5" /> Online</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full"><WifiOff className="w-3.5 h-3.5" /> Offline</span>
            )}
          </div>
        </div>

        {/* Profile info section */}
        <div className="px-6 pb-6 -mt-14 sm:-mt-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden flex items-center justify-center">
                {u?.avatar ? (
                  <img src={u.avatar} alt={u.name || ""} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-16 h-16 text-gray-200 dark:text-gray-600" />
                )}
              </div>
              {master.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-3 border-white dark:border-gray-900 flex items-center justify-center shadow">
                  <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                </div>
              )}
            </div>

            {/* Name & badges */}
            <div className="flex-1 pb-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{u?.name || "Nomsiz"}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {master.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-400 px-2.5 py-1 rounded-lg"><ShieldCheck className="w-3.5 h-3.5" /> Tasdiqlangan</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-400 px-2.5 py-1 rounded-lg"><Clock className="w-3.5 h-3.5" /> Kutilmoqda</span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {(master.rating || 0).toFixed(1)} <span className="font-normal text-amber-500">({master.totalReviews || 0})</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-lg">
                  <Briefcase className="w-3.5 h-3.5" /> {master.subscriptionType}
                </span>
              </div>
              {master.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{master.bio}</p>}
              {master.services?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {master.services.map((s: string, i: number) => (
                    <span key={i} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center"><Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              <div><p className="text-[10px] text-blue-600/60 dark:text-blue-400/60 font-medium uppercase tracking-wider">Telefon</p><p className="text-sm font-bold text-blue-900 dark:text-blue-100">{u?.phone || "—"}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-900/30">
              <div className="w-10 h-10 bg-violet-500/10 dark:bg-violet-500/20 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
              <div><p className="text-[10px] text-violet-600/60 dark:text-violet-400/60 font-medium uppercase tracking-wider">Ro&apos;yxatdan</p><p className="text-sm font-bold text-violet-900 dark:text-violet-100">{new Date(master.createdAt).toLocaleDateString("uz")}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
              <div><p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60 font-medium uppercase tracking-wider">Obuna</p><p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{master.subscriptionType}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
              <div className="w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
              <div><p className="text-[10px] text-green-600/60 dark:text-green-400/60 font-medium uppercase tracking-wider">Daromad</p><p className="text-sm font-bold text-green-700 dark:text-green-300">{Number(master.orderStats?.earnings || 0).toLocaleString()} so&apos;m</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md transition">
          <Package className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{master.orderStats?.total || 0}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Jami buyurtmalar</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md transition">
          <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-600">{master.orderStats?.completed || 0}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Bajarilgan</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md transition">
          <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-600">{master.orderStats?.cancelled || 0}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Bekor qilingan</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md transition">
          <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{master.cancellationCount || 0}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Jarimalar</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md transition col-span-2 sm:col-span-1">
          <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Bajarish %</p>
        </div>
      </div>

      {/* ═══════ PASSPORT & BANK CARD — compact side by side ═══════ */}
      {((master.passportSeries || master.passportNumber) || (master.bankCardNumber || master.bankCardHolder)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {/* ── ID PASSPORT (compact) ── */}
          {(master.passportSeries || master.passportNumber) ? (
            <div className="rounded-xl overflow-hidden shadow-lg border border-[#1b4f7a]/20 dark:border-[#6aacda]/20 flex flex-col max-h-[260px]">
              {/* Header — compact */}
              <div className="relative bg-[#1b4f7a] px-3 py-1.5 overflow-hidden shrink-0">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                  <svg width="100%" height="100%" viewBox="0 0 300 40"><defs><pattern id="hdr-s" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><line x1="0" y1="0" x2="0" y2="10" stroke="white" strokeWidth="0.4" /></pattern></defs><rect width="300" height="40" fill="url(#hdr-s)" /></svg>
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <svg width="22" height="22" viewBox="0 0 100 100" className="shrink-0">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="#c9a042" strokeWidth="2.5" />
                      <circle cx="44" cy="35" r="10" fill="none" stroke="#c9a042" strokeWidth="1.8" />
                      <circle cx="48" cy="35" r="10" fill="#1b4f7a" stroke="none" />
                      <circle cx="44" cy="35" r="10" fill="none" stroke="#c9a042" strokeWidth="1.2" />
                      <polygon points="58,28 59.5,33 65,33 60.5,36.5 62,41.5 58,38 54,41.5 55.5,36.5 51,33 56.5,33" fill="#c9a042" />
                      <path d="M30 65 Q50 80 70 65" fill="none" stroke="#c9a042" strokeWidth="1.5" />
                    </svg>
                    <div>
                      <p className="text-[7px] text-[#c9a042] font-bold tracking-[0.1em] uppercase leading-none">O&apos;zbekiston Respublikasi</p>
                      <p className="text-[5.5px] text-[#8bb8d9] tracking-[0.06em] uppercase">Republic of Uzbekistan</p>
                    </div>
                  </div>
                  <p className="text-[7px] text-[#c9a042] font-semibold tracking-[0.1em] uppercase">Passport</p>
                </div>
              </div>

              {/* Sub-header */}
              <div className="bg-[#dcd3c0] dark:bg-[#3a342a] px-3 py-1 grid grid-cols-3 border-b border-[#c4b89e] dark:border-[#4a4030] shrink-0">
                <div><p className="text-[5px] text-[#7a6f5e] dark:text-[#a09580] uppercase tracking-widest">Turi</p><p className="text-[9px] font-bold text-[#1b4f7a] dark:text-[#6aacda] font-mono">P</p></div>
                <div><p className="text-[5px] text-[#7a6f5e] dark:text-[#a09580] uppercase tracking-widest">Kodi</p><p className="text-[9px] font-bold text-[#1b4f7a] dark:text-[#6aacda] font-mono">UZB</p></div>
                <div><p className="text-[5px] text-[#7a6f5e] dark:text-[#a09580] uppercase tracking-widest">Raqami</p><p className="text-[9px] font-bold text-[#1b4f7a] dark:text-[#6aacda] font-mono tracking-wider">{master.passportSeries || "AA"} {master.passportNumber || "0000000"}</p></div>
              </div>

              {/* Body — compact */}
              <div className="relative bg-[#eae3d5] dark:bg-[#2c2820] flex-1 min-h-0">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.04]">
                  <svg width="100%" height="100%" viewBox="0 0 300 200"><defs><pattern id="pp-s2" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.3" fill="#1b4f7a" /></pattern></defs><rect width="300" height="200" fill="url(#pp-s2)" /><circle cx="220" cy="100" r="50" fill="none" stroke="#1b4f7a" strokeWidth="8" /></svg>
                </div>
                <div className="relative z-10 px-3 py-1.5 flex gap-2">
                  {/* Photo — smaller */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-[60px] h-[78px] bg-[#d5cfc2] dark:bg-[#3a3428] border-[1.5px] border-[#1b4f7a]/25 dark:border-[#6aacda]/25 overflow-hidden relative shadow">
                      {imgTab === "front" && master.passportPhoto ? (
                        <img src={master.passportPhoto} alt="Passport" className="w-full h-full object-cover" />
                      ) : imgTab === "back" && master.passportPhotoBack ? (
                        <img src={master.passportPhotoBack} alt="Passport back" className="w-full h-full object-cover" />
                      ) : u?.avatar ? (
                        <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#c5bfb0] to-[#b5af9f] dark:from-[#4a4438] dark:to-[#3a3428]">
                          <UserCircle className="w-7 h-7 text-[#8a8070] dark:text-[#6a6050]" />
                        </div>
                      )}
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#1b4f7a]/30 pointer-events-none" />
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#1b4f7a]/30 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#1b4f7a]/30 pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#1b4f7a]/30 pointer-events-none" />
                    </div>
                    {(master.passportPhoto || master.passportPhotoBack) && (
                      <div className="flex gap-0.5 mt-1">
                        {master.passportPhoto && <button onClick={() => setImgTab("front")} className={`text-[5.5px] font-bold px-1 py-0.5 rounded-sm border transition ${imgTab === "front" ? "bg-[#1b4f7a] text-white border-[#1b4f7a]" : "bg-transparent text-[#1b4f7a] border-[#1b4f7a]/30 dark:text-[#6aacda] dark:border-[#6aacda]/30"}`}>OLD</button>}
                        {master.passportPhotoBack && <button onClick={() => setImgTab("back")} className={`text-[5.5px] font-bold px-1 py-0.5 rounded-sm border transition ${imgTab === "back" ? "bg-[#1b4f7a] text-white border-[#1b4f7a]" : "bg-transparent text-[#1b4f7a] border-[#1b4f7a]/30 dark:text-[#6aacda] dark:border-[#6aacda]/30"}`}>ORQA</button>}
                      </div>
                    )}
                  </div>
                  {/* Fields — tighter */}
                  <div className="flex-1 min-w-0 space-y-0.5 text-[9px]">
                    <div className="border-b border-[#c4b89e]/40 dark:border-[#4a4030] pb-0.5">
                      <p className="text-[5px] text-[#8a7e6a] dark:text-[#8a806a] uppercase tracking-[0.1em]">Familiyasi / Surname</p>
                      <p className="font-bold text-[#1a1a1a] dark:text-[#e0d8c8] uppercase">{(u?.name || "—").split(" ").slice(-1)[0]}</p>
                    </div>
                    <div className="border-b border-[#c4b89e]/40 dark:border-[#4a4030] pb-0.5">
                      <p className="text-[5px] text-[#8a7e6a] dark:text-[#8a806a] uppercase tracking-[0.1em]">Ismi / Given names</p>
                      <p className="font-bold text-[#1a1a1a] dark:text-[#e0d8c8] uppercase">{(u?.name || "—").split(" ").slice(0, -1).join(" ") || (u?.name || "—")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="border-b border-[#c4b89e]/40 dark:border-[#4a4030] pb-0.5">
                        <p className="text-[5px] text-[#8a7e6a] dark:text-[#8a806a] uppercase tracking-[0.1em]">Fuqaroligi</p>
                        <p className="font-bold text-[#1a1a1a] dark:text-[#e0d8c8] uppercase">UZB</p>
                      </div>
                      <div className="border-b border-[#c4b89e]/40 dark:border-[#4a4030] pb-0.5">
                        <p className="text-[5px] text-[#8a7e6a] dark:text-[#8a806a] uppercase tracking-[0.1em]">Tug&apos;ilgan</p>
                        <p className="font-bold text-[#1a1a1a] dark:text-[#e0d8c8] font-mono">{u?.birthYear || "—"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[5px] text-[#8a7e6a] dark:text-[#8a806a] uppercase tracking-[0.1em]">JSHIR / Personal No.</p>
                      <p className="font-bold text-[#1b4f7a] dark:text-[#6aacda] font-mono tracking-[0.16em]">{master.passportJSHIR || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MRZ — single line compact */}
              <div className="bg-[#f0ebe0] dark:bg-[#252018] px-3 py-1 border-t border-[#c4b89e] dark:border-[#4a4030] font-mono select-none shrink-0">
                <p className="text-[7px] text-[#4a4a4a]/35 dark:text-[#8a8070]/35 tracking-[0.12em] truncate">P&lt;UZB{(u?.name || "").split(" ").reverse().join("<<").replace(/\s/g, "<").toUpperCase()}{"<".repeat(Math.max(0, 30 - (u?.name || "").length))}</p>
                <p className="text-[7px] text-[#4a4a4a]/35 dark:text-[#8a8070]/35 tracking-[0.12em] truncate">{master.passportSeries || "AA"}{master.passportNumber || "0000000"}UZB{master.passportJSHIR?.slice(0, 10) || "0000000000"}{"<".repeat(8)}</p>
              </div>
            </div>
          ) : <div />}

          {/* ── HUMO BANK CARD (compact + Online Usta logo watermark) ── */}
          {(master.bankCardNumber || master.bankCardHolder) ? (
            <div className="relative rounded-xl overflow-hidden shadow-lg flex flex-col border border-[#1a5c72]/20 dark:border-[#2a7c92]/30 max-h-[260px]">
              {/* Teal base */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#14495e] via-[#1a5c72] to-[#0e3545]" />
              {/* Pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="hm-s2" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M30 4 Q50 4 50 24 Q50 44 30 52 Q10 44 10 24 Q10 4 30 4Z" fill="none" stroke="white" strokeWidth="0.6" />
                    <path d="M30 10 Q44 10 44 24 Q44 40 30 46 Q16 40 16 24 Q16 10 30 10Z" fill="none" stroke="white" strokeWidth="0.4" />
                    <circle cx="30" cy="25" r="4" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="400" fill="url(#hm-s2)" />
              </svg>
              {/* Light sweep */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.03] via-white/[0.06] to-transparent" />

              {/* ★ Online Usta Logo watermark ★ */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <img src="/logo.png" alt="" className="w-44 h-auto opacity-[0.07] object-contain select-none" draggable={false} />
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-between p-3.5">
                {/* Top: Chip + Contactless */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {/* Chip — smaller */}
                    <div className="relative w-[32px] h-[22px] rounded-[3px] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#e8c84a] via-[#d4af37] to-[#b8962a]" />
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 32 22">
                        <rect x="2" y="2" width="11" height="7" rx="1" fill="none" stroke="#a07c25" strokeWidth="0.6" />
                        <rect x="19" y="2" width="11" height="7" rx="1" fill="none" stroke="#a07c25" strokeWidth="0.6" />
                        <rect x="2" y="13" width="11" height="7" rx="1" fill="none" stroke="#a07c25" strokeWidth="0.6" />
                        <rect x="19" y="13" width="11" height="7" rx="1" fill="none" stroke="#a07c25" strokeWidth="0.6" />
                        <line x1="16" y1="3" x2="16" y2="19" stroke="#a07c25" strokeWidth="0.4" />
                        <line x1="3" y1="11" x2="29" y2="11" stroke="#a07c25" strokeWidth="0.4" />
                      </svg>
                    </div>
                    {/* Contactless — smaller */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/40">
                      <path d="M6 18.5a8 8 0 0 1 0-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M9.5 16a5 5 0 0 1 0-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M13 13.5a2 2 0 0 1 0-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-[7px] text-white/20 font-mono tracking-widest">{master.bankCardNumber?.slice(-4) || "0000"}</p>
                </div>

                {/* Number — smaller */}
                <div className="flex-1 flex items-center py-1.5">
                  <p className="text-base sm:text-lg font-mono font-semibold text-white tracking-[0.16em] drop-shadow-lg">
                    {master.bankCardNumber
                      ? master.bankCardNumber.replace(/(\d{4})/g, "$1 ").trim()
                      : "•••• •••• •••• ••••"}
                  </p>
                </div>

                {/* Bottom: Holder + Valid + HUMO */}
                <div className="flex items-end justify-between gap-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[5px] text-white/25 uppercase tracking-[0.14em] mb-0.5">Card Holder Name</p>
                    <p className="text-[10px] font-semibold text-white uppercase tracking-wider truncate drop-shadow">
                      {master.bankCardHolder || "— — —"}
                    </p>
                  </div>
                  <div className="shrink-0 text-center">
                    <p className="text-[4.5px] text-white/20 uppercase tracking-[0.1em] leading-tight">Valid</p>
                    <p className="text-[4.5px] text-white/20 uppercase tracking-[0.1em] leading-tight">Thru</p>
                    <p className="text-[10px] font-semibold text-white font-mono mt-0.5">••/••</p>
                  </div>
                  <div className="shrink-0 ml-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#d4af37]/15 blur-md rounded-md" />
                      <div className="relative bg-gradient-to-br from-[#d4af37] via-[#c9a042] to-[#a67c2e] rounded-md px-2 py-1 shadow-lg border border-[#e8c84a]/20">
                        <svg width="34" height="11" viewBox="0 0 34 11" className="drop-shadow">
                          <text x="0" y="10" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="10.5" fill="white" letterSpacing="0.6">HUMO</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : <div />}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Map + Active order */}
        <div className="space-y-5">
          {/* Location map */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                Joriy / Oxirgi joylashuv
              </h3>
              {locTime && <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md"><Clock className="w-3 h-3" /> {locTime}</span>}
            </div>
            <div ref={containerRef} className="h-64 lg:h-72 w-full" />
            {!loc && !u?.latitude && (
              <div className="px-5 py-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" /> Joylashuv ma&apos;lumoti hali mavjud emas
              </div>
            )}
          </div>

          {/* Active order */}
          {master.activeOrder && (
            <div onClick={() => router.push(`/admin/orders/${master.activeOrder.id}`)}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 cursor-pointer hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-white" /></div>
                <h3 className="font-bold text-blue-800 dark:text-blue-200 text-sm">Faol buyurtma</h3>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColors[master.activeOrder.status] || ""}`}>
                  {statusLabels[master.activeOrder.status] || master.activeOrder.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{master.activeOrder.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-blue-600/70 dark:text-blue-400/70">
                <span className="flex items-center gap-1"><UserCircle className="w-3 h-3" />{master.activeOrder.user?.name}</span>
                {master.activeOrder.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{master.activeOrder.address}</span>}
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Orders + Reviews */}
        <div className="space-y-5">
          {/* Recent orders */}
          {master.recentOrders?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-violet-600 dark:text-violet-400" /></div>
                  Oxirgi buyurtmalar
                </h3>
                <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{master.recentOrders.length} ta</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                {master.recentOrders.map((o: any) => (
                  <div key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{o.description}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{o.user?.name || "—"} • {o.category?.nameUz || "—"} • {new Date(o.createdAt).toLocaleDateString("uz")}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${statusColors[o.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 transition shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {master.reviews?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center"><Star className="w-4 h-4 text-amber-600 dark:text-amber-400" /></div>
                  Baholar
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span className="text-sm font-bold text-amber-600">{(master.rating || 0).toFixed(1)}</span>
                  <span className="text-[10px] text-gray-400">/ {master.totalReviews || 0}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[350px] overflow-y-auto">
                {master.reviews.map((r: any) => (
                  <div key={r.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.user?.name || "Anonim"}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">{r.comment}</p>}
                    <p className="text-[10px] text-gray-400 mt-1 ml-8">{new Date(r.createdAt).toLocaleDateString("uz")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscriptions */}
          {master.subscriptions?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center"><Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
                  Obunalar tarixi
                </h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {master.subscriptions.map((s: any) => (
                  <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.type}</p>
                      <p className="text-[10px] text-gray-400">{new Date(s.startDate).toLocaleDateString("uz")} — {new Date(s.endDate).toLocaleDateString("uz")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">{Number(s.price).toLocaleString()} so&apos;m</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
