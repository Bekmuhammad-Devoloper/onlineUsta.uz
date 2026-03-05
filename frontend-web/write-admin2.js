const fs = require("fs");
const path = require("path");

function w(rel, code) {
  const full = path.join(__dirname, "src", rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, code, "utf-8");
  console.log("  ✅", rel);
}

// ============ SETTINGS PAGE ============
w("app/admin/settings/page.tsx", `"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Save, Pencil, Settings2, Info } from "lucide-react";

const settingLabels: Record<string, { label: string; desc: string; unit?: string }> = {
  daily_subscription_price: { label: "Kunlik obuna narxi", desc: "Ustalar uchun kunlik obuna to\\u2018lovi", unit: "so\\u2018m" },
  weekly_subscription_price: { label: "Haftalik obuna narxi", desc: "Ustalar uchun haftalik obuna to\\u2018lovi", unit: "so\\u2018m" },
  monthly_subscription_price: { label: "Oylik obuna narxi", desc: "Ustalar uchun oylik obuna to\\u2018lovi", unit: "so\\u2018m" },
  platform_commission: { label: "Platforma komissiyasi", desc: "Har bir buyurtmadan olinadigan foiz", unit: "%" },
  monthly_cancellation_limit: { label: "Oylik bekor qilish limiti", desc: "Usta oyiga necha marta bekor qila oladi", unit: "ta" },
  weekly_cancellation_limit: { label: "Haftalik bekor qilish limiti", desc: "Usta haftasiga necha marta bekor qila oladi", unit: "ta" },
  penalty_amount: { label: "Jarima summasi", desc: "Limitdan oshganda olinadigan jarima", unit: "so\\u2018m" },
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
      toast.success("Yangi sozlama qo\\u2018shildi!");
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
                  Oxirgi yangilanish: {s.updatedAt ? new Date(s.updatedAt).toLocaleString("uz-UZ", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "\\u2014"}
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
`);

// ============ DASHBOARD PAGE ============
w("app/admin/page.tsx", `"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import {
  Users, Wrench, ClipboardList, DollarSign, Clock,
  AlertTriangle, TrendingUp, CheckCircle2, XCircle, Zap,
  ArrowUpRight, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const monthNames: Record<string, string> = {
  "01": "Yan", "02": "Fev", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Iyun", "07": "Iyul", "08": "Avg",
  "09": "Sen", "10": "Okt", "11": "Noy", "12": "Dek",
};

export default function AdminDashboard() {
  const [d, setD] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/revenue/monthly?months=12"),
    ]).then(([dash, rev]) => {
      setD(dash.data);
      const reversed = (rev.data || []).reverse().map((item: any) => {
        const parts = item.month.split("-");
        return {
          ...item,
          name: monthNames[parts[1]] || parts[1],
          revenue: Number(item.revenue) || 0,
          completedOrders: item.completedOrders || 0,
        };
      });
      setRevenueData(reversed);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><LoadingSpinner /></div>;

  const stats = [
    { label: "Foydalanuvchilar", value: d?.users?.total || 0, icon: Users, gradient: "from-blue-500 to-blue-600" },
    { label: "Ustalar", value: d?.masters?.total || 0, sub: (d?.masters?.verified || 0) + " tasdiqlangan", icon: Wrench, gradient: "from-emerald-500 to-emerald-600" },
    { label: "Buyurtmalar", value: d?.orders?.total || 0, sub: (d?.orders?.today || 0) + " bugun", icon: ClipboardList, gradient: "from-violet-500 to-violet-600" },
    { label: "Umumiy daromad", value: fmtMoney(d?.revenue?.total || 0), icon: DollarSign, gradient: "from-amber-500 to-orange-500" },
  ];

  const ordersPieData = [
    { name: "Bajarilgan", value: d?.orders?.completed || 0, color: "#22c55e" },
    { name: "Bekor qilingan", value: d?.orders?.cancelled || 0, color: "#ef4444" },
    { name: "Jarayonda", value: Math.max(0, (d?.orders?.total || 0) - (d?.orders?.completed || 0) - (d?.orders?.cancelled || 0)), color: "#f59e0b" },
  ].filter(x => x.value > 0);

  const totalRevenue = revenueData.reduce((s, r) => s + r.revenue, 0);
  const totalCompleted = revenueData.reduce((s, r) => s + r.completedOrders, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Boshqaruv paneli</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platformaning umumiy statistikasi va analitikasi</p>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 lg:p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className={"w-10 h-10 rounded-xl bg-gradient-to-br " + s.gradient + " flex items-center justify-center shadow-sm"}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            {s.sub && <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Oylik daromad dinamikasi
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Oxirgi 12 oy ichidagi to\\u2018lovlar</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Jami daromad</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{fmtMoney(totalRevenue)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Oylik daromad</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(d?.revenue?.monthly || 0)}</p>
            </div>
          </div>
        </div>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : v >= 1000 ? (v / 1000).toFixed(0) + "K" : String(v)} />
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "none", borderRadius: "12px", padding: "10px 14px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
                labelStyle={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}
                itemStyle={{ color: "#fff", fontSize: 13 }}
                formatter={(value: any) => [fmtMoney(Number(value)), "Daromad"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#gRev)" dot={false}
                activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Bajarilgan buyurtmalar
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Oylik statistika</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Jami</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{totalCompleted}</p>
            </div>
          </div>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "none", borderRadius: "12px", padding: "10px 14px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
                  labelStyle={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}
                  itemStyle={{ color: "#fff", fontSize: 13 }}
                  formatter={(value: any) => [value, "Buyurtmalar"]}
                />
                <Bar dataKey="completedOrders" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-violet-500" />
              Buyurtmalar taqsimoti
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Holat bo\\u2018yicha taqsimot</p>
          </div>
          <div className="w-full h-[220px] flex items-center">
            {ordersPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ordersPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                    {ordersPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1f2937", border: "none", borderRadius: "12px", padding: "10px 14px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}
                    itemStyle={{ color: "#fff", fontSize: 13 }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={8}
                    formatter={(value: string) => <span style={{ color: "#9ca3af", fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Ma\\u2018lumot yo\\u2018q</div>
            )}
          </div>
          {/* Pie legend numbers */}
          <div className="flex items-center justify-center gap-4 mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            {ordersPieData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.name}:</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Oylik buyurtmalar", value: d?.orders?.monthly || 0, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Bajarilgan", value: d?.orders?.completed || 0, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
          { label: "Bekor qilingan", value: d?.orders?.cancelled || 0, icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
          { label: "Online ustalar", value: d?.masters?.online || 0, icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10" },
          { label: "Ochiq shikoyatlar", value: d?.pending?.complaints || 0, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
          { label: "Qurilma so\\u2018rovlari", value: d?.pending?.deviceRequests || 0, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={"w-9 h-9 rounded-xl flex items-center justify-center " + m.bg}>
              <m.icon className={"w-[18px] h-[18px] " + m.color} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{m.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick action links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/admin/masters?isVerified=false", label: "Tasdiqlanmagan ustalar", emoji: "\\u23F3", color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-800" },
          { href: "/admin/complaints", label: "Ochiq shikoyatlar", emoji: "\\u26A0\\uFE0F", color: "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800" },
          { href: "/admin/orders", label: "Barcha buyurtmalar", emoji: "\\uD83D\\uDCCB", color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-800" },
          { href: "/admin/broadcast", label: "Xabar yuborish", emoji: "\\uD83D\\uDCE2", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800" },
        ].map((q, i) => (
          <Link key={i} href={q.href} className={q.color + " rounded-xl p-4 border font-semibold text-sm hover:shadow-md transition flex items-center gap-2"}>
            <span className="text-base">{q.emoji}</span>
            {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function fmtMoney(amount: number): string {
  if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + " mlrd";
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + " mln";
  if (amount >= 1000) return (amount / 1000).toFixed(0) + " ming";
  return amount.toLocaleString() + " so\\u2018m";
}
`);

console.log("\n✅ Dashboard + Settings pages written!");
