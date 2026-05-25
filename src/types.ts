/**
 * SANUTARI | BKK Kelas II Tembilahan Types
 */

export interface Petugas {
  nama: string;
  nip: string;
  jabatan: string;
  wilayah?: string;
}

export interface Tempat {
  ID_Tempat: string;
  Nama_Tempat: string;
  Wilayah: string;
  Kategori: string;
  Alamat: string;
  Koordinat_Map: string;
  Status_Terakhir: 'Hijau' | 'Kuning' | 'Merah' | 'Belum';
  Tgl_Inspeksi: string;
  Total_Skor: string | number;
  Penanggung_Jawab?: string;
  Jml_Karyawan?: number;
  Status_Aktif?: 'Aktif' | 'Tidak Aktif';
  Avatar?: string;
}

export interface DetailJawaban {
  no: string;
  kategori: string;
  pertanyaan: string;
  parentNo?: string;
  parentText?: string;
  teksJawaban: string;
}

export interface LogInspeksi {
  Timestamp: string;
  ID_Tempat: string;
  Nama_Tempat: string;
  Wilayah: string;
  Kategori: string;
  Penanggung_Jawab: string;
  Jml_Karyawan: number;
  Jml_Penjamah: number;
  Total_Skor: number;
  Kesimpulan_Sistem: string;
  Total_Nilai_Mentah: number;
  Detail_Jawaban: string; // JSON string
  Nama_Pemeriksa: string;
  NIP_Pemeriksa: string;
  Jabatan_Pemeriksa: string;
  TTD_Digital: string; // base64
  TTD_Pemilik?: string; // base64
  Foto_Dokumentasi?: string; // base64 or JSON of base64s
  Bulan_Kegiatan?: string;
}

export interface KriteriaItem {
  No: string;
  Kategori: string;
  "Kriteria Penilaian": string;
  A1?: string;
  A2?: string;
  Bobot?: string;
  Nilai_Max?: string;
}

export interface TabSummaryRow {
  wilayah: string;
  jmlTPP: number;
  jmlTFU: number;
  aman: number; // Hijau
  binaan: number; // Kuning
  rawan: number; // Merah
}
