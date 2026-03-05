"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { getCategoryGif } from "@/lib/categoryGifs";
import { Search, CheckCircle2, XCircle, Star, ChevronRight, Wifi, WifiOff, UserCircle } from "lucide-react";

export default function AdminMastersPage() {
  const router = useRouter();
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verFilter, setVerFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchMasters = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (verFilter) params.set("isVerified", verFilter);
    params.set("page", String(p));
    params.set("limit", "20");
    api.get(`/admin/masters?${params}`).then((r) => {
      setMasters(r.data.masters || []);
      setPagination(r.data.pagination || {});
      setPage(p);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMasters(); }, []);

  const handleVerify = async (id: string) => {
    try { await api.patch(`/admin/masters/${id}/verify`); toast.success("Tasdiqlandi!"); fetchMasters(page); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { toast.error("Sabab kiriting"); return; }
    try { await api.patch(`/admin/masters/${id}/reject`, { reason: rejectReason }); toast.success("Rad etildi"); setRejectId(null); setRejectReason(""); fetchMasters(page); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ustalar boshqaruvi</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchMasters(1)}
            placeholder="Ism yoki telefon..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
        </div>
        <select value={verFilter} onChange={(e) => { setVerFilter(e.target.value); setTimeout(() => fetchMasters(1), 0); }} title="Tasdiqlash filtri"
          className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none text-gray-900 dark:text-white">
          <option value="">Barchasi</option>
          <option value="true">Tasdiqlangan</option>
          <option value="false">Kutilmoqda</option>
        </select>
        <button onClick={() => fetchMasters(1)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">Qidirish</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Usta</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Telefon</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kategoriya</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Reyting</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Holat</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {masters.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Ustalar topilmadi</td></tr>
                ) : masters.map((m) => (
                  <tr key={m.id} onClick={() => router.push(`/admin/masters/${m.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                            {m.user?.avatar ? <img src={m.user.avatar} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-5 h-5 text-gray-400" />}
                          </div>
                          {m.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{m.name || m.user?.name || "—"}</span>
                          {m.isOnline !== undefined && (
                            <span className={`ml-2 inline-flex items-center gap-0.5 text-[10px] ${m.isOnline ? "text-green-600" : "text-gray-400"}`}>
                              {m.isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.user?.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={getCategoryGif(m.category?.nameUz || m.category?.name || "")} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <span className="text-gray-700 dark:text-gray-300">{m.category?.nameUz || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-amber-600"><Star className="w-3.5 h-3.5 fill-amber-400" />{(m.rating || 0).toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {m.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3" />Tasdiqlangan</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-md">Kutilmoqda</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!m.isVerified && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleVerify(m.id); }} className="text-xs text-green-600 hover:text-green-700 font-medium">Tasdiqlash</button>
                            <button onClick={(e) => { e.stopPropagation(); setRejectId(m.id); setRejectReason(""); }} className="text-xs text-red-600 hover:text-red-700 font-medium">Rad etish</button>
                          </>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Reject modal */}
          {rejectId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Rad etish sababi</h3>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Sabab..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none resize-none text-gray-900 dark:text-white" />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleReject(rejectId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-xl transition">Rad etish</button>
                  <button onClick={() => setRejectId(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 rounded-xl transition">Bekor</button>
                </div>
              </div>
            </div>
          )}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">Jami: {pagination.total} | Sahifa {page}/{pagination.totalPages}</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => fetchMasters(page - 1)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">Oldingi</button>
                <button disabled={page >= pagination.totalPages} onClick={() => fetchMasters(page + 1)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">Keyingi</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
