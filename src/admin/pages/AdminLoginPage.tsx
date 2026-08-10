import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import { clearTokens } from "@/api/client";
import { ApiError } from "@/types/api";
import { useAdminAuth } from "../AdminAuthContext";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAdminAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("loading");
    setError("");
    try {
      const user = await login({ username: String(fd.get("username")), password: String(fd.get("password")) });
      if (user.role !== "admin") {
        clearTokens();
        setStatus("error");
        setError("Bu hisobda administrator huquqi yo'q.");
        return;
      }
      await refresh();
      navigate("/admin");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Kirishda xatolik yuz berdi.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-100">
      <div className="w-full max-w-md bg-background-50 rounded-xl border border-background-200 p-8 shadow-sm">
        <h1 className="font-heading text-2xl font-bold text-foreground-950 mb-1">Admin panel</h1>
        <p className="text-sm text-foreground-500 mb-6">FJSTI boshqaruv tizimiga kirish</p>

        {status === "error" && (
          <div className="mb-4 p-3 rounded-md bg-accent-50 border border-accent-200 text-sm text-accent-800">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-700 mb-1.5">Login</label>
            <input name="username" required autoFocus className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-700 mb-1.5">Parol</label>
            <input name="password" type="password" required className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <button type="submit" disabled={status === "loading"} className="w-full h-11 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60">
            {status === "loading" ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}
