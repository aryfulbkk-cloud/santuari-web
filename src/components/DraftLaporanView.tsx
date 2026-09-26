import React, { useState, useEffect } from "react";
import {
  BookMarked, Trash2, PenLine, ClipboardCheck, CheckCircle2,
  Clock, AlertCircle, FolderOpen, Plus
} from "lucide-react";
import { DraftLaporan } from "../types";
import { getAllDrafts, deleteDraft, countDrafts } from "../utils/draftStorage";

interface DraftLaporanViewProps {
  onLanjutkan: (draft: DraftLaporan) => void;
  onGoToInspeksi: () => void;
  refreshKey?: number; // increment to trigger re-fetch
}

export default function DraftLaporanView({
  onLanjutkan,
  onGoToInspeksi,
  refreshKey,
}: DraftLaporanViewProps) {
  const [drafts, setDrafts] = useState<DraftLaporan[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(getAllDrafts().sort((a, b) =>
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    ));
  }, [refreshKey]);

  const handleDelete = (draftId: string) => {
    deleteDraft(draftId);
    setDrafts(prev => prev.filter(d => d.draftId !== draftId));
    setConfirmDeleteId(null);
  };

  const formatSavedAt = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    } catch {
      return iso;
    }
  };

  const formatTanggal = (yyyymmdd: string) => {
    try {
      const [y, m, d] = yyyymmdd.split("-");
      const months = ["","Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
      return `${d} ${months[Number(m)]} ${y}`;
    } catch {
      return yyyymmdd;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-l-4 border-l-amber-500 border border-slate-100 shadow-xl">
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100 mb-6">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <BookMarked className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Draft Laporan</h3>
            <p className="text-sm text-slate-500">
              Laporan inspeksi yang belum selesai diisi. Lanjutkan pengisian kapan saja.
            </p>
          </div>
          {drafts.length > 0 && (
            <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full">
              {drafts.length} Draft
            </span>
          )}
        </div>

        {/* Empty State */}
        {drafts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="p-5 bg-slate-50 rounded-3xl">
              <FolderOpen className="w-12 h-12 text-slate-300" />
            </div>
            <div>
              <p className="font-bold text-slate-600">Tidak ada draft tersimpan</p>
              <p className="text-sm text-slate-400 mt-1">
                Saat mengisi formulir inspeksi, klik <strong>"Simpan Draft"</strong> untuk menyimpan progres Anda.
              </p>
            </div>
            <button
              onClick={onGoToInspeksi}
              className="mt-2 flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-5 py-3 rounded-2xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Mulai Inspeksi Baru</span>
            </button>
          </div>
        )}

        {/* Draft List */}
        {drafts.length > 0 && (
          <div className="space-y-4">
            {drafts.map((draft) => {
              const pct = draft.completionPercent ?? 0;
              const isReady = draft.isReadyToSubmit;
              const progressColor = isReady
                ? "bg-emerald-500"
                : pct >= 50
                ? "bg-amber-400"
                : "bg-sky-400";

              return (
                <div
                  key={draft.draftId}
                  className="border border-slate-100 rounded-2xl p-4 md:p-5 hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                >
                  {/* Top row: name + status badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ClipboardCheck className="w-4 h-4 text-slate-400 shrink-0" />
                        <p className="font-black text-slate-800 text-sm truncate">
                          {draft.selectedPlaceName || "Sarana belum dipilih"}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 ml-6">
                        {draft.selectedPlaceKategori || draft.filterKategoriJenis || "—"}
                      </p>
                    </div>

                    {/* Status badge */}
                    {isReady ? (
                      <span className="shrink-0 flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Siap Dikirim
                      </span>
                    ) : (
                      <span className="shrink-0 flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200">
                        <AlertCircle className="w-3 h-3" />
                        Belum Lengkap
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Kelengkapan Checklist
                      </span>
                      <span className="text-[10px] font-black text-slate-700">
                        {draft.answeredCount ?? 0}/{draft.totalQuestions ?? "?"} poin ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progressColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <ClipboardCheck className="w-3 h-3" />
                      Rencana Inspeksi: <strong className="text-slate-600">{formatTanggal(draft.tanggalInspeksi)}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Disimpan: <strong className="text-slate-600">{formatSavedAt(draft.savedAt)}</strong>
                    </span>
                    {draft.selectedOfficerName && (
                      <span className="flex items-center gap-1">
                        Petugas: <strong className="text-slate-600">{draft.selectedOfficerName}</strong>
                      </span>
                    )}
                  </div>

                  {/* Checklist indicators */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      draft.hasInspectorDrawn ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {draft.hasInspectorDrawn ? "✓" : "○"} TTD Pemeriksa
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      draft.ttdPemilikBase64 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {draft.ttdPemilikBase64 ? "✓" : "○"} TTD Pemilik
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      draft.photos.length > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {draft.photos.length > 0 ? `✓ ${draft.photos.length} Foto` : "○ Belum ada Foto"}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onLanjutkan(draft)}
                      className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black py-2.5 rounded-xl transition-all"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      Lanjutkan Pengisian
                    </button>

                    {confirmDeleteId === draft.draftId ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(draft.draftId)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-3 py-2.5 rounded-xl transition-all"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(draft.draftId)}
                        className="bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* CTA to create new */}
            <button
              onClick={onGoToInspeksi}
              className="w-full border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-400 hover:text-sky-600 text-sm font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat Draft Inspeksi Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
