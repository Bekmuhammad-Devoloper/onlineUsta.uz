"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Wrench, ArrowLeft, ShieldCheck, CheckCircle2, Smartphone, AlertTriangle, Eye, Copy } from "lucide-react";

function OtpForm() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const isRegister = searchParams.get("register") === "1";
  const urlCode = searchParams.get("code") || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(180);
  const [deviceError, setDeviceError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { verifyOtp, register } = useAuth();

  // Auto-fill code from URL
  useEffect(() => {
    if (urlCode && urlCode.length === 6) {
      const digits = urlCode.split("");
      setCode(digits);
    }
  }, [urlCode]);

  // Generate or retrieve a persistent device ID
  const getDeviceId = (): string => {
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = "web_" + crypto.randomUUID();
      localStorage.setItem("device_id", id);
    }
    return id;
  };

  useEffect(() => {
    if (!phone) router.replace("/auth/login");
  }, [phone, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join("");
    if (otp.length !== 6) {
      toast.error("6 xonali kodni kiriting");
      return;
    }
    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const res = await verifyOtp(phone, otp, deviceId);

      // If this is a registration flow, register the user with saved data
      if (isRegister || res.isNew) {
        const raw = sessionStorage.getItem("regData");
        const regData = raw ? JSON.parse(raw) : {};
        const { name, location, role, birthYear, categoryId, passportSeries, passportNumber, passportJSHIR, bankCardNumber, bankCardHolder, subscriptionType } = regData;

        if (name) {
          await register({ name, location, ...(birthYear ? { birthYear: Number(birthYear) } : {}) });
        }

        // If master role selected, call become-master
        if (role === "MASTER" && categoryId) {
          try {
            await api.post("/users/become-master", {
              categoryId,
              passportSeries,
              passportNumber,
              passportJSHIR,
              bankCardNumber,
              bankCardHolder,
              subscriptionType: subscriptionType || "COMMISSION",
            });
            toast.success("Usta sifatida ro'yxatdan o'tdingiz! Tasdiqlash kutilmoqda.");
            sessionStorage.removeItem("regData");
            router.push("/master");
            return;
          } catch (masterErr: any) {
            toast.error(masterErr?.response?.data?.message || "Usta bo'lish xatosi");
          }
        }

        sessionStorage.removeItem("regData");
        toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
        router.push("/home");
        return;
      }

      // Existing user login — redirect by role
      toast.success("Muvaffaqiyatli kirildi!");
      const userRole = res.user?.role;
      if (userRole === "ADMIN") router.push("/admin");
      else if (userRole === "MASTER") router.push("/master");
      else router.push("/home");
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "Kod noto'g'ri";
      if (status === 403 && msg.includes("qurilma")) {
        setDeviceError(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  // Device restriction error screen
  if (deviceError) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/login-register.png')" }} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Qurilma cheklovi</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Usta paneliga faqat bitta qurilmadan kirish mumkin. Siz boshqa qurilmadan kira olmaysiz.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 mb-6">
              <p className="text-amber-800 dark:text-amber-200 text-sm flex items-center gap-1.5 justify-center">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Qurilmani o&apos;zgartirish uchun admin bilan bog&apos;laning
              </p>
            </div>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Orqaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-register.png')" }}
      />
      <div className="absolute inset-0 bg-black/25" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-full flex items-center justify-center">
              <img src="/logo.png" alt="Online Usta" width={56} height={40} className="object-contain h-10 w-auto drop-shadow-lg logo-white" />
            </div>
            <span className="font-bold text-xl text-white text-shadow-lg whitespace-nowrap">Online Usta</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-green-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">SMS kodni kiriting</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-800">{phone}</span> raqamiga yuborildi
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={`Kod raqami ${i + 1}`}
                  placeholder="·"
                  className="w-12 h-14 text-center text-2xl font-bold border border-white/40 bg-white dark:bg-gray-900/40 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                />
              ))}
            </div>

            {/* OTP kod ko'rsatish (dev/test) */}
            {urlCode && urlCode.length === 6 && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">SMS kod:</span>
                  </div>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(urlCode); toast.success("Nusxalandi!"); }} className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-green-800 transition">
                    <Copy className="w-3.5 h-3.5" />
                    Nusxalash
                  </button>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 tracking-[0.3em] text-center mt-1">{urlCode}</p>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
              {timer > 0 ? (
                <span>
                  Qayta yuborish: {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              ) : (
                <button
                  type="button"
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                  onClick={() => {
                    router.push("/auth/login");
                  }}
                >
                  Kodni qayta yuborish
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              {loading ? "Tekshirilmoqda..." : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Tasdiqlash
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => router.back()}
            className="w-full mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 flex items-center justify-center gap-1 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Orqaga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yuklanmoqda...</div>}>
      <OtpForm />
    </Suspense>
  );
}
