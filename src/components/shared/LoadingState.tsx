import { useTranslation } from "react-i18next";

export function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className="py-28 flex flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="relative w-12 h-12">
        <span className="absolute inset-0 rounded-full border-2 border-[#0a1158]/15" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0a1158] animate-spin" />
      </div>
      <p className="text-sm text-[#555555]">{t("common.loading", { defaultValue: "Yuklanmoqda…" })}</p>
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <div className="py-28 flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center mb-4">
        <i className="ri-error-warning-line text-2xl" />
      </div>
      <p className="text-foreground-700 font-medium">{message || t("common.loadError")}</p>
    </div>
  );
}
