import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, CheckCircle2, AlertTriangle, Loader2, UserPlus, Edit2, Trash2, Shield, MapPin, X, UserCheck, Eye, EyeOff } from "lucide-react";

interface UserAccountData {
  username: string;
  nama: string;
  wilayah: string;
}

export default function SuperAdminAccounts() {
  const [users, setUsers] = useState<UserAccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals / forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // New user form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newNama, setNewNama] = useState("");
  const [newWilayah, setNewWilayah] = useState("Tembilahan Induk");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit user state
  const [selectedUser, setSelectedUser] = useState<UserAccountData | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editNama, setEditNama] = useState("");
  const [editWilayah, setEditWilayah] = useState("");

  // Reset password state
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [showResetPass, setShowResetPass] = useState(false);
  const [showResetConfirmPass, setShowResetConfirmPass] = useState(false);

  const wilayahList = [
    "Super Admin",
    "Tembilahan Induk",
    "Kuala Gaung",
    "Sungai Guntung",
    "Kuala Enok",
    "Pulau Kijang",
    "Rengat"
  ];

  // Password validation for creation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(newPassword);
  const isCreatePasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar;

  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasSpecialChar].filter(Boolean).length;
  const strengthLabel = strengthScore <= 1 ? "Lemah" : strengthScore <= 2 ? "Sedang" : strengthScore <= 3 ? "Baik" : "Kuat";
  const strengthColor = strengthScore <= 1 ? "bg-rose-500" : strengthScore <= 2 ? "bg-amber-500" : strengthScore <= 3 ? "bg-sky-500" : "bg-emerald-500";
  const strengthTextColor = strengthScore <= 1 ? "text-rose-600" : strengthScore <= 2 ? "text-amber-600" : strengthScore <= 3 ? "text-sky-600" : "text-emerald-600";

  // Password validation for reset
  const hasMinLengthReset = resetPasswordVal.length >= 8;
  const hasUpperCaseReset = /[A-Z]/.test(resetPasswordVal);
  const hasLowerCaseReset = /[a-z]/.test(resetPasswordVal);
  const hasSpecialCharReset = /[^a-zA-Z0-9]/.test(resetPasswordVal);
  const isResetPasswordValid = hasMinLengthReset && hasUpperCaseReset && hasLowerCaseReset && hasSpecialCharReset && resetPasswordVal === confirmResetPassword;

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch("/api/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setUsers(data.data);
      } else {
        setErrorMsg(data.message || "Gagal mengambil data akun.");
      }
    } catch (err) {
      setErrorMsg("Koneksi gagal. Tidak dapat memuat akun pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isCreatePasswordValid) {
      setErrorMsg("Password baru tidak memenuhi persyaratan keamanan.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          wilayah: newWilayah,
          nama: newNama.trim()
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccessMsg(data.message);
        setShowAddForm(false);
        setNewUsername("");
        setNewPassword("");
        setNewNama("");
        setNewWilayah("Tembilahan Induk");
        fetchUsers();
      } else {
        setErrorMsg(data.message || "Gagal membuat akun baru.");
      }
    } catch (err) {
      setErrorMsg("Terjadi gangguan jaringan saat membuat akun.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg("");
    setSuccessMsg("");

    setLoading(true);
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch(`/api/users/${selectedUser.username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          newUsername: editUsername.trim(),
          nama: editNama.trim(),
          wilayah: editWilayah
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccessMsg(data.message);
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setErrorMsg(data.message || "Gagal memperbarui akun.");
      }
    } catch (err) {
      setErrorMsg("Terjadi gangguan jaringan saat memperbarui akun.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg("");
    setSuccessMsg("");

    if (!isResetPasswordValid) {
      setErrorMsg("Password baru tidak valid atau konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch("/api/auth/reset-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUsername: selectedUser.username,
          newPassword: resetPasswordVal
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccessMsg(data.message);
        setShowResetModal(false);
        setSelectedUser(null);
        setResetPasswordVal("");
        setConfirmResetPassword("");
      } else {
        setErrorMsg(data.message || "Gagal mereset password.");
      }
    } catch (err) {
      setErrorMsg("Terjadi gangguan jaringan saat mereset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun "@${username}"? Akses login petugas ini akan langsung dicabut.`)) {
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");

    setLoading(true);
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch(`/api/users/${username}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccessMsg(data.message);
        fetchUsers();
      } else {
        setErrorMsg(data.message || "Gagal menghapus akun.");
      }
    } catch (err) {
      setErrorMsg("Terjadi gangguan jaringan saat menghapus akun.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: UserAccountData) => {
    setSelectedUser(user);
    setEditUsername(user.username);
    setEditNama(user.nama);
    setEditWilayah(user.wilayah);
    setShowEditModal(true);
  };

  const openResetModal = (user: UserAccountData) => {
    setSelectedUser(user);
    setResetPasswordVal("");
    setConfirmResetPassword("");
    setShowResetModal(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-sky-600" />
            Manajemen Akun Login Petugas
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Super Admin dapat membuat akun baru, merename profil petugas, memindahkan wilayah kerja, dan mereset kata sandi.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-md shadow-sky-200"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showAddForm ? "Batal Tambah" : "Tambah Akun Login"}
        </button>
      </div>

      {/* Action Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-255 rounded-xl flex items-center gap-3 text-rose-700 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-255 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </div>
      )}

      {/* Add User Account Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-850 mb-5 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-600" />
            Registrasi Akun Baru
          </h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Username Login</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: budisantoso (tanpa spasi)"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap Petugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.ST"
                  value={newNama}
                  onChange={e => setNewNama(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Wilayah Kerja</label>
                <select
                  value={newWilayah}
                  onChange={e => setNewWilayah(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-700"
                >
                  {wilayahList.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password Akses</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan password kuat"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-700 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password validation indicators */}
            {newPassword.length > 0 && (
              <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${strengthScore * 25}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold ${strengthTextColor}`}>{strengthLabel}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { ok: hasMinLength, label: "Minimal 8 karakter" },
                    { ok: hasUpperCase, label: "1 huruf besar (A-Z)" },
                    { ok: hasLowerCase, label: "1 huruf kecil (a-z)" },
                    { ok: hasSpecialChar, label: "1 simbol khusus (!@#$)" }
                  ].map((rule, i) => (
                    <div key={i} className={`flex items-center gap-1.5 text-[10px] font-semibold ${rule.ok ? "text-emerald-600" : "text-gray-400"}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${rule.ok ? "text-emerald-500 fill-emerald-100" : "text-gray-300"}`} />
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !isCreatePasswordValid || !newUsername || !newNama}
                className={`px-6 py-2.5 text-xs rounded-xl font-bold transition-all flex items-center gap-2 ${
                  isCreatePasswordValid && newUsername && newNama && !loading
                    ? "bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Simpan Akun Baru</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Accounts List Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 text-xs uppercase font-extrabold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Lengkap & Username</th>
                <th className="px-6 py-4">Wilayah Kerja</th>
                <th className="px-6 py-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.username} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      {u.username === "superadmin" && <Shield className="w-3.5 h-3.5 text-amber-500" />}
                      <span>{u.nama || "Belum ada nama"}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">@{u.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      u.wilayah === "Super Admin"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-sky-50 text-sky-700 border border-sky-100"
                    }`}>
                      <MapPin className="w-3 h-3 shrink-0" />
                      {u.wilayah}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sky-600 hover:bg-sky-50 rounded-lg text-xs font-bold border border-sky-100 bg-white transition-all"
                        title="Edit Profil & Wilayah"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => openResetModal(u)}
                        className="flex items-center gap-1 px-3 py-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-bold border border-amber-100 bg-white transition-all"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Sandi</span>
                      </button>
                      {u.username !== "superadmin" && (
                        <button
                          onClick={() => handleDeleteUser(u.username)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-100 bg-white transition-colors"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    Memuat data akun petugas...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal (Rename Profile & Change Region) */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-slate-800 text-base mb-1">Edit Profil Akun</h3>
            <p className="text-xs text-slate-400 mb-5">Mengubah username, nama petugas, dan penempatan wilayah kerja untuk akun @{selectedUser.username}</p>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Rename Username</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  disabled={selectedUser.username === "superadmin"}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-700 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Rename Nama Petugas</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={e => setEditNama(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Wilayah Kerja</label>
                <select
                  value={editWilayah}
                  onChange={e => setEditWilayah(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-700"
                  disabled={selectedUser.username === "superadmin"}
                >
                  {wilayahList.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                {selectedUser.username === "superadmin" && (
                  <p className="text-[10px] text-amber-600 font-medium">Wilayah kerja superadmin utama terkunci.</p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading || !editNama}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs shadow-md shadow-sky-100"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl py-2.5 text-xs transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setShowResetModal(false);
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-slate-800 text-base mb-1">Reset Password Petugas</h3>
            <p className="text-xs text-slate-400 mb-5">Menyetel ulang password masuk untuk akun @{selectedUser.username} ({selectedUser.nama})</p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password Baru</label>
                <div className="relative">
                  <input
                    type={showResetPass ? "text" : "password"}
                    required
                    placeholder="Masukkan password baru"
                    value={resetPasswordVal}
                    onChange={e => setResetPasswordVal(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-700 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPass(!showResetPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655"
                  >
                    {showResetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Ulangi Password Baru</label>
                <div className="relative">
                  <input
                    type={showResetConfirmPass ? "text" : "password"}
                    required
                    placeholder="Konfirmasi password baru"
                    value={confirmResetPassword}
                    onChange={e => setConfirmResetPassword(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-700 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPass(!showResetConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655"
                  >
                    {showResetConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password validation indicators for reset */}
              {resetPasswordVal.length > 0 && (
                <div className="mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { ok: hasMinLengthReset, label: "Minimal 8 karakter" },
                      { ok: hasUpperCaseReset, label: "1 huruf besar (A-Z)" },
                      { ok: hasLowerCaseReset, label: "1 huruf kecil (a-z)" },
                      { ok: hasSpecialCharReset, label: "1 simbol khusus (!@#$)" },
                      { ok: resetPasswordVal === confirmResetPassword && confirmResetPassword.length > 0, label: "Konfirmasi cocok" }
                    ].map((rule, i) => (
                      <div key={i} className={`flex items-center gap-1.5 text-[9px] font-semibold ${rule.ok ? "text-emerald-600" : "text-gray-400"}`}>
                        <CheckCircle2 className={`w-3 h-3 ${rule.ok ? "text-emerald-500 fill-emerald-100" : "text-gray-300"}`} />
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading || !isResetPasswordValid}
                  className={`w-full font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all text-xs shadow-md ${
                    isResetPasswordValid && !loading
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Setel Ulang Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl py-2.5 text-xs transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
