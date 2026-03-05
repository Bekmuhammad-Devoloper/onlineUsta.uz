"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Smartphone } from "lucide-react";

export default function AdminDeviceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    api.get("/admin/device-requests").then((r) => setRequests(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id: string) => {
    try { await api.patch(`/admin/device-requests/${id}/approve`); toast.success("Tasdiqlandi"); fetchRequests(); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rad etish sababi:");
    if (!reason) return;
    try { await api.patch(`/admin/device-requests/${id}/reject`, { reason }); toast.success("Rad etildi"); fetchRequests(); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Xatolik"); }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Qurilma o&apos;zgartirish so&apos;rovlari</h1>

      {loading ? <LoadingSpinner /> : requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">So&apos;rovlar yo&apos;q</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Usta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Eski qurilma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Yangi qurilma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Holat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Sana</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{req.master?.user?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">{req.oldDeviceId || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">{req.newDeviceId}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${req.status === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : req.status === "APPROVED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{req.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(req.createdAt).toLocaleDateString("uz")}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {req.status === "PENDING" && (
                      <>
                        <button onClick={() => handleApprove(req.id)} className="text-xs text-green-600 hover:text-green-700 font-medium">Tasdiqlash</button>
                        <button onClick={() => handleReject(req.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Rad etish</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
