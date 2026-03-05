const fs = require("fs");
const path = require("path");

function w(rel, content) {
  const fp = path.join(__dirname, "src", ...rel.split("/"));
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content, "utf8");
  console.log("  ✅ " + rel);
}

// ========== 1. ADMIN LAYOUT (Sidebar) ==========
w("app/admin/layout.tsx", `"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useTheme } from "@/context/ThemeProvider";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Wrench, ClipboardList, LayoutGrid,
  AlertTriangle, Smartphone, Megaphone, Settings, LogOut,
  Moon, Sun, ChevronLeft, Menu, Shield,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/masters", label: "Ustalar", icon: Wrench },
  { href: "/admin/orders", label: "Buyurtmalar", icon: ClipboardList },
  { href: "/admin/categories", label: "Kategoriyalar", icon: LayoutGrid },
  { href: "/admin/complaints", label: "Shikoyatlar", icon: AlertTriangle },
  { href: "/admin/device-requests", label: "Qurilma so'rovlari", icon: Smartphone },
  { href: "/admin/broadcast", label: "Xabar yuborish", icon: Megaphone },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!token) { router.replace("/auth/login"); return; }
    if (user && user.role !== "ADMIN") { router.replace("/"); return; }
  }, [token, user, router]);

  if (!token) return null;

  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={\`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 \${collapsed ? "w-[68px]" : "w-64"} \${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}\`}>
        {/* Logo area */}
        <div className={\`flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800 \${collapsed ? "justify-center" : "justify-between"}\`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Online Usta</h1>
                <p className="text-[10px] text-gray-400 font-medium">ADMIN PANEL</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
          )}
          <button onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }} className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ChevronLeft className={\`w-4 h-4 transition-transform \${collapsed ? "rotate-180" : ""}\`} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={\`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all \${active ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}\`}
              >
                <Icon className={\`w-[18px] h-[18px] shrink-0 \${active ? "text-indigo-600 dark:text-indigo-400" : ""}\`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-2.5 space-y-0.5">
          <button onClick={toggleTheme} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition\`}>
            {theme === "dark" ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
            {!collapsed && <span>{theme === "dark" ? "Yorug' rejim" : "Qorong'u rejim"}</span>}
          </button>
          <button onClick={logout} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition\`}>
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">Admin Panel</span>
          </div>
          <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
`);

// ========== 2. DASHBOARD ==========
w("app/admin/page.tsx", `"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import {
  Users, Wrench, ClipboardList, DollarSign, Clock,
  AlertTriangle, TrendingUp, CheckCircle2, XCircle, Zap,
} from "lucide-react";

export default function AdminDashboard() {
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setD(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><LoadingSpinner /></div>;

  const stats = [
    { label: "Foydalanuvchilar", value: d?.users?.total || 0, icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
    { label: "Ustalar", value: d?.masters?.total || 0, sub: \`\${d?.masters?.verified || 0} tasdiqlangan\`, icon: Wrench, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Buyurtmalar", value: d?.orders?.total || 0, sub: \`\${d?.orders?.today || 0} bugun\`, icon: ClipboardList, color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10" },
    { label: "Daromad", value: Number(d?.revenue?.total || 0).toLocaleString() + " so'm", icon: DollarSign, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
  ];

  const metrics = [
    { label: "Oylik buyurtmalar", value: d?.orders?.monthly || 0, icon: TrendingUp, color: "text-blue-500" },
    { label: "Bajarilgan", value: d?.orders?.completed || 0, icon: CheckCircle2, color: "text-green-500" },
    { label: "Bekor qilingan", value: d?.orders?.cancelled || 0, icon: XCircle, color: "text-red-500" },
    { label: "Online ustalar", value: d?.masters?.online || 0, icon: Zap, color: "text-yellow-500" },
    { label: "Shikoyatlar", value: d?.pending?.complaints || 0, icon: AlertTriangle, color: "text-orange-500" },
    { label: "Qurilma so'rovlari", value: d?.pending?.deviceRequests || 0, icon: Clock, color: "text-indigo-500" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platformaning umumiy statistikasi</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${s.color}\`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            {s.sub && <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <m.icon className={\`w-5 h-5 \${m.color} shrink-0\`} />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{m.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/admin/masters?isVerified=false", label: "Tasdiqlanmagan ustalar", color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-800" },
          { href: "/admin/complaints", label: "Ochiq shikoyatlar", color: "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800" },
          { href: "/admin/orders", label: "Barcha buyurtmalar", color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-800" },
          { href: "/admin/broadcast", label: "Xabar yuborish", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800" },
        ].map((q, i) => (
          <Link key={i} href={q.href} className={\`\${q.color} rounded-xl p-4 border font-semibold text-sm hover:shadow-md transition\`}>
            {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
`);

// ========== 3. USERS ==========
w("app/admin/users/page.tsx", `"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  const fetchUsers = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    params.set("page", String(p));
    params.set("limit", "20");
    api.get(\`/admin/users?\${params}\`).then((r) => {
      setUsers(r.data.users || []);
      setPagination(r.data.pagination || {});
      setPage(p);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBlock = async (id: string) => {
    if (!confirm("Bloklashni tasdiqlaysizmi?")) return;
    try { await api.patch(\`/admin/users/\${id}/block\`); toast.success("Bloklandi"); fetchUsers(page); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleUnblock = async (id: string) => {
    try { await api.patch(\`/admin/users/\${id}/unblock\`); toast.success("Blokdan chiqarildi"); fetchUsers(page); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Foydalanuvchilar</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchUsers(1)}
            placeholder="Ism yoki telefon qidirish..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setTimeout(() => fetchUsers(1), 0); }} title="Rol filtri"
          className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white">
          <option value="">Barcha rollar</option>
          <option value="USER">USER</option>
          <option value="MASTER">MASTER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button onClick={() => fetchUsers(1)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">Qidirish</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ism</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Telefon</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Holat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Sana</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Foydalanuvchilar topilmadi</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.phone}</td>
                    <td className="px-4 py-3">
                      <span className={\`text-xs font-semibold px-2 py-1 rounded-md \${u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : u.role === "MASTER" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}\`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={\`text-xs font-semibold px-2 py-1 rounded-md \${u.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : u.status === "BLOCKED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}\`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString("uz")}</td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== "ADMIN" && (u.status === "ACTIVE" ? (
                        <button onClick={() => handleBlock(u.id)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"><ShieldBan className="w-3.5 h-3.5" />Bloklash</button>
                      ) : u.status === "BLOCKED" ? (
                        <button onClick={() => handleUnblock(u.id)} className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"><ShieldCheck className="w-3.5 h-3.5" />Ochish</button>
                      ) : null)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">Jami: {pagination.total} | Sahifa {page}/{pagination.totalPages}</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => fetchUsers(page - 1)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">Oldingi</button>
                <button disabled={page >= pagination.totalPages} onClick={() => fetchUsers(page + 1)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">Keyingi</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
`);

// ========== 4. MASTERS ==========
w("app/admin/masters/page.tsx", `"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { getCategoryGif } from "@/lib/categoryGifs";
import { Search, CheckCircle2, XCircle, Star } from "lucide-react";

export default function AdminMastersPage() {
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
    api.get(\`/admin/masters?\${params}\`).then((r) => {
      setMasters(r.data.masters || []);
      setPagination(r.data.pagination || {});
      setPage(p);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMasters(); }, []);

  const handleVerify = async (id: string) => {
    try { await api.patch(\`/admin/masters/\${id}/verify\`); toast.success("Tasdiqlandi!"); fetchMasters(page); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { toast.error("Sabab kiriting"); return; }
    try { await api.patch(\`/admin/masters/\${id}/reject\`, { reason: rejectReason }); toast.success("Rad etildi"); setRejectId(null); setRejectReason(""); fetchMasters(page); }
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
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{m.name || m.user?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{m.user?.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={getCategoryGif(m.category?.nameUz || m.category?.name || "")} alt="" className="w-5 h-5 object-contain" />
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
                      {!m.isVerified && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleVerify(m.id)} className="text-xs text-green-600 hover:text-green-700 font-medium">Tasdiqlash</button>
                          <button onClick={() => { setRejectId(m.id); setRejectReason(""); }} className="text-xs text-red-600 hover:text-red-700 font-medium">Rad etish</button>
                        </div>
                      )}
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
`);

// ========== 5. ORDERS ==========
w("app/admin/orders/page.tsx", `"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { getCategoryGif } from "@/lib/categoryGifs";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACCEPTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  const fetchOrders = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(p));
    params.set("limit", "20");
    api.get(\`/admin/orders?\${params}\`).then((r) => {
      setOrders(r.data.orders || []);
      setPagination(r.data.pagination || {});
      setPage(p);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buyurtmalar</h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setTimeout(() => fetchOrders(1), 0); }} title="Status filtri"
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl outline-none text-gray-900 dark:text-white">
          <option value="">Barchasi</option>
          <option value="PENDING">Kutilmoqda</option>
          <option value="ACCEPTED">Qabul qilingan</option>
          <option value="IN_PROGRESS">Bajarilmoqda</option>
          <option value="COMPLETED">Bajarilgan</option>
          <option value="CANCELLED">Bekor qilingan</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tavsif</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Buyurtmachi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Usta</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kategoriya</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Holat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Buyurtmalar topilmadi</td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{o.description}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{o.user?.name || o.user?.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{o.master?.name || "—"}</td>
                    <td className="px-4 py-3">
                      {o.category ? (
                        <div className="flex items-center gap-1.5">
                          <img src={getCategoryGif(o.category?.nameUz || "")} alt="" className="w-4 h-4 object-contain" />
                          <span className="text-gray-700 dark:text-gray-300 text-xs">{o.category?.nameUz || "—"}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={\`text-xs font-semibold px-2 py-1 rounded-md \${statusColors[o.status] || "bg-gray-100 text-gray-600"}\`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString("uz")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
`);

// ========== 6. CATEGORIES (already has GIF icons, just fix layout) ==========
w("app/admin/categories/page.tsx", `"use client";
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
      if (editId) { await api.patch(\`/admin/categories/\${editId}\`, body); toast.success("Yangilandi"); }
      else { await api.post("/admin/categories", body); toast.success("Yaratildi"); }
      resetForm(); fetchCategories();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleEdit = (cat: any) => { setEditId(cat.id); setNameUz(cat.nameUz); setName(cat.name); setIcon(cat.icon || ""); setShowForm(true); };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirmoqchimisiz?")) return;
    try { await api.delete(\`/admin/categories/\${id}\`); toast.success("O'chirildi"); fetchCategories(); }
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
`);

// ========== 7. COMPLAINTS (fix status PENDING not OPEN) ==========
w("app/admin/complaints/page.tsx", `"use client";
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
    try { await api.patch(\`/admin/complaints/\${id}/resolve\`, { adminNote }); toast.success("Hal qilindi"); setResolveId(null); setAdminNote(""); fetchComplaints(); }
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
                <span className={\`text-xs font-semibold px-2 py-1 rounded-md shrink-0 \${c.status === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}\`}>{c.status === "PENDING" ? "Kutilmoqda" : "Hal qilingan"}</span>
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
`);

// ========== 8. DEVICE REQUESTS ==========
w("app/admin/device-requests/page.tsx", `"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Smartphone } from "lucide-react";

export default function AdminDeviceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    api.get("/admin/device-requests").then((r) => setRequests(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id: string) => {
    try { await api.patch(\`/admin/device-requests/\${id}/approve\`); toast.success("Tasdiqlandi"); fetchRequests(); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rad etish sababi:");
    if (!reason) return;
    try { await api.patch(\`/admin/device-requests/\${id}/reject\`, { reason }); toast.success("Rad etildi"); fetchRequests(); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Qurilma o&apos;zgartirish so&apos;rovlari</h1>

      {loading ? <LoadingSpinner /> : requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">So&apos;rovlar yo&apos;q</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Usta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Eski qurilma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Yangi qurilma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Holat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Sana</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{req.master?.user?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">{req.oldDeviceId || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">{req.newDeviceId}</td>
                  <td className="px-4 py-3">
                    <span className={\`text-xs font-semibold px-2 py-1 rounded-md \${req.status === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : req.status === "APPROVED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}\`}>{req.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(req.createdAt).toLocaleDateString("uz")}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {req.status === "PENDING" && (
                      <>
                        <button onClick={() => handleApprove(req.id)} className="text-xs text-green-600 hover:text-green-700 font-medium">Tasdiqlash</button>
                        <button onClick={() => handleReject(req.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Rad etish</button>
                      </>
                    )}
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
`);

// ========== 9. BROADCAST ==========
w("app/admin/broadcast/page.tsx", `"use client";
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
`);

// ========== 10. SETTINGS ==========
w("app/admin/settings/page.tsx", `"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const fetchSettings = () => {
    api.get("/admin/settings").then((r) => setSettings(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    if (!key) { toast.error("Kalit kiriting"); return; }
    try { await api.put("/admin/settings", { key, value }); toast.success("Saqlandi"); setKey(""); setValue(""); fetchSettings(); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Platforma sozlamalari</h1>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Sozlama qo&apos;shish / yangilash</h3>
        <div className="flex gap-2">
          <input type="text" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Kalit (masalan: commission_rate)"
            className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
          <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Qiymat"
            className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
          <button onClick={handleSave} className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
            <Save className="w-4 h-4" />Saqlash
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kalit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Qiymat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Yangilangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {settings.map((s: any) => (
                <tr key={s.id || s.key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition" onClick={() => { setKey(s.key); setValue(s.value); }}>
                  <td className="px-4 py-3 font-medium font-mono text-sm text-gray-900 dark:text-white">{s.key}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.value}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.updatedAt ? new Date(s.updatedAt).toLocaleString("uz") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`);

console.log("\\n✅ All 10 admin files written successfully!");
