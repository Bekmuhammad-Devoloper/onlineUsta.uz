"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import { getCategoryGif } from "@/lib/categoryGifs";

export default function MasterDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [master, setMaster] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/masters/${id}`)
      .then((r) => setMaster(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><LoadingSpinner /></div>;
  if (!master) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950"><div className="p-8 text-center text-gray-500 dark:text-gray-400">Usta topilmadi</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 dark:text-gray-300 mb-4 block">← Orqaga</button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
              {master.user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{master.user?.name}</h1>
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="text-yellow-500">⭐ {master.rating?.toFixed(1)}</span>
                <span className="text-gray-400">({master.totalReviews} baho)</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 dark:text-gray-400">{master.totalOrders} buyurtma</span>
              </div>
              {master.isOnline && (
                <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">🟢 Online</span>
              )}
            </div>
          </div>

          {master.bio && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Haqida</h3>
              <p className="text-gray-700 dark:text-gray-300">{master.bio}</p>
            </div>
          )}

          {master.services?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Xizmatlar</h3>
              <div className="flex flex-wrap gap-2">
                {master.services.map((s: string, i: number) => (
                  <span key={i} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {master.category && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Kategoriya</h3>
              <span className="text-gray-700 dark:text-gray-300"><img src={getCategoryGif(master.category.nameUz || master.category.name)} alt="" className="w-5 h-5 object-contain inline-block mr-1" />{master.category.nameUz || master.category.name}</span>
            </div>
          )}

          <button
            onClick={() => router.push(`/orders/create?masterId=${master.id}&categoryId=${master.categoryId}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition mt-4"
          >
            Buyurtma yaratish
          </button>
        </div>

        {/* Reviews */}
        {master.reviews?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Baholar</h2>
            <div className="space-y-3">
              {master.reviews.map((r: any) => (
                <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500">{"⭐".repeat(r.rating)}</span>
                    <span className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString("uz")}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
