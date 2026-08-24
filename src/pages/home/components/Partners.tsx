import { useTranslation } from "react-i18next";
import { partners } from "@/mocks/homeData";

export default function Partners() {
  const { t } = useTranslation();
  // See EventsJournal: use explicit keys so the production build resolves
  // every language rather than showing a generated key as visible text.
  const partnerNames = [
    t("partners.item1.name"),
    t("partners.item2.name"),
    t("partners.item3.name"),
    t("partners.item4.name"),
    t("partners.item5.name"),
    t("partners.item6.name"),
    t("partners.item7.name"),
    t("partners.item8.name"),
  ];

  return (
    <section className="pt-3 pb-5 md:pt-4 md:pb-6 bg-transparent border-t border-[#e5e5e5]/60">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#0a1158] mb-1">
              {t("partners.eyebrow")}
            </p>
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#0a0a0a] tracking-tight">
              {t("partners.heading")}
            </h2>
          </div>
          <p className="text-xs text-[#333333]">{t("footer.davlatPortallari")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {partners.map((p, i) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-white/75 backdrop-blur-sm border border-[#e5e5e5]/80 px-3 py-2.5 hover:border-[#ffd600] hover:bg-white/90 transition-colors cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-white border border-[#e5e5e5] text-[#0a1158] flex items-center justify-center shrink-0">
                <i className={`${p.icon} text-sm`} />
              </span>
              <span className="text-xs font-semibold text-[#0a0a0a] leading-snug line-clamp-2">
                {partnerNames[i] ?? p.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
