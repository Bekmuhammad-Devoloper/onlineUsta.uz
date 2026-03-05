"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin, AlertTriangle, ClipboardList, CalendarDays, Clock,
} from "lucide-react";

import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import api from "@/lib/api";
import { getCategoryGif } from "@/lib/categoryGifs";

const regions = [
  "Barchasi",
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Buxoro viloyati",
  "Andijon viloyati",
  "Farg'ona viloyati",
  "Namangan viloyati",
  "Xorazm viloyati",
  "Surxondaryo viloyati",
  "Qashqadaryo viloyati",
  "Navoiy viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Qoraqalpog'iston",
];

export default function MasterAvailableOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActive, setHasActive] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("Barchasi");
  const [masterRegion, setMasterRegion] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [subMessage, setSubMessage] = useState<string | null>(null);

  const fetchOrders = (region?: string) => {
    setLoading(true);
    const params = region && region !== "Barchasi" ? `?region=${encodeURIComponent(region)}` : "";
    api.get(`/masters/available-orders${params}`)
      .then((r) => {
        setOrders(r.data.availableOrders || []);
        setHasActive(r.data.hasActiveOrder || false);
        setActiveOrderId(r.data.activeOrderId || null);
        setNeedsSubscription(r.data.needsSubscription || false);
        setSubMessage(r.data.message || null);
        if (r.data.masterRegion && !masterRegion) {
          setMasterRegion(r.data.masterRegion);
          // Auto-select master's region on first load
          const regionPrefix = r.data.masterRegion.split(",")[0].trim();
          const found = regions.find((rg) => regionPrefix.startsWith(rg) || rg.startsWith(regionPrefix));
          if (found) setSelectedRegion(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    fetchOrders(region);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mavjud buyurtmalar</h1>

        {/* Region filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Viloyat bo&apos;yicha filter</label>
          <select
            title="Viloyat bo'yicha filter"
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Subscription warning */}
        {needsSubscription && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 mb-4">
            <p className="text-orange-800 dark:text-orange-200 text-sm font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> {subMessage || "Buyurtmalarni ko'rish uchun tariflardan birini tanlang"}
            </p>
            <Link href="/master/profile" className="text-orange-700 dark:text-orange-300 underline text-sm mt-1 inline-block">
              Tarif tanlash →
            </Link>
          </div>
        )}

        {/* Active order warning */}
        {hasActive && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Sizda faol buyurtma bor. Yangi buyurtma qabul qilish uchun avval joriy buyurtmani yakunlang.
            </p>
            {activeOrderId && (
              <Link href={`/master/orders/${activeOrderId}`} className="text-yellow-700 dark:text-yellow-300 underline text-sm mt-1 inline-block">
                Faol buyurtmaga o&apos;tish →
              </Link>
            )}
          </div>
        )}

        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>Hozircha {selectedRegion !== "Barchasi" ? `"${selectedRegion}" da` : ""} mavjud buyurtmalar yo&apos;q</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{orders.length} ta buyurtma topildi</p>
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order.id} href={`/master/orders/${order.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{order.description}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {order.address}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                    {order.category && (
                      <span className="flex items-center gap-1">
                        <img src={getCategoryGif(order.category.nameUz || order.category.name)} alt="" className="w-5 h-5 object-contain" />
                        {order.category.nameUz || order.category.name}
                      </span>
                    )}
                    {order.preferredDate && <span className="flex items-center gap-0.5"><CalendarDays className="w-3 h-3" /> {new Date(order.preferredDate).toLocaleDateString("uz")}</span>}
                    {order.preferredTime && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {order.preferredTime}</span>}
                    <span>{new Date(order.createdAt).toLocaleDateString("uz")}</span>
                  </div>
                  {order.user && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                        {order.user.name?.[0] || "?"}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{order.user.name}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
