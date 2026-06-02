import express from "express";
import crypto from "crypto";
import {
  fetchPetugasList,
  fetchPlaces,
  fetchLogInspeksi,
  authVerifyUser,
  insertNewPlace,
  insertInspectionLog,
  updatePlace,
  deletePlace,
  fetchChangeLogs,
  resetOfficerPassword,
  savePetugas,
  deletePetugas,
  deleteInspectionLog,
  getUserProfile,
  changeOwnPassword,
  fetchUserAccounts,
  insertNewUserAccount,
  updateUserAccountByAdmin,
  deleteUserAccount
} from "../server/db";
import { kriteria_A1A2, kriteria_TFU } from "../server/kriteria_data";
import { LogInspeksi, Tempat } from "../src/types";

// ==========================================
// EXPRESS APP — VERCEL SERVERLESS FUNCTION
// ==========================================
const app = express();

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Security Headers
app.use((req: any, res: any, next: any) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// CORS Middleware
app.use((req: any, res: any, next: any) => {
  const allowedOrigins = [
    'https://santuaribkktbh.web.id',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Simple rate limiting for auth endpoints
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // max 10 attempts per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

// HMAC-based self-verifying token (works across serverless instances)
const TOKEN_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "santuari_fallback_secret_2026";

function generateSignedToken(wilayah: string, username: string): string {
  const payload = JSON.stringify({
    wilayah,
    username,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

function verifySignedToken(token: string): { wilayah: string; username: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadB64).digest("base64url");
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// XSS Sanitizer
function sanitizeString(str: any): string {
  if (typeof str !== "string") return str || "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ status: "error", message: "Token otentikasi diperlukan." });
  }

  const session = verifySignedToken(token);
  if (!session) {
    return res.status(403).json({ status: "error", message: "Sesi tidak valid atau telah kedalwarsa." });
  }

  req.userWilayah = session.wilayah;
  req.userName = session.username || "";
  req.token = token;
  next();
}

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Get List of Officers
app.get("/api/petugas", async (req, res) => {
  try {
    const data = await fetchPetugasList();
    res.json({ status: "success", data });
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 1b. Add / Update Petugas
app.post("/api/petugas", authenticateToken, async (req: any, res: any) => {
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
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 1c. Delete Petugas
app.delete("/api/petugas/:nip", authenticateToken, async (req: any, res: any) => {
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
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 2. Get Dashboard Places Data
app.get("/api/dashboard", async (req, res) => {
  try {
    const places = await fetchPlaces();
    res.json({ status: "success", data: places });
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 3. Verify Username and Password
app.post("/api/auth/verify", async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(typeof clientIp === 'string' ? clientIp : clientIp[0])) {
      return res.status(429).json({ 
        status: "error", 
        message: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit." 
      });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ status: "error", message: "Username dan Password wajib diisi." });
    }

    const result = await authVerifyUser(username, password);

    if (result.success && result.wilayah) {
      const token = generateSignedToken(result.wilayah, result.username || username);

      res.json({
        status: "success",
        message: "Akses Diberikan",
        token,
        wilayah: result.wilayah,
        username: result.username || username,
        nama: result.nama || username
      });
    } else {
      res.status(401).json({ status: "error", message: "Kredensial Tidak Valid." });
    }
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 3b. Get User Profile
app.get("/api/profile", authenticateToken, async (req: any, res) => {
  try {
    const profile = await getUserProfile(req.userName);
    if (profile) {
      res.json({ status: "success", data: profile });
    } else {
      res.status(404).json({ status: "error", message: "Profil user tidak ditemukan." });
    }
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 3c. Change Own Password
app.post("/api/profile/change-password", authenticateToken, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: "error", message: "Password saat ini dan password baru wajib diisi." });
    }
    const result = await changeOwnPassword(req.userName, currentPassword, newPassword);
    if (result.success) {
      res.json({ status: "success", message: result.message });
    } else {
      res.status(400).json({ status: "error", message: result.message });
    }
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 4. Get Inspection Kriteria
app.get("/api/kriteria", (req, res) => {
  try {
    const { jenis } = req.query;
    const typeStr = (jenis || "").toString().trim();
    const data = typeStr.startsWith("TPP") ? kriteria_A1A2 : kriteria_TFU;
    res.json({ status: "success", data });
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 5. Get List of Registered Places
app.get("/api/places/list", async (req, res) => {
  try {
    const { wilayah } = req.query;
    const wStr = (wilayah || "").toString().trim();
    const allPlaces = await fetchPlaces();

    const filtered = wStr && wStr !== "Semua"
      ? allPlaces.filter(p => p.Wilayah === wStr)
      : allPlaces;

    res.json({ status: "success", data: filtered });
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 6. Get Historical Inspection Logs
app.get("/api/rekap", async (req, res) => {
  try {
    const { wilayah } = req.query;
    const logs = await fetchLogInspeksi(wilayah ? (wilayah as string) : undefined);

    const bulanIndo = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const processedLogs = logs.map(log => {
      const dObj = new Date(log.Timestamp);
      const dateStr = !isNaN(dObj.getTime())
        ? `${String(dObj.getDate()).padStart(2, "0")}/${String(dObj.getMonth() + 1).padStart(2, "0")}/${dObj.getFullYear()} ${String(dObj.getHours()).padStart(2, "0")}:${String(dObj.getMinutes()).padStart(2, "0")}`
        : "Tgl tidak valid";
      const bulan = !isNaN(dObj.getTime())
        ? bulanIndo[dObj.getMonth()] + " " + dObj.getFullYear()
        : "Lainnya";

      return {
        ...log,
        Timestamp: dateStr,
        Bulan_Kegiatan: bulan
      };
    });

    processedLogs.sort((a, b) => {
      const parseDate = (str: string) => {
        const parts = str.split(" ");
        if (parts.length < 2) return 0;
        const [d, m, y] = parts[0].split("/").map(Number);
        const [hr, min] = parts[1].split(":").map(Number);
        return new Date(y, m - 1, d, hr, min).getTime();
      };
      return parseDate(b.Timestamp) - parseDate(a.Timestamp);
    });

    res.json({ status: "success", data: processedLogs });
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 3b. Reset Password (Super Admin only)
app.post("/api/auth/reset-pin", authenticateToken, async (req: any, res) => {
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
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 3d. Manage User Accounts (Super Admin only)
app.get("/api/users", authenticateToken, async (req: any, res) => {
  try {
    if (req.userWilayah !== "Super Admin") {
      return res.status(403).json({ status: "error", message: "Akses ditolak: Khusus Super Admin." });
    }
    const data = await fetchUserAccounts();
    res.json({ status: "success", data });
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

app.post("/api/users", authenticateToken, async (req: any, res) => {
  try {
    if (req.userWilayah !== "Super Admin") {
      return res.status(403).json({ status: "error", message: "Akses ditolak: Khusus Super Admin." });
    }
    const { username, password, wilayah, nama } = req.body;
    if (!username || !password || !wilayah || !nama) {
      return res.status(400).json({ status: "error", message: "Username, Password, Wilayah, dan Nama wajib diisi." });
    }
    const result = await insertNewUserAccount(username, password, wilayah, nama, req.userName);
    if (result.success) {
      res.json({ status: "success", message: result.message });
    } else {
      res.status(400).json({ status: "error", message: result.message });
    }
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

app.put("/api/users/:username", authenticateToken, async (req: any, res) => {
  try {
    if (req.userWilayah !== "Super Admin") {
      return res.status(403).json({ status: "error", message: "Akses ditolak: Khusus Super Admin." });
    }
    const { username } = req.params;
    const { nama, wilayah } = req.body;
    let { newUsername } = req.body;
    
    // Jika frontend versi lama (ter-cache) yang mengirimkan request, newUsername akan kosong.
    // Kita otomatis menggunakan username lama agar tidak error.
    if (!newUsername) {
      newUsername = username;
    }

    if (!nama || !wilayah) {
      return res.status(400).json({ status: "error", message: "Username, Nama, dan Wilayah wajib diisi." });
    }
    const result = await updateUserAccountByAdmin(username, newUsername, nama, wilayah, req.userName);
    if (result.success) {
      res.json({ status: "success", message: result.message });
    } else {
      res.status(400).json({ status: "error", message: result.message });
    }
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

app.delete("/api/users/:username", authenticateToken, async (req: any, res) => {
  try {
    if (req.userWilayah !== "Super Admin") {
      return res.status(403).json({ status: "error", message: "Akses ditolak: Khusus Super Admin." });
    }
    const { username } = req.params;
    const result = await deleteUserAccount(username, req.userName);
    if (result.success) {
      res.json({ status: "success", message: result.message });
    } else {
      res.status(400).json({ status: "error", message: result.message });
    }
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 7. Register New Tempat
app.post("/api/tempat", authenticateToken, async (req: any, res) => {
  try {
    const payload = req.body;
    if (!payload.nama || !payload.wilayah || !payload.koordinat) {
      return res.status(400).json({ status: "error", message: "Nama, Wilayah, and Koordinat are required." });
    }

    const sanitizedNama = sanitizeString(payload.nama);
    const sanitizedAlamat = sanitizeString(payload.alamat);
    const sanitizedPj = sanitizeString(payload.penanggung_jawab);

    const idBaru = "SNT-" + Math.floor(1000 + Math.random() * 9000);
    const newPlace: Tempat = {
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
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 7a. Update Existing Tempat
app.post("/api/tempat/update", authenticateToken, async (req: any, res) => {
  try {
    const payload = req.body;
    if (!payload.id) {
      return res.status(400).json({ status: "error", message: "ID Tempat is required for updating." });
    }

    const sanitizedNama = sanitizeString(payload.nama);
    const sanitizedAlamat = sanitizeString(payload.alamat);
    const sanitizedPj = sanitizeString(payload.penanggung_jawab);

    const updatedPlace: Tempat = {
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
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 7b. Delete Inactive Tempat
app.post("/api/tempat/delete", authenticateToken, async (req: any, res) => {
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
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 7c. Get Change Logs Audit Trail
app.get("/api/changelogs", authenticateToken, async (req, res) => {
  try {
    const data = await fetchChangeLogs();
    res.json({ status: "success", data });
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// 8. Save Inspection Result
app.post("/api/inspeksi", authenticateToken, async (req: any, res) => {
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

    const inspection: LogInspeksi = {
      Timestamp: new Date().toISOString(),
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
      Detail_Jawaban: typeof payload.detailJawaban === "string"
        ? payload.detailJawaban
        : JSON.stringify(payload.detailJawaban),
      Nama_Pemeriksa: sanitizedPemeriksaNama,
      NIP_Pemeriksa: sanitizedPemeriksaNip || "-",
      Jabatan_Pemeriksa: sanitizedPemeriksaJabatan || "-",
      TTD_Digital: payload.ttdBase64 || "",
      TTD_Pemilik: payload.ttdPemilikBase64 || "",
      Foto_Dokumentasi: payload.fotoDokumentasiBase64 || ""
    };

    await insertInspectionLog(inspection);
    res.json({ status: "success" });
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// Delete inspection log (by Supabase id or Timestamp)
app.delete("/api/inspeksi/:identifier", authenticateToken, async (req: any, res) => {
  try {
    const identifier = decodeURIComponent(req.params.identifier);
    console.log("DELETE /api/inspeksi called with identifier:", identifier);
    const success = await deleteInspectionLog(identifier);
    if (success) {
      res.json({ status: "success" });
    } else {
      res.status(404).json({ status: "error", message: "Data tidak ditemukan di database." });
    }
  } catch (err: any) {
    console.error("DELETE /api/inspeksi error:", err);
    res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
  }
});

// ==========================================
// EXPORT FOR VERCEL
// ==========================================
// Centralized Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ status: "error", message: "Terjadi kesalahan internal server." });
});

export default app;
