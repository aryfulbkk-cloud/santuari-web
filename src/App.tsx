import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, ShieldCheck, ClipboardCheck, MapPin, 
  FolderCheck, LogOut, ShieldAlert, Heart, Menu, Loader2 
} from "lucide-react";

import HomeDashboard from "./components/HomeDashboard";
import InspeksiForm from "./components/InspeksiForm";
import RegistrasiForm from "./components/RegistrasiForm";
import RekapView from "./components/RekapView";
import LaporMasyarakat from "./components/LaporMasyarakat";
import AuthOtorisasi from "./components/AuthOtorisasi";
import SuperAdminReset from "./components/SuperAdminReset";
import { SuperAdminPetugas } from "./components/SuperAdminPetugas";
import { ErrorBoundary } from "./ErrorBoundary";
import { Tempat, LogInspeksi, Petugas } from "./types";

export default function App() {
  const [activeView, setActiveView] = useState<"dashboard" | "inspeksi" | "registrasi" | "rekap" | "superadmin">("dashboard");
  
  // Lazy init auth states with 3-hour local check
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    const isLogged = localStorage.getItem("santuari_logged_in");
    const lastActive = localStorage.getItem("santuari_last_active");
    if (isLogged === "true" && lastActive) {
      const elapsed = Date.now() - Number(lastActive);
      // 3 hours = 3 * 60 * 60 * 1000 = 10,800,000 ms
      if (elapsed < 3 * 60 * 60 * 1000) {
        return true;
      }
    }
    return false;
  });

  const [currentWilayah, setCurrentWilayah] = useState(() => {
    if (typeof window === "undefined") return "";
    const isLogged = localStorage.getItem("santuari_logged_in");
    const lastActive = localStorage.getItem("santuari_last_active");
    if (isLogged === "true" && lastActive) {
      const elapsed = Date.now() - Number(lastActive);
      if (elapsed < 3 * 60 * 60 * 1000) {
        return localStorage.getItem("santuari_wilayah") || "";
      }
    }
    return "";
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dashboardWilayah, setDashboardWilayah] = useState("Semua Wilayah");

  // Keep dashboardWilayah in sync with active officer's Wilker access limit
  useEffect(() => {
    if (currentWilayah && currentWilayah !== "Tembilahan Induk" && currentWilayah !== "Super Admin") {
      setDashboardWilayah(currentWilayah);
    } else {
      setDashboardWilayah("Semua Wilayah");
    }
  }, [currentWilayah]);

  // Core Database Collections
  const [places, setPlaces] = useState<Tempat[]>([]);
  const [logs, setLogs] = useState<LogInspeksi[]>([]);
  const [officers, setOfficers] = useState<Petugas[]>([]);
  const [loading, setLoading] = useState(true);

  // Greeting based on server/local hour
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 11) return "Pagi 👋";
    if (hr < 15) return "Siang ☀️";
    if (hr < 18) return "Sore 🌇";
    return "Malam 🌙";
  };

  // Synchronize data from Express server
  const synchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch places
      const resDash = await fetch("/api/dashboard");
      const dataDash = await resDash.json();
      if (dataDash.status === "success") {
        setPlaces(dataDash.data);
      }

      // 2. Fetch inspection history
      const resRekap = await fetch("/api/rekap");
      const dataRekap = await resRekap.json();
      if (dataRekap.status === "success") {
        setLogs(dataRekap.data);
      }

      // 3. Fetch officer directory
      const resPetugas = await fetch("/api/petugas");
      const dataPetugas = await resPetugas.json();
      if (dataPetugas.status === "success") {
        setOfficers(dataPetugas.data);
      }
    } catch (err) {
      console.error("Error synchronizing data with Server:", err);
    } finally {
      setLoading(false);
    }
  };

  // Interaction timer update to capture absolute active workflow usage and logs
  useEffect(() => {
    if (!isLoggedIn) return;

    const updateInactivityTimer = () => {
      localStorage.setItem("santuari_last_active", Date.now().toString());
    };

    const checkInactivity = () => {
      const lastActive = localStorage.getItem("santuari_last_active");
      if (lastActive) {
        const elapsed = Date.now() - Number(lastActive);
        if (elapsed >= 3 * 60 * 60 * 1000) {
          handleLogout();
        }
      }
    };

    window.addEventListener("mousedown", updateInactivityTimer);
    window.addEventListener("keydown", updateInactivityTimer);
    window.addEventListener("scroll", updateInactivityTimer);
    window.addEventListener("touchstart", updateInactivityTimer);

    const interval = setInterval(checkInactivity, 60 * 1000); // Check once a minute

    return () => {
      window.removeEventListener("mousedown", updateInactivityTimer);
      window.removeEventListener("keydown", updateInactivityTimer);
      window.removeEventListener("scroll", updateInactivityTimer);
      window.removeEventListener("touchstart", updateInactivityTimer);
      clearInterval(interval);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    synchAllData();
  }, []);

  const handleLoginSuccess = (wilayah: string, token: string) => {
    setIsLoggedIn(true);
    setCurrentWilayah(wilayah);
    localStorage.setItem("santuari_logged_in", "true");
    localStorage.setItem("santuari_wilayah", wilayah);
    localStorage.setItem("santuari_token", token);
    localStorage.setItem("santuari_last_active", Date.now().toString());
    setShowAuthModal(false);
    // If Super Admin, automatically navigate to settings, otherwise dashboard
    if (wilayah === "Super Admin") {
      setActiveView("superadmin");
    } else {
      setActiveView("dashboard");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentWilayah("");
    localStorage.removeItem("santuari_logged_in");
    localStorage.removeItem("santuari_wilayah");
    localStorage.removeItem("santuari_token");
    localStorage.removeItem("santuari_last_active");
    setActiveView("dashboard");
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-gray-50 font-sans leading-normal text-gray-900 pr-sub-print">
      {/* Sidebar Navigation */}
      <aside 
        id="mainAppSidebar"
        className={`fixed lg:static h-screen w-[270px] bg-white border-r border-gray-200 p-6 flex flex-col justify-between z-40 transition-all duration-300 print:hidden ${
          mobileSidebarOpen ? "left-0 shadow-lg" : "-left-[270px] lg:left-0"
        }`}
      >
        <div className="space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center shadow-sm">
              <img 
                src="https://kespelcilacap.com/wp-content/uploads/2025/10/Logo-BKK.png" 
                alt="Logo BKK" 
                className="w-7 h-auto drop-shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight text-gray-800">SANTUARI</h1>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest block uppercase">V2.0 ENTERPRISE</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-3 mb-2">
              Menu Publik
            </span>

            <button
              onClick={() => {
                setActiveView("dashboard");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs leading-none transition-all ${
                activeView === "dashboard"
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dasbor Utama</span>
            </button>

            {!isLoggedIn && (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setMobileSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 mt-2 rounded-lg text-sky-700 font-bold text-xs leading-none hover:bg-sky-50 transition-all border border-dashed border-sky-200"
                id="menu-login"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Otorisasi Akses</span>
              </button>
            )}
          </div>

          {/* Secure Officer Menu options */}
          {isLoggedIn && (
            <div className="space-y-1.5 pt-4 border-t border-gray-100 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-3 mb-2">
                {currentWilayah === "Super Admin" ? "Menu Administrator" : "Menu Petugas BKK"}
              </span>

              {currentWilayah === "Super Admin" ? (
                <button
                  onClick={() => {
                    setActiveView("superadmin");
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs leading-none transition-all ${
                    activeView === "superadmin"
                      ? "bg-amber-50 text-amber-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Kelola Akses Akun</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setActiveView("inspeksi");
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs leading-none transition-all ${
                      activeView === "inspeksi"
                        ? "bg-sky-50 text-sky-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Input Inspeksi IKL</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView("registrasi");
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs leading-none transition-all ${
                      activeView === "registrasi"
                        ? "bg-sky-50 text-sky-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Registrasi TPP/TFU</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView("rekap");
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs leading-none transition-all ${
                      activeView === "rekap"
                        ? "bg-sky-50 text-sky-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <FolderCheck className="w-4 h-4" />
                    <span>Rekap Hasil Inspeksi</span>
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 mt-6 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold text-xs leading-none transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Sistem</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info branding block */}
        <div className="space-y-2 border-t border-gray-100 pt-4 text-[10px] text-gray-400 font-medium select-all">
          <p className="flex items-center gap-1 font-semibold">
            <span>SANTUARI BKK Tembilahan</span>
          </p>
          <p>Tembilahan, Indragiri Hilir, Riau</p>
        </div>
      </aside>

      {/* Mobile Sidebar overlay gray curtain */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Content Layout container */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto p-4 md:p-8 relative print:p-0 print:overflow-visible">
        {/* Top Header Row of Main Content */}
        <header 
          id="appHeaderBar"
          className="flex justify-between items-center pb-5 mb-5 border-b border-gray-200 shrink-0 print:hidden"
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
            >
              <Menu className="w-5 h-5 text-gray-705" />
            </button>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight leading-none">
                Halo, Selamat {getGreeting()}
              </h2>
              <span className="text-[10px] md:text-[11px] text-gray-400 font-semibold block mt-1.5 uppercase tracking-widest">
                Balai Kekarantinaan Kesehatan Kelas II Tembilahan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            {isLoggedIn && (
              <span className="hidden sm:inline bg-emerald-55 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm animate-in slide-in-from-right duration-250">
                👤 Wilayah Kerja: <strong className="font-extrabold">{currentWilayah}</strong>
              </span>
            )}
            <div className="bg-white border border-gray-200 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-[10px] text-gray-600 shadow-sm leading-none font-bold uppercase tracking-wider">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
              <span>Satelit Aktif</span>
            </div>
          </div>
        </header>

        {/* Global Loading Spinner for API synchronization */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-4" />
            <span className="text-sm text-slate-650 font-extrabold animate-pulse">
              Sinkronisasi Data Real-time...
            </span>
            <p className="text-xs text-slate-400 mt-1">Menghubungkan ke satelit database SANTUARI.</p>
          </div>
        ) : (
          /* Actual Content views */
          <div className="flex-1 print:block">
            {activeView === "dashboard" && (
              <HomeDashboard 
                places={places} 
                logs={logs} 
                activeWilayah={dashboardWilayah} 
                setActiveWilayah={(w) => {
                  // Allow custom filter selection for guest, Super Admin, or Tembilahan Induk
                  if (!isLoggedIn || currentWilayah === "Tembilahan Induk" || currentWilayah === "Super Admin") {
                    setDashboardWilayah(w);
                  } else {
                    alert("Akses wilayah Anda terkunci pada: " + currentWilayah);
                  }
                }}
                onNavigateToRekap={() => {
                  if (isLoggedIn) {
                    setActiveView("rekap");
                  } else {
                    setShowAuthModal(true);
                  }
                }}
              />
            )}

            {isLoggedIn && activeView === "inspeksi" && (
              <InspeksiForm
                currentWilayah={currentWilayah}
                places={places}
                officers={officers}
                onSuccess={() => {
                  synchAllData();
                  setActiveView("dashboard");
                }}
              />
            )}

            {isLoggedIn && activeView === "registrasi" && (
              <ErrorBoundary>
                <RegistrasiForm 
                  currentWilayah={currentWilayah}
                  places={places}
                  onSuccess={() => {
                    synchAllData();
                    setActiveView("dashboard");
                  }}
                />
              </ErrorBoundary>
            )}

            {isLoggedIn && activeView === "rekap" && (
              <RekapView 
                logs={currentWilayah === "Tembilahan Induk" ? logs : logs.filter(l => l.Wilayah === currentWilayah)} 
                onRefresh={synchAllData}
              />
            )}

            {isLoggedIn && activeView === "superadmin" && currentWilayah === "Super Admin" && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                <SuperAdminPetugas />
                <SuperAdminReset />
              </div>
            )}
          </div>
        )}

        {/* Floating whatsapp messenger */}
        <LaporMasyarakat />

        {/* Auth Entry PIN Modal overlay */}
        {showAuthModal && (
          <AuthOtorisasi 
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setShowAuthModal(false)}
          />
        )}
      </main>
    </div>
  );
}
