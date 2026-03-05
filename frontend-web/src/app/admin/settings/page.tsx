"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Pencil, Settings2, Info } from "lucide-react";

const settingLabels: Record<string, { label: string; desc: string; unit?: string }> = {
  daily_subscription_price: { label: "Kunlik obuna narxi", desc: "Ustalar uchun kunlik obuna to\u2018lovi", unit: "so\u2018m" },
  weekly_subscription_price: { label: "Haftalik obuna narxi", desc: "Ustalar uchun haftalik obuna to\u2018lovi", unit: "so\u2018m" },
  monthly_subscription_price: { label: "Oylik obuna narxi", desc: "Ustalar uchun oylik obuna to\u2018lovi", unit: "so\u2018m" },
  platform_commission: { label: "Platforma komissiyasi", desc: "Har bir buyurtmadan olinadigan foiz", unit: "%" },
  monthly_cancellation_limit: { label: "Oylik bekor qilish limiti", desc: "Usta oyiga necha marta bekor qila oladi", unit: "ta" },
  weekly_cancellation_limit: { label: "Haftalik bekor qilish limiti", desc: "Usta haftasiga necha marta bekor qila oladi", unit: "ta" },
  penalty_amount: { label: "Jarima summasi", desc: "Limitdan oshganda olinadigan jarima", unit: "so\u2018m" },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchSettings = () => {
    api.get("/admin/settings").then((r) => setSettings(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleUpdate = async (key: string) => {
    try {
      await api.put("/admin/settings", { key, value: editValue });
      toast.success("Saqlandi!");
      setEditKey(null);
      setEditValue("");
      fetchSettings();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleAddNew = async () => {
    if (!newKey) { toast.error("Kalit nomini kiriting"); return; }
    try {
      await api.put("/admin/settings", { key: newKey, value: newValue });
      toast.success("Yangi sozlama qo\u2018shildi!");
      setNewKey("");
      setNewValue("");
      setShowAddForm(false);
      fetchSettings();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const getInfo = (key: string) => settingLabels[key] || { label: key, desc: "", unit: "" };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Platforma sozlamalari</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Narxlar, komissiya va limitlarni boshqarish</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
          <Settings2 className="w-4 h-4" />
          {showAddForm ? "Yopish" : "Yangi sozlama"}
        </button>
      </div>

      {/* Add new setting */}
      {showAddForm && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4">
          <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 mb-3">Yangi sozlama qo&apos;shish</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)}
              placeholder="Kalit nomi (masalan: max_order_images)"
              className="flex-1 px-3 py-2.5 text-sm border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
            <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)}
              placeholder="Qiymat"
              className="flex-1 px-3 py-2.5 text-sm border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
            <button onClick={handleAddNew}
              className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition">
              <Save className="w-4 h-4" />Qo&apos;shish
            </button>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {settings.map((s: any) => {
            const info = getInfo(s.key);
            const isEditing = editKey === s.key;

            return (
              <div key={s.id || s.key}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{info.label}</h3>
                      {info.unit && (
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                          {info.unit}
                        </span>
                      )}
                    </div>
                    {info.desc && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />{info.desc}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 font-mono mt-1">{s.key}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleUpdate(s.key)}
                          autoFocus
                          className="w-32 px-3 py-2 text-sm border border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white font-semibold text-right" />
                        <button onClick={() => handleUpdate(s.key)}
                          className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditKey(null); setEditValue(""); }}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition hover:bg-gray-300 dark:hover:bg-gray-600 text-xs">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-gray-900 dark:text-white min-w-[60px] text-right">
                          {isNaN(Number(s.value)) ? s.value : Number(s.value).toLocaleString("uz")}
                        </span>
                        <button onClick={() => { setEditKey(s.key); setEditValue(s.value); }}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-2">
                  Oxirgi yangilanish: {s.updatedAt ? new Date(s.updatedAt).toLocaleString("uz-UZ", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "\u2014"}
                </p>
              </div>
            );
          })}

          {settings.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
              <Settings2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Hozircha sozlamalar yo&apos;q</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
