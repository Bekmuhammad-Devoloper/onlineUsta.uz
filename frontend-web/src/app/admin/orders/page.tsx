"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { getCategoryGif } from "@/lib/categoryGifs";
import {
  Search, Package, CheckCircle2, XCircle, Clock, ChevronRight,
  Loader2, DollarSign,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Kutilmoqda", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  ACCEPTED: { label: "Qabul qilingan", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 },
  IN_PROGRESS: { label: "Bajarilmoqda", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: Loader2 },
  COMPLETED: { label: "Bajarilgan", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  CANCELLED: { label: "Bekor qilingan", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  CONTRACT_SENT: { label: "Shartnoma", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", icon: Package },
  PAYMENT_PENDING: { label: "To'lov kutilmoqda", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: DollarSign },
  PAYMENT_DONE: { label: "To'lov qilingan", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: DollarSign },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  const fetchOrders = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    params.set("page", String(p));
    params.set("limit", "20");
    api.get(`/admin/orders?${params}`).then((r) => {
      setOrders(r.data.orders || []);
      setPagination(r.data.pagination || {});
      setPage(p);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const totalCount = pagination.total || orders.length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-500" /> Buyurtmalar
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Jami {totalCount} ta buyurtma</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setStatusFilter(""); setTimeout(() => fetchOrders(1), 0); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition ${!statusFilter ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
          Barchasi
        </button>
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button key={key} onClick={() => { setStatusFilter(key); setTimeout(() => fetchOrders(1), 0); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition inline-flex items-center gap-1 ${statusFilter === key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
              <Icon className="w-3 h-3" /> {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchOrders(1)}
            placeholder="Tavsif, buyurtmachi yoki usta qidirish..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
        </div>
        <button onClick={() => fetchOrders(1)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-1.5">
          <Search className="w-4 h-4" /> Qidirish
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Desktop table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Buyurtma</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Buyurtmachi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Usta</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kategoriya</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Narxi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Holat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Sana</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400">Buyurtmalar topilmadi</p>
                  </td></tr>
                ) : orders.map((o) => {
                  const st = statusConfig[o.status] || { label: o.status, color: "bg-gray-100 text-gray-600", icon: Clock };
                  const Icon = st.icon;
                  return (
                    <tr key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer group">
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{o.description}</p>
                        {o.address && <p className="text-[10px] text-gray-400 truncate mt-0.5">{o.address}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{o.user?.name || "—"}</p>
                        <p className="text-[10px] text-gray-400">{o.user?.phone || ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{o.master?.name || o.master?.user?.name || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        {o.category ? (
                          <div className="flex items-center gap-1.5">
                            <img src={getCategoryGif(o.category?.nameUz || "")} alt="" className="w-4 h-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            <span className="text-gray-600 dark:text-gray-400 text-xs">{o.category?.nameUz}</span>
                          </div>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {o.totalPrice ? (
                          <span className="text-sm font-semibold text-green-600">{Number(o.totalPrice).toLocaleString()}</span>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${st.color}`}>
                          <Icon className="w-3 h-3" /> {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString("uz")}</td>
                      <td className="px-2 py-3">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">Buyurtmalar topilmadi</p>
              </div>
            ) : orders.map((o) => {
              const st = statusConfig[o.status] || { label: o.status, color: "bg-gray-100 text-gray-600", icon: Clock };
              const Icon = st.icon;
              return (
                <div key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 cursor-pointer hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex-1 line-clamp-2">{o.description}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${st.color}`}>
                      <Icon className="w-2.5 h-2.5" /> {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{o.user?.name || "—"}</span>
                    <span>→</span>
                    <span>{o.master?.name || o.master?.user?.name || "Tayinlanmagan"}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-400">{o.category?.nameUz || "—"}</span>
                    <div className="flex items-center gap-2">
                      {o.totalPrice && <span className="font-semibold text-green-600">{Number(o.totalPrice).toLocaleString()} so&apos;m</span>}
                      <span className="text-gray-400">{new Date(o.createdAt).toLocaleDateString("uz")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">Jami: {pagination.total} | Sahifa {page}/{pagination.totalPages}</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => fetchOrders(page - 1)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">Oldingi</button>
                <button disabled={page >= pagination.totalPages} onClick={() => fetchOrders(page + 1)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">Keyingi</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
