"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { getCategoryGif } from "@/lib/categoryGifs";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nameUz, setNameUz] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

  const fetchCategories = () => {
    api.get("/admin/categories").then((r) => setCategories(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => { setShowForm(false); setEditId(null); setNameUz(""); setName(""); setIcon(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUz) { toast.error("Kategoriya nomini kiriting"); return; }
    try {
      const body = { name: name || nameUz, nameUz, icon };
      if (editId) { await api.patch(`/admin/categories/${editId}`, body); toast.success("Yangilandi"); }
      else { await api.post("/admin/categories", body); toast.success("Yaratildi"); }
      resetForm(); fetchCategories();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleEdit = (cat: any) => { setEditId(cat.id); setNameUz(cat.nameUz); setName(cat.name); setIcon(cat.icon || ""); setShowForm(true); };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirmoqchimisiz?")) return;
    try { await api.delete(`/admin/categories/${id}`); toast.success("O'chirildi"); fetchCategories(); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kategoriyalar</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
          <Plus className="w-4 h-4" /> Yangi
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">{editId ? "Tahrirlash" : "Yangi kategoriya"}</h3>
              <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom (UZ) *</label>
              <input type="text" value={nameUz} onChange={(e) => setNameUz(e.target.value)} placeholder="Santexnika"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom (EN)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Plumbing"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emoji ikonka</label>
              <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🔧"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-xl transition">{editId ? "Yangilash" : "Yaratish"}</button>
              <button type="button" onClick={resetForm} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 rounded-xl transition">Bekor</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ikonka</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nom</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ustalar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Buyurtmalar</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-4 py-3"><img src={getCategoryGif(cat.nameUz || cat.name)} alt="" className="w-8 h-8 object-contain" /></td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{cat.nameUz}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{cat._count?.masters || 0}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{cat._count?.orders || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(cat)} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mr-3"><Pencil className="w-3 h-3" />Tahrir</button>
                    <button onClick={() => handleDelete(cat.id)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"><Trash2 className="w-3 h-3" />O'chirish</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
