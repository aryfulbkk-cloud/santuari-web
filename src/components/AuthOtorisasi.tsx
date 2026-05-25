import React, { useState } from "react";
import { ShieldAlert, LogIn, X, Loader2 } from "lucide-react";

interface AuthOtorisasiProps {
  onLoginSuccess: (wilayah: string, token: string) => void;
  onCancel: () => void;
}

export default function AuthOtorisasi({ onLoginSuccess, onCancel }: AuthOtorisasiProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorText("Username wajib diisi.");
      return;
    }
    if (!password) {
      setErrorText("Password wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorText("");

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const res = await response.json();
      if (res.status === "success") {
        onLoginSuccess(res.wilayah, res.token);
      } else {
        setErrorText(res.message || "Kredensial yang dimasukkan salah!");
      }
    } catch (err) {
      setErrorText("Terjadi gangguan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg w-full max-w-sm p-6 shadow-xl border border-gray-200 relative animate-in zoom-in-95 duration-150"
        id="modalLogin"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-sky-50 p-2.5 rounded-lg mb-4">
            <ShieldAlert className="w-8 h-8 text-sky-600" />
          </div>
          <h3 className="font-bold text-base text-gray-800 mb-1">Otorisasi Petugas</h3>
          <p className="text-xs text-gray-400 mb-6">
            Masukkan Username dan Password petugas resmi.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full text-xs bg-white border border-gray-250 focus:border-sky-500 rounded-lg px-3.5 py-2.5 outline-none font-semibold text-slate-700"
              id="usernameInput"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full text-xs bg-white border border-gray-250 focus:border-sky-500 rounded-lg px-3.5 py-2.5 outline-none font-semibold text-slate-700"
              id="passwordInput"
              required
            />
          </div>

          {errorText && (
            <div className="text-xs text-red-650 font-medium bg-red-50 border border-red-100 rounded-lg p-3 text-center">
              {errorText}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sedang Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Buka Akses Sistem</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg py-2 text-xs"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
