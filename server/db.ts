import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Petugas, Tempat, LogInspeksi } from "../src/types";

export function hashPin(pin: string): string {
  const salt = "santuari_salt_2026";
  return crypto.createHash("sha256").update(pin + salt).digest("hex");
}

export interface UserAccount {
  username: string;
  passwordHash: string;
  wilayah: string;
  nama: string;
}

export function hashPassword(password: string): string {
  const salt = "santuari_password_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

// DB file path
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Define Supabase config (optional, loaded from .env)
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

let supabaseClient: SupabaseClient | null = null;

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

// Secure PIN Auth codes per Wilayah Kerja
const DEFAULT_AUTH_PINS: Record<string, string> = {
  "Tembilahan Induk": "111111",
  "Kuala Gaung": "222222",
  "Sungai Guntung": "333333",
  "Kuala Enok": "444444",
  "Pulau Kijang": "555555",
  "Rengat": "666666",
  "Super Admin": "999999"
};

const DEFAULT_AUTH_USERS: Record<string, { username: string; plainPass: string; wilayah: string; nama: string }> = {
  "superadmin": { username: "superadmin", plainPass: "Super@Admin123", wilayah: "Super Admin", nama: "Administrator" },
  "tembilahan": { username: "tembilahan", plainPass: "Tembilahan@2026", wilayah: "Tembilahan Induk", nama: "Petugas Tembilahan" },
  "kualagaung": { username: "kualagaung", plainPass: "Kuala@Gaung2026", wilayah: "Kuala Gaung", nama: "Petugas Kuala Gaung" },
  "sungaiguntung": { username: "sungaiguntung", plainPass: "Sungai@Guntung2026", wilayah: "Sungai Guntung", nama: "Petugas Sungai Guntung" },
  "kualaenok": { username: "kualaenok", plainPass: "Kuala@Enok2026", wilayah: "Kuala Enok", nama: "Petugas Kuala Enok" },
  "pulaukijang": { username: "pulaukijang", plainPass: "Pulau@Kijang2026", wilayah: "Pulau Kijang", nama: "Petugas Pulau Kijang" },
  "rengat": { username: "rengat", plainPass: "Rengat@2026", wilayah: "Rengat", nama: "Petugas Rengat" }
};

// Seed Officers Master
const DEFAULT_PETUGAS: Petugas[] = [
  { nama: "H. Irwan Efendi, S.KM., M.Si", nip: "197810142002121001", jabatan: "Inspektur Kesling Madya" },
  { nama: "Budi Santoso, S.ST", nip: "198505122008031002", jabatan: "Inspektur Kesling Muda" },
  { nama: "Siti Aminah, A.Md.KL", nip: "199208242014022001", jabatan: "Inspektur Kesling Pertama" }
];

// Seed Registered Places (Master Tempat)
const DEFAULT_TEMPAT: Tempat[] = [
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
    Total_Skor: 58.0
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

// Seed Historical Logs
const DEFAULT_LOGS: LogInspeksi[] = [
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
    Total_Skor: 58.0,
    Kesimpulan_Sistem: "Tidak Memenuhi Syarat",
    Total_Nilai_Mentah: 58.0,
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

// Interface for database JSON files
export interface LogPerubahan {
  id: string;
  timestamp: string;
  tipe: "TAMBAH" | "UBAH" | "HAPUS";
  idTempat: string;
  namaTempat: string;
  wilayah: string;
  operator: string;
  deskripsi: string;
}

interface DatabaseSchema {
  users?: Record<string, UserAccount>;
  pins: Record<string, string>;
  petugas: Petugas[];
  tempat: Tempat[];
  logs: LogInspeksi[];
  changeLogs?: LogPerubahan[];
}

// Function to read JSON Database
function getLocalDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
    const initialUsers: Record<string, UserAccount> = {};
    for (const key in DEFAULT_AUTH_USERS) {
      const u = DEFAULT_AUTH_USERS[key];
      initialUsers[key] = {
        username: u.username,
        passwordHash: hashPassword(u.plainPass),
        wilayah: u.wilayah,
        nama: u.nama
      };
    }
    const initialData: DatabaseSchema = {
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
    
    // Auto-migrate plain PINs to hashes
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

    // Auto-migrate users schema
    if (!parsed.users) {
      parsed.users = {};
      for (const key in DEFAULT_AUTH_USERS) {
        const u = DEFAULT_AUTH_USERS[key];
        parsed.users[key] = {
          username: u.username,
          passwordHash: hashPassword(u.plainPass),
          wilayah: u.wilayah,
          nama: u.nama
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
    const initialUsers: Record<string, UserAccount> = {};
    for (const key in DEFAULT_AUTH_USERS) {
      const u = DEFAULT_AUTH_USERS[key];
      initialUsers[key] = {
        username: u.username,
        passwordHash: hashPassword(u.plainPass),
        wilayah: u.wilayah,
        nama: u.nama
      };
    }
    const initialData: DatabaseSchema = {
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

function saveLocalDB(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.warn("saveLocalDB failed (read-only filesystem on Vercel).");
  }
}

// ===============================================
// DATABASE SERVICES (POLISHED AND SECURE)
// ===============================================

export async function fetchPetugasList(): Promise<Petugas[]> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("master_petugas").select("*");
      if (!error && data) return data as Petugas[];
      console.warn("Supabase fetchPetugasList error, falling back:", error);
    } catch (e) {
      console.error("Supabase error, falling back locally:", e);
    }
  }
  const db = getLocalDB();
  return db.petugas || [];
}

export async function savePetugas(petugasData: Petugas): Promise<boolean> {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("master_petugas").upsert({
        nip: petugasData.nip,
        nama: petugasData.nama,
        jabatan: petugasData.jabatan,
        wilayah: petugasData.wilayah || "Semua Wilayah"
      }, { onConflict: "nip" });
      if (!error) {
        console.log("Supabase savePetugas succeeded.");
        return true;
      }
      console.warn("Supabase savePetugas failed, falling back locally:", error);
    } catch (e) {
      console.error("Supabase savePetugas error:", e);
    }
  }
  try {
    const db = getLocalDB();
    const existingIndex = db.petugas.findIndex(p => p.nip === petugasData.nip);
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

export async function deletePetugas(nip: string): Promise<boolean> {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from("master_petugas").delete().eq("nip", nip);
      if (!error) {
        console.log("Supabase deletePetugas succeeded.");
        return true;
      }
      console.warn("Supabase deletePetugas failed, falling back locally:", error);
    } catch (e) {
      console.error("Supabase deletePetugas error:", e);
    }
  }
  try {
    const db = getLocalDB();
    const originalLength = db.petugas.length;
    db.petugas = db.petugas.filter(p => p.nip !== nip);
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

export async function fetchPlaces(): Promise<Tempat[]> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("master_tempat").select("*");
      if (!error && data) {
        // Map Supabase column names if needed
        return data.map((d: any) => ({
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
        })) as Tempat[];
      }
      console.warn("Supabase fetchPlaces error, falling back:", error);
    } catch (e) {
      console.error("Supabase error, falling back locally:", e);
    }
  }
  const db = getLocalDB();
  return db.tempat;
}

export async function fetchLogInspeksi(wilayah?: string): Promise<LogInspeksi[]> {
  if (supabaseClient) {
    try {
      let query = supabaseClient.from("log_inspeksi").select("*");
      if (wilayah && wilayah !== "Semua") {
        query = query.eq("wilayah", wilayah);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
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
        })) as LogInspeksi[];
      }
      console.warn("Supabase fetchLogInspeksi error, falling back:", error);
    } catch (e) {
      console.error("Supabase error, falling back locally:", e);
    }
  }
  const db = getLocalDB();
  if (wilayah && wilayah !== "Semua") {
    return db.logs.filter(log => log.Wilayah === wilayah);
  }
  return db.logs;
}

export async function authVerifyUser(usernameInput: string, passwordInput: string): Promise<{ success: boolean; wilayah?: string; username?: string; nama?: string }> {
  const normUsername = usernameInput.toLowerCase().trim();
  const hash = hashPassword(passwordInput);

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("auth_users")
        .select("password_hash, wilayah, nama")
        .eq("username", normUsername)
        .single();
      if (!error && data) {
        if (data.password_hash === hash) {
          return { success: true, wilayah: data.wilayah, username: normUsername, nama: data.nama || normUsername };
        }
      }
    } catch (e) {
      console.error("Supabase user auth failed, falling back to local database:", e);
    }
  }

  // Fallback to local DB
  const db = getLocalDB();
  const user = db.users ? db.users[normUsername] : null;
  if (!user) return { success: false };

  if (user.passwordHash === hash) {
    return { success: true, wilayah: user.wilayah, username: normUsername, nama: user.nama || normUsername };
  }
  return { success: false };
}

// Get user profile data (join auth_users with master_petugas by wilayah)
export async function getUserProfile(username: string): Promise<{
  username: string;
  nama: string;
  wilayah: string;
  nip: string;
  jabatan: string;
} | null> {
  const normUsername = username.toLowerCase().trim();
  let userNama = "";
  let userWilayah = "";

  // Get auth user info
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("auth_users")
        .select("wilayah, nama")
        .eq("username", normUsername)
        .single();
      if (!error && data) {
        userNama = data.nama || normUsername;
        userWilayah = data.wilayah;
      }
    } catch (e) {
      console.error("Supabase getUserProfile auth_users error:", e);
    }
  }

  if (!userWilayah) {
    const db = getLocalDB();
    const user = db.users ? db.users[normUsername] : null;
    if (!user) return null;
    userNama = user.nama || normUsername;
    userWilayah = user.wilayah;
  }

  // Find matching petugas by wilayah for NIP and jabatan
  let nip = "-";
  let jabatan = "-";

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("master_petugas")
        .select("nip, jabatan")
        .eq("wilayah", userWilayah)
        .limit(1);
      if (!error && data && data.length > 0) {
        nip = data[0].nip;
        jabatan = data[0].jabatan;
      }
    } catch (e) {
      console.error("Supabase getUserProfile petugas error:", e);
    }
  }

  if (nip === "-") {
    const db = getLocalDB();
    const petugas = db.petugas.find((p: Petugas) => p.wilayah === userWilayah);
    if (petugas) {
      nip = petugas.nip;
      jabatan = petugas.jabatan;
    }
  }

  return {
    username: normUsername,
    nama: userNama,
    wilayah: userWilayah,
    nip,
    jabatan
  };
}

// Change own password (self-service)
export async function changeOwnPassword(username: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const normUsername = username.toLowerCase().trim();

  // 1. Verify old password first
  const authResult = await authVerifyUser(normUsername, oldPassword);
  if (!authResult.success) {
    return { success: false, message: "Password saat ini tidak cocok. Periksa kembali." };
  }

  // 2. Validate new password complexity
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return { success: false, message: "Password baru tidak memenuhi kriteria: minimal 8 karakter, 1 huruf besar, 1 huruf kecil, dan 1 karakter khusus." };
  }

  // 3. Ensure new password is different from old
  if (oldPassword === newPassword) {
    return { success: false, message: "Password baru tidak boleh sama dengan password saat ini." };
  }

  const hashedPass = hashPassword(newPassword);

  // 4. Update in Supabase
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from("auth_users")
        .update({ password_hash: hashedPass })
        .eq("username", normUsername);
      if (error) {
        console.warn("Supabase changeOwnPassword update failed:", error);
      }
    } catch (e) {
      console.error("Supabase changeOwnPassword error:", e);
    }
  }

  // 5. Update in local DB
  const db = getLocalDB();
  if (db.users && db.users[normUsername]) {
    db.users[normUsername].passwordHash = hashedPass;
  }

  // 6. Audit log
  if (!db.changeLogs) db.changeLogs = [];
  db.changeLogs.push({
    id: "CHG-" + Math.floor(1000 + Math.random() * 9000),
    timestamp: new Date().toISOString(),
    tipe: "UBAH",
    idTempat: "SYSTEM-AUTH",
    namaTempat: `Otorisasi User: ${normUsername}`,
    wilayah: authResult.wilayah || "",
    operator: normUsername,
    deskripsi: `User "${normUsername}" mengubah password sendiri.`
  });

  saveLocalDB(db);
  return { success: true, message: "Password berhasil diubah. Silakan login ulang dengan password baru Anda." };
}

export async function resetOfficerPassword(usernameTarget: string, newPasswordInput: string, operator: string): Promise<boolean> {
  const normUsername = usernameTarget.toLowerCase().trim();
  const db = getLocalDB();
  const hashedPass = hashPassword(newPasswordInput);

  // Backend complexity constraint (Min 8 chars, 1 upper, 1 lower, 1 symbol)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
  if (!passwordRegex.test(newPasswordInput)) {
    throw new Error("Password baru tidak memenuhi kriteria kompleksitas (Min 8 karakter, huruf besar & kecil, dan minimal 1 simbol).");
  }

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from("auth_users")
        .update({ password_hash: hashedPass })
        .eq("username", normUsername);
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

  const wilMapping: Record<string, string> = {
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
    id: "CHG-" + Math.floor(1000 + Math.random() * 9000),
    timestamp: new Date().toISOString(),
    tipe: "UBAH",
    idTempat: "SYSTEM-AUTH",
    namaTempat: `Otorisasi User: ${normUsername}`,
    wilayah: db.users[normUsername].wilayah,
    operator: operator,
    deskripsi: `Mereset password akun "${normUsername}" oleh Super Admin.`
  });

  saveLocalDB(db);
  return true;
}

export async function insertNewPlace(place: Tempat, operator: string = "Sistem"): Promise<string> {
  const newId = place.ID_Tempat || "SNT-" + Math.floor(1000 + Math.random() * 9000);
  const enrichedPlace: Tempat = { ...place, ID_Tempat: newId, Status_Aktif: place.Status_Aktif || "Aktif" };

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

  // Always write locally as source of truth / fallback
  const db = getLocalDB();
  db.tempat.push(enrichedPlace);

  if (!db.changeLogs) {
    db.changeLogs = [];
  }

  db.changeLogs.push({
    id: "CHG-" + Math.floor(1000 + Math.random() * 9000),
    timestamp: new Date().toISOString(),
    tipe: "TAMBAH",
    idTempat: newId,
    namaTempat: enrichedPlace.Nama_Tempat,
    wilayah: enrichedPlace.Wilayah,
    operator: operator,
    deskripsi: `Mendaftarkan tempat baru "${enrichedPlace.Nama_Tempat}" (${enrichedPlace.Kategori}) di Wilayah Kerja ${enrichedPlace.Wilayah}.`
  });

  saveLocalDB(db);

  return newId;
}

export async function updatePlace(id: string, updated: Tempat, operator: string = "Sistem"): Promise<boolean> {
  const db = getLocalDB();
  if (!db.changeLogs) {
    db.changeLogs = [];
  }
  
  const index = db.tempat.findIndex(t => t.ID_Tempat === id);
  if (index === -1) return false;
  
  const original = db.tempat[index];
  const changesDelta: string[] = [];
  
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
  
  const descLog = changesDelta.length > 0 
    ? `Mengubah data tempat: ${changesDelta.join(", ")}`
    : `Memperbarui info sarana tanpa merubah isian dasar`;
    
  db.tempat[index] = {
    ...original,
    ...updated,
    ID_Tempat: id
  };
  
  db.changeLogs.push({
    id: "CHG-" + Math.floor(1000 + Math.random() * 9000),
    timestamp: new Date().toISOString(),
    tipe: "UBAH",
    idTempat: id,
    namaTempat: updated.Nama_Tempat,
    wilayah: original.Wilayah,
    operator: operator,
    deskripsi: descLog
  });
  
  saveLocalDB(db);
  return true;
}

export async function deletePlace(id: string, operator: string): Promise<boolean> {
  const db = getLocalDB();
  if (!db.changeLogs) {
    db.changeLogs = [];
  }
  
  const index = db.tempat.findIndex(t => t.ID_Tempat === id);
  if (index === -1) return false;
  
  const place = db.tempat[index];
  
  if (operator !== "Tembilahan Induk") {
    throw new Error("Hanya admin dari induk Tembilahan yang berwenang meniadakan tempat");
  }
  
  db.tempat.splice(index, 1);
  
  db.changeLogs.push({
    id: "CHG-" + Math.floor(1000 + Math.random() * 9000),
    timestamp: new Date().toISOString(),
    tipe: "HAPUS",
    idTempat: id,
    namaTempat: place.Nama_Tempat,
    wilayah: place.Wilayah,
    operator: operator,
    deskripsi: `Mengahapus dan meniadakan sarana "${place.Nama_Tempat}" dari pengawasan Wilayah Kerja ${place.Wilayah}.`
  });
  
  saveLocalDB(db);
  return true;
}

export async function fetchChangeLogs(): Promise<LogPerubahan[]> {
  const db = getLocalDB();
  const logs = db.changeLogs || [];
  return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function insertInspectionLog(payload: LogInspeksi): Promise<void> {
  if (supabaseClient) {
    try {
      // 1. Log the inspection record
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
        // 2. Update the master place with the last status
        const colorStatus = payload.Kesimpulan_Sistem === "Memenuhi Syarat" ? "Hijau" : "Merah";
        const dateObj = new Date(payload.Timestamp);
        const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
        
        const { error: updateErr } = await supabaseClient
          .from("master_tempat")
          .update({
            "Status_Terakhir": colorStatus,
            "Tgl_Inspeksi": dateStr,
            "Total_Skor": payload.Total_Skor
          })
          .eq("ID_Tempat", payload.ID_Tempat);

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

  // Write to local JSON Database
  const db = getLocalDB();
  
  // Assign a unique numeric id to the payload for local DB if not already present
  if (payload.id === undefined) {
    const maxId = db.logs.reduce((max: number, l: any) => (l.id && l.id > max ? l.id : max), 0);
    payload.id = maxId + 1;
  }
  
  db.logs.push(payload);

  // Update corresponding place state locally
  const index = db.tempat.findIndex(t => t.ID_Tempat === payload.ID_Tempat);
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

export async function deleteInspectionLog(identifier: string): Promise<boolean> {
  // identifier can be a numeric id (from Supabase) or a Timestamp string
  const numericId = Number(identifier);
  const isId = !isNaN(numericId) && numericId > 0;

  if (supabaseClient) {
    try {
      // 1. Get the ID_Tempat of the log being deleted
      let getLogQuery;
      if (isId) {
        getLogQuery = supabaseClient.from("log_inspeksi").select("ID_Tempat").eq("id", numericId).single();
      } else {
        getLogQuery = supabaseClient.from("log_inspeksi").select("ID_Tempat").eq("Timestamp", identifier).single();
      }
      const { data: logData, error: logGetError } = await getLogQuery;
      let idTempat: string | null = null;
      if (!logGetError && logData) {
        idTempat = logData.ID_Tempat;
      }

      // 2. Perform the deletion
      let query;
      if (isId) {
        query = supabaseClient.from("log_inspeksi").delete().eq("id", numericId).select();
      } else {
        query = supabaseClient.from("log_inspeksi").delete().eq("Timestamp", identifier).select();
      }
      const { data, error } = await query;
      
      if (!error && data && data.length > 0) {
        console.log(`Supabase deleteInspectionLog succeeded. Deleted ${data.length} row(s).`);
        
        // 3. Recalculate place status if ID_Tempat is known
        if (idTempat) {
          const { data: remainingLogs, error: remainingErr } = await supabaseClient
            .from("log_inspeksi")
            .select("Kesimpulan_Sistem, Timestamp, Total_Skor")
            .eq("ID_Tempat", idTempat)
            .order("Timestamp", { ascending: false })
            .limit(1);

          if (!remainingErr) {
            if (remainingLogs && remainingLogs.length > 0) {
              const latestLog = remainingLogs[0];
              const colorStatus = latestLog.Kesimpulan_Sistem === "Memenuhi Syarat" ? "Hijau" : "Merah";
              const dateObj = new Date(latestLog.Timestamp);
              const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;

              await supabaseClient
                .from("master_tempat")
                .update({
                  "Status_Terakhir": colorStatus,
                  "Tgl_Inspeksi": dateStr,
                  "Total_Skor": latestLog.Total_Skor
                })
                .eq("ID_Tempat", idTempat);
            } else {
              // No remaining logs, revert to 'Belum'
              await supabaseClient
                .from("master_tempat")
                .update({
                  "Status_Terakhir": "Belum",
                  "Tgl_Inspeksi": "",
                  "Total_Skor": ""
                })
                .eq("ID_Tempat", idTempat);
            }
          }
        }
        return true;
      } else if (error) {
        console.warn("Supabase deleteInspectionLog error:", error);
      } else {
        console.warn("Supabase deleteInspectionLog: 0 rows matched.", { identifier, isId });
      }
    } catch (e) {
      console.error("Supabase error for log delete:", e);
    }
  }

  // Fallback to local DB
  const db = getLocalDB();
  const originalLength = db.logs.length;
  let deletedLog: any = null;

  if (isId) {
    deletedLog = db.logs.find((l: any) => l.id === numericId);
    db.logs = db.logs.filter((l: any) => l.id !== numericId);
  } else {
    deletedLog = db.logs.find((l: any) => l.Timestamp === identifier);
    db.logs = db.logs.filter((l: any) => l.Timestamp !== identifier);
  }

  if (db.logs.length < originalLength) {
    if (deletedLog) {
      const idTempat = deletedLog.ID_Tempat;
      // Find latest remaining log for this place in local DB
      const placeLogs = db.logs
        .filter((l: any) => l.ID_Tempat === idTempat)
        .sort((a: any, b: any) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());

      const index = db.tempat.findIndex((t: any) => t.ID_Tempat === idTempat);
      if (index !== -1) {
        if (placeLogs.length > 0) {
          const latestLog = placeLogs[0];
          const colorStatus = latestLog.Kesimpulan_Sistem === "Memenuhi Syarat" ? "Hijau" : "Merah";
          const dateObj = new Date(latestLog.Timestamp);
          const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;

          db.tempat[index].Status_Terakhir = colorStatus;
          db.tempat[index].Tgl_Inspeksi = dateStr;
          db.tempat[index].Total_Skor = latestLog.Total_Skor;
        } else {
          db.tempat[index].Status_Terakhir = "Belum";
          db.tempat[index].Tgl_Inspeksi = "";
          db.tempat[index].Total_Skor = "";
        }
      }
    }
    saveLocalDB(db);
    return true;
  }
  return false;
}
