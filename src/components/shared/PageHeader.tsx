import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import BrandMark from "./BrandMark";

interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  description?: string;
  compact?: boolean;
  aside?: ReactNode;
}

export default function PageHeader({ title, breadcrumb, description, compact, aside }: PageHeaderProps) {
  const { t } = useTranslation();

  return (
    <section className="page-header relative overflow-hidden">
      <div className="page-header__glow" aria-hidden />
      <div className="page-header__grid" aria-hidden />

      <div className={`section-container relative z-10 ${compact ? (aside ? "pt-4 pb-1 sm:pt-4 sm:pb-1 md:pt-5 md:pb-1" : "pt-4 pb-4 sm:pt-5 sm:pb-4 md:pt-6 md:pb-5") : "pt-4 pb-6 sm:pt-5 sm:pb-6 md:pt-6 md:pb-8"}`}>
        <nav
          className="inline-flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-wide uppercase mb-2.5 px-2.5 py-1 rounded-full bg-white/95 border border-[#e5e5e5]/80 text-[#555555] shadow-sm max-w-full"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="text-[#0a1158] hover:text-[#060a3d] transition-colors cursor-pointer">
            {t("common.homePage")}
          </Link>
          <span className="text-[#ccc]">/</span>
          <span className="text-[#0a1158]">{breadcrumb || title}</span>
        </nav>

        <div className={aside ? "grid gap-4 lg:grid-cols-[max-content_minmax(0,1fr)] lg:items-start lg:gap-3" : undefined}>
          <div>
            <p className="mb-1.5">
              <BrandMark size="sm" showFull layout="inline" className="text-[#0a1158]" />
            </p>

            <h1 className={`font-heading font-extrabold text-[#0a0a0a] leading-[1.05] tracking-tight max-w-4xl ${aside ? "text-[clamp(2.35rem,4.2vw,4rem)]" : "text-[clamp(1.45rem,3vw,2.15rem)]"}`}>
              {title}
            </h1>

            {description && (
              <p className="mt-3 text-base text-[#444444] max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {aside && <div className="md:min-w-0">{aside}</div>}
        </div>

        <div className={`page-header__rule ${aside ? "mt-2" : "mt-6"}`} aria-hidden />
      </div>
    </section>
  );
}
