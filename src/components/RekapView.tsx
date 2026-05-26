import React, { useState } from "react";
import { FileText, Printer, FileWarning, Search, X, DownloadCloud, Trash2 } from "lucide-react";
import { LogInspeksi, DetailJawaban } from "../types";

interface RekapViewProps {
  logs: LogInspeksi[];
  onRefresh: () => void;
}

export default function RekapView({ logs, onRefresh }: RekapViewProps) {
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<LogInspeksi | null>(null);

  const handleDelete = async (log: LogInspeksi) => {
    if (confirm(`Apakah Anda yakin ingin menghapus arsip inspeksi untuk ${log.Nama_Tempat}?\nAksi ini tidak dapat dibatalkan.`)) {
      try {
        const token = localStorage.getItem("santuari_token") || "";
        const res = await fetch(`/api/inspeksi/${encodeURIComponent(log.Timestamp)}`, {
          method: 'DELETE',
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          throw new Error(`Server returned non-JSON response. Status: ${res.status}`);
        }

        if (data.status === "success") {
          alert("Arsip berhasil dihapus.");
          onRefresh();
        } else {
          alert(`Gagal menghapus: ${data.message}`);
        }
      } catch (err: any) {
        console.error("Delete Error:", err);
        alert(`Terjadi kesalahan jaringan saat menghapus arsip.\nInfo: ${err.message}`);
      }
    }
  };

  // Filter logs list
  const filteredLogs = logs.filter(log => {
    return log.Nama_Tempat.toLowerCase().includes(search.toLowerCase()) ||
           log.Wilayah.toLowerCase().includes(search.toLowerCase()) ||
           log.ID_Tempat.toLowerCase().includes(search.toLowerCase()) ||
           log.Nama_Pemeriksa.toLowerCase().includes(search.toLowerCase());
  });

  const handlePrint = () => {
    const printableArea = document.getElementById("printableArea");
    if (!printableArea) return;

    // Clone the printable content into a body-level container
    // This ensures it's a sibling of #root, not nested inside it
    const printRoot = document.createElement("div");
    printRoot.id = "santuari-print-root";
    printRoot.innerHTML = printableArea.innerHTML;
    document.body.appendChild(printRoot);

    // Cleanup function — runs after print dialog is dismissed
    const cleanup = () => {
      if (document.body.contains(printRoot)) {
        document.body.removeChild(printRoot);
      }
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);

    // Trigger browser print dialog
    // CSS @media print rules will hide #root and show #santuari-print-root
    window.print();
  };

  // Convert raw base64 or stringified JSON details
  const getDetailArray = (raw: string): DetailJawaban[] => {
    try {
      if (!raw) return [];
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Rekap Hasil Inspeksi IKL</h3>
            <p className="text-xs text-gray-400">Arsip digital dan cetak berita acara hasil IKL lapangan.</p>
          </div>
          <button 
            onClick={onRefresh}
            className="text-xs bg-sky-50 text-sky-700 border border-sky-100 font-semibold px-3.5 py-2 rounded-lg hover:bg-sky-100 transition-all shadow-sm"
          >
            Segarkan Log Data
          </button>
        </div>

        {/* Global Search inside database logs */}
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari TPP/TFU atau Petugas..."
            className="w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white border border-gray-250 rounded-lg outline-none focus:border-sky-500 transition-all shadow-sm"
          />
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] border-b border-gray-200">
                <th className="py-3 px-5">Bulan / Tgl</th>
                <th className="py-3 px-5">Nama Tempat</th>
                <th className="py-3 px-5">Kategori</th>
                <th className="py-3 px-5 text-center">Skor IKL</th>
                <th className="py-3 px-5 text-center">Kesimpulan</th>
                <th className="py-3 px-5 text-right">Aksi Laporan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 font-medium">
                    Tidak ada arsip log yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const isCompliant = log.Kesimpulan_Sistem === "Memenuhi Syarat" || log.Total_Skor >= 70;
                  return (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-gray-700 block">{log.Bulan_Kegiatan || "Lainnya"}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{log.Timestamp}</span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-gray-800">
                        {log.Nama_Tempat}
                        <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{log.Wilayah}</span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-gray-500">{log.Kategori}</td>
                      <td className="py-3.5 px-5 text-center font-bold text-sky-700 text-xs">
                        {log.Total_Skor}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isCompliant ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}>
                          {log.Kesimpulan_Sistem}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(log)}
                            title="Hapus Laporan"
                            className="text-[11px] font-medium text-rose-600 border border-rose-200 hover:bg-rose-50 shadow-sm bg-white px-2.5 py-1.5 rounded-lg inline-flex items-center transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-[11px] font-medium text-gray-700 border border-gray-250 hover:bg-gray-50 shadow-sm bg-white px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-sky-600" />
                            <span>Berita Acara</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 
        ====================================================
        BERITA ACARA HIGH-FIDELITY OFFICIAL REPORT VIEW MODAL
        ====================================================
      */}
      {selectedLog && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print-overlay-active"
          id="beritaAcaraOverlay"
        >
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 flex flex-col print-modal-card">
            {/* Modal Actions Header Bar - hidden in print */}
            <div className="bg-gray-50 text-gray-800 p-4 border-b border-gray-200 flex justify-between items-center print-hide">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <h4 className="font-bold text-xs tracking-tight text-gray-700">Pratinjau Resmi Berita Acara (Kemenkes Format)</h4>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Wrapper for printable area */}
            <div id="printableArea" className="w-full">
              {/* Official pristine Times New Roman printed sheet */}
              <div 
                className="p-10 text-black font-serif bg-white text-[11px] leading-snug select-all print:p-0"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
                id="baPrintableDoc"
              >
                {/* Official Kop Surat - Full Width Image, NO border/line below */}
                <div className="w-full mb-3">
                  <img 
                    src="/assets/kop-surat-bkk.png" 
                    alt="Kop Surat BKK Tembilahan" 
                    className="kop-surat-img w-full h-auto block"
                    style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block' }}
                  />
                </div>

              {/* Document Title */}
              <div className="text-center space-y-0.5 mb-4">
                <h3 className="font-bold text-[13px] underline inline-block tracking-tight text-center">
                  BERITA ACARA HASIL INSPEKSI KESEHATAN LINGKUNGAN (IKL)
                </h3>
                <div className="text-[10px]">
                  Nomor: {selectedLog.ID_Tempat.split("-")[1]} / BKK-TBH / IKL / {new Date(selectedLog.Timestamp.replace(/(\d+)\/(\d+)\/(\d+).*/, "$3-$2-$1")).getFullYear() || new Date().getFullYear()}
                </div>
              </div>

              {/* Master target details */}
              <table className="w-full mb-4 border-collapse text-[11px]">
                <tbody>
                  <tr>
                    <td className="w-[30%] py-0.5">Nama TPP / TFU</td>
                    <td className="w-[2%]">:</td>
                    <td className="w-[68%] py-0.5 font-bold uppercase">{selectedLog.Nama_Tempat}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Kategori / Golongan</td>
                    <td className="w-[2%]">:</td>
                    <td className="py-0.5">{selectedLog.Kategori}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Wilayah Kerja Kantor</td>
                    <td className="w-[2%]">:</td>
                    <td className="py-0.5">{selectedLog.Wilayah}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Nama Penanggung Jawab</td>
                    <td className="w-[2%]">:</td>
                    <td className="py-0.5 font-semibold">{selectedLog.Penanggung_Jawab}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Jumlah Karyawan / Staff Dapur</td>
                    <td className="w-[2%]">:</td>
                    <td className="py-0.5">{selectedLog.Jml_Karyawan} Orang / {selectedLog.Jml_Penjamah} Orang</td>
                  </tr>
                  <tr>
                    <td className="py-0.5">Tanggal Inspeksi Audit</td>
                    <td className="w-[2%]">:</td>
                    <td className="py-0.5 font-semibold">{selectedLog.Timestamp.split(" ")[0]}</td>
                  </tr>
                </tbody>
              </table>

              {/* Detailed instrument checks */}
              <div className="font-bold text-[10px] mb-1">A. Rincian Seluruh Instrumen Penilaian:</div>
              <table className="w-full border-collapse border border-black mb-4 text-[10px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-black py-1 px-2 text-center w-[7%]">No.</th>
                    <th className="border border-black py-1 px-2 text-left w-[68%]">Variabel / Komponen yang Dinilai</th>
                    <th className="border border-black py-1 px-2 text-center w-[25%]">Hasil Observasi</th>
                  </tr>
                </thead>
                <tbody>
                  {getDetailArray(selectedLog.Detail_Jawaban).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="border border-black text-center py-3 text-gray-500">
                        Rincian kriteria tidak tersedia atau terarsip versi lama.
                      </td>
                    </tr>
                  ) : (
                    getDetailArray(selectedLog.Detail_Jawaban).map((detail, dIdx) => {
                      const isMinus = detail.teksJawaban.includes("Tidak") || detail.teksJawaban.includes("-");
                      const categoryHeader = dIdx === 0 || getDetailArray(selectedLog.Detail_Jawaban)[dIdx - 1].kategori !== detail.kategori;

                      return (
                        <React.Fragment key={dIdx}>
                          {categoryHeader && (
                            <tr className="bg-slate-205">
                              <td colSpan={3} className="border border-black py-0.5 px-2 font-bold uppercase tracking-wide bg-slate-100 text-[9px]">
                                {detail.kategori}
                              </td>
                            </tr>
                          )}

                          {detail.parentNo && (dIdx === 0 || getDetailArray(selectedLog.Detail_Jawaban)[dIdx - 1].parentNo !== detail.parentNo) && (
                            <tr className="bg-slate-50">
                              <td className="border border-black py-0.5 px-2 text-center font-bold">{detail.parentNo}</td>
                              <td colSpan={2} className="border border-black py-0.5 px-2 font-bold">{detail.parentText}</td>
                            </tr>
                          )}

                          <tr className="page-break-inside-avoid">
                            <td className="border border-black py-0.5 px-2 text-center">{detail.no}</td>
                            <td 
                              className={`border border-black py-0.5 px-2 ${
                                detail.parentNo ? "pl-5 text-slate-700 font-normal" : "font-bold"
                              }`}
                            >
                              {detail.pertanyaan}
                            </td>
                            <td 
                              className={`border border-black py-0.5 px-2 text-center font-bold ${
                                isMinus ? "text-red-600" : "text-slate-900"
                              }`}
                            >
                              {detail.teksJawaban}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* B. Formula Calculations summary block */}
              <div className="font-bold text-[10px] mb-1">B. Kalkulasi & Kesimpulan Akhir:</div>
              <table className="w-full border-collapse border border-black mb-6 text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-black p-2.5 w-[65%] leading-normal">
                      {selectedLog.Kategori.includes("TFU") || selectedLog.Kategori.includes("Fasilitas") ? (
                        <div>
                          <strong>Kategori:</strong> Tempat Fasilitas Umum (TFU) <br />
                          <strong>Total Kelayakan Bobot Berjalan:</strong> {selectedLog.Total_Nilai_Mentah} <br />
                          <strong>Skor Akhir:</strong> <span className="font-bold text-sky-700">{selectedLog.Total_Skor}</span> <br />
                          <span className="text-[9px] text-gray-500 italic block mt-1">
                            *Rumus Skor Akhir = Total (Bobot x Nilai) / 10
                          </span>
                        </div>
                      ) : (
                        <div>
                          <strong>Golongan TPP:</strong> {selectedLog.Kategori.replace("TPP_", "")} <br />
                          <strong>Total Poin Ketidaksesuaian/Deduction:</strong> <span className="text-red-600 font-bold">{selectedLog.Total_Nilai_Mentah} pt</span> <br />
                          <strong>Skor Kelayakan IKL:</strong> <span className="font-bold text-sky-700">{selectedLog.Total_Skor} %</span> <br />
                          <span className="text-[9px] text-gray-500 italic block mt-1">
                            {`*Rumus Skor IKL = 100 - ((Total Ketidaksesuaian / ${selectedLog.Kategori.includes("A1") ? 220 : 208}) x 100)`}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="border border-black p-2.5 w-[35%] text-center vertical-middle align-middle">
                      <div className="mb-1.5 font-medium text-[10px]">Berdasarkan hasil audit IKL, lokasi ini dinyatakan:</div>
                      <div className={`font-black text-xs uppercase p-1.5 border-[2px] rounded ${
                        selectedLog.Kesimpulan_Sistem === "Memenuhi Syarat" || selectedLog.Total_Skor >= 70
                          ? "border-emerald-500 text-emerald-600"
                          : "border-red-500 text-red-600"
                      }`}>
                        {selectedLog.Kesimpulan_Sistem.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures - Only Pemeriksa and Pemilik */}
              <table className="w-full text-center text-[10px] mt-4 table-fixed">
                <tbody>
                  <tr>
                    <td className="pb-12 w-1/2">
                      Mengetahui, <br />
                      Pengelola / Penanggung Jawab Bangunan
                    </td>
                    <td className="pb-12 w-1/2">
                      Tembilahan, {selectedLog.Timestamp.split(" ")[0]} <br />
                      {selectedLog.Jabatan_Pemeriksa || "Inspektur Kesling"}
                    </td>
                  </tr>
                  
                  <tr>
                    {/* Pemilik / PJ signature */}
                    <td className="relative">
                      {selectedLog.TTD_Pemilik ? (
                        <div className="absolute left-1/2 -translate-x-1/2 -top-12 flex justify-center items-center pointer-events-none">
                          <img 
                            src={selectedLog.TTD_Pemilik} 
                            alt="Tanda Tangan Pemilik" 
                            className="max-h-16 w-auto mix-blend-multiply"
                          />
                        </div>
                      ) : (
                        <div className="h-6"></div>
                      )}
                      <div className="font-bold">
                        ( {selectedLog.Penanggung_Jawab === "-" ? "................................................" : selectedLog.Penanggung_Jawab} )
                      </div>
                    </td>
                    {/* Pemeriksa / Inspector signature */}
                    <td className="relative">
                      {selectedLog.TTD_Digital ? (
                        <div className="absolute left-1/2 -translate-x-1/2 -top-12 flex justify-center items-center pointer-events-none">
                          <img 
                            src={selectedLog.TTD_Digital} 
                            alt="Tanda Tangan Pemeriksa" 
                            className="max-h-16 w-auto mix-blend-multiply"
                          />
                        </div>
                      ) : (
                        <div className="h-6"></div>
                      )}
                      <div className="font-bold">
                        ( {selectedLog.Nama_Pemeriksa} )
                      </div>
                      <div className="text-[10px] text-gray-500 font-sans">
                        NIP. {selectedLog.NIP_Pemeriksa}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* C. Dokumentasi Kegiatan Lapangan (Paperless Proof of Inspection) */}
            {selectedLog.Foto_Dokumentasi && (
              <div 
                className="p-10 bg-white text-black font-serif page-break-before-always"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* Documentation page title — NO kop surat, just description */}
                <div className="text-center mb-8">
                  <div className="font-bold text-sm uppercase tracking-wide mb-2">
                    DOKUMENTASI KEGIATAN LAPANGAN
                  </div>
                  <div className="text-xs font-semibold mb-1">
                    (Paperless Proof of Inspection)
                  </div>
                  <div className="text-xs text-gray-700 mt-3">
                    Nama TPP/TFU: <strong className="uppercase">{selectedLog.Nama_Tempat}</strong> — {selectedLog.Wilayah}
                  </div>
                  <div className="text-xs text-gray-600">
                    Tanggal Inspeksi: <strong>{selectedLog.Timestamp.split(" ")[0]}</strong> | Pemeriksa: <strong>{selectedLog.Nama_Pemeriksa}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6 mt-4">
                  {(() => {
                    try {
                      const parsed = JSON.parse(selectedLog.Foto_Dokumentasi);
                      if (Array.isArray(parsed)) {
                        return parsed.map((photo: string, pIdx: number) => (
                          <div key={pIdx} className="border border-gray-300 p-2.5 rounded bg-white text-center inline-block max-w-[48%]">
                            <img src={photo} alt={`Dokumentasi ${pIdx + 1}`} className="max-h-80 max-w-full h-auto object-contain mx-auto rounded" />
                            <div className="text-[10px] text-gray-800 mt-2 font-serif font-bold italic">
                              Gambar #{pIdx + 1}: Bukti Inspeksi di {selectedLog.Nama_Tempat}
                            </div>
                            <div className="text-[9px] text-gray-500 font-sans mt-0.5">
                              Diaudit pada {selectedLog.Timestamp.split(" ")[0]}
                            </div>
                          </div>
                        ));
                      }
                    } catch (e) {
                      return (
                        <div className="border border-gray-300 p-2.5 rounded bg-white text-center inline-block max-w-[70%]">
                          <img src={selectedLog.Foto_Dokumentasi} alt="Dokumentasi" className="max-h-80 max-w-full h-auto object-contain mx-auto rounded" />
                          <div className="text-[10px] text-gray-800 mt-2 font-serif font-bold italic">
                            Gambar Bukti Inspeksi: {selectedLog.Nama_Tempat}
                          </div>
                        </div>
                      );
                    }
                    return <div className="text-xs text-gray-400">Tidak ada gambar dokumentasi yang ditemukan.</div>;
                  })()}
                </div>
                <div className="text-center text-[10px] text-gray-500 font-sans mt-8 italic border-t border-gray-200 pt-4">
                  * Seluruh berkas dokumentasi di atas disimpan secara permanen pada sistem cloud SANTUARI BKK Tembilahan dan diakui secara hukum sebagai bukti pengawasan yang sah dan paperless.
                </div>
              </div>
            )}
            </div>

            {/* Modal Bottom Print Button bar - hidden in print */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-2 print-hide">
              <button
                onClick={handlePrint}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Dokumen</span>
              </button>
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-white border border-gray-300 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
