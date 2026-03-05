"use client";
import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) { toast.error("Sarlavha va matnni kiriting"); return; }
    setLoading(true);
    try {
      const res = await api.post("/admin/notifications/broadcast", { title, body, targetRole: targetRole || undefined });
      toast.success(res.data?.message || "Xabar yuborildi!");
      setTitle(""); setBody(""); setTargetRole("");
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ommaviy xabar yuborish</h1>

      <form onSubmit={handleSend} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sarlavha *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Yangilik sarlavhasi"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matn *</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Xabar matni..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kimga</label>
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} title="Maqsadli rol"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none text-gray-900 dark:text-white">
            <option value="">Hammaga</option>
            <option value="USER">Foydalanuvchilarga</option>
            <option value="MASTER">Ustalarga</option>
          </select>
        </div>
        <button type="submit" disabled={loading}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition">
          <Send className="w-4 h-4" />
          {loading ? "Yuborilmoqda..." : "Xabar yuborish"}
        </button>
      </form>
    </div>
  );
}
