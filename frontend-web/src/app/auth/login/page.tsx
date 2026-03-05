"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import toast from "react-hot-toast";
import { Wrench, Phone, ArrowRight, UserPlus, Eye, Copy, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [phone, setPhone] = useState("+998");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { sendOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\+998\d{9}$/.test(phone)) {
      toast.error("Telefon raqamini to'g'ri kiriting: +998XXXXXXXXX");
      return;
    }
    setLoading(true);
    setDevCode(null);
    try {
      const res = await sendOtp(phone);
      toast.success("SMS kod yuborildi!");
      // Backend returns OTP code — show on page + navigate to OTP page with code
      if (res?.code) {
        setDevCode(res.code);
        // Auto-navigate after 2 seconds so user can see the code
        setTimeout(() => {
          router.push(`/auth/otp?phone=${encodeURIComponent(phone)}&code=${res.code}`);
        }, 2000);
        return;
      }
      router.push(`/auth/otp?phone=${encodeURIComponent(phone)}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (devCode) {
      navigator.clipboard.writeText(devCode);
      setCopied(true);
      toast.success("Kod nusxalandi!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-register.png')" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/25" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-full flex items-center justify-center">
              <img src="/logo.png" alt="Online Usta" width={85} height={60} className="object-contain h-14 w-auto drop-shadow-lg logo-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white text-shadow-lg whitespace-nowrap">Online Usta</h1>
          <p className="text-white/90 mt-2 text-shadow">Usta topish va xizmat buyurtma qilish platformasi</p>
        </div>

        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Kirish</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            Telefon raqamingizni kiriting, SMS orqali kod yuboramiz
          </p>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Telefon raqami
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                className="w-full pl-10 pr-4 py-3 border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg tracking-wide text-gray-900 dark:text-white placeholder-gray-400"
                maxLength={13}
              />
            </div>

            {/* OTP kod ko'rsatish */}
            {devCode && (
              <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">SMS kod:</span>
                  </div>
                  <button type="button" onClick={copyCode} className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-green-800 transition">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Nusxalandi" : "Nusxalash"}
                  </button>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 tracking-[0.3em] text-center mt-1.5">{devCode}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/60 text-center mt-1">2 soniyadan keyin avtomatik o&apos;tadi...</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              {loading ? "Yuborilmoqda..." : (
                <>
                  SMS kod olish
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800/50 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Hisobingiz yo&apos;qmi?{" "}
              <Link href="/auth/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline inline-flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" />
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
