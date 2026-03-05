"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import api from "@/lib/api";
import { getCategoryGif } from "@/lib/categoryGifs";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders").then((r) => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buyurtmalarim</h1>
          <Link
            href="/orders/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition text-sm"
          >
            + Yangi
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
            Hozircha buyurtmalar yo&apos;q
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{order.description}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.address}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  {order.category && (
                    <span><img src={getCategoryGif(order.category.nameUz || order.category.name)} alt="" className="w-5 h-5 object-contain inline-block mr-1" />{order.category.nameUz || order.category.name}</span>
                  )}
                  {order.amount && <span className="font-medium text-gray-600 dark:text-gray-300">{Number(order.amount).toLocaleString()} so&apos;m</span>}
                  <span>{new Date(order.createdAt).toLocaleDateString("uz")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
