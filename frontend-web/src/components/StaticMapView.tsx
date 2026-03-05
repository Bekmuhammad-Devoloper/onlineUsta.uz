"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface StaticMapViewProps {
  lat: number;
  lng: number;
  height?: string;
}

export default function StaticMapView({ lat, lng, height = "200px" }: StaticMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const pinIcon = L.divIcon({
      className: "",
      html: `<div style="display:flex;align-items:center;justify-content:center;">
        <svg width="36" height="46" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 14.667 20 32 20 32s20-17.333 20-32C40 8.954 31.046 0 20 0z" fill="#EF4444"/>
          <circle cx="20" cy="20" r="8" fill="white"/>
        </svg>
      </div>`,
      iconSize: [36, 46],
      iconAnchor: [18, 46],
    });

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      touchZoom: false,
      attributionControl: false,
    }).setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.marker([lat, lng], { icon: pinIcon }).addTo(map);

    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return (
    <div style={{ isolation: "isolate", zIndex: 0 }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        style={{ height, minHeight: height }}
      />
    </div>
  );
}
