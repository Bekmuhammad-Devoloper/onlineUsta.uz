"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthProvider";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  MapPin, Navigation, Pencil, Save, X, LogOut,
  ShieldCheck, User, Phone, Calendar, ChevronRight,
} from "lucide-react";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600" />
    </div>
  ),
});

const DEFAULT_LAT = 41.2995;
const DEFAULT_LNG = 69.2401;

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(DEFAULT_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_LNG);
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    api.get("/users/profile")
      .then((r) => {
        setProfile(r.data);
        setName(r.data.name || "");
        setLocation(r.data.location || "");
        if (r.data.latitude) setLatitude(r.data.latitude);
        if (r.data.longitude) setLongitude(r.data.longitude);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/users/profile", { name, location, latitude, longitude });
      toast.success("Profil yangilandi");
      setEditing(false);
      setShowMap(false);
      const res = await api.get("/users/profile");
      setProfile(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Brauzeringiz lokatsiyani qo'llab-quvvatlamaydi");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`
          );
          const data = await res.json();
          if (data.display_name) {
            setLocation(data.display_name);
          }
        } catch {}
        setLocating(false);
        toast.success("Lokatsiya aniqlandi!");
      },
      () => {
        setLocating(false);
        toast.error("Lokatsiyani aniqlash imkoni bo'lmadi");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapLocationChange = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`
      );
      const data = await res.json();
      if (data.display_name) {
        setLocation(data.display_name);
      }
    } catch {}
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profil</h1>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
              {profile?.name ? (
                <span className="text-2xl font-bold">{profile.name.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile?.name || "Foydalanuvchi"}</h2>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {profile?.phone}
              </p>
              <span className="inline-block mt-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {profile?.role === "MASTER" ? "Usta" : profile?.role === "ADMIN" ? "Admin" : "Foydalanuvchi"}
              </span>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ism</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ismingiz"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Manzil</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Manzilingiz"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleGetCurrentLocation} disabled={locating}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition text-sm">
                  <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
                  {locating ? "Aniqlanmoqda..." : "Hozirgi joy"}
                </button>
                <button onClick={() => setShowMap(!showMap)}
                  className={`flex-1 flex items-center justify-center gap-2 font-medium py-2.5 rounded-xl border transition text-sm ${showMap ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                  <MapPin className="w-4 h-4" />
                  {showMap ? "Xaritani yopish" : "Xaritada tanlash"}
                </button>
              </div>
              {showMap && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Xaritada bosib yoki markerni sudrab lokatsiyani tanlang</p>
                  <LocationPickerMap latitude={latitude} longitude={longitude} onLocationChange={handleMapLocationChange} />
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Kenglik: {latitude.toFixed(6)}</span>
                    <span>Uzunlik: {longitude.toFixed(6)}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition">
                  <Save className="w-4 h-4" />
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button onClick={() => { setEditing(false); setShowMap(false); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition hover:bg-gray-200 dark:hover:bg-gray-700">
                  <X className="w-4 h-4" />
                  Bekor qilish
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              <div className="flex justify-between items-center py-3.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Ism</span>
                <span className="text-gray-900 dark:text-white font-medium text-sm">{profile?.name || "\u2014"}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Telefon</span>
                <span className="text-gray-900 dark:text-white font-medium text-sm">{profile?.phone}</span>
              </div>
              <div className="flex justify-between items-start py-3.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Manzil</span>
                <span className="text-gray-900 dark:text-white font-medium text-sm text-right max-w-[60%]">{profile?.location || "\u2014"}</span>
              </div>
              {profile?.latitude && profile?.longitude && (
                <div className="flex justify-between items-center py-3.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Lokatsiya</span>
                  <span className="text-green-600 dark:text-green-400 font-medium text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Belgilangan
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-3.5">
                <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Ro'yxatdan
                </span>
                <span className="text-gray-900 dark:text-white font-medium text-sm">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("uz") : "\u2014"}</span>
              </div>
              <button onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold py-3 rounded-xl transition hover:bg-blue-100 dark:hover:bg-blue-950/50 mt-4">
                <Pencil className="w-4 h-4" /> Tahrirlash
              </button>
            </div>
          )}
        </div>

        {!editing && profile?.latitude && profile?.longitude && (
          <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Mening lokatsiyam
              </h3>
              <button onClick={() => { setEditing(true); setShowMap(true); }}
                className="text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-0.5">
                O'zgartirish <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="h-[200px]">
              <LocationPickerMap latitude={profile.latitude} longitude={profile.longitude} onLocationChange={() => {}} />
            </div>
          </div>
        )}

        {profile?.role === "USER" && !profile?.master && (
          <button onClick={() => router.push("/become-master")}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3.5 rounded-xl transition hover:opacity-90 shadow-lg shadow-blue-600/20">
            <ShieldCheck className="w-5 h-5" /> Usta bo&apos;lish
          </button>
        )}

        <button onClick={() => { logout(); router.push("/auth/login"); }}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold py-3 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/40 transition">
          <LogOut className="w-4 h-4" /> Tizimdan chiqish
        </button>
      </main>
    </div>
  );
}
