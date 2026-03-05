"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths (broken in webpack/Next.js)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({ latitude, longitude, onLocationChange }: LocationPickerMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState<string>("");

  // Reverse geocode to get address
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`
      );
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch {
      setAddress("");
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Custom marker icon
    const pinIcon = L.divIcon({
      className: "",
      html: `<div style="display:flex;align-items:center;justify-content:center;">
        <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 14.667 20 32 20 32s20-17.333 20-32C40 8.954 31.046 0 20 0z" fill="#2563EB"/>
          <circle cx="20" cy="20" r="8" fill="white"/>
        </svg>
      </div>`,
      iconSize: [40, 52],
      iconAnchor: [20, 52],
    });

    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([latitude, longitude], 15);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([latitude, longitude], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onLocationChange(pos.lat, pos.lng);
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Force resize after render so tiles load correctly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Initial geocode
    reverseGeocode(latitude, longitude);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker when lat/lng changes externally
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - latitude) > 0.0001 || Math.abs(currentPos.lng - longitude) > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
        reverseGeocode(latitude, longitude);
      }
    }
  }, [latitude, longitude, reverseGeocode]);

  return (
    <div className="relative" style={{ isolation: "isolate", zIndex: 0 }}>
      {/* Inject leaflet CSS as a fallback in case the import doesn't apply */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800"
        style={{ height: "250px", minHeight: "250px" }}
      />
      {address && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">📍 Tanlangan manzil:</p>
          <p className="text-sm text-gray-900 dark:text-white mt-0.5 line-clamp-2">{address}</p>
        </div>
      )}
    </div>
  );
}
