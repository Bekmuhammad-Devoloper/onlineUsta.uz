"use client";
import { useEffect, useState } from "react";

import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api.get("/notifications").then((r) => setNotifications(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleReadAll = async () => {
    try {
      await api.patch("/notifications/read-all");
      toast.success("Barchasi o'qilgan deb belgilandi");
      fetchNotifications();
    } catch {}
  };

  const handleRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bildirishnomalar</h1>
          {notifications.some((n) => !n.isRead) && (
            <button onClick={handleReadAll} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Barchasini o&apos;qish
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
            Bildirishnomalar yo&apos;q
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleRead(n.id)}
                className={`bg-white dark:bg-gray-900 rounded-xl p-4 border transition cursor-pointer ${
                  n.isRead ? "border-gray-100 dark:border-gray-800" : "border-blue-200 bg-blue-50/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-medium ${n.isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>{n.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.body}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>}
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString("uz")}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
