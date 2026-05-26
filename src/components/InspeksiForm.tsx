import React, { useState, useEffect, useRef } from "react";
import { 
  ClipboardCheck, Info, Users, PenTool, Save, CheckCircle2, 
  HelpCircle, ChevronDown, ListTodo, FileWarning, UploadCloud, Trash2, Camera
} from "lucide-react";
import { Petugas, Tempat, KriteriaItem, DetailJawaban } from "../types";

interface InspeksiFormProps {
  currentWilayah: string;
  places: Tempat[];
  officers: Petugas[];
  onSuccess: () => void;
}

export default function InspeksiForm({ 
  currentWilayah, 
  places, 
  officers, 
  onSuccess 
}: InspeksiFormProps) {
  
  const [filterKategoriJenis, setFilterKategoriJenis] = useState<"" | "TPP" | "TFU">("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Tempat | null>(null);
  
  const [selectedOfficerName, setSelectedOfficerName] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState<Petugas | null>(null);

  const [karyawan, setKaryawan] = useState<number | "">("");
  const [penjamah, setPenjamah] = useState<number | "">("");
  
  const [criteria, setCriteria] = useState<KriteriaItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, { value: number; teks: string; item: KriteriaItem }>>({});
  
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [openSection, setOpenSection] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Drawing signature pad states for inspector and owner
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ownerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isOwnerDrawing, setIsOwnerDrawing] = useState(false);
  const [hasInspectorDrawn, setHasInspectorDrawn] = useState(false);
  const [hasOwnerDrawn, setHasOwnerDrawn] = useState(false);

  // Photos state for proof of activity documentation
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Initialize Canvas stroke styles
  useEffect(() => {
    const initializeCanvasStyle = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a"; // Crisp slate ink
    };

    initializeCanvasStyle(canvasRef.current);
    initializeCanvasStyle(ownerCanvasRef.current);
  }, [selectedPlace]);

  // Inspector coordinate handler
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInspectorDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInspectorDrawn(false);
  };

  // Owner coordinate handler
  const startOwnerDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = ownerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsOwnerDrawing(true);
  };

  const drawOwnerSignature = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isOwnerDrawing) return;
    const canvas = ownerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasOwnerDrawn(true);
  };

  const stopOwnerDrawing = () => {
    setIsOwnerDrawing(false);
  };

  const clearOwnerSignature = () => {
    const canvas = ownerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasOwnerDrawn(false);
  };

  // Drag and drop / file input logic for documentation photos
  // Drag and drop / file input logic for documentation photos with client-side compression
  const addPhotoBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Ideal resolution: max 1024px (crisp, not pixelated, and extremely light)
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
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
          // Compress to JPEG with 0.75 quality (perfect balance, small size, crisp detail)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
          setPhotos(prev => [...prev, compressedBase64]);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(addPhotoBase64);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(addPhotoBase64);
    }
  };

  const removePhoto = (pIdx: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== pIdx));
  };

  // Helper: detect if a kategori string is a TPP type
  const TPP_KW = ["TPP", "Rumah", "Makan", "Kantin", "Catering", "Depot", "Warung", "Kedai", "Boga"];
  const TFU_KW = ["TFU", "Fasilitas", "Terminal", "Pelabuhan", "Pasar", "Pertokoan", "Ibadah", "Masjid", "Penginapan", "Hotel", "Toilet"];
  const isTPPKategori = (kat: string) => TPP_KW.some(kw => kat.includes(kw));
  const isTFUKategori = (kat: string) => TFU_KW.some(kw => kat.includes(kw));

  // Filter places based on active region
  const localPlaces = places.filter(p => {
    if (p.Wilayah !== currentWilayah) return false;
    if (p.Status_Aktif === "Tidak Aktif") return false;
    if (filterKategoriJenis === "TPP") return isTPPKategori(p.Kategori);
    if (filterKategoriJenis === "TFU") return isTFUKategori(p.Kategori);
    return true;
  });

  // Select place from list and loads related checking criteria
  const handlePlaceChange = async (placeId: string) => {
    setSelectedPlaceId(placeId);
    setErrorMassage("");
    const plc = localPlaces.find(p => p.ID_Tempat === placeId) || null;
    setSelectedPlace(plc);
    
    if (!plc) {
      setCriteria([]);
      setAnswers({});
      return;
    }

    setKaryawan(plc.Jml_Karyawan || "");
    setPenjamah("");

    const isTPP = isTPPKategori(plc.Kategori);
    const jenis = isTPP ? (plc.Kategori.includes("A2") ? "TPP_A2" : "TPP_A1") : "TFU";

    setLoadingCriteria(true);
    setAnswers({});
    
    try {
      const response = await fetch(`/api/kriteria?jenis=${jenis}`);
      const res = await response.json();
      if (res.status === "success") {
        setCriteria(res.data);
        // Automatically default open first categorization tab
        if (res.data.length > 0) {
          setOpenSection(res.data[0].Kategori);
        }
      } else {
        alert("Gagal memuat kriteria checklist.");
      }
    } catch (err) {
      alert("Terjadi gangguan koneksi kriteria.");
    } finally {
      setLoadingCriteria(false);
    }
  };

  // Select Officer and updates detail views
  const availableOfficers = officers.filter(o => 
    !o.wilayah || 
    o.wilayah === "Semua Wilayah" || 
    o.wilayah === currentWilayah ||
    currentWilayah === "Super Admin"
  );

  const handleOfficerChange = (name: string) => {
    setSelectedOfficerName(name);
    const off = availableOfficers.find(o => o.nama === name) || null;
    setSelectedOfficer(off);
  };

  // Handle radio option clicked
  const handleOptionChange = (
    indexKey: string, 
    value: number, 
    teks: string, 
    item: KriteriaItem
  ) => {
    setAnswers(prev => ({
      ...prev,
      [indexKey]: { value, teks, item }
    }));
  };

  const [errMassage, setErrorMassage] = useState("");

  const handleSave = async () => {
    if (!selectedPlace) {
      setErrorMassage("Harap pilih lokasi target terlebih dahulu.");
      return;
    }
    if (!selectedOfficer) {
      setErrorMassage("Pilih nama Petugas Pemeriksa.");
      return;
    }

    // Validate Inspector signature
    const canvas = canvasRef.current;
    let ttdBase64 = "";
    if (!hasInspectorDrawn || !canvas) {
      setErrorMassage("Tanda tangan petugas pemeriksa wajib digoreskan pada kotak.");
      return;
    }
    ttdBase64 = canvas.toDataURL("image/png");

    // Validate Owner signature
    const ownerCanvas = ownerCanvasRef.current;
    let ttdPemilikBase64 = "";
    if (!hasOwnerDrawn || !ownerCanvas) {
      setErrorMassage("Tanda tangan pemilik / penanggung jawab bangunan wajib digoreskan pada kotak.");
      return;
    }
    ttdPemilikBase64 = ownerCanvas.toDataURL("image/png");

    // Validate minimal 1 foto
    if (photos.length === 0) {
      setErrorMassage("Bukti dokumentasi kegiatan wajib diupload minimal 1 foto kegiatan.");
      return;
    }
    const fotoDokumentasiBase64 = JSON.stringify(photos);

    // Identify total answerable points
    // Questions are rows where Bobot or A1/A2 exists (not a section header).
    const plcKategori = selectedPlace.Kategori;
    const isTFU = plcKategori.includes("Fasilitas") || plcKategori.includes("TFU");
    const jenisType = isTFU ? "TFU" : plcKategori.includes("A2") ? "TPP_A2" : "TPP_A1";
    const tK = isTFU ? null : (jenisType === "TPP_A2" ? "A2" : "A1");

    const answerableCriteria = criteria.filter(item => {
      if (isTFU) {
        return item.Bobot && item.Bobot !== "";
      } else if (tK) {
        // If TPP, it's a question if A1 or A2 points exists and is not empty or NA
        const valRating = item[tK];
        const isEmptyRating = !valRating || valRating === "" || valRating === "NA";
        return !isEmptyRating;
      }
      return false;
    });

    const unansweredKeys: string[] = [];
    const detailJawabanList: DetailJawaban[] = [];

    // Map answerable to key format: k_{item.No}_{index}
    criteria.forEach((item, index) => {
      // Check if it is an answerable question
      const isQuestion = isTFU 
        ? (item.Bobot && item.Bobot !== "") 
        : (tK && item[tK] && item[tK] !== "" && item[tK] !== "NA");

      if (!isQuestion) return;

      const key = `k_${item.No}_${index}`;
      const ansObj = answers[key];

      if (!ansObj) {
        unansweredKeys.push(`• Poin ${item.No} (${item.Kategori})`);
      } else {
        // Track visual helpers
        // Look up parent title if it has sub-point decimal/letter
        const isSub = item.No.includes(".") || /^[a-zA-Z]$/.test(item.No);
        let parentNo = "";
        let parentText = "";

        if (isSub) {
          const mainNo = item.No.split(".")[0];
          const parentItem = criteria.find(c => c.No === mainNo);
          if (parentItem) {
            parentNo = parentItem.No;
            parentText = parentItem["Kriteria Penilaian"];
          }
        }

        detailJawabanList.push({
          no: item.No.includes('.') ? item.No.split('.')[1] : item.No,
          kategori: item.Kategori,
          pertanyaan: item["Kriteria Penilaian"],
          parentNo: parentNo || undefined,
          parentText: parentText || undefined,
          teksJawaban: ansObj.teks
        });
      }
    });

    if (unansweredKeys.length > 0) {
      setErrorMassage(`Beberapa poin instrumen penilaian belum dijawab!\n\nLengkapi poin:\n${unansweredKeys.join("\n")}`);
      return;
    }

    setSubmitting(true);
    setErrorMassage("");

    // Perform final skor calculations
    let totalDeductionsOrPoints = 0;
    Object.values(answers).forEach((ansObj: any) => {
      totalDeductionsOrPoints += ansObj.value || 0;
    });

    let skorAkhir = 0;
    if (isTFU) {
      skorAkhir = totalDeductionsOrPoints / 10;
    } else {
      const divider = jenisType === "TPP_A1" ? 220 : 208;
      skorAkhir = 100 - ((totalDeductionsOrPoints / divider) * 100);
    }

    skorAkhir = Math.round(skorAkhir * 100) / 100;
    const kesimpulan = skorAkhir >= 70 ? "Memenuhi Syarat" : "Tidak Memenuhi Syarat";

    const payload = {
      idTempat: selectedPlaceId,
      namaTempat: selectedPlace.Nama_Tempat,
      wilayah: currentWilayah,
      jenis: jenisType,
      pj: selectedPlace.Penanggung_Jawab || "-",
      jmlKaryawan: karyawan === "" ? 0 : Number(karyawan),
      jmlPenjamah: penjamah === "" ? 0 : Number(penjamah),
      skorAkhir,
      kesimpulan,
      totalNilai: totalDeductionsOrPoints,
      detailJawaban: detailJawabanList,
      pemeriksaNama: selectedOfficer.nama,
      pemeriksaNip: selectedOfficer.nip,
      pemeriksaJabatan: selectedOfficer.jabatan,
      ttdBase64,
      ttdPemilikBase64,
      fotoDokumentasiBase64
    };

    try {
      const token = localStorage.getItem("santuari_token") || "";
      const resp = await fetch("/api/inspeksi", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (res.status === "success") {
        alert(`Inspeksi Berhasil Disimpan!\nSkor Akhir: ${skorAkhir}\nKesimpulan: ${kesimpulan.toUpperCase()}`);
        onSuccess();
      } else {
        setErrorMassage(res.message || "Gagal mengirimkan hasil laporan.");
      }
    } catch (err) {
      setErrorMassage("Terjadi gangguan jaringan saat menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Group criteria by Kategori name for nice accordion grouping
  const groupedCategoriesList = criteria.reduce((acc: string[], curr) => {
    if (!acc.includes(curr.Kategori)) acc.push(curr.Kategori);
    return acc;
  }, []);

  const totalDeductions = Object.values(answers).reduce((sum, current: any) => {
    const isTPPDeduction = selectedPlace && !selectedPlace.Kategori.includes("TFU") && !selectedPlace.Kategori.includes("Fasilitas");
    return sum + (isTPPDeduction ? current.value : 0);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 border-l-4 border-l-sky-600 border border-slate-100 shadow-xl">
        <div className="flex items-start gap-4 pb-4 border-b border-slate-105 mb-6">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <ClipboardCheck className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Formulir Inspeksi IKL Berita Acara</h3>
            <p className="text-sm text-slate-500">
              Pengisian instrumen Inspeksi Kesehatan Lingkungan (IKL). Data tervalidasi real-time.
            </p>
          </div>
        </div>

        {/* 1. Pemilihan kategori jenis dulu, lalu target dan pengawas */}
        <div className="mb-6">
          <label className="text-[11px] font-black text-sky-700 uppercase block mb-1.5 tracking-wider">
            1. Pilih Kategori Tempat (TPP / TFU) <span className="text-red-500">*</span>
          </label>
          <select
            value={filterKategoriJenis}
            onChange={(e) => {
              const val = e.target.value as "" | "TPP" | "TFU";
              setFilterKategoriJenis(val);
              setSelectedPlaceId("");
              setSelectedPlace(null);
              setCriteria([]);
              setAnswers({});
            }}
            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-4 py-3 outline-none shadow-sm cursor-pointer"
            id="insPilihKategoriJenis"
          >
            <option value="">-- Pilih Kategori (TPP atau TFU) --</option>
            <option value="TPP">🍽️ Tempat Pengolahan Pangan (TPP)</option>
            <option value="TFU">🏢 Tempat Fasilitas Umum (TFU)</option>
          </select>
        </div>

        {/* 2. Pemilihan target dan pengawas — hanya muncul setelah pilih jenis */}
        {filterKategoriJenis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 animate-in fade-in slide-in-from-top-3 duration-200">
          <div>
            <label className="text-[11px] font-black text-sky-700 uppercase block mb-1.5 tracking-wider">
              2. Pilih Lokasi Target Pantau
            </label>
            <select
              value={selectedPlaceId}
              onChange={(e) => handlePlaceChange(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-4 py-3 outline-none shadow-sm cursor-pointer"
              id="insPilihTempat"
            >
              <option value="">
                -- Pilih Tempat {filterKategoriJenis === "TPP" ? "Pengolahan Pangan" : "Fasilitas Umum"} --
              </option>
              {localPlaces.length === 0 ? (
                <option value="" disabled>
                  Belum ada {filterKategoriJenis} terdaftar di Wilker {currentWilayah}
                </option>
              ) : (
                localPlaces.map(p => (
                  <option key={p.ID_Tempat} value={p.ID_Tempat}>
                    {p.Nama_Tempat} ({p.Kategori})
                  </option>
                ))
              )}
            </select>
            {localPlaces.length > 0 && (
              <p className="text-[9px] text-slate-400 mt-1">
                Menampilkan {localPlaces.length} sarana {filterKategoriJenis} di Wilker {currentWilayah}
              </p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-black text-sky-700 uppercase block mb-1.5 tracking-wider">
              3. Petugas Pemeriksa BKK
            </label>
            <select
              value={selectedOfficerName}
              onChange={(e) => handleOfficerChange(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-4 py-3 outline-none shadow-sm cursor-pointer"
              id="insPilihPetugas"
            >
              <option value="">-- Pilih Nama Petugas --</option>
              {availableOfficers.map((o) => (
                <option key={o.nip} value={o.nama}>
                  {o.nama} - {o.jabatan} {o.wilayah && o.wilayah !== "Semua Wilayah" ? `(${o.wilayah})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        )}

        {/* Prompt to select jenis if not yet selected */}
        {!filterKategoriJenis && (
          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Pilih Jenis Pemeriksaan</p>
            <p className="text-[11px] text-slate-400 mt-1">Tentukan terlebih dahulu apakah Anda akan memeriksa TPP atau TFU.</p>
          </div>
        )}

        {/* 2. Informasi Master detail (Read-only) */}
        {selectedPlace && (
          <div 
            className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
            id="insDetailTempat"
          >
            <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-xs border-b border-slate-105 pb-2">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Detail Info Integrasi Sarana</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nama Tempat</label>
                <input type="text" value={selectedPlace.Nama_Tempat} disabled className="w-full bg-white border border-slate-105 rounded-lg px-3 py-2 text-slate-650 font-bold" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Kategori Check</label>
                <input type="text" value={selectedPlace.Kategori} disabled className="w-full bg-white border border-slate-105 rounded-lg px-3 py-2 text-slate-650 font-bold" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Alamat Operasional</label>
                <input type="text" value={selectedPlace.Alamat} disabled className="w-full bg-white border border-slate-105 rounded-lg px-3 py-2 text-slate-650 font-semibold" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Jabatan Penilai Utama</label>
                <input 
                  type="text" 
                  value={selectedOfficer ? `${selectedOfficer.jabatan} (NIP: ${selectedOfficer.nip})` : ""} 
                  placeholder="Pilih petugas pemeriksa..." 
                  disabled 
                  className="w-full bg-white border border-sky-100 placeholder:text-red-400 rounded-lg px-3 py-2 text-sky-700 font-black"
                  id="lblJabatanPetugas"
                />
              </div>
            </div>

            <hr className="border-slate-200" />

            <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-xs pb-1">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Operational Update Lapangan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Jml. Karyawan Terkini</label>
                <input 
                  type="number" 
                  value={karyawan}
                  onChange={(e) => setKaryawan(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Ketik jumlah" 
                  className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 focus:border-sky-500 rounded-xl px-4 py-2.5 outline-none shadow-sm"
                  id="insKaryawan"
                />
              </div>

              {/* Show only for Food Processing (RM A1 / TPP) */}
              {(!selectedPlace.Kategori.includes("TFU") && !selectedPlace.Kategori.includes("Fasilitas")) && (
                <div id="boxPenjamah" className="animate-in slide-in-from-left duration-150">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Jml. Penjamah Makanan (Koki/Staff)</label>
                  <input 
                    type="number" 
                    value={penjamah}
                    onChange={(e) => setPenjamah(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Ketik staff dapur" 
                    className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 focus:border-sky-500 rounded-xl px-4 py-2.5 outline-none shadow-sm"
                    id="insPenjamah"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Render checklist questions accordions */}
      {selectedPlace && criteria.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-slate-800 text-white rounded-2xl p-4 px-5 shadow-lg">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-sky-400" />
              <h4 className="font-extrabold text-sm">Instrumen & Checklist Penilaian Lapangan</h4>
            </div>

            {/* Live point deduction count (TPP only) */}
            {(!selectedPlace.Kategori.includes("TFU") && !selectedPlace.Kategori.includes("Fasilitas")) && (
              <span className="text-xs font-bold bg-rose-500 text-white px-3 py-1 rounded-full animate-pulse">
                Deduction: -{totalDeductions} pts
              </span>
            )}
          </div>

          <div className="space-y-3" id="areaPertanyaan">
            {groupedCategoriesList.map((categoryName) => {
              const categoryItems = criteria.filter(c => c.Kategori === categoryName);
              const isOpen = openSection === categoryName;

              // Count total answered in this specific category
              const answeredInCategory = categoryItems.filter((item, index) => {
                const uniqueKey = `k_${item.No}_${criteria.indexOf(item)}`;
                return answers[uniqueKey] !== undefined;
              }).length;

              const totalQuestionsInCategory = categoryItems.filter(item => {
                const isTFU = selectedPlace.Kategori.includes("TFU") || selectedPlace.Kategori.includes("Fasilitas");
                const type = isTFU ? "TFU" : selectedPlace.Kategori.includes("A2") ? "TPP_A2" : "TPP_A1";
                const tK = isTFU ? null : (type === "TPP_A2" ? "A2" : "A1");
                return isTFU ? (item.Bobot && item.Bobot !== "") : (tK && item[tK] && item[tK] !== "" && item[tK] !== "NA");
              }).length;

              return (
                <div key={categoryName} className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenSection(isOpen ? "" : categoryName)}
                    className="w-full flex justify-between items-center text-left py-4 px-5 bg-slate-50 font-extrabold text-sm text-slate-800 border-b border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full font-bold">
                        {answeredInCategory} / {totalQuestionsInCategory} OK
                      </span>
                      <span className="truncate">{categoryName}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 md:p-5 space-y-4 bg-white animate-in slide-in-from-top-2 duration-150">
                      {categoryItems.map((item) => {
                        const idx = criteria.indexOf(item);
                        
                        // Decide if this row is a point question or section sub-title description
                        const isTFU = selectedPlace.Kategori.includes("TFU") || selectedPlace.Kategori.includes("Fasilitas");
                        const jenisTypeComp = isTFU ? "TFU" : selectedPlace.Kategori.includes("A2") ? "TPP_A2" : "TPP_A1";
                        const tK = isTFU ? null : (jenisTypeComp === "TPP_A2" ? "A2" : "A1");

                        let isQuestion = false;
                        if (isTFU) {
                          isQuestion = !!(item.Bobot && item.Bobot !== "");
                        } else if (tK) {
                          const valStr = item[tK];
                          isQuestion = !!(valStr && valStr !== "" && valStr !== "NA");
                        }

                        const displayNo = item.No.includes(".") ? item.No.split(".").pop() : item.No;

                        let indentClass = "";
                        if (item.No.includes(".")) {
                          indentClass = "ml-8 md:ml-12";
                        } else if (isNaN(Number(item.No)) && item.No !== "") {
                          indentClass = "ml-4 md:ml-6";
                        }

                        // If it's a section text and not a checklist option
                        if (!isQuestion) {
                          return (
                            <div 
                              key={item.No} 
                              className={`p-3 bg-sky-50 text-sky-800 rounded-xl font-extrabold text-xs border-l-4 border-l-sky-500 mt-2 mb-1 ${indentClass}`}
                            >
                              {displayNo ? `${displayNo}. ` : ""}{item["Kriteria Penilaian"]}
                            </div>
                          );
                        }

                        // Formulate button deduction values
                        // Standard Yes and No multipliers
                        let vYes = 0;
                        let vNo = 0;

                        if (isTFU) {
                          const bobotVal = parseFloat((item.Bobot || "0").toString().replace(",", "."));
                          const maxVal = parseFloat((item.Nilai_Max || "1").toString().replace(",", "."));
                          vYes = bobotVal * maxVal;
                          vNo = 0;
                        } else if (tK) {
                          vYes = 0;
                          vNo = parseFloat((item[tK] || "0").toString().replace(",", "."));
                        }

                        const uniqueKey = `k_${item.No}_${idx}`;
                        const currentSelection = answers[uniqueKey];

                        return (
                          <div 
                            key={uniqueKey}
                            className={`p-4 rounded-2xl border border-slate-150 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all ${
                              indentClass ? `${indentClass} border-l-2 border-l-slate-300` : ""
                            }`}
                          >
                            <div className="max-w-xl text-xs space-y-1">
                              <span className="font-extrabold text-slate-800 block">
                                {displayNo ? `${displayNo}. ` : ""}{item["Kriteria Penilaian"]}
                              </span>
                            </div>

                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOptionChange(uniqueKey, vYes, "Memenuhi", item)}
                                className={`text-[11px] font-black tracking-tight rounded-xl px-4 py-2.5 transition-all text-center flex-1 md:flex-none ${
                                  currentSelection?.teks === "Memenuhi"
                                    ? "bg-emerald-500 text-white border-emerald-500 shadow-lg"
                                    : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
                                }`}
                              >
                                Memenuhi
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOptionChange(uniqueKey, vNo, `Tidak Memenuhi (-${vNo})`, item)}
                                className={`text-[11px] font-black tracking-tight rounded-xl px-4 py-2.5 transition-all text-center flex-1 md:flex-none ${
                                  currentSelection?.teks.startsWith("Tidak")
                                    ? "bg-rose-500 text-white border-rose-500 shadow-lg"
                                    : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
                                }`}
                              >
                                Tidak Memenuhi {vNo > 0 ? `(-${vNo})` : ""}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 4. Bukti Dokumentasi Kegiatan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-105 pb-2">
              <Camera className="w-5 h-5 text-sky-600" />
              <span className="font-extrabold text-sm text-slate-800">C. Bukti Dokumentasi Kegiatan Kegiatan Lapangan</span>
            </div>
            
            <p className="text-xs text-slate-500">
              Silakan ambil foto menggunakan kamera perangkat Anda atau pilih dari galeri. 
              <span className="text-rose-600 font-bold ml-1">* Wajib diunggah minimal 1 foto kegiatan untuk keabsahan berita acara paperless.</span>
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragOver 
                  ? "border-sky-500 bg-sky-50/50" 
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100/70"
              }`}
              onClick={() => document.getElementById("fileDocInput")?.click()}
            >
              <input
                id="fileDocInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Tarik & Lepas gambar di sini, atau Klik untuk memilih</p>
              <p className="text-[10px] text-slate-400 mt-1">Mendukung format PNG, JPG, JPEG (Max. 5MB per file)</p>
            </div>

            {/* List of uploaded photos */}
            {photos.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Foto yang Terpilih ({photos.length} Foto):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative group rounded-xl border border-slate-205 overflow-hidden shadow-sm bg-slate-100 aspect-video flex items-center justify-center">
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(pIdx);
                        }}
                        className="absolute top-1.5 right-1.5 bg-rose-500/90 text-white p-1.5 rounded-lg hover:bg-rose-600 transition-colors shadow"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Dual Digital Signatures (Inspector & Owner) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Inspector Signature */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-105 pb-2">
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800">
                  <PenTool className="w-4 h-4 text-sky-600" />
                  <span>D. Tanda Tangan Petugas Pemeriksa BKK</span>
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[10px] font-extrabold text-rose-600 border border-rose-100 bg-rose-50 px-2.5 py-1 rounded hover:bg-rose-100 transition-colors"
                >
                  Ulang
                </button>
              </div>

              <div className="relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-250 rounded-xl overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={drawSignature}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={drawSignature}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                  style={{ background: "transparent" }}
                  width={800}
                  height={200}
                />
              </div>
              <p className="text-[10px] text-slate-450 italic leading-snug">
                * Goreskan coretan tanda tangan {selectedOfficer ? selectedOfficer.nama : "Petugas"} pada pad di atas.
              </p>
            </div>

            {/* Owner/Representative Signature */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-105 pb-2">
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800">
                  <PenTool className="w-4 h-4 text-sky-600" />
                  <span>E. Tanda Tangan Pemilik / Penanggung Jawab</span>
                </div>
                <button
                  type="button"
                  onClick={clearOwnerSignature}
                  className="text-[10px] font-extrabold text-rose-600 border border-rose-100 bg-rose-50 px-2.5 py-1 rounded hover:bg-rose-100 transition-colors"
                >
                  Ulang
                </button>
              </div>

              <div className="relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-250 rounded-xl overflow-hidden shadow-inner">
                <canvas
                  ref={ownerCanvasRef}
                  onMouseDown={startOwnerDrawing}
                  onMouseMove={drawOwnerSignature}
                  onMouseUp={stopOwnerDrawing}
                  onMouseLeave={stopOwnerDrawing}
                  onTouchStart={startOwnerDrawing}
                  onTouchMove={drawOwnerSignature}
                  onTouchEnd={stopOwnerDrawing}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                  style={{ background: "transparent" }}
                  width={800}
                  height={200}
                />
              </div>
              <p className="text-[10px] text-slate-450 italic leading-snug">
                * Goreskan coretan tanda tangan {selectedPlace ? selectedPlace.Penanggung_Jawab || "Pemilik/PJ" : "Pemilik"} pada pad di atas.
              </p>
            </div>
          </div>

          {/* Error notifications and send button */}
          {errMassage && (
            <div className="bg-red-50 text-red-750 text-xs font-bold border border-red-100 rounded-2xl p-4 whitespace-pre-line text-left flex gap-2 items-start shrink-0">
              <FileWarning className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errMassage}</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={submitting}
            className="w-full bg-slate-900 hover:bg-sky-600 text-white font-black text-sm rounded-2xl py-4 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-sky-100 shadow-slate-100 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-5 h-5 animate-bounce" />
            <span>{submitting ? "Kirim Berkas Berita Acara & Foto..." : "Simpan & Sinkronkan Hasil Penilaian Lapangan"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
