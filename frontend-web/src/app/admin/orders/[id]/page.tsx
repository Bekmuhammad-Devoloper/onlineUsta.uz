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
  ArrowLeft, UserCircle, Phone, MapPin, Calendar, Star, Clock,
  CheckCircle2, XCircle, Package, DollarSign, MessageSquare,
  AlertTriangle, Image as ImageIcon, CreditCard, Wrench, FileText,
  RefreshCw, Search, Users, Wifi,
} from "lucide-react";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Kutilmoqda", color: "text-yellow-700", bg: "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
  ACCEPTED: { label: "Qabul qilingan", color: "text-blue-700", bg: "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  IN_PROGRESS: { label: "Bajarilmoqda", color: "text-indigo-700", bg: "bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400" },
  COMPLETED: { label: "Bajarilgan", color: "text-green-700", bg: "bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Bekor qilingan", color: "text-red-700", bg: "bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
  CONTRACT_SENT: { label: "Shartnoma yuborilgan", color: "text-cyan-700", bg: "bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400" },
  PAYMENT_PENDING: { label: "To'lov kutilmoqda", color: "text-orange-700", bg: "bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
  PAYMENT_DONE: { label: "To'lov qilingan", color: "text-emerald-700", bg: "bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

const statusOrder = ["PENDING", "ACCEPTED", "CONTRACT_SENT", "IN_PROGRESS", "PAYMENT_PENDING", "PAYMENT_DONE", "COMPLETED"];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reassignment state
  const [showReassign, setShowReassign] = useState(false);
  const [reassignMasters, setReassignMasters] = useState<any[]>([]);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignSearch, setReassignSearch] = useState("");
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/orders/${id}/detail`).then(r => setOrder(r.data)).catch(() => toast.error("Buyurtma topilmadi")).finally(() => setLoading(false));
  }, [id]);

  // Open reassign modal — load masters from same category
  const openReassignModal = async () => {
    setShowReassign(true);
    setReassignLoading(true);
    setReassignSearch("");
    try {
      const params = new URLSearchParams();
      if (order?.categoryId) params.set("categoryId", order.categoryId);
      params.set("limit", "50");
      const res = await api.get(`/admin/masters?${params}`);
      setReassignMasters(res.data.masters || []);
    } catch {
      toast.error("Ustalar yuklanmadi");
    } finally {
      setReassignLoading(false);
    }
  };

  // Reassign order to new master
  const handleReassign = async (masterUserId: string) => {
    if (!confirm("Bu buyurtmani tanlangan ustaga tayinlashni tasdiqlaysizmi?")) return;
    setReassigning(true);
    try {
      await api.patch(`/admin/orders/${id}/assign`, { masterId: masterUserId });
      toast.success("Buyurtma muvaffaqiyatli qayta tayinlandi!");
      setShowReassign(false);
      // Reload order
      const res = await api.get(`/admin/orders/${id}/detail`);
      setOrder(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tayinlashda xatolik");
    } finally {
      setReassigning(false);
    }
  };

  // Map
  useEffect(() => {
    if (!order || !containerRef.current || mapRef.current) return;
    if (!order.latitude || !order.longitude) return;

    const map = L.map(containerRef.current, { zoomControl: false }).setView([order.latitude, order.longitude], 15);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19,
    }).addTo(map);

    L.marker([order.latitude, order.longitude]).addTo(map)
      .bindPopup(`<b>Buyurtma joyi</b><br/>${order.address || ""}`);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [order]);

  if (loading) return <div className="p-8"><LoadingSpinner /></div>;
  if (!order) return <div className="p-8 text-center text-gray-500">Buyurtma topilmadi</div>;

  const st = statusConfig[order.status] || { label: order.status, color: "text-gray-700", bg: "bg-gray-100" };
  const currentIdx = statusOrder.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Orqaga">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buyurtma tafsilotlari</h1>
          <p className="text-sm text-gray-500">ID: {order.id?.slice(0, 8)}...</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl ${st.bg}`}>{st.label}</span>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between overflow-x-auto">
            {statusOrder.map((s, i) => {
              const isDone = i <= currentIdx;
              const isCurrent = s === order.status;
              const cfg = statusConfig[s];
              return (
                <div key={s} className="flex items-center gap-0 flex-1 min-w-0 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isDone ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"} ${isCurrent ? "ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900" : ""}`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : (i + 1)}
                    </div>
                    <span className={`text-[9px] mt-1 text-center whitespace-nowrap ${isDone ? "text-indigo-600 font-semibold" : "text-gray-400"}`}>{cfg?.label || s}</span>
                  </div>
                  {i < statusOrder.length - 1 && <div className={`h-0.5 flex-1 mx-1 mt-[-14px] ${i < currentIdx ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"}`} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-700 dark:text-red-300">Buyurtma bekor qilingan</p>
            {order.cancellation?.reason && <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">Sabab: {order.cancellation.reason}</p>}
          </div>
          <button
            onClick={openReassignModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Qayta tayinlash
          </button>
        </div>
      )}

      {/* Description card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-violet-500" /> Buyurtma tavsifi</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{order.description}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(order.createdAt).toLocaleString("uz")}</span>
          {order.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {order.address}</span>}
          {order.region && <span className="flex items-center gap-1">📍 {order.region}</span>}
          {order.category && (
            <span className="flex items-center gap-1">
              <img src={getCategoryGif(order.category?.nameUz || "")} alt="" className="w-4 h-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              {order.category.nameUz}
            </span>
          )}
        </div>
      </div>

      {/* Order images */}
      {order.images?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-pink-500" /> Rasmlar</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {order.images.map((img: string, i: number) => (
              <img key={i} src={img} alt={`Rasm ${i + 1}`} className="h-40 rounded-xl border object-cover shrink-0" />
            ))}
          </div>
        </div>
      )}

      {/* Price & payment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-center">
          <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-600">{order.totalPrice ? Number(order.totalPrice).toLocaleString() : "—"}</p>
          <p className="text-xs text-gray-500 mt-1">Umumiy narx (so&apos;m)</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-center">
          <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{order.payments?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">To&apos;lovlar soni</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-center">
          <Star className="w-8 h-8 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{order.review?.rating || "—"}</p>
          <p className="text-xs text-gray-500 mt-1">Baho</p>
        </div>
      </div>

      {/* User & Master info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><UserCircle className="w-5 h-5 text-blue-500" /> Buyurtmachi</h3>
          {order.user ? (
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 py-2 rounded-lg transition" onClick={() => router.push(`/admin/users/${order.user.id}`)}>
              <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                {order.user.avatar ? <img src={order.user.avatar} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-6 h-6 text-gray-400" />}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{order.user.name || "Nomsiz"}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {order.user.phone || "—"}</p>
              </div>
            </div>
          ) : <p className="text-sm text-gray-400">Ma&apos;lumot yo&apos;q</p>}
        </div>

        {/* Master */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Wrench className="w-5 h-5 text-indigo-500" /> Usta</h3>
          {order.master ? (
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 py-2 rounded-lg transition" onClick={() => router.push(`/admin/masters/${order.master.id}`)}>
              <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                {order.master.user?.avatar ? <img src={order.master.user.avatar} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-6 h-6 text-gray-400" />}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{order.master.name || order.master.user?.name || "Nomsiz"}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {(order.master.rating || 0).toFixed(1)}
                  {order.master.category?.nameUz && <> • {order.master.category.nameUz}</>}
                </p>
              </div>
            </div>
          ) : <p className="text-sm text-gray-400">Usta hali tayinlanmagan</p>}
        </div>
      </div>

      {/* Location map */}
      {(order.latitude && order.longitude) && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-red-500" /> Buyurtma joylashuvi</h3>
          </div>
          <div ref={containerRef} className="h-64 w-full" />
        </div>
      )}

      {/* Payments */}
      {order.payments?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-500" /> To&apos;lovlar</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {order.payments.map((p: any) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{Number(p.amount).toLocaleString()} so&apos;m</p>
                  <p className="text-xs text-gray-500">{p.method || "—"}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${p.status === "COMPLETED" ? "bg-green-100 text-green-700" : p.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleString("uz")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review */}
      {order.review && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Baho va sharh</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">{Array.from({ length: order.review.rating }, (_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />)}</div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.review.rating}/5</span>
            <span className="text-xs text-gray-400">— {order.review.user?.name || "Anonim"}</span>
          </div>
          {order.review.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{order.review.comment}</p>}
        </div>
      )}

      {/* Complaints */}
      {order.complaints?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 dark:border-red-800">
            <h3 className="font-bold text-red-700 dark:text-red-300 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Shikoyatlar</h3>
          </div>
          <div className="divide-y divide-red-100 dark:divide-red-800">
            {order.complaints.map((c: any) => (
              <div key={c.id} className="px-5 py-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{c.reason}</p>
                {c.description && <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{c.description}</p>}
                <p className="text-[10px] text-red-400 mt-1">{c.fromUser?.name || "—"} • {new Date(c.createdAt).toLocaleString("uz")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {showReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowReassign(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-600" /> Boshqa ustaga tayinlash
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {order.category?.nameUz ? `Kategoriya: ${order.category.nameUz}` : "Barcha ustalar"}
              </p>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={reassignSearch}
                  onChange={(e) => setReassignSearch(e.target.value)}
                  placeholder="Usta nomi yoki telefon..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Masters list */}
            <div className="flex-1 overflow-y-auto">
              {reassignLoading ? (
                <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
              ) : reassignMasters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">Ustalar topilmadi</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {reassignMasters
                    .filter((m: any) => {
                      if (!reassignSearch) return true;
                      const q = reassignSearch.toLowerCase();
                      return (m.user?.name || m.name || "").toLowerCase().includes(q) || (m.user?.phone || "").includes(q);
                    })
                    .map((m: any) => (
                      <button
                        key={m.id}
                        onClick={() => handleReassign(m.userId)}
                        disabled={reassigning}
                        className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center gap-3 disabled:opacity-50"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                          {m.user?.avatar ? (
                            <img src={m.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.user?.name || m.name || "Nomsiz"}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{m.user?.phone || "—"}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-500" />{(m.rating || 0).toFixed(1)}</span>
                            {m.isOnline && <span className="flex items-center gap-1 text-green-600"><Wifi className="w-3 h-3" />Online</span>}
                          </div>
                        </div>
                        <div className="text-xs shrink-0">
                          {m.isVerified ? (
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-md font-semibold">Tasdiqlangan</span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-md font-semibold">Kutilmoqda</span>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <button
                onClick={() => setShowReassign(false)}
                className="w-full py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
