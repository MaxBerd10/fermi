import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { login } from "@/api/auth";
import { ApiError } from "@/types/api";
import { Reveal } from "@/components/Animation";

const inputClass = "page-input focus:ring-2 focus:ring-[#0a1158]/15";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("loading");
    setError("");
    try {
      await login({ username: String(fd.get("username")), password: String(fd.get("password")) });
      navigate("/");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : t("auth.login.error"));
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10 bg-transparent">
      <Reveal className="w-full max-w-md">
        <div className="page-card p-6 shadow-[0_20px_50px_-24px_rgba(14,26,43,0.15)]">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
            <i className="ri-user-line w-6 h-6 flex items-center justify-center text-xl" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground-950 tracking-tight mb-1">
            {t("auth.login.title")}
          </h1>
          <p className="text-sm text-foreground-500 mb-6">{t("auth.login.subtitle")}</p>

          {status === "error" && (
            <div className="mb-4 p-3 rounded-xl bg-accent-50 border border-accent-200 text-sm text-accent-800">{error}</div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t("auth.usernameLabel")}</label>
              <input name="username" required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t("auth.passwordLabel")}</label>
              <input name="password" type="password" required className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60 transition-colors"
            >
              {status === "loading" ? t("auth.login.submitting") : t("auth.login.submit")}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/parolni-tiklash" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              {t("auth.forgotPassword")}
            </Link>
            <Link to="/royxatdan-otish" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              {t("auth.signUp")}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
