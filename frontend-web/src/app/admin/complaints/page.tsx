"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { MessageSquare, CheckCircle2 } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const fetchComplaints = () => {
    api.get("/admin/complaints").then((r) => setComplaints(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleResolve = async (id: string) => {
    if (!adminNote.trim()) { toast.error("Izoh kiriting"); return; }
    try { await api.patch(`/admin/complaints/${id}/resolve`, { adminNote }); toast.success("Hal qilindi"); setResolveId(null); setAdminNote(""); fetchComplaints(); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shikoyatlar</h1>

      {loading ? <LoadingSpinner /> : complaints.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Shikoyatlar yo&apos;q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white">{c.fromUser?.name || c.fromUser?.phone || "—"}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{c.againstUser?.name || c.againstUser?.phone || "—"}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{c.description}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-md shrink-0 ${c.status === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>{c.status === "PENDING" ? "Kutilmoqda" : "Hal qilingan"}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{new Date(c.createdAt).toLocaleString("uz")}</p>
              {c.adminNote && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-sm text-indigo-700 dark:text-indigo-400 mb-2">
                  <strong>Admin:</strong> {c.adminNote}
                </div>
              )}
              {c.status === "PENDING" && (
                resolveId === c.id ? (
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Admin izohi..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none text-gray-900 dark:text-white" />
                    <button onClick={() => handleResolve(c.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">Tasdiqlash</button>
                    <button onClick={() => { setResolveId(null); setAdminNote(""); }} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-xl text-sm transition">Bekor</button>
                  </div>
                ) : (
                  <button onClick={() => setResolveId(c.id)} className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium mt-1"><CheckCircle2 className="w-3.5 h-3.5" />Hal qilish</button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
