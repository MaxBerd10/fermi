import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { verifyEmail } from "@/api/auth";
import { ApiError } from "@/types/api";
import { Reveal } from "@/components/Animation";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage(t("auth.verifyEmail.success"));
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : t("auth.verifyEmail.error"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10 bg-transparent">
      <Reveal className="w-full max-w-md">
        <div className="page-card p-6 text-center shadow-[0_20px_50px_-24px_rgba(14,26,43,0.15)]">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              status === "loading"
                ? "bg-primary-50 text-primary-500"
                : status === "success"
                  ? "bg-secondary-50 text-secondary-600"
                  : "bg-accent-50 text-accent-600"
            }`}
          >
            {status === "loading" && (
              <i className="ri-loader-4-line w-8 h-8 flex items-center justify-center text-2xl animate-spin" />
            )}
            {status === "success" && (
              <i className="ri-checkbox-circle-line w-8 h-8 flex items-center justify-center text-2xl" />
            )}
            {status === "error" && (
              <i className="ri-error-warning-line w-8 h-8 flex items-center justify-center text-2xl" />
            )}
          </div>
          <p className="mt-5 text-sm text-foreground-600 leading-relaxed">{message || "\u00a0"}</p>
          {status !== "loading" && (
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold transition-colors"
            >
              <i className="ri-home-line w-4 h-4 flex items-center justify-center" />
              {t("notFound.backHome")}
            </Link>
          )}
        </div>
      </Reveal>
    </div>
  );
}
