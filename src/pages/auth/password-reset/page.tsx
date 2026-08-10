import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { requestPasswordReset, resetPassword } from "@/api/auth";
import { ApiError } from "@/types/api";
import { Reveal } from "@/components/Animation";

const inputClass = "page-input focus:ring-2 focus:ring-[#0a1158]/15";

export default function PasswordResetPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onRequestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setStatus("loading");
    try {
      await requestPasswordReset(email);
      setStatus("success");
      setMessage(t("auth.resetPassword.linkSent"));
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : t("common.genericError"));
    }
  }

  async function onResetSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    setStatus("loading");
    try {
      await resetPassword(token!, password);
      setStatus("success");
      setMessage(t("auth.resetPassword.success"));
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : t("common.genericError"));
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10 bg-transparent">
      <Reveal className="w-full max-w-md">
        <div className="page-card p-6 shadow-[0_20px_50px_-24px_rgba(14,26,43,0.15)]">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
            <i className="ri-lock-password-line w-6 h-6 flex items-center justify-center text-xl" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground-950 tracking-tight mb-1">
            {t("auth.resetPassword.title")}
          </h1>
          <p className="text-sm text-foreground-500 mb-6">
            {token ? t("auth.resetPassword.newPasswordPrompt") : t("auth.resetPassword.emailPrompt")}
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm ${
                status === "success"
                  ? "bg-secondary-50 border border-secondary-200 text-secondary-800"
                  : "bg-accent-50 border border-accent-200 text-accent-800"
              }`}
            >
              {message}
            </div>
          )}

          {token ? (
            <form onSubmit={onResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">
                  {t("auth.resetPassword.newPasswordLabel")}
                </label>
                <input name="password" type="password" required minLength={8} className={inputClass} />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60 transition-colors"
              >
                {status === "loading" ? t("contact.sending") : t("auth.resetPassword.updatePassword")}
              </button>
            </form>
          ) : (
            <form onSubmit={onRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t("contact.email")}</label>
                <input name="email" type="email" required className={inputClass} />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60 transition-colors"
              >
                {status === "loading" ? t("contact.sending") : t("auth.resetPassword.sendLink")}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  );
}
