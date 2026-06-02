import React, { useState, useEffect } from "react";
import { User, KeyRound, MapPin, BadgeCheck, Eye, EyeOff, ShieldCheck, Loader2, CheckCircle2, XCircle, Info } from "lucide-react";

interface UserProfileProps {
  username: string;
  userNama: string;
  currentWilayah: string;
}

interface ProfileData {
  username: string;
  nama: string;
  wilayah: string;
  nip: string;
  jabatan: string;
}

export default function UserProfile({ username, userNama, currentWilayah }: UserProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changing, setChanging] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const allValid = hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar && passwordsMatch;

  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasSpecialChar].filter(Boolean).length;
  const strengthLabel = strengthScore <= 1 ? "Lemah" : strengthScore <= 2 ? "Sedang" : strengthScore <= 3 ? "Baik" : "Kuat";
  const strengthColor = strengthScore <= 1 ? "bg-red-500" : strengthScore <= 2 ? "bg-amber-500" : strengthScore <= 3 ? "bg-sky-500" : "bg-emerald-500";
  const strengthTextColor = strengthScore <= 1 ? "text-red-600" : strengthScore <= 2 ? "text-amber-600" : strengthScore <= 3 ? "text-sky-600" : "text-emerald-600";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch("/api/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setProfile(data.data);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!currentPassword) {
      setErrorMsg("Password saat ini wajib diisi.");
      return;
    }
    if (!allValid) {
      setErrorMsg("Pastikan semua syarat password terpenuhi.");
      return;
    }

    setChanging(true);
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccessMsg(data.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(data.message || "Gagal mengubah password.");
      }
    } catch (err) {
      setErrorMsg("Terjadi gangguan koneksi ke server.");
    } finally {
      setChanging(false);
    }
  };

  const initials = (profile?.nama || userNama || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const wilayahColors: Record<string, string> = {
    "Super Admin": "from-amber-500 to-orange-600",
    "Tembilahan Induk": "from-sky-500 to-blue-600",
    "Kuala Gaung": "from-teal-500 to-cyan-600",
    "Sungai Guntung": "from-emerald-500 to-green-600",
    "Kuala Enok": "from-violet-500 to-purple-600",
    "Pulau Kijang": "from-rose-500 to-pink-600",
    "Rengat": "from-indigo-500 to-blue-700"
  };

  const gradientClass = wilayahColors[profile?.wilayah || currentWilayah] || "from-sky-500 to-blue-600";

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Profil Saya</h2>
          <p className="text-[11px] text-gray-400 font-medium">Informasi akun dan keamanan password</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Gradient Banner */}
        <div className={`h-28 bg-gradient-to-r ${gradientClass} relative`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-60" />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-white"
            style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
            <span className={`bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent`}>{initials}</span>
          </div>

          {loadingProfile ? (
            <div className="mt-4 flex items-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Memuat data profil...</span>
            </div>
          ) : profile ? (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{profile.nama}</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">@{profile.username}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* NIP */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-sky-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">NIP</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 font-mono">{profile.nip}</p>
                </div>

                {/* Jabatan */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jabatan</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{profile.jabatan}</p>
                </div>

                {/* Wilayah */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 sm:col-span-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wilayah Kerja</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-br ${gradientClass}`} />
                    <p className="text-sm font-semibold text-gray-700">{profile.wilayah}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">Tidak dapat memuat data profil.</p>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Ubah Password</h3>
            <p className="text-[10px] text-gray-400 font-medium">Pastikan password baru Anda kuat dan mudah diingat</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Password Saat Ini</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                placeholder="Masukkan password saat ini"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Password Baru</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                placeholder="Masukkan password baru"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength indicator */}
            {newPassword.length > 0 && (
              <div className="mt-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${strengthColor}`} style={{ width: `${strengthScore * 25}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold ${strengthTextColor}`}>{strengthLabel}</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { ok: hasMinLength, label: "Minimal 8 karakter" },
                    { ok: hasUpperCase, label: "1 huruf besar (A-Z)" },
                    { ok: hasLowerCase, label: "1 huruf kecil (a-z)" },
                    { ok: hasSpecialChar, label: "1 karakter khusus (!@#$)" }
                  ].map((rule, i) => (
                    <div key={i} className={`flex items-center gap-1.5 text-[10px] font-medium ${rule.ok ? "text-emerald-600" : "text-gray-400"}`}>
                      {rule.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Konfirmasi Password Baru</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all ${
                  confirmPassword.length > 0
                    ? passwordsMatch ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100" : "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-sky-400 focus:ring-sky-100"
                }`}
                placeholder="Ketik ulang password baru"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-[10px] text-red-500 font-medium mt-1">Password tidak cocok.</p>
            )}
          </div>

          {/* Feedback Messages */}
          {successMsg && (
            <div className="flex items-start gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium p-3 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-xs font-medium p-3 rounded-xl border border-red-200">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={changing || !allValid || !currentPassword}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              allValid && currentPassword && !changing
                ? "bg-sky-600 hover:bg-sky-700 text-white shadow-sm hover:shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {changing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Simpan Password Baru</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-300" />
          <span>Setelah password berhasil diubah, Anda akan diminta login ulang menggunakan password baru. Perubahan password tercatat di log audit keamanan sistem.</span>
        </div>
      </div>
    </div>
  );
}
