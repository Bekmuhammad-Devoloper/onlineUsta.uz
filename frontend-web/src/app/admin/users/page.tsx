"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Search, ShieldBan, ShieldCheck, UserCircle, ChevronRight, Shield, Crown, UserCog } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [roleChanging, setRoleChanging] = useState<string | null>(null);
  const [roleModal, setRoleModal] = useState<{ user: any; open: boolean }>({ user: null, open: false });

  const fetchUsers = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    params.set("page", String(p));
    params.set("limit", "20");
    api.get(`/admin/users?${params}`).then((r) => {
      setUsers(r.data.users || []);
      setPagination(r.data.pagination || {});
      setPage(p);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBlock = async (id: string) => {
    if (!confirm("Bloklashni tasdiqlaysizmi?")) return;
    try { await api.patch(`/admin/users/${id}/block`); toast.success("Bloklandi"); fetchUsers(page); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleUnblock = async (id: string) => {
    try { await api.patch(`/admin/users/${id}/unblock`); toast.success("Blokdan chiqarildi"); fetchUsers(page); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    setRoleChanging(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Rol ${newRole} ga o'zgartirildi`);
      fetchUsers(page);
      setRoleModal({ user: null, open: false });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Rol o'zgartirishda xatolik");
    } finally {
      setRoleChanging(null);
    }
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
                  <tr key={u.id} onClick={() => router.push(`/admin/users/${u.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                          {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-5 h-5 text-gray-400" />}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{u.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : u.role === "MASTER" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${u.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : u.status === "BLOCKED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString("uz")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== "ADMIN" && (
                          <button onClick={(e) => { e.stopPropagation(); setRoleModal({ user: u, open: true }); }} title="Rolni o'zgartirish" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
                            <UserCog className="w-3.5 h-3.5" />Rol
                          </button>
                        )}
                        {u.role !== "ADMIN" && (u.status === "ACTIVE" ? (
                          <button onClick={(e) => { e.stopPropagation(); handleBlock(u.id); }} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"><ShieldBan className="w-3.5 h-3.5" />Bloklash</button>
                        ) : u.status === "BLOCKED" ? (
                          <button onClick={(e) => { e.stopPropagation(); handleUnblock(u.id); }} className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"><ShieldCheck className="w-3.5 h-3.5" />Ochish</button>
                        ) : null)}
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition" />
                      </div>
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

      {/* Role Change Modal */}
      {roleModal.open && roleModal.user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRoleModal({ user: null, open: false })}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Rolni o&apos;zgartirish</h3>
                <p className="text-sm text-gray-500">{roleModal.user.name || roleModal.user.phone}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Hozirgi rol: <span className="font-semibold text-gray-700 dark:text-gray-300">{roleModal.user.role}</span></p>

            <div className="space-y-2">
              {[
                { role: "USER", label: "Foydalanuvchi", desc: "Oddiy foydalanuvchi", icon: UserCircle, color: "gray" },
                { role: "MASTER", label: "Usta", desc: "Xizmat ko'rsatuvchi usta", icon: Shield, color: "blue" },
                { role: "ADMIN", label: "Administrator", desc: "To'liq boshqaruv huquqi", icon: Crown, color: "purple" },
              ].map((item) => {
                const isActive = roleModal.user.role === item.role;
                const Icon = item.icon;
                const colorMap: Record<string, string> = {
                  gray: "border-gray-200 dark:border-gray-700 hover:border-gray-400",
                  blue: "border-blue-200 dark:border-blue-800 hover:border-blue-500",
                  purple: "border-purple-200 dark:border-purple-800 hover:border-purple-500",
                };
                const activeColorMap: Record<string, string> = {
                  gray: "border-gray-500 bg-gray-50 dark:bg-gray-800",
                  blue: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
                  purple: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
                };
                const iconColorMap: Record<string, string> = {
                  gray: "text-gray-500",
                  blue: "text-blue-600 dark:text-blue-400",
                  purple: "text-purple-600 dark:text-purple-400",
                };
                return (
                  <button
                    key={item.role}
                    disabled={isActive || roleChanging === roleModal.user.id}
                    onClick={() => {
                      if (item.role === "ADMIN" && !confirm(`${roleModal.user.name || roleModal.user.phone} ni ADMIN qilmoqchimisiz? Bu to'liq boshqaruv huquqini beradi!`)) return;
                      handleChangeRole(roleModal.user.id, item.role);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${isActive ? activeColorMap[item.color] : colorMap[item.color]} ${isActive ? "cursor-default" : "cursor-pointer"} disabled:opacity-60`}
                  >
                    <Icon className={`w-5 h-5 ${iconColorMap[item.color]}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                    {isActive && <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Hozirgi</span>}
                    {roleChanging === roleModal.user.id && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setRoleModal({ user: null, open: false })}
              className="w-full mt-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition font-medium"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
