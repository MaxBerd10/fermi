import type { ReactNode } from "react";

/** Compact AI assistant card — brand-matched animated gradient */
export default function AiPanel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ai-panel ${className}`.trim()}>
      <div className="ai-panel__glow" aria-hidden />
      <div className="ai-panel__shine" aria-hidden />
      <div className="ai-panel__content">
        <div className="flex items-start gap-3 mb-3">
          <span className="ai-panel__icon">
            <i className="ri-sparkling-2-line text-lg" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-sm md:text-base font-bold text-[#0a1158]">{title}</h3>
            {subtitle && <p className="text-xs text-[#555555] mt-0.5 leading-snug">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
