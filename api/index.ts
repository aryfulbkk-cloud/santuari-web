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
  deletePetugas
} from "../server/db";
import { kriteria_A1A2, kriteria_TFU } from "../server/kriteria_data";
import { LogInspeksi, Tempat } from "../src/types";

// ==========================================
// EXPRESS APP — VERCEL SERVERLESS FUNCTION
// ==========================================
const app = express();

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// In-memory token storage (per-instance on Vercel)
const ACTIVE_TOKENS = new Map<string, { wilayah: string; expires: number }>();

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

  const session = ACTIVE_TOKENS.get(token);
  if (!session) {
    return res.status(403).json({ status: "error", message: "Sesi tidak valid atau telah kedalwarsa." });
  }

  if (Date.now() > session.expires) {
    ACTIVE_TOKENS.delete(token);
    return res.status(403).json({ status: "error", message: "Sesi Anda telah kedaluwarsa. Silakan login kembali." });
  }

  session.expires = Date.now() + 3 * 60 * 60 * 1000;
  req.userWilayah = session.wilayah;
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
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
  }
});

// 2. Get Dashboard Places Data
app.get("/api/dashboard", async (req, res) => {
  try {
    const places = await fetchPlaces();
    res.json({ status: "success", data: places });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.toString() });
  }
});

// 3. Verify Username and Password
app.post("/api/auth/verify", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ status: "error", message: "Username dan Password wajib diisi." });
    }

    const result = await authVerifyUser(username, password);

    if (result.success && result.wilayah) {
      const token = crypto.randomBytes(16).toString("hex");

      ACTIVE_TOKENS.set(token, {
        wilayah: result.wilayah,
        expires: Date.now() + 3 * 60 * 60 * 1000
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
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
  }
});

// 7c. Get Change Logs Audit Trail
app.get("/api/changelogs", authenticateToken, async (req, res) => {
  try {
    const data = await fetchChangeLogs();
    res.json({ status: "success", data });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.toString() });
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
    res.status(500).json({ status: "error", message: err.toString() });
  }
});

// ==========================================
// EXPORT FOR VERCEL
// ==========================================
export default app;
