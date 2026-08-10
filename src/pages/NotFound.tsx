import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/Animation";

export default function NotFound() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-24 bg-transparent">
      <Reveal className="relative text-center max-w-lg">
        <p className="font-heading text-[8rem] md:text-[10rem] font-bold leading-none text-primary-500/10 select-none pointer-events-none">
          404
        </p>
        <div className="relative -mt-16 md:-mt-20">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-6 ring-4 ring-primary-500/10">
            <i className="ri-compass-3-line w-8 h-8 flex items-center justify-center text-2xl" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground-950 tracking-tight mb-2">
            {t("notFound.title")}
          </h1>
          <p className="text-sm text-foreground-500 font-mono mb-1 px-4 py-1.5 inline-block rounded-lg bg-background-50 border border-background-200">
            {location.pathname}
          </p>
          <p className="text-sm text-foreground-600 mt-3 mb-8 leading-relaxed">{t("notFound.description")}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a1158] hover:bg-[#060a3d] text-white text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors shadow-[0_12px_30px_-12px_rgba(10,17,88,0.35)]"
          >
            <i className="ri-home-line w-4 h-4 flex items-center justify-center" />
            {t("notFound.backHome")}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
