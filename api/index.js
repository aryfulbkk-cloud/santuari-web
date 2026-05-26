// server/api_entry.ts
import express from "express";
import crypto2 from "crypto";

// server/db.ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
function hashPin(pin) {
  const salt = "santuari_salt_2026";
  return crypto.createHash("sha256").update(pin + salt).digest("hex");
}
function hashPassword(password) {
  const salt = "santuari_password_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}
var DB_DIR = path.join(process.cwd(), "data");
var DB_FILE = path.join(DB_DIR, "db.json");
var SUPABASE_URL = process.env.SUPABASE_URL || "";
var SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
var supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
} else {
  console.log("Using local JSON file-based database storage.");
}
var DEFAULT_AUTH_PINS = {
  "Tembilahan Induk": "111111",
  "Kuala Gaung": "222222",
  "Sungai Guntung": "333333",
  "Kuala Enok": "444444",
  "Pulau Kijang": "555555",
  "Rengat": "666666",
  "Super Admin": "999999"
};
var DEFAULT_AUTH_USERS = {
  "superadmin": { username: "superadmin", plainPass: "Super@Admin123", wilayah: "Super Admin" },
  "tembilahan": { username: "tembilahan", plainPass: "Tembilahan@2026", wilayah: "Tembilahan Induk" },
  "kualagaung": { username: "kualagaung", plainPass: "Kuala@Gaung2026", wilayah: "Kuala Gaung" },
  "sungaiguntung": { username: "sungaiguntung", plainPass: "Sungai@Guntung2026", wilayah: "Sungai Guntung" },
  "kualaenok": { username: "kualaenok", plainPass: "Kuala@Enok2026", wilayah: "Kuala Enok" },
  "pulaukijang": { username: "pulaukijang", plainPass: "Pulau@Kijang2026", wilayah: "Pulau Kijang" },
  "rengat": { username: "rengat", plainPass: "Rengat@2026", wilayah: "Rengat" }
};
var DEFAULT_PETUGAS = [
  { nama: "H. Irwan Efendi, S.KM., M.Si", nip: "197810142002121001", jabatan: "Inspektur Kesling Madya" },
  { nama: "Budi Santoso, S.ST", nip: "198505122008031002", jabatan: "Inspektur Kesling Muda" },
  { nama: "Siti Aminah, A.Md.KL", nip: "199208242014022001", jabatan: "Inspektur Kesling Pertama" }
];
var DEFAULT_TEMPAT = [
  {
    ID_Tempat: "SNT-1024",
    Nama_Tempat: "Kantin Utama Pelabuhan Pelindo",
    Wilayah: "Tembilahan Induk",
    Kategori: "Rumah Makan A1",
    Alamat: "Area Terminal Keberangkatan Pelabuhan Pelindo Tembilahan",
    Penanggung_Jawab: "Hj. Rosnah",
    Jml_Karyawan: 4,
    Koordinat_Map: "-0.327824,103.161102",
    Status_Terakhir: "Hijau",
    Tgl_Inspeksi: "24/05/2026",
    Total_Skor: 92.5
  },
  {
    ID_Tempat: "SNT-2091",
    Nama_Tempat: "Kantin Karyawan PT. Pulau Sambu",
    Wilayah: "Sungai Guntung",
    Kategori: "Rumah Makan A2",
    Alamat: "Kawasan Industri PT. Pulau Sambu, Kateman, Guntung",
    Penanggung_Jawab: "Ahmad Subarjo",
    Jml_Karyawan: 12,
    Koordinat_Map: "0.305211,103.614820",
    Status_Terakhir: "Kuning",
    Tgl_Inspeksi: "22/05/2026",
    Total_Skor: 78.2
  },
  {
    ID_Tempat: "SNT-3045",
    Nama_Tempat: "Ruang Tunggu Kelas II Pelabuhan Kuala Enok",
    Wilayah: "Kuala Enok",
    Kategori: "Fasilitas Umum",
    Alamat: "Loket dan Area Gerbang Pelabuhan Utama Kuala Enok",
    Penanggung_Jawab: "Dinas Perhubungan KHP",
    Jml_Karyawan: 3,
    Koordinat_Map: "-0.517200,103.389900",
    Status_Terakhir: "Merah",
    Tgl_Inspeksi: "20/05/2026",
    Total_Skor: 58
  },
  {
    ID_Tempat: "SNT-4082",
    Nama_Tempat: "Restoran Dermaga Sari Laut",
    Wilayah: "Tembilahan Induk",
    Kategori: "Rumah Makan A2",
    Alamat: "Jl. Parit 13 Tembilahan Hilir, Tembilahan Induk",
    Penanggung_Jawab: "Ko Ahie",
    Jml_Karyawan: 8,
    Koordinat_Map: "-0.326200,103.163100",
    Status_Terakhir: "Hijau",
    Tgl_Inspeksi: "25/05/2026",
    Total_Skor: 88.4
  },
  {
    ID_Tempat: "SNT-5051",
    Nama_Tempat: "Terminal Penumpang Kuala Gaung",
    Wilayah: "Kuala Gaung",
    Kategori: "Fasilitas Umum",
    Alamat: "Samping Syahbandar Pelabuhan Kuala Gaung",
    Penanggung_Jawab: "Mukhtar Luthfi",
    Jml_Karyawan: 2,
    Koordinat_Map: "-0.166839,103.457208",
    Status_Terakhir: "Belum",
    Tgl_Inspeksi: "",
    Total_Skor: "-"
  }
];
var DEFAULT_LOGS = [
  {
    Timestamp: "2026-05-24T09:12:00.000Z",
    ID_Tempat: "SNT-1024",
    Nama_Tempat: "Kantin Utama Pelabuhan Pelindo",
    Wilayah: "Tembilahan Induk",
    Kategori: "Rumah Makan A1",
    Penanggung_Jawab: "Hj. Rosnah",
    Jml_Karyawan: 4,
    Jml_Penjamah: 2,
    Total_Skor: 92.5,
    Kesimpulan_Sistem: "Memenuhi Syarat",
    Total_Nilai_Mentah: 16.8,
    Detail_Jawaban: JSON.stringify([
      { no: "1.1", kategori: "I. LOKASI, BANGUNAN & FASILITAS", pertanyaan: "Bebas dari pencemaran lingkungan (debu, asap, kotoran)", teksJawaban: "Memenuhi" },
      { no: "1.2", kategori: "I. LOKASI, BANGUNAN & FASILITAS", pertanyaan: "Bangunan kokoh, aman, bersih, dan bebas dari masuknya binatang/vektor jorok", teksJawaban: "Memenuhi" },
      { no: "4.1", kategori: "II. SUPPLY AIR & SANITASI", pertanyaan: "Sumber air mengalir lancar, tidak berbau/berwarna, aman dikonsumsi", teksJawaban: "Memenuhi" }
    ]),
    Nama_Pemeriksa: "H. Irwan Efendi, S.KM., M.Si",
    NIP_Pemeriksa: "197810142002121001",
    Jabatan_Pemeriksa: "Inspektur Kesling Madya",
    TTD_Digital: ""
  },
  {
    Timestamp: "2026-05-22T14:35:00.000Z",
    ID_Tempat: "SNT-2091",
    Nama_Tempat: "Kantin Karyawan PT. Pulau Sambu",
    Wilayah: "Sungai Guntung",
    Kategori: "Rumah Makan A2",
    Penanggung_Jawab: "Ahmad Subarjo",
    Jml_Karyawan: 12,
    Jml_Penjamah: 6,
    Total_Skor: 78.2,
    Kesimpulan_Sistem: "Memenuhi Syarat",
    Total_Nilai_Mentah: 22.4,
    Detail_Jawaban: JSON.stringify([
      { no: "1.1", kategori: "I. LOKASI, BANGUNAN & FASILITAS", pertanyaan: "Bebas dari pencemaran lingkungan (debu, asap, kotoran)", teksJawaban: "Memenuhi" },
      { no: "8.4", kategori: "IV. HIGIENE PENJAMAH MAKANAN", pertanyaan: "Tidak merorok, meludah, atau bersin di atas makanan sewaktu menyiapkan makanan", teksJawaban: "Tidak Memenuhi (-5)" }
    ]),
    Nama_Pemeriksa: "Budi Santoso, S.ST",
    NIP_Pemeriksa: "198505122008031002",
    Jabatan_Pemeriksa: "Inspektur Kesling Muda",
    TTD_Digital: ""
  },
  {
    Timestamp: "2026-05-20T10:05:00.000Z",
    ID_Tempat: "SNT-3045",
    Nama_Tempat: "Ruang Tunggu Kelas II Pelabuhan Kuala Enok",
    Wilayah: "Kuala Enok",
    Kategori: "Fasilitas Umum",
    Penanggung_Jawab: "Dinas Perhubungan KHP",
    Jml_Karyawan: 3,
    Jml_Penjamah: 0,
    Total_Skor: 58,
    Kesimpulan_Sistem: "Tidak Memenuhi Syarat",
    Total_Nilai_Mentah: 58,
    Detail_Jawaban: JSON.stringify([
      { no: "3.1", kategori: "III. TOILET & SALURAN AIR", pertanyaan: "Tersedia toilet terpisah untuk laki-laki dan perempuan dengan penanda jelas", teksJawaban: "Tidak Memenuhi (-5)" },
      { no: "3.2", kategori: "III. TOILET & SALURAN AIR", pertanyaan: "Lantai toilet bersih, tidak berbau, tidak licin, saluran air lancar tidak terhambat", teksJawaban: "Tidak Memenuhi (-5)" }
    ]),
    Nama_Pemeriksa: "Siti Aminah, A.Md.KL",
    NIP_Pemeriksa: "199208242014022001",
    Jabatan_Pemeriksa: "Inspektur Kesling Pertama",
    TTD_Digital: ""
  }
];
function getLocalDB() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialUsers = {};
      for (const key in DEFAULT_AUTH_USERS) {
        const u = DEFAULT_AUTH_USERS[key];
        initialUsers[key] = {
          username: u.username,
          passwordHash: hashPassword(u.plainPass),
          wilayah: u.wilayah
        };
      }
      const initialData = {
        users: initialUsers,
        pins: DEFAULT_AUTH_PINS,
        petugas: DEFAULT_PETUGAS,
        tempat: DEFAULT_TEMPAT,
        logs: DEFAULT_LOGS,
        changeLogs: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
      return initialData;
    }
    try {
      const content = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(content);
      if (!parsed.changeLogs) {
        parsed.changeLogs = [];
      }
      let modified = false;
      if (!parsed.pins) {
        parsed.pins = { ...DEFAULT_AUTH_PINS };
        modified = true;
      }
      for (const wil in parsed.pins) {
        const val = parsed.pins[wil]?.toString();
        if (val && val.length === 6 && /^\d+$/.test(val)) {
          parsed.pins[wil] = hashPin(val);
          modified = true;
        }
      }
      if (!parsed.pins["Super Admin"]) {
        parsed.pins["Super Admin"] = hashPin("999999");
        modified = true;
      }
      if (!parsed.users) {
        parsed.users = {};
        for (const key in DEFAULT_AUTH_USERS) {
          const u = DEFAULT_AUTH_USERS[key];
          parsed.users[key] = {
            username: u.username,
            passwordHash: hashPassword(u.plainPass),
            wilayah: u.wilayah
          };
        }
        modified = true;
      }
      if (modified) {
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf8");
        } catch (err) {
          console.error("Failed to save migrated database pins & users:", err);
        }
      }
      return parsed;
    } catch (e) {
      console.error("Local database read error, reinitializing:", e);
      const initialUsers = {};
      for (const key in DEFAULT_AUTH_USERS) {
        const u = DEFAULT_AUTH_USERS[key];
        initialUsers[key] = {
          username: u.username,
          passwordHash: hashPassword(u.plainPass),
          wilayah: u.wilayah
        };
      }
      const initialData = {
        users: initialUsers,
        pins: DEFAULT_AUTH_PINS,
        petugas: DEFAULT_PETUGAS,
        tempat: DEFAULT_TEMPAT,
        logs: DEFAULT_LOGS,
        changeLogs: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
      return initialData;
    }
  } catch (err) {
    console.warn("getLocalDB fallback failed (likely read-only filesystem on Vercel). Returning empty schema.");
    return { users: {}, pins: {}, petugas: [], tempat: [], logs: [] };
  }
}
function saveLocalDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.warn("saveLocalDB failed (read-only filesystem on Vercel).");
  }
}
async function fetchPetugasList() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("master_petugas").select("*");
      if (!error && data) return data;
      console.warn("Supabase fetchPetugasList error, falling back:", error);
    } catch (e) {
      console.error("Supabase error, falling back locally:", e);
    }
  }
  const db = getLocalDB();
  return db.petugas || [];
}
async function savePetugas(petugasData) {
  try {
    const db = getLocalDB();
    const existingIndex = db.petugas.findIndex((p) => p.nip === petugasData.nip);
    if (existingIndex >= 0) {
      db.petugas[existingIndex] = petugasData;
    } else {
      db.petugas.push(petugasData);
    }
    saveLocalDB(db);
    return true;
  } catch (e) {
    console.error("Error saving petugas", e);
    return false;
  }
}
async function deletePetugas(nip) {
  try {
    const db = getLocalDB();
    const originalLength = db.petugas.length;
    db.petugas = db.petugas.filter((p) => p.nip !== nip);
    if (db.petugas.length < originalLength) {
      saveLocalDB(db);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error deleting petugas", e);
    return false;
  }
}
async function fetchPlaces() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("master_tempat").select("*");
      if (!error && data) {
        return data.map((d) => ({
          ID_Tempat: d.id_tempat || d.ID_Tempat,
          Nama_Tempat: d.nama_tempat || d.Nama_Tempat,
          Wilayah: d.wilayah || d.Wilayah,
          Kategori: d.kategori || d.Kategori,
          Alamat: d.alamat || d.Alamat,
          Koordinat_Map: d.koordinat_map || d.Koordinat_Map,
          Status_Terakhir: d.status_terakhir || d.Status_Terakhir,
          Tgl_Inspeksi: d.tgl_inspeksi || d.Tgl_Inspeksi,
          Total_Skor: d.total_skor || d.Total_Skor,
          Penanggung_Jawab: d.penanggung_jawab || d.Penanggung_Jawab,
          Jml_Karyawan: d.jml_karyawan || d.Jml_Karyawan
        }));
      }
      console.warn("Supabase fetchPlaces error, falling back:", error);
    } catch (e) {
      console.error("Supabase error, falling back locally:", e);
    }
  }
  const db = getLocalDB();
  return db.tempat;
}
async function fetchLogInspeksi(wilayah) {
  if (supabaseClient) {
    try {
      let query = supabaseClient.from("log_inspeksi").select("*");
      if (wilayah && wilayah !== "Semua") {
        query = query.eq("wilayah", wilayah);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d) => ({
          Timestamp: d.timestamp || d.Timestamp,
          ID_Tempat: d.id_tempat || d.ID_Tempat,
          Nama_Tempat: d.nama_tempat || d.Nama_Tempat,
          Wilayah: d.wilayah || d.Wilayah,
          Kategori: d.kategori || d.Kategori,
          Penanggung_Jawab: d.penanggung_jawab || d.Penanggung_Jawab,
          Jml_Karyawan: d.jml_karyawan || d.Jml_Karyawan,
          Jml_Penjamah: d.jml_penjamah || d.Jml_Penjamah,
          Total_Skor: d.total_skor || d.Total_Skor,
          Kesimpulan_Sistem: d.kesimpulan_sistem || d.Kesimpulan_Sistem,
          Total_Nilai_Mentah: d.total_nilai_mentah || d.Total_Nilai_Mentah,
          Detail_Jawaban: d.detail_jawaban || d.Detail_Jawaban,
          Nama_Pemeriksa: d.nama_pemeriksa || d.Nama_Pemeriksa,
          NIP_Pemeriksa: d.nip_pemeriksa || d.NIP_Pemeriksa,
          Jabatan_Pemeriksa: d.jabatan_pemeriksa || d.Jabatan_Pemeriksa,
          TTD_Digital: d.ttd_digital || d.TTD_Digital,
          TTD_Pemilik: d.ttd_pemilik || d.TTD_Pemilik || "",
          Foto_Dokumentasi: d.foto_dokumentasi || d.Foto_Dokumentasi || ""
        }));
      }
      console.warn("Supabase fetchLogInspeksi error, falling back:", error);
    } catch (e) {
      console.error("Supabase error, falling back locally:", e);
    }
  }
  const db = getLocalDB();
  if (wilayah && wilayah !== "Semua") {
    return db.logs.filter((log) => log.Wilayah === wilayah);
  }
  return db.logs;
}
async function authVerifyUser(usernameInput, passwordInput) {
  const normUsername = usernameInput.toLowerCase().trim();
  const hash = hashPassword(passwordInput);
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("auth_users").select("password_hash, wilayah").eq("username", normUsername).single();
      if (!error && data) {
        if (data.password_hash === hash) {
          return { success: true, wilayah: data.wilayah };
        }
      }
    } catch (e) {
      console.error("Supabase user auth failed, falling back to local database:", e);
    }
  }
  const db = getLocalDB();
  const user = db.users ? db.users[normUsername] : null;
  if (!user) return { success: false };
  if (user.passwordHash === hash) {
    return { success: true, wilayah: user.wilayah };
  }
  return { success: false };
}
async function resetOfficerPassword(usernameTarget, newPasswordInput, operator) {
  const normUsername = usernameTarget.toLowerCase().trim();
  const db = getLocalDB();
  const hashedPass = hashPassword(newPasswordInput);
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
  if (!passwordRegex.test(newPasswordInput)) {
    throw new Error("Password baru tidak memenuhi kriteria kompleksitas (Min 8 karakter, huruf besar & kecil, dan minimal 1 simbol).");
  }
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("auth_users").update({ password_hash: hashedPass }).eq("username", normUsername);
      if (error) {
        console.warn("Supabase auth_users update failed, writing locally:", error);
      }
    } catch (e) {
      console.error("Supabase auth_users update error, writing locally:", e);
    }
  }
  if (!db.users) {
    db.users = {};
  }
  const wilMapping = {
    "superadmin": "Super Admin",
    "tembilahan": "Tembilahan Induk",
    "kualagaung": "Kuala Gaung",
    "sungaiguntung": "Sungai Guntung",
    "kualaenok": "Kuala Enok",
    "pulaukijang": "Pulau Kijang",
    "rengat": "Rengat"
  };
  if (db.users[normUsername]) {
    db.users[normUsername].passwordHash = hashedPass;
  } else {
    db.users[normUsername] = {
      username: normUsername,
      passwordHash: hashedPass,
      wilayah: wilMapping[normUsername] || "Tembilahan Induk"
    };
  }
  if (!db.changeLogs) {
    db.changeLogs = [];
  }
  db.changeLogs.push({
    id: "CHG-" + Math.floor(1e3 + Math.random() * 9e3),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    tipe: "UBAH",
    idTempat: "SYSTEM-AUTH",
    namaTempat: `Otorisasi User: ${normUsername}`,
    wilayah: db.users[normUsername].wilayah,
    operator,
    deskripsi: `Mereset password akun "${normUsername}" oleh Super Admin.`
  });
  saveLocalDB(db);
  return true;
}
async function insertNewPlace(place, operator = "Sistem") {
  const newId = place.ID_Tempat || "SNT-" + Math.floor(1e3 + Math.random() * 9e3);
  const enrichedPlace = { ...place, ID_Tempat: newId, Status_Aktif: place.Status_Aktif || "Aktif" };
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("master_tempat").insert({
        "ID_Tempat": newId,
        "Nama_Tempat": enrichedPlace.Nama_Tempat,
        "Wilayah": enrichedPlace.Wilayah,
        "Kategori": enrichedPlace.Kategori,
        "Alamat": enrichedPlace.Alamat,
        "Koordinat_Map": enrichedPlace.Koordinat_Map,
        "Status_Terakhir": enrichedPlace.Status_Terakhir || "Belum",
        "Tgl_Inspeksi": enrichedPlace.Tgl_Inspeksi || "",
        "Total_Skor": enrichedPlace.Total_Skor === "-" ? null : enrichedPlace.Total_Skor,
        "Penanggung_Jawab": enrichedPlace.Penanggung_Jawab || "",
        "Jml_Karyawan": enrichedPlace.Jml_Karyawan || 0,
        "Status_Aktif": enrichedPlace.Status_Aktif,
        "Avatar": enrichedPlace.Avatar
      });
      if (!error) {
        console.log("Supabase insertNewPlace succeeded.");
      } else {
        console.warn("Supabase insertNewPlace failed, writing locally:", error);
      }
    } catch (e) {
      console.error("Supabase insert error, saving locally:", e);
    }
  }
  const db = getLocalDB();
  db.tempat.push(enrichedPlace);
  if (!db.changeLogs) {
    db.changeLogs = [];
  }
  db.changeLogs.push({
    id: "CHG-" + Math.floor(1e3 + Math.random() * 9e3),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    tipe: "TAMBAH",
    idTempat: newId,
    namaTempat: enrichedPlace.Nama_Tempat,
    wilayah: enrichedPlace.Wilayah,
    operator,
    deskripsi: `Mendaftarkan tempat baru "${enrichedPlace.Nama_Tempat}" (${enrichedPlace.Kategori}) di Wilayah Kerja ${enrichedPlace.Wilayah}.`
  });
  saveLocalDB(db);
  return newId;
}
async function updatePlace(id, updated, operator = "Sistem") {
  const db = getLocalDB();
  if (!db.changeLogs) {
    db.changeLogs = [];
  }
  const index = db.tempat.findIndex((t) => t.ID_Tempat === id);
  if (index === -1) return false;
  const original = db.tempat[index];
  const changesDelta = [];
  if (original.Nama_Tempat !== updated.Nama_Tempat) {
    changesDelta.push(`Nama Tempat dari "${original.Nama_Tempat}" menjadi "${updated.Nama_Tempat}"`);
  }
  if (original.Kategori !== updated.Kategori) {
    changesDelta.push(`Kategori dari "${original.Kategori}" menjadi "${updated.Kategori}"`);
  }
  if (original.Alamat !== updated.Alamat) {
    changesDelta.push(`Alamat dari "${original.Alamat}" menjadi "${updated.Alamat}"`);
  }
  if (original.Penanggung_Jawab !== updated.Penanggung_Jawab) {
    changesDelta.push(`Penanggung Jawab dari "${original.Penanggung_Jawab}" menjadi "${updated.Penanggung_Jawab}"`);
  }
  if (original.Jml_Karyawan !== updated.Jml_Karyawan) {
    changesDelta.push(`Jumlah Karyawan dari ${original.Jml_Karyawan || 0} menjadi ${updated.Jml_Karyawan || 0}`);
  }
  if (original.Koordinat_Map !== updated.Koordinat_Map) {
    changesDelta.push(`Koordinat GPS dari "${original.Koordinat_Map}" menjadi "${updated.Koordinat_Map}"`);
  }
  if (original.Status_Aktif !== updated.Status_Aktif) {
    changesDelta.push(`Status Aktif dari "${original.Status_Aktif || "Aktif"}" menjadi "${updated.Status_Aktif}"`);
  }
  if (original.Avatar !== updated.Avatar) {
    changesDelta.push(`Avatar Gambar diubah`);
  }
  const descLog = changesDelta.length > 0 ? `Mengubah data tempat: ${changesDelta.join(", ")}` : `Memperbarui info sarana tanpa merubah isian dasar`;
  db.tempat[index] = {
    ...original,
    ...updated,
    ID_Tempat: id
  };
  db.changeLogs.push({
    id: "CHG-" + Math.floor(1e3 + Math.random() * 9e3),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    tipe: "UBAH",
    idTempat: id,
    namaTempat: updated.Nama_Tempat,
    wilayah: original.Wilayah,
    operator,
    deskripsi: descLog
  });
  saveLocalDB(db);
  return true;
}
async function deletePlace(id, operator) {
  const db = getLocalDB();
  if (!db.changeLogs) {
    db.changeLogs = [];
  }
  const index = db.tempat.findIndex((t) => t.ID_Tempat === id);
  if (index === -1) return false;
  const place = db.tempat[index];
  if (operator !== "Tembilahan Induk") {
    throw new Error("Hanya admin dari induk Tembilahan yang berwenang meniadakan tempat");
  }
  db.tempat.splice(index, 1);
  db.changeLogs.push({
    id: "CHG-" + Math.floor(1e3 + Math.random() * 9e3),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    tipe: "HAPUS",
    idTempat: id,
    namaTempat: place.Nama_Tempat,
    wilayah: place.Wilayah,
    operator,
    deskripsi: `Mengahapus dan meniadakan sarana "${place.Nama_Tempat}" dari pengawasan Wilayah Kerja ${place.Wilayah}.`
  });
  saveLocalDB(db);
  return true;
}
async function fetchChangeLogs() {
  const db = getLocalDB();
  const logs = db.changeLogs || [];
  return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
async function insertInspectionLog(payload) {
  if (supabaseClient) {
    try {
      const { error: logErr } = await supabaseClient.from("log_inspeksi").insert({
        "Timestamp": payload.Timestamp,
        "ID_Tempat": payload.ID_Tempat,
        "Nama_Tempat": payload.Nama_Tempat,
        "Wilayah": payload.Wilayah,
        "Kategori": payload.Kategori,
        "Penanggung_Jawab": payload.Penanggung_Jawab,
        "Jml_Karyawan": payload.Jml_Karyawan,
        "Jml_Penjamah": payload.Jml_Penjamah,
        "Total_Skor": payload.Total_Skor,
        "Kesimpulan_Sistem": payload.Kesimpulan_Sistem,
        "Total_Nilai_Mentah": payload.Total_Nilai_Mentah,
        "Detail_Jawaban": payload.Detail_Jawaban,
        "Nama_Pemeriksa": payload.Nama_Pemeriksa,
        "NIP_Pemeriksa": payload.NIP_Pemeriksa,
        "Jabatan_Pemeriksa": payload.Jabatan_Pemeriksa,
        "TTD_Digital": payload.TTD_Digital,
        "TTD_Pemilik": payload.TTD_Pemilik || "",
        "Foto_Dokumentasi": payload.Foto_Dokumentasi || ""
      });
      if (!logErr) {
        const colorStatus = payload.Kesimpulan_Sistem === "Memenuhi Syarat" ? "Hijau" : "Merah";
        const dateObj = new Date(payload.Timestamp);
        const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
        const { error: updateErr } = await supabaseClient.from("master_tempat").update({
          "Status_Terakhir": colorStatus,
          "Tgl_Inspeksi": dateStr,
          "Total_Skor": payload.Total_Skor
        }).eq("ID_Tempat", payload.ID_Tempat);
        if (!updateErr) {
          console.log("Supabase log and master updates succeeded.");
        } else {
          console.warn("Supabase master update failed:", updateErr);
        }
      } else {
        console.warn("Supabase log insertion failed, fallback to local:", logErr);
      }
    } catch (e) {
      console.error("Supabase error for log insert, saving locally:", e);
    }
  }
  const db = getLocalDB();
  db.logs.push(payload);
  const index = db.tempat.findIndex((t) => t.ID_Tempat === payload.ID_Tempat);
  if (index !== -1) {
    const colorStatus = payload.Kesimpulan_Sistem === "Memenuhi Syarat" ? "Hijau" : "Merah";
    const dateObj = new Date(payload.Timestamp);
    const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
    db.tempat[index].Status_Terakhir = colorStatus;
    db.tempat[index].Tgl_Inspeksi = dateStr;
    db.tempat[index].Total_Skor = payload.Total_Skor;
    if (payload.Jml_Karyawan) {
      db.tempat[index].Jml_Karyawan = payload.Jml_Karyawan;
    }
  }
  saveLocalDB(db);
}

// server/kriteria_data.ts
var kriteria_A1A2 = [
  // =====================================================
  // INSPEKSI AREA LUAR TPP
  // =====================================================
  {
    "No": "1",
    "Kategori": "Inspeksi Area Luar TPP",
    "Kriteria Penilaian": "Lokasi bebas banjir",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "2",
    "Kategori": "Inspeksi Area Luar TPP",
    "Kriteria Penilaian": "Lokasi bebas dari pencemaran bau/asap/debu/kotoran",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "3",
    "Kategori": "Inspeksi Area Luar TPP",
    "Kriteria Penilaian": "Lokasi bebas dari sumber vektor dan binatang pembawa penyakit",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "4",
    "Kategori": "Inspeksi Area Luar TPP",
    "Kriteria Penilaian": "Tenda tidak bocor (kedap air), kuat dan mudah dibersihkan",
    "A1": "NA",
    "A2": "2"
  },
  // =====================================================
  // INSPEKSI AREA PELAYANAN KONSUMEN
  // =====================================================
  {
    "No": "1",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Area tempat makan konsumen bersih",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "2",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Dinding ruang makan bersih (jika tidak ada dinding, maka abaikan persyaratan ini)",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "3",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Ventilasi udara baik (bisa menggunakan ventilasi udara alami atau buatan)",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "4",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Memiliki tempat sampah:"
  },
  {
    "No": "a",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Tertutup rapat",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "b",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Tidak ada tumpukan sampah. Frekuensi pembuangan teratur",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "5",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Tempat/area makan atau meja makan konsumen:"
  },
  {
    "No": "a",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Bersih dan mudah dibersihkan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "b",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Utuh / rata",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "c",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Kedap air",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "6",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Peralatan yang digunakan untuk penyajian (piring, sendok, panci dan lainnya):",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "a",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Bersih",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "b",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Utuh",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "c",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Aman bagi kesehatan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "d",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Tara pangan (food grade)",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "7",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Pangan yang tidak dikemas harus disajikan dengan penutup (tudung saji) atau di dalam lemari display yang tertutup"
  },
  {
    "No": "8",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Pangan segar yang langsung dikonsumsi seperti buah potong dan salad disimpan dalam suhu yang aman yaitu di bawah 5\xB0C (lemari pendingin) atau di wadah bersuhu dingin/(coolbox)",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "9",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Pangan siap saji berkuah disimpan dalam kondisi panas dengan suhu di atas 60\xB0C (wadah dengan pemanas)",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "10",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Pangan matang yang mudah rusak dan disimpan pada suhu ruang dikonsumsi maksimal 4 jam setelah dimasak, jika masih akan dikonsumsi harus dilakukan pemanasan ulang",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "11",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Tidak ada vektor dan binatang pembawa penyakit atau hewan peliharaan berkeliaran di area ini",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "12",
    "Kategori": "Inspeksi Area Pelayanan Konsumen",
    "Kriteria Penilaian": "Personel yang menyentuh uang saat melayani pembayaran, tidak menyentuh pangan secara langsung sebelum melakukan cuci tangan atau menggunakan hand sanitizer",
    "A1": "3",
    "A2": "3"
  },
  // =====================================================
  // UMUM
  // =====================================================
  {
    "No": "1",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Tersedia akses ke sumber air yang aman",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "2",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Tersedia akses jamban/toilet yang mudah diakses",
    "A1": "2",
    "A2": "NA"
  },
  {
    "No": "3",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Tersedia tempat pencucian peralatan dan bahan pangan, yang:"
  },
  {
    "No": "a",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Menggunakan air mengalir",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "b",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Pencucian tidak dilakukan di area sumber kontaminasi (kamar mandi, jamban, kamar mandi umum, sungai, atau air permukaan seperti danau, dan lainnya)",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "4",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Tersedia tempat cuci tangan, dengan:"
  },
  {
    "No": "a",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Air mengalir",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "b",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Sabun cuci tangan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "5",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Tersedia tempat sampah yang tertutup",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "6",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Tersedia tempat penyimpanan pangan yang bersih terlindung dari bahan kimia, serta vektor dan binatang pembawa penyakit",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "7",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Tersedia tempat penyimpanan peralatan yang bersih terhindar dari vektor dan binatang pembawa penyakit",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "8",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Tempat penyimpanan bukan merupakan jalur akses ke kamar mandi atau jamban",
    "A1": "2",
    "A2": "NA"
  },
  {
    "No": "9",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Tidak ada vektor dan binatang pembawa penyakit atau hewan peliharaan berkeliaran di area ini",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "10",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Bahan kimia (insektisida dan lainnya) tidak disimpan bersebelahan dengan bahan pangan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "11",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Lantai:"
  },
  {
    "No": "a",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Rata",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "b",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Mudah dibersihkan",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "12",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Memiliki ventilasi udara, dengan:",
    "A1": "1",
    "A2": "NA"
  },
  {
    "No": "a",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Bahan kuat dan tahan lama",
    "A1": "1",
    "A2": "NA"
  },
  {
    "No": "b",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Jika terbuka, memiliki kasa anti serangga yang mudah dilepas & dibersihkan",
    "A1": "1",
    "A2": "NA"
  },
  {
    "No": "c",
    "Kategori": "Umum",
    "Kriteria Penilaian": "Jika menggunakan exhaust atau air conditioner maka kondisi terawat, berfungsi dan bersih",
    "A1": "1",
    "A2": "NA"
  },
  // =====================================================
  // PEMILIHAN DAN PENYIMPANAN BAHAN PANGAN
  // =====================================================
  {
    "No": "1",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Bahan pangan:"
  },
  {
    "No": "a",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Mutu baik",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "b",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Utuh dan tidak rusak",
    "A1": "1",
    "A2": "1"
  },
  {
    "No": "2",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Bahan baku pangan dalam kemasan:"
  },
  {
    "No": "a",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Memiliki label",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "b",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Terdaftar atau ada izin edar",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "c",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Tidak kadaluwarsa",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "d",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Kemasan tidak rusak (mengelembung, bocor, penyok atau berkarat)",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "3",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Pangan yang disimpan di kulkas, dengan kondisi:"
  },
  {
    "No": "a",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Bersih",
    "A1": "2",
    "A2": "NA"
  },
  {
    "No": "b",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Tersusun rapi sesuai jenis pangan (matang di atas dan mentah di bagian bawah)",
    "A1": "2",
    "A2": "NA"
  },
  {
    "No": "c",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Tidak terlalu padat",
    "A1": "2",
    "A2": "NA"
  },
  {
    "No": "4",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Bahan pangan:"
  },
  {
    "No": "a",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Disimpan terpisah dan dikelompokkan menurut jenisnya dalam wadah yang bersih, dan tara pangan (food grade)",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "b",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Disimpan pada suhu yang tepat sesuai jenisnya",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "c",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Tidak terdapat bahan pangan yang kadaluwarsa",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "d",
    "Kategori": "Pemilihan dan Penyimpanan Bahan Pangan",
    "Kriteria Penilaian": "Tertutup untuk mencegah akses vektor dan binatang pembawa penyakit",
    "A1": "2",
    "A2": "2"
  },
  // =====================================================
  // PERSIAPAN DAN PENGOLAHAN/PEMASAKAN PANGAN
  // =====================================================
  {
    "No": "1",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Pencahayaan cukup terang",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "2",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Bahan pangan yang akan digunakan dibersihkan dan dicuci dengan air mengalir sebelum dimasak",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "3",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Melakukan thawing/pelunakan dengan benar",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "4",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Pangan dimasak dengan suhu yang sesuai dan matang sempurna",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "5",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Personil yang bekerja pada area ini:"
  },
  {
    "No": "a",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Sehat & bebas dari penyakit menular",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "b",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Menggunakan APD:"
  },
  {
    "No": "b.1",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Celemek",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "b.2",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Masker",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "b.3",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Hairnet / penutup rambut",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "c",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Berkuku pendek, bersih dan tidak memakai pewarna kuku",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "d",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Selalu mencuci tangan dengan sabun dan air mengalir sebelum dan secara berkala saat mengolah pangan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "e",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Tidak menggunakan perhiasan dan aksesoris lain (cincin, gelang, bros dan lain-lain) ketika mengolah pangan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "f",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Pada saat mengolah pangan:"
  },
  {
    "No": "f.1",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Tidak merokok",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "f.2",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Tidak bersin atau batuk di atas pangan langsung",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "f.3",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Tidak meludah sembarangan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "f.4",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Tidak mengunyah makanan/permen",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "f.5",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Tidak menggaruk-garuk atau menyentuh anggota badan yang kotor dan kemudian langsung menyentuh pangan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "g",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Mengambil pangan matang menggunakan sarung tangan atau alat bantu (contoh sendok, penjapit makanan)",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "h",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Jika terluka maka luka ditutup dengan perban/sejenisnya dan ditutup penutup tahan air dan kondisi bersih",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "i",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Melakukan pemeriksaan kesehatan minimal 1 kali dalam setahun",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "j",
    "Kategori": "Persiapan dan Pengolahan/Pemasakan Pangan",
    "Kriteria Penilaian": "Sudah mendapatkan peningkatan kapasitas/pelatihan keamanan pangan olahan siap saji",
    "A1": "2",
    "A2": "2"
  },
  // =====================================================
  // PERALATAN (termasuk meja tempat pengolahan)
  // =====================================================
  {
    "No": "1",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Peralatan untuk pengolahan pangan:"
  },
  {
    "No": "a",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Bahan kuat",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "b",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Tidak berkarat",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "c",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Tara pangan (food grade)",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "d",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Bersih sebelum digunakan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "e",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Setelah digunakan kondisi bersih dan kering",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "f",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Berbeda untuk pangan matang dan pangan mentah",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "g",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Peralatan masak/makan sekali pakai tidak dipakai ulang & food grade",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "2",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Alat pengering peralatan seperti lap/kain majun selalu dalam kondisi bersih dan diganti secara rutin untuk menghindari kontaminasi silang",
    "A1": "2",
    "A2": "2"
  },
  {
    "No": "3",
    "Kategori": "Peralatan (termasuk meja tempat pengolahan)",
    "Kriteria Penilaian": "Peralatan pembersih tidak menyebabkan kontaminasi silang (tidak boleh menggunakan sapu ijuk atau kemoceng)",
    "A1": "2",
    "A2": "2"
  },
  // =====================================================
  // PENYAJIAN PANGAN MATANG
  // =====================================================
  {
    "No": "1",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Pangan matang yang mudah rusak harus sudah dikonsumsi 4 (empat) jam setelah matang",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "2",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Pangan matang panas dijaga pada suhu > 60\xB0C",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "3",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Pangan matang dingin dijaga pada suhu < 5\xB0C",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "4",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Pangan segar yang langsung dikonsumsi seperti buah potong dan salad disimpan dalam suhu yang aman yaitu di bawah 5\xB0C (lemari pendingin) atau di wadah bersuhu dingin/(coolbox)",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "5",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Jika menggunakan es batu yang dicampur dengan pangan matang, maka es batu harus dibuat dari air yang memenuhi standar kualitas air minum/air yang sudah diolah/dimasak",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "6",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Pangan matang sisa yang sudah melampaui batas waktu konsumsi dan suhu penyimpanan tidak boleh dikonsumsi",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "7",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Air untuk minum memenuhi standar kualitas air minum/air yang sudah diolah/dimasak",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "8",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Tempat yang digunakan untuk menyajikan pangan:"
  },
  {
    "No": "a",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Piring bersih dan tara pangan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "b",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Gelas bersih dan tara pangan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "c",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Sendok bersih dan tara pangan",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "d",
    "Kategori": "Penyajian Pangan Matang",
    "Kriteria Penilaian": "Sedotan bersih dan tara pangan",
    "A1": "3",
    "A2": "3"
  },
  // =====================================================
  // PENGEMASAN PANGAN MATANG
  // =====================================================
  {
    "No": "1",
    "Kategori": "Pengemasan Pangan Matang",
    "Kriteria Penilaian": "Pengemasan dilakukan secara higiene (personil cuci tangan dan menggunakan sarung tangan dengan kondisi baik)",
    "A1": "3",
    "A2": "3"
  },
  {
    "No": "2",
    "Kategori": "Pengemasan Pangan Matang",
    "Kriteria Penilaian": "Pengemasan pangan matang harus dalam wadah tertutup dan tara pangan (foodgrade)",
    "A1": "3",
    "A2": "3"
  }
];
var kriteria_TFU = [
  {
    "No": "1",
    "Kategori": "Lingkungan luar halaman",
    "Kriteria Penilaian": "Bersih",
    "Bobot": "6",
    "Nilai_Max": "2,5"
  },
  {
    "No": "2",
    "Kategori": "Lingkungan luar halaman",
    "Kriteria Penilaian": "Tertata rapi",
    "Bobot": "6",
    "Nilai_Max": "2,5"
  },
  {
    "No": "3",
    "Kategori": "Lingkungan luar halaman",
    "Kriteria Penilaian": "Tidak ada genangan air/ tidak becek",
    "Bobot": "6",
    "Nilai_Max": "2,5"
  },
  {
    "No": "4",
    "Kategori": "Lingkungan luar halaman",
    "Kriteria Penilaian": "Tingkat kebisingan max. 70 db.A",
    "Bobot": "6",
    "Nilai_Max": "2,5"
  },
  {
    "No": "1",
    "Kategori": "Ruang Bangunan",
    "Kriteria Penilaian": "Bangunan kuat, terpelihara dan bersih",
    "Bobot": "6",
    "Nilai_Max": "1,5"
  },
  {
    "No": "2",
    "Kategori": "Ruang Bangunan",
    "Kriteria Penilaian": "Lantai kuat, kedap air, rata dan tidak licin",
    "Bobot": "6",
    "Nilai_Max": "1,5"
  },
  {
    "No": "3",
    "Kategori": "Ruang Bangunan",
    "Kriteria Penilaian": "Dinding rata, bersih dan berwarna terang",
    "Bobot": "6",
    "Nilai_Max": "1,5"
  },
  {
    "No": "4",
    "Kategori": "Ruang Bangunan",
    "Kriteria Penilaian": "Permukaan dinding yang selalu terkena air, terbuat dari bahan kedap air",
    "Bobot": "6",
    "Nilai_Max": "1,5"
  },
  {
    "No": "5",
    "Kategori": "Ruang Bangunan",
    "Kriteria Penilaian": "Langit-langit kuat, bersih, berwarna terang dan tinggi minimal 2.5 meter",
    "Bobot": "6",
    "Nilai_Max": "1,5"
  },
  {
    "No": "6",
    "Kategori": "Ruang Bangunan",
    "Kriteria Penilaian": "Luas lubang ventilasi (jendela pintu + kisi-kisi) minimal 1/6 kali luas lantai",
    "Bobot": "6",
    "Nilai_Max": "1,5"
  },
  {
    "No": "7",
    "Kategori": "Ruang Bangunan",
    "Kriteria Penilaian": "Setiap karyawan mendapat ruang udara minimal 10m3/karyawan",
    "Bobot": "6",
    "Nilai_Max": "1"
  },
  {
    "No": "1",
    "Kategori": "Penyehatan air",
    "Kriteria Penilaian": "Tersedia air bersih untuk kebutuhan karyawan dengan kapasitas 40 liter/orang/hari",
    "Bobot": "10",
    "Nilai_Max": "4"
  },
  {
    "No": "2",
    "Kategori": "Penyehatan air",
    "Kriteria Penilaian": "Kualitas air bersih memenuhi syarat fisik",
    "Bobot": "10",
    "Nilai_Max": "4"
  },
  {
    "No": "3",
    "Kategori": "Penyehatan air",
    "Kriteria Penilaian": "Distribusi air dengan sistim perpipaan",
    "Bobot": "10",
    "Nilai_Max": "2"
  },
  {
    "No": "1",
    "Kategori": "Penyehatan udara ruang",
    "Kriteria Penilaian": "Suhu: 18-26\xB0 C (ruang AC) dan suhu ruangan terasa nyaman (tanpa AC)",
    "Bobot": "10",
    "Nilai_Max": "3,5"
  },
  {
    "No": "2",
    "Kategori": "Penyehatan udara ruang",
    "Kriteria Penilaian": "Kelembaban 40-60 % (ruang AC) atau ambient 70% (tanpa AC)",
    "Bobot": "10",
    "Nilai_Max": "3"
  },
  {
    "No": "3",
    "Kategori": "Penyehatan udara ruang",
    "Kriteria Penilaian": "Kadar debu total <0.15 mg/m3 udara atau tidak berdebu",
    "Bobot": "10",
    "Nilai_Max": "3,5"
  },
  {
    "No": "1",
    "Kategori": "Pengelolaan Limbah",
    "Kriteria Penilaian": "Pengelolaan sampah dikumpulkan pada tempat yang telah tersedia",
    "Bobot": "15",
    "Nilai_Max": "5"
  },
  {
    "No": "2",
    "Kategori": "Pengelolaan Limbah",
    "Kriteria Penilaian": "Limbah cair diolah dalam IPAL",
    "Bobot": "15",
    "Nilai_Max": "5"
  },
  {
    "No": "1",
    "Kategori": "Pencahayaan",
    "Kriteria Penilaian": "Intensitas cahaya pada masing-masing ruang kerja minimal 100 lux",
    "Bobot": "10",
    "Nilai_Max": "6"
  },
  {
    "No": "2",
    "Kategori": "Pencahayaan",
    "Kriteria Penilaian": "Pencahayaan ruang tidak menimbulkan bayangan",
    "Bobot": "10",
    "Nilai_Max": "4"
  },
  {
    "No": "1",
    "Kategori": "Kebisingan pada ruang",
    "Kriteria Penilaian": "Tingkat kebisingan diruang kerja maksimal 85 dBA",
    "Bobot": "10",
    "Nilai_Max": "10"
  },
  {
    "No": "1",
    "Kategori": "Getaran di ruang kerja",
    "Kriteria Penilaian": "Getaran diruang kerja tidak mengganggu kenyamanan",
    "Bobot": "10",
    "Nilai_Max": "10"
  },
  {
    "No": "1",
    "Kategori": "Pengendalian vector penyakit",
    "Kriteria Penilaian": "Indeks lalat dalam pengukuran 30 menit maksimal 8 ekor /fly grill",
    "Bobot": "8",
    "Nilai_Max": "2"
  },
  {
    "No": "2",
    "Kategori": "Pengendalian vector penyakit",
    "Kriteria Penilaian": "Indeks kecoa dalam pengukuran 24 jam maksimal 2 ekor/plate",
    "Bobot": "8",
    "Nilai_Max": "2"
  },
  {
    "No": "3",
    "Kategori": "Pengendalian vector penyakit",
    "Kriteria Penilaian": "Indeks jentik aedes aegypti perimeter area (house index aedes) = 0",
    "Bobot": "8",
    "Nilai_Max": "2"
  },
  {
    "No": "4",
    "Kategori": "Pengendalian vector penyakit",
    "Kriteria Penilaian": "Indeks jentik aedes aegypti buffer area kurang dari 0,01",
    "Bobot": "8",
    "Nilai_Max": "2"
  },
  {
    "No": "5",
    "Kategori": "Pengendalian vector penyakit",
    "Kriteria Penilaian": "Seluruh ruangan bebas tikus",
    "Bobot": "8",
    "Nilai_Max": "2"
  },
  {
    "No": "1",
    "Kategori": "Instalasi",
    "Kriteria Penilaian": "Instalasi listrik, pemadam, air bersih/kotor/limbah menjamin keamanan",
    "Bobot": "5",
    "Nilai_Max": "5"
  },
  {
    "No": "2",
    "Kategori": "Instalasi",
    "Kriteria Penilaian": "Bangunan tinggi > 10 meter dilengkapi penangkal petir",
    "Bobot": "5",
    "Nilai_Max": "5"
  },
  {
    "No": "1",
    "Kategori": "Pemeliharaan Jamban & kamar mandi",
    "Kriteria Penilaian": "Jamban & kamar mandi bersih dan tidak bau",
    "Bobot": "10",
    "Nilai_Max": "2"
  },
  {
    "No": "2",
    "Kategori": "Pemeliharaan Jamban & kamar mandi",
    "Kriteria Penilaian": "Jamban & kamar mandi pria terpisah dengan wanita",
    "Bobot": "10",
    "Nilai_Max": "2"
  },
  {
    "No": "3",
    "Kategori": "Pemeliharaan Jamban & kamar mandi",
    "Kriteria Penilaian": "Lantai jamban & kamar mandi kedap air dan tidak licin",
    "Bobot": "10",
    "Nilai_Max": "2"
  },
  {
    "No": "4",
    "Kategori": "Pemeliharaan Jamban & kamar mandi",
    "Kriteria Penilaian": "Tersedia air bersih yang mencukupi",
    "Bobot": "10",
    "Nilai_Max": "2"
  },
  {
    "No": "5",
    "Kategori": "Pemeliharaan Jamban & kamar mandi",
    "Kriteria Penilaian": "Tersedia Wastafel, Jamban, dan Peturasan yang memadai",
    "Bobot": "10",
    "Nilai_Max": "2"
  }
];

// server/api_entry.ts
var app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
var ACTIVE_TOKENS = /* @__PURE__ */ new Map();
function sanitizeString(str) {
  if (typeof str !== "string") return str || "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ status: "error", message: "Token otentikasi diperlukan." });
  }
  const session = ACTIVE_TOKENS.get(token);
  if (!session) {
    return res.status(403).json({ status: "error", message: "Sesi tidak valid atau telah kedalwarsa." });
  }
  if (Date.now() > session.expires) {
    ACTIVE_TOKENS.delete(token);
    return res.status(403).json({ status: "error", message: "Sesi Anda telah kedaluwarsa. Silakan login kembali." });
  }
  session.expires = Date.now() + 3 * 60 * 60 * 1e3;
  req.userWilayah = session.wilayah;
  req.token = token;
  next();
}
app.get("/api/petugas", async (req, res) => {
  try {
    const data = await fetchPetugasList();
    res.json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.post("/api/petugas", authenticateToken, async (req, res) => {
  try {
    if (req.userWilayah !== "Super Admin") {
      return res.status(403).json({ status: "error", message: "Akses Ditolak. Khusus Super Admin." });
    }
    const { nama, nip, jabatan, wilayah } = req.body;
    if (!nama || !nip || !jabatan) {
      return res.status(400).json({ status: "error", message: "Data petugas tidak lengkap" });
    }
    const success = await savePetugas({ nama, nip, jabatan, wilayah });
    if (success) {
      res.json({ status: "success", message: "Petugas berhasil disimpan" });
    } else {
      res.status(500).json({ status: "error", message: "Gagal menyimpan petugas" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.delete("/api/petugas/:nip", authenticateToken, async (req, res) => {
  try {
    if (req.userWilayah !== "Super Admin") {
      return res.status(403).json({ status: "error", message: "Akses Ditolak. Khusus Super Admin." });
    }
    const success = await deletePetugas(req.params.nip);
    if (success) {
      res.json({ status: "success", message: "Petugas berhasil dihapus" });
    } else {
      res.status(404).json({ status: "error", message: "Petugas tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.get("/api/dashboard", async (req, res) => {
  try {
    const places = await fetchPlaces();
    res.json({ status: "success", data: places });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.post("/api/auth/verify", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ status: "error", message: "Username dan Password wajib diisi." });
    }
    const result = await authVerifyUser(username, password);
    if (result.success && result.wilayah) {
      const token = crypto2.randomBytes(16).toString("hex");
      ACTIVE_TOKENS.set(token, {
        wilayah: result.wilayah,
        expires: Date.now() + 3 * 60 * 60 * 1e3
      });
      res.json({
        status: "success",
        message: "Akses Diberikan",
        token,
        wilayah: result.wilayah
      });
    } else {
      res.status(401).json({ status: "error", message: "Kredensial Tidak Valid." });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.get("/api/kriteria", (req, res) => {
  try {
    const { jenis } = req.query;
    const typeStr = (jenis || "").toString().trim();
    const data = typeStr.startsWith("TPP") ? kriteria_A1A2 : kriteria_TFU;
    res.json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.get("/api/places/list", async (req, res) => {
  try {
    const { wilayah } = req.query;
    const wStr = (wilayah || "").toString().trim();
    const allPlaces = await fetchPlaces();
    const filtered = wStr && wStr !== "Semua" ? allPlaces.filter((p) => p.Wilayah === wStr) : allPlaces;
    res.json({ status: "success", data: filtered });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.get("/api/rekap", async (req, res) => {
  try {
    const { wilayah } = req.query;
    const logs = await fetchLogInspeksi(wilayah ? wilayah : void 0);
    const bulanIndo = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember"
    ];
    const processedLogs = logs.map((log) => {
      const dObj = new Date(log.Timestamp);
      const dateStr = !isNaN(dObj.getTime()) ? `${String(dObj.getDate()).padStart(2, "0")}/${String(dObj.getMonth() + 1).padStart(2, "0")}/${dObj.getFullYear()} ${String(dObj.getHours()).padStart(2, "0")}:${String(dObj.getMinutes()).padStart(2, "0")}` : "Tgl tidak valid";
      const bulan = !isNaN(dObj.getTime()) ? bulanIndo[dObj.getMonth()] + " " + dObj.getFullYear() : "Lainnya";
      return {
        ...log,
        Timestamp: dateStr,
        Bulan_Kegiatan: bulan
      };
    });
    processedLogs.sort((a, b) => {
      const parseDate = (str) => {
        const parts = str.split(" ");
        if (parts.length < 2) return 0;
        const [d, m, y] = parts[0].split("/").map(Number);
        const [hr, min] = parts[1].split(":").map(Number);
        return new Date(y, m - 1, d, hr, min).getTime();
      };
      return parseDate(b.Timestamp) - parseDate(a.Timestamp);
    });
    res.json({ status: "success", data: processedLogs });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.post("/api/auth/reset-pin", authenticateToken, async (req, res) => {
  try {
    const { targetUsername, newPassword } = req.body;
    if (!targetUsername || !newPassword) {
      return res.status(400).json({ status: "error", message: "Username target dan Password baru wajib diisi." });
    }
    if (req.userWilayah !== "Super Admin") {
      return res.status(403).json({ status: "error", message: "Akses ditolak: Hanya Super Admin yang berwenang mereset password." });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: "error",
        message: "Password tidak memenuhi kriteria kompleksitas (Min 8 karakter, mengandung huruf besar, huruf kecil, dan minimal 1 simbol)."
      });
    }
    const success = await resetOfficerPassword(targetUsername, newPassword, req.userWilayah);
    if (success) {
      res.json({ status: "success", message: `Password untuk akun ${targetUsername} berhasil direset.` });
    } else {
      res.status(500).json({ status: "error", message: "Gagal mereset password." });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.post("/api/tempat", authenticateToken, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.nama || !payload.wilayah || !payload.koordinat) {
      return res.status(400).json({ status: "error", message: "Nama, Wilayah, and Koordinat are required." });
    }
    const sanitizedNama = sanitizeString(payload.nama);
    const sanitizedAlamat = sanitizeString(payload.alamat);
    const sanitizedPj = sanitizeString(payload.penanggung_jawab);
    const idBaru = "SNT-" + Math.floor(1e3 + Math.random() * 9e3);
    const newPlace = {
      ID_Tempat: idBaru,
      Nama_Tempat: sanitizedNama,
      Wilayah: payload.wilayah,
      Kategori: payload.kategori || "Fasilitas Umum",
      Alamat: sanitizedAlamat || "-",
      Penanggung_Jawab: sanitizedPj || "-",
      Jml_Karyawan: parseInt(payload.jml_karyawan, 10) || 0,
      Koordinat_Map: payload.koordinat,
      Status_Terakhir: "Belum",
      Tgl_Inspeksi: "",
      Total_Skor: "-",
      Status_Aktif: payload.status_aktif || "Aktif",
      Avatar: payload.avatar || ""
    };
    const operator = req.userWilayah || "Sistem";
    const resultId = await insertNewPlace(newPlace, operator);
    res.json({ status: "success", newId: resultId });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.post("/api/tempat/update", authenticateToken, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.id) {
      return res.status(400).json({ status: "error", message: "ID Tempat is required for updating." });
    }
    const sanitizedNama = sanitizeString(payload.nama);
    const sanitizedAlamat = sanitizeString(payload.alamat);
    const sanitizedPj = sanitizeString(payload.penanggung_jawab);
    const updatedPlace = {
      ID_Tempat: payload.id,
      Nama_Tempat: sanitizedNama,
      Wilayah: payload.wilayah,
      Kategori: payload.kategori,
      Alamat: sanitizedAlamat || "-",
      Penanggung_Jawab: sanitizedPj || "-",
      Jml_Karyawan: parseInt(payload.jml_karyawan, 10) || 0,
      Koordinat_Map: payload.koordinat,
      Status_Terakhir: payload.status_terakhir || "Belum",
      Tgl_Inspeksi: payload.tgl_inspeksi || "",
      Total_Skor: payload.total_skor || "-",
      Status_Aktif: payload.status_aktif || "Aktif",
      Avatar: payload.avatar || ""
    };
    const operator = req.userWilayah || "Sistem";
    const success = await updatePlace(payload.id, updatedPlace, operator);
    if (success) {
      res.json({ status: "success", message: "Master data tempat berhasil diperbarui." });
    } else {
      res.status(404).json({ status: "error", message: "Tempat tidak ditemukan." });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.post("/api/tempat/delete", authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ status: "error", message: "ID Tempat is required." });
    }
    const operator = req.userWilayah || "Sistem";
    const success = await deletePlace(id, operator);
    if (success) {
      res.json({ status: "success", message: "Tempat berhasil dihapus." });
    } else {
      res.status(404).json({ status: "error", message: "Tempat tidak ditemukan." });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.get("/api/changelogs", authenticateToken, async (req, res) => {
  try {
    const data = await fetchChangeLogs();
    res.json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
app.post("/api/inspeksi", authenticateToken, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.idTempat || !payload.pemeriksaNama) {
      return res.status(400).json({ status: "error", message: "ID Tempat and Pemeriksa are required." });
    }
    const sanitizedNamaTempat = sanitizeString(payload.namaTempat);
    const sanitizedPj = sanitizeString(payload.pj);
    const sanitizedPemeriksaNama = sanitizeString(payload.pemeriksaNama);
    const sanitizedPemeriksaNip = sanitizeString(payload.pemeriksaNip);
    const sanitizedPemeriksaJabatan = sanitizeString(payload.pemeriksaJabatan);
    const inspection = {
      Timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ID_Tempat: payload.idTempat,
      Nama_Tempat: sanitizedNamaTempat,
      Wilayah: payload.wilayah,
      Kategori: payload.jenis,
      Penanggung_Jawab: sanitizedPj || "-",
      Jml_Karyawan: parseInt(payload.jmlKaryawan, 10) || 0,
      Jml_Penjamah: parseInt(payload.jmlPenjamah, 10) || 0,
      Total_Skor: parseFloat(payload.skorAkhir) || 0,
      Kesimpulan_Sistem: payload.kesimpulan,
      Total_Nilai_Mentah: parseFloat(payload.totalNilai) || 0,
      Detail_Jawaban: typeof payload.detailJawaban === "string" ? payload.detailJawaban : JSON.stringify(payload.detailJawaban),
      Nama_Pemeriksa: sanitizedPemeriksaNama,
      NIP_Pemeriksa: sanitizedPemeriksaNip || "-",
      Jabatan_Pemeriksa: sanitizedPemeriksaJabatan || "-",
      TTD_Digital: payload.ttdBase64 || "",
      TTD_Pemilik: payload.ttdPemilikBase64 || "",
      Foto_Dokumentasi: payload.fotoDokumentasiBase64 || ""
    };
    await insertInspectionLog(inspection);
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});
var api_entry_default = app;
export {
  api_entry_default as default
};
