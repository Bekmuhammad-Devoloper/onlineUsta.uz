"use client";
import dynamic from "next/dynamic";

const LiveMapContent = dynamic(() => import("./LiveMapContent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Xarita yuklanmoqda...</p>
      </div>
    </div>
  ),
});

export default function AdminLiveMapPage() {
  return <LiveMapContent />;
}
