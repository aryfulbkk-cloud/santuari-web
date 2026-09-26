/**
 * draftStorage.ts — CRUD helper untuk Draft Laporan di localStorage
 * Draft disimpan offline-first tanpa membutuhkan koneksi internet.
 */

import { DraftLaporan } from "../types";

const DRAFT_KEY = "santuari_drafts_v1";

/** Ambil semua draft dari localStorage */
export function getAllDrafts(): DraftLaporan[] {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Simpan atau perbarui satu draft (upsert berdasarkan draftId) */
export function saveDraft(draft: DraftLaporan): void {
  try {
    const all = getAllDrafts();
    const idx = all.findIndex(d => d.draftId === draft.draftId);
    if (idx >= 0) {
      all[idx] = draft; // update
    } else {
      all.push(draft);  // insert baru
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("[draftStorage] Gagal menyimpan draft:", err);
  }
}

/** Hapus satu draft berdasarkan draftId */
export function deleteDraft(draftId: string): void {
  try {
    const all = getAllDrafts().filter(d => d.draftId !== draftId);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("[draftStorage] Gagal menghapus draft:", err);
  }
}

/** Ambil satu draft berdasarkan draftId */
export function getDraftById(draftId: string): DraftLaporan | undefined {
  return getAllDrafts().find(d => d.draftId === draftId);
}

/** Hitung jumlah draft aktif */
export function countDrafts(): number {
  return getAllDrafts().length;
}

/** Generate draftId unik */
export function generateDraftId(placeId: string): string {
  const ts = Date.now();
  return `draft_${ts}_${placeId}`;
}
