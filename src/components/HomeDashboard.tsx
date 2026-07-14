import React, { useState, useEffect, useRef } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  Map, Activity, Check, AlertTriangle, FileText, Calendar, 
  Search, ShieldAlert, BadgeInfo, TrendingUp, MapPin, Sparkles,
  CheckCircle2, AlertOctagon, RefreshCw, ChevronRight, HelpCircle
} from "lucide-react";
import { Tempat, TabSummaryRow } from "../types";

// Helper: detect category type reliably for all registered kategori values
const TPP_KEYWORDS = ["TPP", "Rumah", "Makan", "Kantin", "Catering", "Depot", "Warung", "Kedai", "Boga"];
const TFU_KEYWORDS = ["TFU", "Fasilitas", "Terminal", "Pelabuhan", "Pasar", "Pertokoan", "Ibadah", "Masjid", "Penginapan", "Hotel", "Toilet"];

function isTPP(kategori: string): boolean {
  return TPP_KEYWORDS.some(kw => kategori.includes(kw));
}
function isTFU(kategori: string): boolean {
  return TFU_KEYWORDS.some(kw => kategori.includes(kw));
}

// Work Areas & Coordinates
const GEO_COORDS: Record<string, [number, number]> = { 
  "Tembilahan Induk": [-0.326650, 103.160350], 
  "Kuala Gaung": [-0.166839, 103.457208], 
  "Sungai Guntung": [0.305106, 103.614661], 
  "Kuala Enok": [-0.517097, 103.389842], 
  "Pulau Kijang": [-0.687044, 103.205208], 
  "Rengat": [-0.472606, 102.688756] 
};

interface HomeDashboardProps {
  places: Tempat[];
  logs: any[];
  activeWilayah: string;
  setActiveWilayah: (w: string) => void;
  onNavigateToRekap: () => void;
}

export default function HomeDashboard({ 
  places, 
  logs, 
  activeWilayah, 
  setActiveWilayah,
  onNavigateToRekap
}: HomeDashboardProps) {
  
  const [filterBulan, setFilterBulan] = useState<string>("Semua");
  const [filterTahun, setFilterTahun] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [leafletLoaded, setLeafletLoaded] = useState(typeof window !== "undefined" && !!(window as any).L);
  const mapRef = useRef<any>(null);

  // Poll for Leaflet window load in slow connections or async script loads
  useEffect(() => {
    if (leafletLoaded) return;
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).L) {
        setLeafletLoaded(true);
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [leafletLoaded]);

  // Generate years list
  const years = ["Semua"];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 2024; y--) {
    years.push(y.toString());
  }

  // Filter places based on region & inspection timing matching selected Month/Year
  const filteredPlaces = places.filter(place => {
    // 1. Filter by Wilayah
    const matchRegion = activeWilayah === "Semua Wilayah" || place.Wilayah === activeWilayah;

    // 2. Filter by search query
    const matchSearch = place.Nama_Tempat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (place.Alamat || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        place.ID_Tempat.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Filter by Tgl_Inspeksi (if Month/Year specified)
    //    IMPORTANT: Always show places that haven't been inspected yet,
    //    regardless of month/year filter. Only filter inspected places by date.
    if (filterBulan === "Semua" && filterTahun === "Semua") {
      return matchRegion && matchSearch;
    }

    const tgl = (place.Tgl_Inspeksi || "").trim();

    // Places without inspection date should ALWAYS appear (they are "Belum Diinspeksi")
    if (!tgl || !tgl.includes("/")) {
      return matchRegion && matchSearch;
    }

    const parts = tgl.split("/");
    if (parts.length < 3) {
      return matchRegion && matchSearch;
    }

    const m = parseInt(parts[1], 10).toString();
    const y = parts[2].trim();

    const matchBulan = filterBulan === "Semua" || m === filterBulan;
    const matchTahun = filterTahun === "Semua" || y === filterTahun;

    return matchRegion && matchSearch && matchBulan && matchTahun;
  });

  // Calculate KPIs
  const totalTerdaftar = filteredPlaces.length;
  const listMerah = filteredPlaces.filter(p => p.Status_Terakhir === "Merah");
  const countMerah = listMerah.length;
  const countHijau = filteredPlaces.filter(p => p.Status_Terakhir === "Hijau").length;
  const countKuning = filteredPlaces.filter(p => p.Status_Terakhir === "Kuning" || (p.Status_Terakhir as any) === "Belum").length; // yellow fallback or uninspected

  // Tinkat kepatuhan = % of places satisfying requirements based on tested places (skor >= 70 or state in Hijau/Kuning)
  const testedCount = filteredPlaces.filter(p => p.Status_Terakhir !== "Belum").length;
  const compliantCount = filteredPlaces.filter(p => p.Status_Terakhir === "Hijau").length;
  const tingkatKepatuhan = testedCount > 0 
    ? Math.round((compliantCount / testedCount) * 100) + "%" 
    : "0%";

  const tppCount = filteredPlaces.filter(p => isTPP(p.Kategori)).length;
  const tfuCount = filteredPlaces.filter(p => isTFU(p.Kategori)).length;

  // Render Leaflet Map
  useEffect(() => {
    // Escape standard error loops
    if (typeof window === "undefined" || !(window as any).L) return;
    const L = (window as any).L;

    // Clean up previous map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Determine center coord
    let center: [number, number] = [-0.326650, 103.160350]; // default Tembilahan
    let zoom = 10;

    if (activeWilayah !== "Semua Wilayah" && GEO_COORDS[activeWilayah]) {
      center = GEO_COORDS[activeWilayah];
      zoom = 13;
    }

    const mapOption = {
      zoomControl: true,
      scrollWheelZoom: false,
    };

    mapRef.current = L.map("mapTracker", mapOption).setView(center, zoom);
    
    // Default to dynamic high-fidelity Google hybrid satellite layer
    const tileUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "&copy; Google Maps"
    }).addTo(mapRef.current);

    // Call invalidateSize on next tick to ensure precise map layout calculation
    const resizeTimeout = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 250);

    // Draw markers for filtered places
    filteredPlaces.forEach(d => {
      if (d.Status_Aktif === "Tidak Aktif") return;

      if (d.Koordinat_Map && d.Koordinat_Map.includes(",")) {
        const [latStr, lngStr] = d.Koordinat_Map.split(",");
        const latch = parseFloat(latStr.trim());
        const lngch = parseFloat(lngStr.trim());

        if (!isNaN(latch) && !isNaN(lngch)) {
          let color = "#64748b"; // Uninspected
          if (d.Status_Terakhir === "Hijau") color = "#10b981";
          else if (d.Status_Terakhir === "Kuning") color = "#f59e0b";
          else if (d.Status_Terakhir === "Merah") color = "#ef4444";

          const customHtmlIcon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.25);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const avatarUrl = d.Avatar || (isTPP(d.Kategori)
            ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=60"
            : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60");

          L.marker([latch, lngch], { icon: customHtmlIcon })
            .addTo(mapRef.current)
            .bindPopup(`
              <div style="font-family: 'Inter', sans-serif; font-size:12px; width:220px; display:flex; gap:10px; align-items:start;">
                <img src="${avatarUrl}" referrerpolicy="no-referrer" style="width:48px; height:48px; border-radius:8px; object-fit:cover; border:1px solid #e2e8f0; flex-shrink:0;" />
                <div style="min-width:0; flex:1;">
                  <b style="font-size:13px; color:#1e293b; display:block; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${d.Nama_Tempat}">${d.Nama_Tempat}</b>
                  <span style="font-size:10px; color:#64748b; display:block; margin-bottom:4px;">${d.Kategori} • ${d.Wilayah}</span>
                  <span style="background-color:${color}15; color:${color}; padding: 2px 6px; border-radius:4px; font-weight:bold; display:inline-block; font-size:9px;">
                    ${d.Status_Terakhir === "Belum" ? "Belum Diinspeksi" : `Status: ${d.Status_Terakhir}`}
                  </span>
                  ${d.Tgl_Inspeksi ? `<span style="display:block; margin-top:4px; font-size:9px; color:#94a3b8;">Inspeksi: ${d.Tgl_Inspeksi} ${d.Total_Skor && d.Total_Skor !== "-" ? `(Skor: ${d.Total_Skor})` : ""}</span>` : ""}
                </div>
              </div>
            `);
        }
      }
    });

    return () => {
      clearTimeout(resizeTimeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [filteredPlaces, activeWilayah, leafletLoaded]);

  // Construct Data for Charts
  // Stacked Bar Data for regional distributions
  const barData = Object.keys(GEO_COORDS).map(w => {
    const rPlaces = places.filter(p => {
      let matchWaktu = true;
      if (filterBulan !== "Semua" || filterTahun !== "Semua") {
        const t = (p.Tgl_Inspeksi || "").trim();
        if (t.includes("/")) {
          const pt = t.split("/");
          const m = parseInt(pt[1], 10).toString();
          const y = pt[2].trim();
          matchWaktu = (filterBulan === "Semua" || m === filterBulan) && (filterTahun === "Semua" || y === filterTahun);
        } else {
          matchWaktu = false;
        }
      }
      return p.Wilayah === w && matchWaktu;
    });

    return {
      name: w,
      tpp: rPlaces.filter(p => isTPP(p.Kategori)).length,
      tfu: rPlaces.filter(p => isTFU(p.Kategori)).length
    };
  });

  // Doughnut Pie Data for sanitasi states
  const pieData = [
    { name: "Memenuhi Syarat", value: countHijau, color: "#10b981" },
    { name: "Tidak Memenuhi Syarat (Kuning)", value: filteredPlaces.filter(p => p.Status_Terakhir === "Kuning").length, color: "#f59e0b" },
    { name: "Tidak Memenuhi Syarat (Merah)", value: countMerah, color: "#ef4444" },
    { name: "Belum Diperiksa", value: filteredPlaces.filter(p => p.Status_Terakhir === "Belum").length, color: "#94a3b8" }
  ].filter(item => item.value > 0);

  // Recalculate regional metrics table summary
  const tableSummary: TabSummaryRow[] = Object.keys(GEO_COORDS).map(w => {
    const itemPlaces = places.filter(p => p.Wilayah === w);
    return {
      wilayah: w,
      jmlTPP: itemPlaces.filter(p => isTPP(p.Kategori)).length,
      jmlTFU: itemPlaces.filter(p => isTFU(p.Kategori)).length,
      memenuhi: itemPlaces.filter(p => p.Status_Terakhir === "Hijau").length,
      tidakKuning: itemPlaces.filter(p => p.Status_Terakhir === "Kuning").length,
      tidakMerah: itemPlaces.filter(p => p.Status_Terakhir === "Merah").length
    };
  });

  return (
    <div className="space-y-6">
      {/* Search and Time-frame filters block */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-slate-50 to-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-wider text-sky-600">Sistem Informasi Pengawasan Sanitasi - SANTUARI</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Radar Sanitasi Pelabuhan</h2>
          <p className="text-xs text-slate-500">Pemantauan Terintegrasi Tempat Pengolahan Pangan & Fasilitas Umum (TFU)</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Quick Search with interactive outline and hover transitions */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama lokasi, alamat, atau ID..."
              className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all shadow-sm text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Month/Year Filter widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-2 px-3 flex items-center gap-2 text-xs font-semibold shadow-sm focus-within:ring-2 focus-within:ring-sky-100">
            <Calendar className="w-4 h-4 text-sky-600" />
            <select 
              value={filterBulan} 
              onChange={(e) => setFilterBulan(e.target.value)}
              className="font-bold text-sky-700 bg-transparent outline-none cursor-pointer text-xs pr-1"
            >
              <option value="Semua">Semua Bulan</option>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((m, i) => (
                <option key={m} value={m}>
                  {[
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                  ][i]}
                </option>
              ))}
            </select>
            <span className="text-slate-250 font-light">|</span>
            <select 
              value={filterTahun} 
              onChange={(e) => setFilterTahun(e.target.value)}
              className="font-bold text-sky-700 bg-transparent outline-none cursor-pointer text-xs"
            >
              {years.map(y => (
                <option key={y} value={y}>{y === "Semua" ? "Semua Tahun" : y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Wilayah Kerjas horizontal Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-2 flex-shrink-0">
          Wilayah Kerja:
        </span>
        <button
          onClick={() => setActiveWilayah("Semua Wilayah")}
          className={`px-4 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${
            activeWilayah === "Semua Wilayah"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          🌍 Semua Wilayah
        </button>
        {Object.keys(GEO_COORDS).map(w => (
          <button
            key={w}
            onClick={() => setActiveWilayah(w)}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${
              activeWilayah === w
                ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-50"
                : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      {/* KPI Cards Grid with modern designs, gradients, and micro indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Terdaftar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-sky-50 rounded-full -mr-6 -mt-6 transition-all group-hover:scale-110 pointer-events-none" />
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              Total Terdaftar
            </span>
            <h3 className="text-3xl font-black text-slate-800 leading-none tracking-tight">
              {totalTerdaftar}
            </h3>
          </div>
          <div className="text-[10px] text-slate-450 mt-4 font-semibold flex items-center justify-between z-10">
            <span>TPP & TFU Terdaftar</span>
            <span className="text-sky-600 font-bold">100% Digital</span>
          </div>
        </div>

        {/* KPI 2: Risiko (Merah) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between hover:border-rose-300 transition-all hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-50 rounded-full -mr-6 -mt-6 transition-all group-hover:scale-110 pointer-events-none" />
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              Tidak Memenuhi Syarat (Merah)
            </span>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-3xl font-black text-rose-600 leading-none tracking-tight">
                {countMerah}
              </h3>
              {countMerah > 0 && (
                <span className="animate-ping inline-flex h-2 w-2 rounded-full bg-rose-450" />
              )}
            </div>
          </div>
          <div className="text-[10px] text-rose-600/95 mt-4 font-bold flex items-center justify-between z-10">
            <span>Butuh Tindak Lanjut</span>
            <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[9px]">Prioritas Tinggi</span>
          </div>
        </div>

        {/* KPI 3: Kepatuhan (Aman) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mr-6 -mt-6 transition-all group-hover:scale-110 pointer-events-none" />
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              Kepatuhan Sanitasi
            </span>
            <h3 className="text-3xl font-black text-emerald-600 leading-none tracking-tight">
              {tingkatKepatuhan}
            </h3>
          </div>
          <div className="mt-4 z-10">
            <div className="w-full bg-slate-100 rounded-full h-1 mb-1">
              <div 
                className="bg-emerald-500 h-1 rounded-full transition-all duration-500" 
                style={{ width: tingkatKepatuhan }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Rasio Memenuhi Syarat</span>
              <span className="text-emerald-600">{compliantCount} dari {testedCount}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Rasio TPP / TFU */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-full -mr-6 -mt-6 transition-all group-hover:scale-110 pointer-events-none" />
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              Rasio Objek TPP vs TFU
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-indigo-700">{tppCount}</span>
              <span className="text-slate-300 text-lg font-light">/</span>
              <span className="text-lg font-bold text-slate-500">{tfuCount}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-450 mt-4 font-semibold flex items-center justify-between z-10">
            <span>Total TPP : TFU</span>
            <span className="text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded text-[9px] font-bold">Objek Sasaran</span>
          </div>
        </div>
      </div>

      {/* Map Tracker and Activity logs Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
        {/* Geospatial Map Tracker Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm lg:col-span-8 flex flex-col h-[480px]">
          <div className="flex items-center justify-between gap-4 mb-3 border-b border-slate-50 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-sky-50 rounded-lg text-sky-600">
                <Map className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Pemetaan Geospasial Sanitasi</h4>
                <p className="text-[10px] text-slate-400">Visualisasi sebaran titik sanitasi real-time di pelabuhan</p>
              </div>
            </div>
            
            {/* Real-time map status counts */}
            <div className="flex items-center gap-2 text-[9px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {countHijau} MS
              </span>
              <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {filteredPlaces.filter(p => p.Status_Terakhir === "Kuning").length} TMS
              </span>
              <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {countMerah} TMS
              </span>
            </div>
          </div>
          
          <div 
            id="mapTracker" 
            className="w-full flex-1 rounded-xl border border-slate-200 shadow-inner z-10 overflow-hidden relative"
          />
        </div>

        {/* Live Active Audits Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm lg:col-span-4 flex flex-col h-[480px]">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
            <span className="p-1.5 bg-sky-50 rounded-lg text-sky-600">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Riwayat Terkini Audit Lapangan</h4>
              <p className="text-[10px] text-slate-400">Log sinkronisasi hasil inspeksi terbaru</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                <BadgeInfo className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                <span className="text-xs font-bold text-slate-500">Belum ada riwayat aktivitas</span>
                <p className="text-[10px] text-slate-400 text-center px-6 mt-0.5">Lakukan inspeksi lapangan untuk menyelaraskan data</p>
              </div>
            ) : (
              logs.slice(0, 10).map((log, idx) => {
                const isCompliant = log.Kesimpulan_Sistem === "Memenuhi Syarat";
                return (
                  <div 
                    key={idx} 
                    className="group bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition-all hover:border-slate-200 flex gap-3 items-start"
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 transition-transform group-hover:scale-105 ${
                      isCompliant 
                        ? "text-emerald-700 bg-emerald-100/70" 
                        : "bg-rose-100/70 text-rose-700"
                    }`}>
                      {isCompliant ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertOctagon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-1">
                        <p className="font-bold text-xs text-slate-800 truncate leading-snug group-hover:text-sky-700 transition-colors">
                          {log.Nama_Tempat}
                        </p>
                        <span className="text-[9px] text-slate-400 font-medium flex-shrink-0">
                          {log.Timestamp ? log.Timestamp.split(" ")[0] : "-"}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-450 block mt-0.5 font-semibold">
                        {log.Wilayah} • {log.Kategori || "Audit"}
                      </span>
                      <div className="mt-2 flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                          isCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          Skor: {log.Total_Skor}
                        </span>
                        <span className="text-[9px] text-slate-450 font-bold truncate max-w-[100px]" title={log.Nama_Pemeriksa}>
                          👤 {log.Nama_Pemeriksa.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid of location card items */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-150 pb-3 gap-2">
          <div>
            <h4 className="font-black text-slate-800 text-base tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" />
              <span>Rincian Lokasi Pantau Lapangan</span>
            </h4>
            <p className="text-[10px] text-slate-400">Daftar objek sasaran pengawasan dan status kepatuhan terbarunya</p>
          </div>
          <span className="text-[10px] bg-slate-900 text-white font-black py-1 px-3.5 rounded-full shadow-sm">
            Wilayah: {activeWilayah}
          </span>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="bg-slate-50/50 rounded-2xl p-12 text-center border border-slate-200">
            <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 block mb-3 stroke-1" />
            <h5 className="font-bold text-sm text-slate-700">Tidak ada Tempat Ditemukan</h5>
            <p className="text-xs mt-1 text-slate-400 max-w-md mx-auto">Sesuaikan filter bulan & tahun di atas atau lakukan registrasi objek baru untuk mendaftarkan sasaran peninjauan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaces.map(place => {
              const scoreNum = parseFloat(String(place.Total_Skor || "0"));
              const isInspected = place.Status_Terakhir !== "Belum";
              
              let statusBadgeBg = "bg-slate-100 text-slate-600 border-slate-200";
              let statusText = "Belum Inspeksi";
              let accentColorHex = "border-t-slate-400";
              let scoreColorClass = "text-slate-400";

              if (place.Status_Terakhir === "Hijau") {
                statusBadgeBg = "bg-emerald-50 text-emerald-700 border-emerald-100";
                statusText = "🟢 Memenuhi Syarat";
                accentColorHex = "border-t-emerald-500";
                scoreColorClass = "text-emerald-600";
              } else if (place.Status_Terakhir === "Kuning") {
                statusBadgeBg = "bg-amber-50 text-amber-700 border-amber-150";
                statusText = "🟡 Tidak Memenuhi Syarat";
                accentColorHex = "border-t-amber-500";
                scoreColorClass = "text-amber-600";
              } else if (place.Status_Terakhir === "Merah") {
                statusBadgeBg = "bg-rose-50 text-rose-700 border-rose-150";
                statusText = "🔴 Tidak Memenuhi Syarat";
                accentColorHex = "border-t-rose-500";
                scoreColorClass = "text-rose-600";
              }

              return (
                <div 
                  key={place.ID_Tempat}
                  className={`bg-white rounded-2xl p-5 border border-slate-150 border-t-4 ${accentColorHex} shadow-sm hover:shadow-md hover:border-slate-250 transition-all flex flex-col justify-between group`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                        {place.Kategori}
                      </span>
                      <span className={`text-[9px] font-black border px-2 py-0.5 rounded-lg ${statusBadgeBg}`}>
                        {statusText}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-sm text-slate-800 leading-snug tracking-tight mb-1 group-hover:text-sky-600 transition-colors truncate">
                        {place.Nama_Tempat}
                      </h5>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{place.Wilayah}</span>
                      </div>
                      <p className="text-[11px] text-slate-450 line-clamp-2 leading-relaxed min-h-[34px]" title={place.Alamat}>
                        {place.Alamat || "Alamat tidak spesifik."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-slate-100 flex justify-between items-center bg-transparent">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Hasil Skor</span>
                      <span className={`font-black text-sm ${scoreColorClass}`}>
                        {isInspected && place.Total_Skor !== "-" ? `${place.Total_Skor} Poin` : "N/A"}
                      </span>
                    </div>
                    
                    <div className="text-right flex flex-col">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Tanggal Tinjau</span>
                      <span className="text-slate-500 font-bold text-xs">{place.Tgl_Inspeksi || "Belum Audited"}</span>
                    </div>
                  </div>

                  {/* Micro score progress bars for luxury UX */}
                  {isInspected && scoreNum > 0 && (
                    <div className="mt-2.5">
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            place.Status_Terakhir === "Hijau" ? "bg-emerald-500" :
                            place.Status_Terakhir === "Kuning" ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${scoreNum}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stacked Chart & Status Breakdown diagrams with gorgeous visual design */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
        <div>
          <h4 className="font-black text-slate-800 text-sm tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <span>Analisis Distribusi Kelayakan dan Rasio Kerja</span>
          </h4>
          <p className="text-[10px] text-slate-450">Statistik pembanding kelayakan sanitasi serta pemetaan kategori per kecamatan</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* Doughnut Pie chart with central indicator */}
          <div className="md:col-span-4 flex flex-col items-center border border-slate-100 p-4 rounded-2xl bg-slate-50/40">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 mb-3 text-center">Status Kelayakan Lapangan</span>
            <div className="w-full h-[240px] relative flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Tidak ada data untuk diagram bulat</div>
              ) : (
                <>
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none">Terlaksana</span>
                    <span className="text-3xl font-black text-slate-800 mt-0.5">{testedCount}</span>
                    <span className="text-[9px] text-slate-450 uppercase font-bold mt-0.5">Audit</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={68}
                        outerRadius={88}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: "11px", 
                          borderRadius: "12px", 
                          border: "1px solid #e2e8f0", 
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          fontWeight: "bold"
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
            
            {/* Custom Interactive Legend badges */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-3 text-[10px]">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 bg-white border border-slate-150 rounded-lg p-1.5 px-3.5 shadow-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-slate-600">{item.name}: <b className="text-slate-800 font-black">{item.value}</b></span>
                </div>
              ))}
            </div>
          </div>

          {/* Stacked Bar chart featuring gradient definitions and beautiful coordinate labels */}
          <div className="md:col-span-8 border border-slate-100 p-4 rounded-2xl bg-slate-50/40 flex flex-col">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 mb-3 text-center">Rasio Usaha TPP vs Fasilitas TFU per Wilayah</span>
            <div className="w-full flex-1 min-h-[240px] h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  {/* Define premium linear gradient fills */}
                  <defs>
                    <linearGradient id="tppUrl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#0369a1" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="tfuUrl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#475569" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: "700", fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 9, fontWeight: "500", fill: "#64748b" }} />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: "11px", 
                      borderRadius: "12px", 
                      border: "1px solid #e2e8f0", 
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      fontWeight: "750"
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: "bold", paddingTop: "8px" }} />
                  <Bar dataKey="tpp" fill="url(#tppUrl)" name="Tempat Pengolahan Pangan (TPP)" stackId="a" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="tfu" fill="url(#tfuUrl)" name="Tempat Fasilitas Umum (TFU)" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Regional summary detailed table */}
      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
        <div className="p-4 px-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">Rekapitulasi Kategori per Wilayah Kerja BKK</h4>
            <p className="text-[10px] text-slate-400">Peta sebaran total audit memenuhi syarat dan tidak memenuhi syarat tiap kecamatan</p>
          </div>
          <button 
            type="button"
            onClick={onNavigateToRekap}
            className="text-xs text-sky-600 hover:text-sky-750 font-black flex items-center justify-center gap-1 transition-all border border-sky-100 bg-sky-50 py-1.5 px-3 rounded-lg active:scale-95"
          >
            <span>Selanjutnya, Lihat Rekap Seluruhnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 uppercase font-black text-[9px] border-b border-slate-200">
                <th className="py-3 px-5 tracking-wider">Wilayah Kerja BKK</th>
                <th className="py-3 px-5 text-center tracking-wider">Target TPP (Kantin / Rumah Makan)</th>
                <th className="py-3 px-5 text-center tracking-wider">Target TFU (Toilet / Terminal)</th>
                <th className="py-3 px-5 text-center tracking-wider">🟢 MS</th>
                <th className="py-3 px-5 text-center tracking-wider">🟡 TMS</th>
                <th className="py-3 px-5 text-center tracking-wider">🔴 TMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableSummary.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3 px-5 font-bold text-slate-700">{row.wilayah}</td>
                  <td className="py-3 px-5 text-center font-black text-sky-750 bg-sky-50/10">{row.jmlTPP} tempat</td>
                  <td className="py-3 px-5 text-center font-bold text-slate-500">{row.jmlTFU} tempat</td>
                  <td className="py-3 px-5 text-center">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-3.5 py-1 rounded-full text-[10px]">
                      {row.memenuhi}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-center">
                    <span className="bg-amber-50 text-amber-700 border border-amber-100 font-extrabold px-3.5 py-1 rounded-full text-[10px]">
                      {row.tidakKuning}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-center">
                    <span className="bg-rose-50 text-rose-700 border border-rose-100 font-extrabold px-3.5 py-1 rounded-full text-[10px]">
                      {row.tidakMerah}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
