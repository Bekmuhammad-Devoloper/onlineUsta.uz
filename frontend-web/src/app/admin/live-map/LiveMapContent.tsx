"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import api from "@/lib/api";
import {
  MapPin, RefreshCw, Users, Navigation, Clock, Phone,
  Wifi, Package, ChevronRight, X, Filter,
} from "lucide-react";

/* ── regions ── */
const UZ_REGIONS = [
  { label: "Butun O\u2019zbekiston", lat: 41.3775, lng: 64.5853, zoom: 6 },
  { label: "Toshkent shahri", lat: 41.3111, lng: 69.2797, zoom: 12 },
  { label: "Toshkent viloyati", lat: 41.3167, lng: 69.5, zoom: 10 },
  { label: "Andijon", lat: 40.7833, lng: 72.3442, zoom: 11 },
  { label: "Buxoro", lat: 39.7747, lng: 64.4286, zoom: 10 },
  { label: "Farg\u2019ona", lat: 40.3842, lng: 71.7975, zoom: 11 },
  { label: "Jizzax", lat: 40.1158, lng: 67.8422, zoom: 10 },
  { label: "Xorazm", lat: 41.55, lng: 60.6333, zoom: 10 },
  { label: "Namangan", lat: 41.0011, lng: 71.6722, zoom: 11 },
  { label: "Navoiy", lat: 40.1033, lng: 65.3792, zoom: 10 },
  { label: "Qashqadaryo", lat: 38.86, lng: 65.8, zoom: 10 },
  { label: "Samarqand", lat: 39.6547, lng: 66.9597, zoom: 10 },
  { label: "Sirdaryo", lat: 40.8375, lng: 68.6611, zoom: 10 },
  { label: "Surxondaryo", lat: 38.2119, lng: 67.2783, zoom: 10 },
  { label: "Qoraqalpog\u2019iston", lat: 42.46, lng: 59.6, zoom: 8 },
];

/* ── types ── */
interface MasterLocation {
  masterId: string;
  userId: string;
  name: string;
  phone: string;
  avatar: string | null;
  category: string | null;
  isOnline: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
    timestamp: string | null;
  } | null;
  activeOrder: {
    id: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    status: string;
  } | null;
}

/* ── icons ── */
function createMasterIcon(hasOrder: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;position:relative;">
      <div style="width:36px;height:36px;border-radius:50%;background:${hasOrder ? "#2563EB" : "#22c55e"};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      ${hasOrder ? '<div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;background:#f59e0b;border:2px solid white;border-radius:50%;"></div>' : ""}
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function createOrderIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;">
      <svg width="32" height="42" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 14.667 20 32 20 32s20-17.333 20-32C40 8.954 31.046 0 20 0z" fill="#EF4444"/>
        <circle cx="20" cy="20" r="7" fill="white"/>
      </svg>
    </div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

/* ── helper: fly to region ── */
function FlyToRegion({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }, [map, lat, lng, zoom]);
  return null;
}

/* ── helper: invalidate on mount ── */
function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
    setTimeout(() => map.invalidateSize(), 800);
  }, [map]);
  return null;
}

/* ─────────── MAIN COMPONENT ─────────── */
export default function LiveMapContent() {
  const [masters, setMasters] = useState<MasterLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState<MasterLocation | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLocations = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get("/admin/masters/live-locations");
      setMasters(res.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => fetchLocations(), 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchLocations]);

  const handleRegionChange = (idx: number) => setSelectedRegion(idx);

  const focusMaster = (m: MasterLocation) => {
    setSelectedMaster(m);
    if (m.currentLocation) {
      /* flyTo is handled by updating selectedRegion or via FlyToMaster */
    }
  };

  const mastersWithLocation = masters.filter((m) => m.currentLocation);
  const mastersWithOrder = masters.filter((m) => m.activeOrder);
  const region = UZ_REGIONS[selectedRegion];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Xarita yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* ─── Sidebar ─── */}
        <div className="w-full lg:w-80 xl:w-96 bg-white dark:bg-gray-900 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col max-h-[40vh] lg:max-h-full overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> Jonli xarita
              </h1>
              <button onClick={() => fetchLocations(true)} disabled={refreshing} title="Yangilash" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                <p className="text-lg font-bold text-green-600">{mastersWithLocation.length}</p>
                <p className="text-[10px] text-green-600/80">Online</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                <p className="text-lg font-bold text-blue-600">{mastersWithOrder.length}</p>
                <p className="text-[10px] text-blue-600/80">Faol buyurtma</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <p className="text-lg font-bold text-gray-600 dark:text-gray-300">{masters.length}</p>
                <p className="text-[10px] text-gray-500">Jami online</p>
              </div>
            </div>

            {/* Region filter */}
            <div className="mt-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Filter className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Viloyat</span>
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(Number(e.target.value))}
                title="Viloyat tanlang"
                className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {UZ_REGIONS.map((r, i) => (
                  <option key={i} value={i}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Auto refresh toggle */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Avto yangilanish (15s)
              </span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                title="Avto yangilanish"
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${autoRefresh ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${autoRefresh ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Masters list */}
          <div className="flex-1 overflow-y-auto">
            {mastersWithLocation.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Hozircha online ustalar yo&apos;q</p>
                <p className="text-xs text-gray-400 mt-1">Ustalar online bo&apos;lganda bu yerda ko&apos;rinadi</p>
              </div>
            ) : (
              mastersWithLocation.map((m) => (
                <button
                  key={m.masterId}
                  onClick={() => focusMaster(m)}
                  className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${selectedMaster?.masterId === m.masterId ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden flex items-center justify-center">
                      {m.avatar ? (
                        <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.name}</p>
                        <Wifi className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {m.phone}
                      </p>
                      {m.category && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{m.category}</p>}
                      {m.currentLocation?.timestamp && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(m.currentLocation.timestamp).toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </p>
                      )}
                      {m.activeOrder && (
                        <div className="mt-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] rounded px-2 py-1 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          <span className="truncate">{m.activeOrder.description?.slice(0, 40) || "Faol buyurtma"}</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ─── Map ─── */}
        <div className="flex-1 relative" style={{ minHeight: "400px" }}>
          <MapContainer
            center={[region.lat, region.lng]}
            zoom={region.zoom}
            zoomControl={false}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            <FlyToRegion lat={region.lat} lng={region.lng} zoom={region.zoom} />
            <InvalidateSize />

            {mastersWithLocation.map((m) => {
              if (!m.currentLocation) return null;
              const pos: [number, number] = [m.currentLocation.latitude, m.currentLocation.longitude];
              const timeStr = m.currentLocation.timestamp
                ? new Date(m.currentLocation.timestamp).toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" })
                : "\u2014";
              return (
                <span key={m.masterId}>
                  <Marker
                    position={pos}
                    icon={createMasterIcon(!!m.activeOrder)}
                    eventHandlers={{ click: () => setSelectedMaster(m) }}
                  >
                    <Popup>
                      <div style={{ minWidth: 200, fontFamily: "system-ui,sans-serif" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>📱 {m.phone}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>🔧 {m.category || "—"}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>🕐 Oxirgi: {timeStr}</div>
                        {m.activeOrder && (
                          <div style={{ marginTop: 6, padding: 6, background: "#eff6ff", borderRadius: 6, fontSize: 11 }}>
                            <strong>Faol buyurtma:</strong><br />{m.activeOrder.description?.slice(0, 60) || "—"}<br />
                            <span style={{ color: "#2563eb" }}>{m.activeOrder.status}</span>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>

                  {m.activeOrder?.latitude && m.activeOrder?.longitude && (
                    <>
                      <Marker
                        position={[m.activeOrder.latitude, m.activeOrder.longitude]}
                        icon={createOrderIcon()}
                      >
                        <Popup>
                          <div style={{ minWidth: 180, fontFamily: "system-ui,sans-serif" }}>
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>📍 Buyurtma joyi</div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>{m.activeOrder.description?.slice(0, 80) || "—"}</div>
                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{m.activeOrder.address || ""}</div>
                            <div style={{ fontSize: 11, color: "#2563eb", marginTop: 2 }}>Usta: {m.name}</div>
                          </div>
                        </Popup>
                      </Marker>
                      <Polyline
                        positions={[pos, [m.activeOrder.latitude, m.activeOrder.longitude]]}
                        pathOptions={{ color: "#2563EB", weight: 2, dashArray: "8, 6", opacity: 0.7 }}
                      />
                    </>
                  )}
                </span>
              );
            })}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-[1000]">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">Belgilar</p>
            <div className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow" />
                <span>Usta (bo&apos;sh)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow" />
                <span>Usta (buyurtmada)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="18" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C8.954 0 0 8.954 0 20c0 14.667 20 32 20 32s20-17.333 20-32C40 8.954 31.046 0 20 0z" fill="#EF4444" />
                  <circle cx="20" cy="20" r="7" fill="white" />
                </svg>
                <span>Buyurtma joyi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 border-t-2 border-dashed border-blue-500" />
                <span>Usta &#8594; Buyurtma</span>
              </div>
            </div>
          </div>

          {/* Selected master info panel */}
          {selectedMaster && (
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-[1000] min-w-[260px] max-w-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{selectedMaster.name}</h3>
                <button onClick={() => setSelectedMaster(null)} title="Yopish" className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedMaster.phone}</p>
                {selectedMaster.category && (
                  <p className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> {selectedMaster.category}</p>
                )}
                {selectedMaster.currentLocation?.timestamp && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Oxirgi joylashuv: {new Date(selectedMaster.currentLocation.timestamp).toLocaleString("uz")}
                  </p>
                )}
                {selectedMaster.activeOrder && (
                  <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5">
                    <p className="font-semibold text-blue-700 dark:text-blue-300 text-xs mb-1 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Faol buyurtma
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-[11px]">{selectedMaster.activeOrder.description?.slice(0, 100)}</p>
                    {selectedMaster.activeOrder.address && (
                      <p className="text-gray-500 text-[10px] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {selectedMaster.activeOrder.address}
                      </p>
                    )}
                    <p className="text-blue-600 dark:text-blue-400 text-[10px] mt-1 font-medium">{selectedMaster.activeOrder.status}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
