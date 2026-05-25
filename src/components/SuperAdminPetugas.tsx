import React, { useState, useEffect } from "react";
import { Users, UserPlus, Edit2, Trash2, Shield, MapPin, X, CheckCircle, AlertTriangle } from "lucide-react";
import { Petugas } from "../types";

export function SuperAdminPetugas() {
  const [officers, setOfficers] = useState<Petugas[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Petugas>({ nama: "", nip: "", jabatan: "", wilayah: "Semua Wilayah" });
  const [isEditing, setIsEditing] = useState(false);

  const wilayahList = [
    "Semua Wilayah",
    "Tembilahan Induk",
    "Kuala Gaung",
    "Sungai Guntung",
    "Kuala Enok",
    "Pulau Kijang",
    "Rengat"
  ];

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/petugas");
      const data = await res.json();
      if (data.status === "success") {
        setOfficers(data.data);
      }
    } catch (e) {
      setErrorMsg("Gagal memuat data petugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch("/api/petugas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok && data.status === "success") {
        setSuccessMsg(isEditing ? "Petugas berhasil diperbarui." : "Petugas baru berhasil ditambahkan.");
        setShowForm(false);
        fetchOfficers();
      } else {
        setErrorMsg(data.message || "Gagal menyimpan petugas");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (nip: string) => {
    if (!window.confirm("Yakin ingin menghapus petugas ini? Data yang terhapus tidak bisa dikembalikan.")) return;
    
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    
    try {
      const token = localStorage.getItem("santuari_token") || "";
      const res = await fetch(`/api/petugas/${nip}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok && data.status === "success") {
        setSuccessMsg("Petugas berhasil dihapus.");
        fetchOfficers();
      } else {
        setErrorMsg(data.message || "Gagal menghapus petugas");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setFormData({ nama: "", nip: "", jabatan: "", wilayah: "Semua Wilayah" });
    setIsEditing(false);
    setShowForm(true);
  };

  const openEditForm = (officer: Petugas) => {
    setFormData({ 
      nama: officer.nama, 
      nip: officer.nip, 
      jabatan: officer.jabatan, 
      wilayah: officer.wilayah || "Semua Wilayah" 
    });
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Manajemen Petugas (Wilker)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data petugas pemeriksa BKK dan atur wilayah kerja mereka.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-200"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Petugas
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              {isEditing ? "Edit Petugas" : "Tambah Petugas Baru"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  required
                  readOnly={isEditing}
                  value={formData.nip}
                  onChange={e => setFormData({ ...formData, nip: e.target.value })}
                  className={`w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all ${isEditing ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                  placeholder="Masukkan NIP"
                />
                {isEditing && <p className="text-[10px] text-slate-500">NIP tidak dapat diubah setelah dibuat.</p>}
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Nama Lengkap (beserta Gelar)</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="Contoh: Budi Santoso, S.ST"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Jabatan</label>
                <input
                  type="text"
                  required
                  value={formData.jabatan}
                  onChange={e => setFormData({ ...formData, jabatan: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="Contoh: Inspektur Kesling Muda"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Wilayah Kerja (Wilker)</label>
                <select
                  value={formData.wilayah}
                  onChange={e => setFormData({ ...formData, wilayah: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                >
                  {wilayahList.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">
                  Petugas "Semua Wilayah" dapat dipilih dari lokasi BKK manapun.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-200 disabled:opacity-70 flex items-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isEditing ? "Simpan Perubahan" : "Simpan Petugas"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 text-xs uppercase font-extrabold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama & NIP</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Wilayah Kerja</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {officers.map((officer, i) => (
                <tr key={officer.nip} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{officer.nama}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{officer.nip}</div>
                  </td>
                  <td className="px-6 py-4">{officer.jabatan}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      officer.wilayah && officer.wilayah !== "Semua Wilayah" 
                        ? "bg-sky-100 text-sky-700" 
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      <MapPin className="w-3 h-3" />
                      {officer.wilayah || "Semua Wilayah"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditForm(officer)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Petugas"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(officer.nip)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Petugas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {officers.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Belum ada data petugas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
