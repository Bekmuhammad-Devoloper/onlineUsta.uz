"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthProvider";
import api from "@/lib/api";
import { getCategoryGif } from "@/lib/categoryGifs";
import toast from "react-hot-toast";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Payment state
  const [paymentType, setPaymentType] = useState("CASH");

  const fetchOrder = () => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleChoosePayment = async () => {
    try {
      await api.patch(`/orders/${id}/choose-payment`, { paymentType });
      toast.success("To'lov turi tanlandi");
      fetchOrder();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleCancel = async () => {
    if (!confirm("Buyurtmani bekor qilmoqchimisiz?")) return;
    try {
      await api.patch(`/orders/${id}/cancel`, { reason: "Foydalanuvchi tomonidan bekor qilindi" });
      toast.success("Buyurtma bekor qilindi");
      fetchOrder();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleReview = async () => {
    try {
      await api.post(`/orders/${id}/review`, { rating, comment });
      toast.success("Baho qo'yildi!");
      fetchOrder();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><LoadingSpinner /></div>;
  if (!order) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><div className="p-8 text-center text-gray-500 dark:text-gray-400">Buyurtma topilmadi</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 mb-4 block">← Orqaga</button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buyurtma tafsilotlari</h1>
            <StatusBadge status={order.status} />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Tavsif</h3>
              <p className="text-gray-700 dark:text-gray-300">{order.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Manzil</h3>
              <p className="text-gray-700 dark:text-gray-300">{order.address}</p>
            </div>
            {order.category && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Kategoriya</h3>
                <p className="text-gray-700 dark:text-gray-300"><img src={getCategoryGif(order.category.nameUz || order.category.name)} alt="" className="w-5 h-5 object-contain inline-block mr-1" />{order.category.nameUz || order.category.name}</p>
              </div>
            )}
            {order.preferredDate && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Qulay sana</h3>
                <p className="text-gray-700 dark:text-gray-300">{new Date(order.preferredDate).toLocaleDateString("uz")} {order.preferredTime || ""}</p>
              </div>
            )}
            {order.amount && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Narxi</h3>
                  <p className="text-gray-900 dark:text-white font-medium">{Number(order.amount).toLocaleString()} so&apos;m</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Komissiya</h3>
                  <p className="text-gray-700 dark:text-gray-300">{Number(order.platformFee || 0).toLocaleString()} so&apos;m</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Usta oladi</h3>
                  <p className="text-gray-700 dark:text-gray-300">{Number(order.masterAmount || 0).toLocaleString()} so&apos;m</p>
                </div>
              </div>
            )}
            {order.contractDescription && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Shartnoma tavsifi</h3>
                <p className="text-gray-700 dark:text-gray-300">{order.contractDescription}</p>
              </div>
            )}
            {order.master && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Usta</h3>
                <p className="text-gray-700 dark:text-gray-300">{order.master.user?.name} — ⭐ {order.master.rating?.toFixed(1)}</p>
              </div>
            )}
            {order.images?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Rasmlar</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {order.images.map((url: string, i: number) => (
                    <img key={i} src={url} alt="" className="w-24 h-24 object-cover rounded-lg border" />
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Yaratilgan</h3>
              <p className="text-gray-700 dark:text-gray-300">{new Date(order.createdAt).toLocaleString("uz")}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-3">
          {/* Choose payment */}
          {order.status === "CONTRACT_SENT" && order.userId === user?.id && (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">To&apos;lov turini tanlang</h3>
              <div className="flex gap-2 mb-3">
                {["CASH", "PAYME", "CLICK"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPaymentType(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      paymentType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300"
                    }`}
                  >
                    {t === "CASH" ? "💵 Naqd" : t === "PAYME" ? "💳 Payme" : "💳 Click"}
                  </button>
                ))}
              </div>
              <button onClick={handleChoosePayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition">
                Tasdiqlash
              </button>
            </div>
          )}

          {/* Review */}
          {order.status === "COMPLETED" && order.userId === user?.id && !order.review && (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Baho qo&apos;ying</h3>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`text-2xl ${n <= rating ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Izoh (ixtiyoriy)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button onClick={handleReview} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition">
                Baho qo&apos;yish
              </button>
            </div>
          )}

          {/* Cancel */}
          {["PENDING", "ACCEPTED", "CONTRACT_SENT"].includes(order.status) && order.userId === user?.id && (
            <button
              onClick={handleCancel}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition border border-red-200"
            >
              Buyurtmani bekor qilish
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
