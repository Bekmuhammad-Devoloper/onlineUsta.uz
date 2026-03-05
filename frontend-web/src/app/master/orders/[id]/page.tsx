"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft, MapPin, Map, CalendarDays, Clock, Camera, Tag,
  User, Phone, Smartphone, CheckCircle2, FileText, Send,
  Hammer, CircleCheckBig, XCircle, Banknote, Percent, Wallet,
} from "lucide-react";

import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import api from "@/lib/api";
import { getCategoryGif } from "@/lib/categoryGifs";
import toast from "react-hot-toast";

const StaticMapView = dynamic(() => import("@/components/StaticMapView"), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />,
});

export default function MasterOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgModal, setImgModal] = useState<string | null>(null);

  // Contract
  const [amount, setAmount] = useState("");
  const [contractDesc, setContractDesc] = useState("");

  const fetchOrder = () => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchOrder(); }, [id]);

  const handleAccept = async () => {
    try {
      await api.patch(`/orders/${id}/accept`);
      toast.success("Buyurtma qabul qilindi!");
      fetchOrder();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleSendContract = async () => {
    if (!amount || Number(amount) <= 0) { toast.error("Narxni kiriting"); return; }
    try {
      await api.patch(`/orders/${id}/contract`, { amount: Number(amount), description: contractDesc || undefined });
      toast.success("Shartnoma yuborildi!");
      fetchOrder();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleStart = async () => {
    try {
      await api.patch(`/orders/${id}/start`);
      toast.success("Ish boshlandi!");
      fetchOrder();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleComplete = async () => {
    try {
      await api.patch(`/orders/${id}/complete`);
      toast.success("Ish tugallandi!");
      fetchOrder();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleCancel = async () => {
    if (!confirm("Buyurtmani bekor qilmoqchimisiz?")) return;
    try {
      await api.patch(`/orders/${id}/cancel`, { reason: "Usta tomonidan bekor qilindi" });
      toast.success("Bekor qilindi");
      fetchOrder();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><LoadingSpinner /></div>;
  if (!order) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><div className="p-8 text-center text-gray-500 dark:text-gray-400">Buyurtma topilmadi</div></div>;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-4 text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>

        {/* Order info card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 mb-4">
          <div className="flex items-start justify-between mb-5">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buyurtma</h1>
            <StatusBadge status={order.status} />
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                <FileText className="w-3.5 h-3.5" /> Tavsif
              </h3>
              <p className="text-gray-800 dark:text-gray-200">{order.description}</p>
            </div>

            {/* Address */}
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Manzil
              </h3>
              <p className="text-gray-800 dark:text-gray-200">{order.address}</p>
            </div>

            {/* Map */}
            {order.latitude && order.longitude && (
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  <Map className="w-3.5 h-3.5 text-blue-400" /> Xaritada joylashuv
                </h3>
                <StaticMapView lat={order.latitude} lng={order.longitude} height="200px" />
              </div>
            )}

            {/* Category */}
            {order.category && (
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  <Tag className="w-3.5 h-3.5 text-teal-400" /> Kategoriya
                </h3>
                <div className="flex items-center gap-2">
                  <img src={getCategoryGif(order.category.nameUz || order.category.name)} alt="" className="w-6 h-6 object-contain" />
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{order.category.nameUz || order.category.name}</span>
                </div>
              </div>
            )}

            {/* Date / Time */}
            {(order.preferredDate || order.preferredTime) && (
              <div className="flex gap-6">
                {order.preferredDate && (
                  <div>
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-400" /> Qulay sana
                    </h3>
                    <p className="text-gray-800 dark:text-gray-200">{new Date(order.preferredDate).toLocaleDateString("uz")}</p>
                  </div>
                )}
                {order.preferredTime && (
                  <div>
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> Vaqt
                    </h3>
                    <p className="text-gray-800 dark:text-gray-200">{order.preferredTime}</p>
                  </div>
                )}
              </div>
            )}

            {/* Images */}
            {order.images?.length > 0 && (
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  <Camera className="w-3.5 h-3.5 text-purple-400" /> Rasmlar
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {order.images.map((url: string, i: number) => {
                    const src = url.startsWith("http") ? url : `${API_URL}${url}`;
                    return (
                      <img key={i} src={src} alt="" onClick={() => setImgModal(src)}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition flex-shrink-0" />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price info */}
            {order.amount && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Banknote className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400 mb-0.5">Narxi</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(order.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">so&apos;m</p>
                  </div>
                  <div>
                    <Percent className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400 mb-0.5">Komissiya</p>
                    <p className="text-lg font-bold text-orange-500">{Number(order.platformFee || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">so&apos;m</p>
                  </div>
                  <div>
                    <Wallet className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-400 mb-0.5">Siz olasiz</p>
                    <p className="text-lg font-bold text-green-600">{Number(order.masterAmount || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">so&apos;m</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buyer info card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 mb-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            <User className="w-4 h-4 text-blue-500" /> Buyurtmachi
          </h2>
          <div className="flex items-center gap-4 mb-4">
            {order.user?.avatar ? (
              <img src={order.user.avatar.startsWith("http") ? order.user.avatar : `${API_URL}${order.user.avatar}`}
                alt="" className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-300">
                {order.user?.name?.[0] || "?"}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.user?.name || "Noma&apos;lum"}</p>
              {order.user?.phone && (
                <a href={`tel:${order.user.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  <Phone className="w-3.5 h-3.5" /> {order.user.phone}
                </a>
              )}
            </div>
          </div>
          {order.contactPhone && order.contactPhone !== order.user?.phone && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
              <p className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-300 font-medium mb-0.5">
                <Smartphone className="w-3.5 h-3.5" /> Qo&apos;shimcha telefon
              </p>
              <a href={`tel:${order.contactPhone}`} className="text-blue-700 dark:text-blue-200 font-semibold hover:underline ml-5">
                {order.contactPhone}
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Accept */}
          {order.status === "PENDING" && (
            <button onClick={handleAccept} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition text-lg shadow-sm">
              <CheckCircle2 className="w-5 h-5" /> Qabul qilish
            </button>
          )}

          {/* Send contract */}
          {order.status === "ACCEPTED" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
                <FileText className="w-5 h-5 text-blue-500" /> Shartnoma yuborish
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Narx (so&apos;m) *</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="500000" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ish tavsifi</label>
                  <textarea value={contractDesc} onChange={(e) => setContractDesc(e.target.value)}
                    rows={2} placeholder="Bajarilishi kerak bo'lgan ishlar..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <button onClick={handleSendContract} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition">
                  <Send className="w-4 h-4" /> Shartnoma yuborish
                </button>
              </div>
            </div>
          )}

          {/* Start work */}
          {order.status === "PAYMENT_DONE" && (
            <button onClick={handleStart} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition text-lg shadow-sm">
              <Hammer className="w-5 h-5" /> Ishni boshlash
            </button>
          )}

          {/* Complete */}
          {order.status === "IN_PROGRESS" && (
            <button onClick={handleComplete} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition text-lg shadow-sm">
              <CircleCheckBig className="w-5 h-5" /> Ishni tugatish
            </button>
          )}

          {/* Cancel */}
          {["PENDING", "ACCEPTED", "CONTRACT_SENT"].includes(order.status) && (
            <button onClick={handleCancel} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 font-semibold py-3 rounded-xl transition border border-red-200 dark:border-red-800">
              <XCircle className="w-5 h-5" /> Bekor qilish
            </button>
          )}
        </div>
      </main>

      {/* Image modal */}
      {imgModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setImgModal(null)}>
          <img src={imgModal} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}
