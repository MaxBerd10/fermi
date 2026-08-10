import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { register } from "@/api/auth";
import { ApiError } from "@/types/api";
import { Reveal } from "@/components/Animation";

const inputClass = "page-input focus:ring-2 focus:ring-[#0a1158]/15";

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("loading");
    setErrors({});
    setGeneralError("");
    try {
      await register({
        username: String(fd.get("username")),
        email: String(fd.get("email")),
        password: String(fd.get("password")),
      });
      navigate("/");
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError && err.fields) {
        setErrors(err.fields);
      } else {
        setGeneralError(err instanceof ApiError ? err.message : t("auth.signup.error"));
      }
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10 bg-transparent">
      <Reveal className="w-full max-w-md">
        <div className="page-card p-6 shadow-[0_20px_50px_-24px_rgba(14,26,43,0.15)]">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
            <i className="ri-user-add-line w-6 h-6 flex items-center justify-center text-xl" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground-950 tracking-tight mb-1">
            {t("auth.signUp")}
          </h1>
          <p className="text-sm text-foreground-500 mb-6">{t("auth.signup.subtitle")}</p>

          {generalError && (
            <div className="mb-4 p-3 rounded-xl bg-accent-50 border border-accent-200 text-sm text-accent-800">{generalError}</div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t("auth.usernameLabel")}</label>
              <input name="username" required className={inputClass} />
              {errors.username && <p className="text-xs text-accent-700 mt-1">{errors.username[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t("contact.email")}</label>
              <input name="email" type="email" required className={inputClass} />
              {errors.email && <p className="text-xs text-accent-700 mt-1">{errors.email[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t("auth.passwordLabel")}</label>
              <input name="password" type="password" required minLength={8} className={inputClass} />
              {errors.password && <p className="text-xs text-accent-700 mt-1">{errors.password[0]}</p>}
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60 transition-colors"
            >
              {status === "loading" ? t("contact.sending") : t("auth.signUp")}
            </button>
          </form>

          <div className="mt-6 text-sm text-center">
            <span className="text-foreground-500">{t("auth.haveAccount")} </span>
            <Link to="/kirish" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              {t("auth.login.submit")}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
