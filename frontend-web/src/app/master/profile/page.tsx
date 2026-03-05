"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Hourglass, Wifi, Star, Pencil, ClipboardList,
  CheckCircle2, LogOut, Camera,
} from "lucide-react";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthProvider";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { getCategoryGif } from "@/lib/categoryGifs";

export default function MasterProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [services, setServices] = useState("");
  const [saving, setSaving] = useState(false);
  const [tariffs, setTariffs] = useState<any[]>([]);
  const [subscribing, setSubscribing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/users/profile"),
      api.get("/masters/tariffs").catch(() => ({ data: [] })),
    ])
      .then(([profileRes, tariffsRes]) => {
        setProfile(profileRes.data);
        setBio(profileRes.data.master?.bio || "");
        setServices(profileRes.data.master?.services?.join(", ") || "");
        setTariffs(tariffsRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/masters/profile", {
        bio: bio || undefined,
        services: services ? services.split(",").map((s: string) => s.trim()) : undefined,
      });
      toast.success("Profil yangilandi");
      setEditing(false);
      const res = await api.get("/users/profile");
      setProfile(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleSubscribe = async (tariffId: string) => {
    setSubscribing(true);
    try {
      await api.patch("/masters/subscription", { tariffId });
      toast.success("Obuna muvaffaqiyatli o'zgartirildi!");
      const res = await api.get("/users/profile");
      setProfile(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik");
    } finally {
      setSubscribing(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllarini yuklash mumkin");
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const avatarUrl = uploadRes.data.url;
      await api.patch("/users/profile", { avatar: avatarUrl });
      const res = await api.get("/users/profile");
      setProfile(res.data);
      toast.success("Profil rasmi yangilandi!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Rasm yuklashda xatolik");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><LoadingSpinner /></div>;

  const m = profile?.master;
  const subLabel = m?.subscriptionType === "COMMISSION"
    ? "Komissiya (12%)"
    : m?.subscriptionType === "DAILY"
      ? "Kunlik"
      : m?.subscriptionType === "WEEKLY"
        ? "Haftalik"
        : m?.subscriptionType === "MONTHLY"
          ? "Oylik"
          : m?.subscriptionType || "—";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Usta profili</h1>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-6">
            <label className="relative cursor-pointer group">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                  {profile?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </label>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{profile?.phone}</p>
              <div className="flex items-center gap-2 mt-1">
                {m?.isVerified ? (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Tasdiqlangan</span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Hourglass className="w-3 h-3" /> Tekshiruvda</span>
                )}
                {m?.isOnline && <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Wifi className="w-3 h-3" /> Online</span>}
              </div>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">O&apos;zingiz haqingizda</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  placeholder="Tajribangiz..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Xizmat turlari (vergul bilan)</label>
                <input type="text" value={services} onChange={(e) => setServices(e.target.value)}
                  placeholder="Kran ta'mirlash, Truba almashtirish"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition">
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button onClick={() => setEditing(false)} className="flex-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-semibold py-2 rounded-xl transition hover:bg-gray-200 dark:hover:bg-gray-700">
                  Bekor
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Kategoriya</span>
                <span className="text-gray-900 dark:text-white flex items-center gap-1.5">
                  {m?.category ? (
                    <>
                      <img src={getCategoryGif(m.category.nameUz || m.category.name)} alt="" className="w-5 h-5 object-contain" />
                      {m.category.nameUz || m.category.name}
                    </>
                  ) : m?.categoryName || "—"}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Reyting</span>
                <span className="text-yellow-500 font-medium flex items-center gap-1"><Star className="w-4 h-4" /> {m?.rating?.toFixed(1) || "0.0"} ({m?.totalReviews || 0})</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Jami buyurtmalar</span>
                <span className="text-gray-900 dark:text-white font-medium">{m?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Jami daromad</span>
                <span className="text-green-600 font-medium">{Number(m?.totalEarnings || 0).toLocaleString()} so&apos;m</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Oylik daromad</span>
                <span className="text-emerald-500 font-medium">{Number(m?.monthlyEarnings || 0).toLocaleString()} so&apos;m</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Obuna</span>
                <div className="text-right">
                  <span className="text-blue-600 font-medium">{subLabel}</span>
                  {m?.activeSubscription && (
                    <p className="text-xs text-gray-400">
                      {new Date(m.activeSubscription.endDate).toLocaleDateString("uz")} gacha
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Hudud</span>
                <span className="text-gray-900 dark:text-white">{profile?.location || "Belgilanmagan"}</span>
              </div>
              {m?.bio && (
                <div className="py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">Haqida</span>
                  <p className="text-gray-700 dark:text-gray-300">{m.bio}</p>
                </div>
              )}
              {m?.services?.length > 0 && (
                <div className="py-3">
                  <span className="text-gray-500 dark:text-gray-400 text-sm block mb-2">Xizmatlar</span>
                  <div className="flex flex-wrap gap-2">
                    {m.services.map((s: string, i: number) => (
                      <span key={i} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setEditing(true)} className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold py-2 rounded-xl transition hover:bg-blue-100 dark:hover:bg-blue-900/30 mt-2 flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4" /> Tahrirlash
              </button>
            </div>
          )}
        </div>

        {/* Tariffs section */}
        {tariffs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Mavjud tariflar</h2>
            <div className="space-y-3">
              {tariffs.map((t: any) => {
                const isActive = m?.activeSubscription?.tariffId === t.id || 
                  (!m?.activeSubscription?.tariffId && m?.subscriptionType === t.type);
                return (
                  <div key={t.id} className={`bg-white dark:bg-gray-900 rounded-xl p-4 border shadow-sm ${
                    isActive ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800" : "border-gray-100 dark:border-gray-800"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.description || t.type}</p>
                        <p className="text-lg font-bold text-green-600 mt-1">{Number(t.price).toLocaleString()} so&apos;m / {t.duration} kun</p>
                      </div>
                      {isActive ? (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Faol
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(t.id)}
                          disabled={subscribing}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition disabled:opacity-50"
                        >
                          {subscribing ? "..." : "Tanlash"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => { logout(); router.push("/auth/login"); }}
          className="w-full mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 font-semibold py-3 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Tizimdan chiqish
        </button>
      </main>
    </div>
  );
}
