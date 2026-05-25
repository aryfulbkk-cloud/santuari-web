import React, { useState } from "react";
import { KeyRound, ShieldAlert, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function SuperAdminReset() {
  const [targetUsername, setTargetUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!targetUsername) {
      setErrorMessage("Harap pilih akun petugas yang ingin direset.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setErrorMessage("Password baru harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan minimal 1 simbol/karakter khusus.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi password baru tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("santuari_token") || "";
      const response = await fetch("/api/auth/reset-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ targetUsername, newPassword })
      });

      const res = await response.json();
      if (res.status === "success") {
        setSuccessMessage(`Sukses! Password untuk akun "${targetUsername}" berhasil direset.`);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(res.message || "Gagal mereset password.");
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan saat mereset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 border-l-4 border-l-amber-500 border border-slate-100 shadow-xl">
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100 mb-6">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Super Admin: Reset Password Petugas</h3>
            <p className="text-sm text-slate-500">
              Membantu mereset Password / Kata Sandi petugas wilayah kerja yang lupa password.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3 text-amber-800">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block font-bold mb-0.5">Pemberitahuan Keamanan</strong>
            Pastikan Anda telah memverifikasi identitas Petugas / PJ Wilayah Kerja yang bersangkutan sebelum melakukan reset password ini. Tindakan reset password akan dicatat secara permanen di log audit trail sistem.
          </div>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
              1. Pilih Akun Petugas Target
            </label>
            <select
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 outline-none shadow-sm cursor-pointer"
              required
            >
              <option value="">-- Pilih Akun Petugas --</option>
              <option value="superadmin">superadmin (Super Admin)</option>
              <option value="tembilahan">tembilahan (Tembilahan Induk)</option>
              <option value="kualagaung">kualagaung (Kuala Gaung)</option>
              <option value="sungaiguntung">sungaiguntung (Sungai Guntung)</option>
              <option value="kualaenok">kualaenok (Kuala Enok)</option>
              <option value="pulaukijang">pulaukijang (Pulau Kijang)</option>
              <option value="rengat">rengat (Rengat)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                2. Password Baru (Min. 8 Karakter, Huruf Besar, Kecil & Simbol)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kata sandi baru"
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 outline-none shadow-sm font-semibold text-slate-700"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                3. Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 outline-none shadow-sm font-semibold text-slate-700"
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2 text-red-700 text-xs items-center justify-center font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-55/15 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2 text-emerald-700 text-xs items-center justify-center font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs shadow-md shadow-amber-100/50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sedang Menyimpan Password Baru...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Simpan Password Baru</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
