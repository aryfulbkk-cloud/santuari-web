const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  try {
    const raw = fs.readFileSync('./data/db.json', 'utf8');
    const db = JSON.parse(raw);

    console.log("Starting migration to Supabase...");

    if (db.petugas && db.petugas.length > 0) {
      console.log(`Migrating ${db.petugas.length} Petugas...`);
      const { error } = await supabase.from('master_petugas').upsert(db.petugas.map(p => ({
        nip: p.nip,
        nama: p.nama,
        jabatan: p.jabatan,
        wilayah: p.wilayah || 'Semua Wilayah'
      })));
      if (error) throw error;
    }

    if (db.tempat && db.tempat.length > 0) {
      console.log(`Migrating ${db.tempat.length} Tempat...`);
      const { error } = await supabase.from('master_tempat').upsert(db.tempat.map(t => ({
        ID_Tempat: t.ID_Tempat,
        Nama_Tempat: t.Nama_Tempat,
        Wilayah: t.Wilayah,
        Kategori: t.Kategori,
        Alamat: t.Alamat,
        Koordinat_Map: t.Koordinat_Map,
        Status_Terakhir: t.Status_Terakhir,
        Tgl_Inspeksi: t.Tgl_Inspeksi,
        Total_Skor: t.Total_Skor?.toString(),
        Penanggung_Jawab: t.Penanggung_Jawab,
        Jml_Karyawan: t.Jml_Karyawan || 0,
        Status_Aktif: t.Status_Aktif || 'Aktif',
        Avatar: t.Avatar
      })));
      if (error) throw error;
    }

    if (db.logs && db.logs.length > 0) {
      console.log(`Migrating ${db.logs.length} Log Inspeksi...`);
      const { error } = await supabase.from('log_inspeksi').insert(db.logs.map(l => ({
        Timestamp: l.Timestamp,
        ID_Tempat: l.ID_Tempat,
        Nama_Tempat: l.Nama_Tempat,
        Wilayah: l.Wilayah,
        Kategori: l.Kategori,
        Penanggung_Jawab: l.Penanggung_Jawab,
        Jml_Karyawan: l.Jml_Karyawan || 0,
        Jml_Penjamah: l.Jml_Penjamah || 0,
        Total_Skor: l.Total_Skor,
        Kesimpulan_Sistem: l.Kesimpulan_Sistem,
        Total_Nilai_Mentah: l.Total_Nilai_Mentah,
        Detail_Jawaban: l.Detail_Jawaban,
        Nama_Pemeriksa: l.Nama_Pemeriksa,
        NIP_Pemeriksa: l.NIP_Pemeriksa,
        Jabatan_Pemeriksa: l.Jabatan_Pemeriksa,
        TTD_Digital: l.TTD_Digital,
        TTD_Pemilik: l.TTD_Pemilik,
        Foto_Dokumentasi: l.Foto_Dokumentasi,
        Bulan_Kegiatan: l.Bulan_Kegiatan
      })));
      if (error) throw error;
    }

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();
