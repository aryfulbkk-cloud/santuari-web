import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, HardDrive, Info, Edit3, Plus, Trash2, 
  History, User, Image as ImageIcon, AlertOctagon,
  Eye, Check, EyeOff, ShieldAlert, FileText, Calendar, Compass
} from "lucide-react";
import { Tempat } from "../types";

interface RegistrasiFormProps {
  currentWilayah: string;
  places: Tempat[];
  onSuccess: () => void;
}

export default function RegistrasiForm({ currentWilayah, places, onSuccess }: RegistrasiFormProps) {
  const [formMode, setFormMode] = useState<"tambah" | "ubah">("tambah");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>("");

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("Tempat Pengolahan Pangan (TPP)");
  const [alamat, setAlamat] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [karyawan, setKaryawan] = useState<number | "">("");
  const [koordinat, setKoordinat] = useState("");
  const [statusAktif, setStatusAktif] = useState<'Aktif' | 'Tidak Aktif'>("Aktif");
  const [avatar, setAvatar] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [changeLogs, setChangeLogs] = useState<any[]>([]);
  const [showingLogs, setShowingLogs] = useState(true);

  const pickerMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Filter places based on the current user's authority area
  const editablePlaces = places.filter(p => 
    currentWilayah === "Tembilahan Induk" || p.Wilayah === currentWilayah
  );

  // Fetch modification logs audit trail
  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/changelogs");
      const data = await res.json();
      if (data.status === "success") {
        setChangeLogs(data.data);
      }
    } catch (e) {
      console.error("Gagal mengambil log audit trail:", e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [submitting]);

  // Handle selected place changes in ubah mode
  useEffect(() => {
    if (formMode === "ubah" && selectedPlaceId) {
      const place = places.find(p => p.ID_Tempat === selectedPlaceId);
      if (place) {
        setNama(place.Nama_Tempat || "");
        setKategori(place.Kategori || "Tempat Pengolahan Pangan (TPP)");
        setAlamat(place.Alamat || "");
        setPenanggungJawab(place.Penanggung_Jawab || "");
        setKaryawan(place.Jml_Karyawan || "");
        setKoordinat(place.Koordinat_Map || "");
        setStatusAktif(place.Status_Aktif || "Aktif");
        setAvatar(place.Avatar || "");

        // Set Map coordinate point
        if (pickerMapRef.current && place.Koordinat_Map && place.Koordinat_Map.includes(",")) {
          const [latStr, lngStr] = place.Koordinat_Map.split(",");
          const lat = parseFloat(latStr.trim());
          const lng = parseFloat(lngStr.trim());
          if (!isNaN(lat) && !isNaN(lng)) {
            const L = (window as any).L;
            if (L) {
              const latlng = L.latLng(lat, lng);
              pickerMapRef.current.setView(latlng, 15);
              if (markerRef.current) {
                markerRef.current.setLatLng(latlng);
              } else {
                const redIcon = L.divIcon({
                  className: "custom-marker-picker",
                  html: `<div style="background-color:#ef4444; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.45);"></div>`,
                  iconSize: [22, 22],
                  iconAnchor: [11, 11]
                });
                markerRef.current = L.marker(latlng, { icon: redIcon }).addTo(pickerMapRef.current);
              }
            }
          }
        }
      }
    } else if (formMode === "tambah") {
      setNama("");
      setKategori("Tempat Pengolahan Pangan (TPP)");
      setAlamat("");
      setPenanggungJawab("");
      setKaryawan("");
      setKoordinat("");
      setStatusAktif("Aktif");
      setAvatar("");
      
      // Center back to default wilayah position on Map Picker
      const L = (window as any).L;
      if (L && pickerMapRef.current) {
        const DEFAULT_CENTERS: Record<string, [number, number]> = {
          "Tembilahan Induk": [-0.326650, 103.160350],
          "Kuala Gaung": [-0.166839, 103.457208],
          "Sungai Guntung": [0.305106, 103.614661],
          "Kuala Enok": [-0.517097, 103.389842],
          "Pulau Kijang": [-0.687044, 103.205208],
          "Rengat": [-0.472606, 102.688756]
        };
        const center = DEFAULT_CENTERS[currentWilayah] || [-0.326650, 103.160350];
        pickerMapRef.current.setView(center, 14);
        if (markerRef.current) {
          pickerMapRef.current.removeLayer(markerRef.current);
          markerRef.current = null;
        }
      }
    }
  }, [selectedPlaceId, formMode]);

  // Handle map initialization
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).L) return;
    const L = (window as any).L;

    const DEFAULT_CENTERS: Record<string, [number, number]> = {
      "Tembilahan Induk": [-0.326650, 103.160350],
      "Kuala Gaung": [-0.166839, 103.457208],
      "Sungai Guntung": [0.305106, 103.614661],
      "Kuala Enok": [-0.517097, 103.389842],
      "Pulau Kijang": [-0.687044, 103.205208],
      "Rengat": [-0.472606, 102.688756]
    };

    const center = DEFAULT_CENTERS[currentWilayah] || [-0.326650, 103.160350];

    const mapContainer = document.getElementById("mapPicker");
    if (!mapContainer) return;

    pickerMapRef.current = L.map("mapPicker").setView(center, 13);
    
    // Satelite high precision map
    const tileUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "&copy; Google Maps"
    }).addTo(pickerMapRef.current);

    const onMapClick = (e: any) => {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      setKoordinat(`${lat},${lng}`);

      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      } else {
        const redIcon = L.divIcon({
          className: "custom-marker-picker",
          html: `<div style="background-color:#ef4444; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.45);"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        markerRef.current = L.marker(e.latlng, { icon: redIcon }).addTo(pickerMapRef.current);
      }
    };

    pickerMapRef.current.on("click", onMapClick);

    // Initial load check if coordinates exist (for edit mode)
    if (koordinat && koordinat.includes(",")) {
      const parts = koordinat.split(",");
      const initialLat = parseFloat(parts[0]);
      const initialLng = parseFloat(parts[1]);
      if (!isNaN(initialLat) && !isNaN(initialLng)) {
        const initialLatLng = L.latLng(initialLat, initialLng);
        pickerMapRef.current.setView(initialLatLng, 15);
        if (!markerRef.current) {
          const redIcon = L.divIcon({
            className: "custom-marker-picker",
            html: `<div style="background-color:#ef4444; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.45);"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          markerRef.current = L.marker(initialLatLng, { icon: redIcon }).addTo(pickerMapRef.current);
        }
      }
    }

    return () => {
      if (pickerMapRef.current) {
        pickerMapRef.current.off("click", onMapClick);
        pickerMapRef.current.remove();
        pickerMapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [selectedPlaceId, formMode]);

  // Read images file upload base64 Avatar with client-side compression
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Ideal resolution for avatar thumbnail: max 256px width/height (extremely light)
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.70 quality (excellent thumbnail quality, very small file size)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.70);
          setAvatar(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const clearForm = () => {
    setNama("");
    setKategori("Rumah Makan A1");
    setAlamat("");
    setPenanggungJawab("");
    setKaryawan("");
    setKoordinat("");
    setStatusAktif("Aktif");
    setAvatar("");
    setSelectedPlaceId("");
    if (markerRef.current && pickerMapRef.current) {
      pickerMapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !alamat.trim() || !koordinat) {
      setErrorText("Harap isi seluruh formulir: Nama, Alamat, dan tentukan letak di peta geospasial!");
      return;
    }

    setSubmitting(true);
    setErrorText("");

    try {
      if (formMode === "tambah") {
        // Registering a new TPP/TFU
        const token = localStorage.getItem("santuari_token") || "";
        const res = await fetch("/api/tempat", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            nama: nama.trim(),
            kategori,
            alamat: alamat.trim(),
            penanggung_jawab: penanggungJawab.trim() || "-",
            jml_karyawan: karyawan === "" ? 0 : Number(karyawan),
            wilayah: currentWilayah,
            koordinat,
            status_aktif: statusAktif,
            avatar,
            operator: currentWilayah
          })
        });
        const resData = await res.json();
        if (resData.status === "success") {
          alert(`Sukses mendaftarkan sarana baru: "${nama.trim()}"`);
          clearForm();
          onSuccess();
        } else {
          setErrorText(resData.message || "Gagal menyimpan pendaftaran.");
        }
      } else {
        // Updating an existing TPP/TFU
        const originalPlace = places.find(p => p.ID_Tempat === selectedPlaceId);
        const token = localStorage.getItem("santuari_token") || "";
        const res = await fetch("/api/tempat/update", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedPlaceId,
            nama: nama.trim(),
            kategori,
            alamat: alamat.trim(),
            penanggung_jawab: penanggungJawab.trim() || "-",
            jml_karyawan: karyawan === "" ? 0 : Number(karyawan),
            wilayah: originalPlace ? originalPlace.Wilayah : currentWilayah,
            koordinat,
            status_aktif: statusAktif,
            avatar,
            operator: currentWilayah,
            // Keep last inspection info untouched inside updates
            status_terakhir: originalPlace ? originalPlace.Status_Terakhir : "Belum",
            tgl_inspeksi: originalPlace ? originalPlace.Tgl_Inspeksi : "",
            total_skor: originalPlace ? originalPlace.Total_Skor : "-"
          })
        });
        const resData = await res.json();
        if (resData.status === "success") {
          alert(`Sukses memperbarui data sarana: "${nama.trim()}"`);
          clearForm();
          onSuccess();
        } else {
          setErrorText(resData.message || "Gagal memperbarui data.");
        }
      }
    } catch (err: any) {
      setErrorText("Gagal menyimpan data ke Server. Masalah koneksi: " + err.toString());
    } finally {
      setSubmitting(false);
    }
  };

  // Secure Delete Handler only allowed for "Tembilahan Induk"
  const handleDeletePlace = async () => {
    if (!selectedPlaceId) return;
    const place = places.find(p => p.ID_Tempat === selectedPlaceId);
    if (!place) return;

    // Must be marked as Non-Active first
    const isAktif = (place.Status_Aktif || "Aktif") === "Aktif";
    if (isAktif) {
      alert("Peringatan: Sarana pengawasan yang masih Aktif tidak boleh dihapus! Anda harus mengubah status sarana menjadi 'Tidak Aktif' terlebih dahulu.");
      return;
    }

    // Must be from Kantor Induk Tembilahan
    if (currentWilayah !== "Tembilahan Induk") {
      alert("Keamanan Ditolak: Hanya admin atau pejabat dari Kantor Induk Tembilahan yang berwenang menghapus tempat pengawasan tidak aktif!");
      return;
    }

    const doubleCheck = window.confirm(`Apakah Anda yakin ingin menghapus "${place.Nama_Tempat}" dari pengawasan secara permanen? Tindakan ini akan dicatat di log audit trail.`);
    if (!doubleCheck) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch("/api/tempat/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedPlaceId,
          operator: currentWilayah
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        alert("Sarana pengawasan sukses dihapus dari database.");
        clearForm();
        onSuccess();
      } else {
        alert("Gagal menghapus: " + data.message);
      }
    } catch (err) {
      alert("Kesalahan jaringan: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      
      {/* Choice mode buttons header block */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3 text-center">
          PILIH OPERASI PENDAFTARAN / PERUBAHAN
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setFormMode("tambah");
              clearForm();
            }}
            className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-lg border transition-all text-center ${
              formMode === "tambah"
                ? "bg-sky-50 border-sky-400 text-sky-700 font-bold"
                : "bg-gray-50/50 border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <Plus className="w-5 h-5" />
            <div className="leading-none">
              <span className="text-xs block">Registrasi Baru</span>
              <span className="text-[10px] text-gray-400 block mt-1 font-normal">Mendaftarkan sarana TPP/TFU baru</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormMode("ubah");
              clearForm();
            }}
            className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-lg border transition-all text-center ${
              formMode === "ubah"
                ? "bg-indigo-50/80 border-indigo-400 text-indigo-700 font-bold"
                : "bg-gray-50/50 border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <Edit3 className="w-5 h-5" />
            <div className="leading-none">
              <span className="text-xs block">Perubahan Data</span>
              <span className="text-[10px] text-gray-400 block mt-1 font-normal">Mengubah / Edit data sarana yang ada</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Registration and Custom Form Card */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
        
        {/* Visual corner badge for mode indicators */}
        <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-bold text-white rounded-bl-lg uppercase tracking-wider ${
          formMode === "tambah" ? "bg-sky-600" : "bg-indigo-600"
        }`}>
          {formMode === "tambah" ? "TAMBAH MASTER DATA" : "EDIT MASTER DATA"}
        </div>

        <div className="mb-6 flex items-start gap-4">
          <div className={`p-2.5 rounded-lg ${
            formMode === "tambah" ? "bg-sky-55/10 bg-sky-50 text-sky-600" : "bg-indigo-50 text-indigo-600"
          }`}>
            {formMode === "tambah" ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 tracking-tight">
              {formMode === "tambah" ? "Registrasi Sarana TPP/TFU Baru" : "Pengubahan Data Sarana Terdaftar"}
            </h3>
            <p className="text-xs text-gray-400">
              {formMode === "tambah" 
                ? "Mendaftarkan sarana atau tempat usaha baru ke dalam pengawasan Balai Kekarantinaan Kesehatan." 
                : "Sesuaikan atribut, nama pemilik, lokasi spasial GPS, atau mengubah ke status non-aktif."
              }
            </p>
          </div>
        </div>

        {/* Search selector if in edit mode */}
        {formMode === "ubah" && (
          <div className="mb-6 pb-6 border-b border-gray-150 animate-in slide-in-from-top-3 duration-200">
            <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-2">
              Pilih Sarana Yang Ingin Anda Ubah <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPlaceId}
              onChange={(e) => setSelectedPlaceId(e.target.value)}
              className="w-full text-xs font-semibold text-gray-700 bg-white border border-indigo-200 focus:border-indigo-500 rounded-lg px-3.5 py-3 outline-none transition-all shadow-xs"
              id="selectEditPlace"
            >
              <option value="">-- Pilih Sarana {currentWilayah === "Tembilahan Induk" ? "(Semua Wilayah)" : `(Wilker ${currentWilayah})`} --</option>
              {editablePlaces.map(p => (
                <option key={p.ID_Tempat} value={p.ID_Tempat}>
                  [{p.ID_Tempat}] {p.Nama_Tempat} ({p.Kategori}) - Wilker: {p.Wilayah} {(p.Status_Aktif === "Tidak Aktif") ? " [TIDAK AKTIF]" : ""}
                </option>
              ))}
            </select>
            {editablePlaces.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-2">Belum ada sarana terdaftar di bawah wewenang wilayah kerja Anda.</p>
            )}
          </div>
        )}

        {(formMode === "tambah" || selectedPlaceId) ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row: Name and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Nama Tempat / Usaha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Cth: Kantin Pelabuhan Pelindo"
                  className="w-full text-xs font-medium text-gray-700 bg-white border border-gray-250 focus:border-sky-500 rounded-lg px-3.5 py-2.5 outline-none transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Kategori Sarana <span className="text-red-500">*</span>
                </label>
                 <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full text-xs font-semibold text-sky-700 bg-white border border-gray-250 focus:border-sky-500 rounded-lg px-3.5 py-2.5 outline-none transition-all shadow-sm"
                >
                  <option value="Tempat Pengolahan Pangan (TPP)">Tempat Pengolahan Pangan (TPP)</option>
                  <option value="Tempat Fasilitas Umum (TFU)">Tempat Fasilitas Umum (TFU)</option>
                  {kategori && kategori !== "Tempat Pengolahan Pangan (TPP)" && kategori !== "Tempat Fasilitas Umum (TFU)" && (
                    <option value={kategori}>{kategori} (Kategori Lama)</option>
                  )}
                </select>
                <p className="text-[9px] text-gray-400 mt-1">
                  Pilih kategori yang sesuai. TPP = Tempat Pengolahan Pangan, TFU = Tempat Fasilitas Umum.
                </p>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={2}
                placeholder="Masukkan alamat operasional detail di area pelabuhan"
                className="w-full text-xs font-medium text-gray-700 bg-white border border-gray-250 focus:border-sky-500 rounded-lg px-3.5 py-2.5 outline-none transition-all shadow-sm resize-y"
                required
              />
            </div>

            {/* Manager and Employees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Nama Pengelola / Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                  placeholder="Cth: Hj. Rosnah"
                  className="w-full text-xs font-medium text-gray-700 bg-white border border-gray-250 focus:border-sky-500 rounded-lg px-3.5 py-2.5 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Jumlah Karyawan Awal / Terdaftar
                </label>
                <input
                  type="number"
                  value={karyawan}
                  onChange={(e) => setKaryawan(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Angka karyawan"
                  className="w-full text-xs font-medium text-gray-700 bg-white border border-gray-250 focus:border-sky-500 rounded-lg px-3.5 py-2.5 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Region (Wilker) & Active Status (Status_Aktif) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Wilayah Kerja Penugasan
                </label>
                <input
                  type="text"
                  value={formMode === "ubah" ? (places.find(p => p.ID_Tempat === selectedPlaceId)?.Wilayah || currentWilayah) : currentWilayah}
                  readOnly
                  className="w-full text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 outline-none cursor-not-allowed"
                />
                <span className="text-[9px] text-gray-400 mt-1 block">Wewenang wilayah terkunci otomatis berdasarkan hak akses login Anda.</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Status Keaktifan Tempat
                </label>
                <select
                  value={statusAktif}
                  onChange={(e) => setStatusAktif(e.target.value as any)}
                  className={`w-full text-xs font-bold rounded-lg px-3.5 py-2.5 outline-none border transition-all shadow-sm ${
                    statusAktif === "Aktif"
                      ? "text-emerald-700 border-emerald-250 bg-emerald-50 focus:border-emerald-500"
                      : "text-rose-700 border-rose-250 bg-rose-50 focus:border-rose-500"
                  }`}
                >
                  <option value="Aktif">🟢 AKTIF (Tampil di dasbor geospasial & siap diperiksa)</option>
                  <option value="Tidak Aktif">🔴 TIDAK AKTIF (Hanya bisa dihapus oleh pejabat induk Tembilahan)</option>
                </select>
              </div>
            </div>

            {/* AVATAR UPLOAD WIDGET (REUIREMENT 5) */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-5 border border-gray-250 space-y-4">
              <label className="text-[11px] font-extrabold text-gray-600 block flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-600 font-bold" />
                <span>Unggah Foto Avatar / Miniatur Sarana (Requirement 5)</span>
              </label>
              <p className="text-[10px] text-gray-400">
                Gambar mini ini akan muncul sebagai avatar ikonik eksklusif untuk tempat ini pada popup peta geospasial dasbor utama.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Image preview box */}
                <div className="w-16 h-16 rounded-lg bg-gray-200 border border-gray-300 overflow-hidden flex items-center justify-center relative shrink-0">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar("")}
                      className="absolute inset-0 bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-[9px] font-bold leading-none opacity-0 hover:opacity-100 transition-opacity"
                    >
                      HAPUS
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 file:cursor-pointer hover:file:bg-sky-100"
                    id="fileAvatar"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Standard scenic illustration fallback
                        const tppKeywords = ["TPP", "Rumah", "Makan", "Kantin", "Catering", "Depot", "Warung", "Kedai", "Boga"];
                        const isKategoriTPP = tppKeywords.some(kw => kategori.includes(kw));
                        const fallbackType = isKategoriTPP
                          ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=60" 
                          : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60";
                        setAvatar(fallbackType);
                      }}
                      className="text-[10px] text-sky-700 hover:underline font-semibold leading-none"
                    >
                      Gunakan Foto Ilustrasi Kategori Default
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Map Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Penetapan Titik GPS Geospasial <span className="text-red-500">*</span>
                </label>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Usap atau klik langsung pada area peta satelit di bawah ini untuk mengunci titik koordinat spasial sarana yang benar secara presisi.
              </p>
              
              <div 
                id="mapPicker" 
                className="w-full h-80 rounded-lg border border-gray-200 shadow-sm cursor-crosshair z-10"
              />

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
                <input
                  type="text"
                  value={koordinat}
                  readOnly
                  placeholder="Koordinat GPS (Klik Langsung Pada Peta Di Atas)"
                  className="w-full text-center text-xs font-semibold text-sky-700 bg-sky-50/50 border border-sky-100/70 rounded-lg px-3.5 py-2.5 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const L = (window as any).L;
                    if (!L || !pickerMapRef.current) return;
                    // Detect user location
                    pickerMapRef.current.locate({ setView: true, maxZoom: 16 });
                    pickerMapRef.current.on('locationfound', (e: any) => {
                      setKoordinat(`${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`);
                      if (markerRef.current) {
                        markerRef.current.setLatLng(e.latlng);
                      } else {
                        const redIcon = L.divIcon({
                          className: "custom-marker-picker",
                          html: `<div style="background-color:#ef4444; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.45);"></div>`,
                          iconSize: [22, 22],
                          iconAnchor: [11, 11]
                        });
                        markerRef.current = L.marker(e.latlng, { icon: redIcon }).addTo(pickerMapRef.current);
                      }
                    });
                  }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-lg border border-gray-200 transition-all shadow-xs leading-none shrink-0"
                >
                  📍 Gunakan Lokasi GPS Saya Saat Ini
                </button>
              </div>
            </div>

            {errorText && (
              <div className="text-xs text-red-650 font-medium bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                {errorText}
              </div>
            )}

            {/* Actions button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-sky-600 hover:bg-sky-700 font-bold text-white rounded-lg py-3 flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-sky-100/50 disabled:opacity-50 text-xs cursor-pointer"
              >
                <HardDrive className="w-4 h-4 font-bold" />
                <span>
                  {submitting 
                    ? "Menyimpan data..." 
                    : formMode === "tambah" 
                      ? "Daftarkan Sarana Terdaftar" 
                      : "Simpan Perbaikan Atribut Sarana"
                  }
                </span>
              </button>

              {formMode === "ubah" && (
                <button
                  type="button"
                  onClick={handleDeletePlace}
                  disabled={submitting}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-bold px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all border border-rose-200 text-xs cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Sarana Secara Permanen</span>
                </button>
              )}
            </div>

          </form>
        ) : (
          <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Compass className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-bounce" />
            <span className="text-xs font-bold text-indigo-800 block">Pilih Sarana di Atas</span>
            <p className="text-[10px] text-gray-400 mt-1">Gunakan opsi dropdown untuk memuat data sarana dalam pengawasan guna dirubah.</p>
          </div>
        )}

      </div>

      {/* CHANGES LOG AUDIT TRAIL WIDGET (REQUIREMENT 3 & 4) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowingLogs(!showingLogs)}
          className="w-full flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 font-bold text-xs text-gray-750 hover:bg-gray-100/70 transition-all text-left"
        >
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-amber-600 animate-spin-slow duration-1000" />
            <div>
              <span className="block font-bold">Log Riwayat Perubahan & Audit Trail (Requirement 3)</span>
              <span className="text-[10px] text-gray-400 font-normal">Merekam audit penambahan, pengubahan, dan penghapusan data secara transparan</span>
            </div>
          </div>
          <div className="bg-white px-2.5 py-1 text-[9px] font-bold text-gray-500 border rounded-full">
            {showingLogs ? "Sembunyikan" : "Tampilkan"} Log
          </div>
        </button>

        {showingLogs && (
          <div className="p-5 animate-in fade-in duration-200 overflow-x-auto">
            {changeLogs.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">Belum ada riwayat perubahan yang dicatat di satelit database.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-150 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    <th className="pb-3 width-[80px]">ID LOG</th>
                    <th className="pb-3 width-[130px]">Waktu</th>
                    <th className="pb-3 width-[105px]">Jenis Tindakan</th>
                    <th className="pb-3 width-[150px]">Nama Tempat</th>
                    <th className="pb-3 width-[120px]">Operator Wilker</th>
                    <th className="pb-3">Rincian Deskripsi Kegiatan</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100">
                  {changeLogs.map((log: any) => {
                    let typeBadge = "";
                    if (log.tipe === "TAMBAH") {
                      typeBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
                    } else if (log.tipe === "UBAH") {
                      typeBadge = "bg-sky-50 text-sky-700 border-sky-100";
                    } else {
                      typeBadge = "bg-rose-50 text-rose-700 border-rose-100";
                    }

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-mono text-[10px] font-bold text-gray-500">{log.id}</td>
                        <td className="py-3 text-[10px] text-gray-500 font-medium">
                          {new Date(log.timestamp).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${typeBadge}`}>
                            {log.tipe}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-gray-800">{log.namaTempat}</td>
                        <td className="py-3">
                          <span className="font-bold text-slate-700 text-[11px]">{log.operator}</span>
                        </td>
                        <td className="py-3 text-[11px] leading-relaxed text-gray-500 max-w-[300px] break-words">
                          {log.deskripsi}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
