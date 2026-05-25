import React, { useState } from "react";
import { MessageSquareWarning, X, Send } from "lucide-react";

export default function LaporMasyarakat() {
  const [isOpen, setIsOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kategori, setKategori] = useState("Kebersihan lingkungan buruk");
  const [uraian, setUraian] = useState("");

  const LAPMAS_WA_NUMBER = "6281261717144";

  const handleSend = () => {
    if (!lokasi.trim() || !uraian.trim()) {
      alert("Lokasi kejadian dan isi laporan wajib diisi.");
      return;
    }

    const message = `*LAPORAN MASYARAKAT - SANTUARI*\n\n` +
      `Nama Pelapor: ${nama.trim() || "Anonim"}\n` +
      `Lokasi Kejadian: ${lokasi.trim()}\n` +
      `Jenis Ketidaksesuaian: ${kategori}\n` +
      `Uraian Laporan: ${uraian.trim()}\n\n` +
      `Mohon dilakukan verifikasi dan tindak lanjut lapangan.`;

    const url = `https://wa.me/${LAPMAS_WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full px-5 py-3 shadow-md flex items-center gap-3 transition-transform hover:-translate-y-1 group print:hidden"
        id="lapmasFab"
        aria-label="Lapor Masyarakat"
      >
        <div className="bg-white/20 p-1.5 rounded-full">
          <MessageSquareWarning className="w-4 h-4 text-white" />
        </div>
        <span className="hidden sm:inline text-xs select-none">Lapor Masyarakat</span>
      </button>

      {/* Slide-Up / Fade-In Panel */}
      {isOpen && (
        <div 
          className="fixed right-6 bottom-24 w-full max-w-[390px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
          id="lapmasPanel"
        >
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-sm mb-1" id="lapmasTitle">Laporan Masyarakat</h3>
              <p className="text-[11px] text-white/90 leading-relaxed">
                Sampaikan ketidaksesuaian sanitasi lapangan melalui WhatsApp resmi BKK Tembilahan.
              </p>
            </div>
            <button
               onClick={() => setIsOpen(false)}
              className="bg-white/20 hover:bg-white/30 text-white p-1 rounded transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto scrollbar-none">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Nama Pelapor
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Opsional / boleh anonim"
                className="w-full text-xs bg-white border border-gray-250 focus:border-emerald-500 rounded-lg px-3 py-2 outline-none transition-colors"
                id="lapmasNama"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Lokasi Kejadian <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Contoh: Kantin Pelabuhan, toilet umum"
                className="w-full text-xs bg-white border border-gray-250 focus:border-emerald-500 rounded-lg px-3 py-2 outline-none transition-colors"
                id="lapmasLokasi"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Jenis Ketidaksesuaian
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full text-xs bg-white border border-gray-250 focus:border-emerald-500 rounded-lg px-3 py-2 outline-none"
                id="lapmasKategori"
              >
                <option value="Kebersihan lingkungan buruk">Kebersihan lingkungan buruk</option>
                <option value="Sanitasi makanan/minuman tidak layak">Sanitasi makanan/minuman tidak layak</option>
                <option value="Air bersih / toilet bermasalah">Air bersih / toilet bermasalah</option>
                <option value="Sampah, bau, vektor, atau genangan">Sampah, bau, vektor, atau genangan</option>
                <option value="Fasilitas umum rusak / tidak higienis">Fasilitas umum rusak / tidak higienis</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Isi Laporan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={uraian}
                onChange={(e) => setUraian(e.target.value)}
                placeholder="Jelaskan temuan secara singkat: apa yang terjadi dan dampaknya."
                className="w-full text-xs bg-white border border-gray-250 focus:border-emerald-500 rounded-lg px-3 py-2 outline-none min-h-[90px] resize-y"
                id="lapmasUraian"
                required
              />
            </div>

            <button
               onClick={handleSend}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 font-semibold text-xs flex items-center justify-center gap-2 transition-colors mt-2 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim ke WhatsApp</span>
            </button>

            <p className="text-[10px] text-gray-400 leading-normal text-center mt-3">
              Laporan dikirimkan ke kontak tim BKK Tembilahan. Laporan ini merupakan kanal cepat masyarakat dan tidak memengaruhi data rekap inspeksi legal.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
