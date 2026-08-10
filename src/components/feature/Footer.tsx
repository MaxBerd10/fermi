import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FOUNDED_YEAR } from "@/lib/siteConstants";
import { useApi } from "../../hooks/useApi";
import { getSettings } from "../../api/settings";
import BrandMark from "../shared/BrandMark";
import WwwUzCounter from "../shared/WwwUzCounter";

const LOGO_IMG = "/images/logo.png?v=2";

const NAVY = "#0a1158";
const NAVY_DEEP = "#060a3d";
const YELLOW = "#ffd600";

const FALLBACK_ADDRESS = "Farg'ona sh., Yangi Turon, 2-a uy";
const FALLBACK_PHONE = "+998 95 062-23-45, +998 95 063-23-45";
const FALLBACK_EMAIL = "info@fjsti.uz, fmioz@mail.ru";

const SOCIAL_ICON_MAP: Record<string, string> = {
  facebook: "ri-facebook-fill",
  twitter: "ri-twitter-x-line",
  youtube: "ri-youtube-fill",
  telegram: "ri-telegram-fill",
  instagram: "ri-instagram-line",
};

const FOOTER_SERVICES = [
  { labelKey: "quickServices.item1.title", href: "/virtual-reception/17", icon: "ri-customer-service-2-line" },
  { labelKey: "footer.qabul", href: "/qabul", icon: "ri-file-user-line" },
  { labelKey: "quickServices.item2.title", href: "/aloqa", icon: "ri-map-pin-line" },
  { labelKey: "quickServices.item3.title", href: "http://hemis.fjsti.uz", icon: "ri-dashboard-3-line" },
  { labelKey: "quickServices.item4.title", href: "https://www.scopus.com/standard/marketing.uri", icon: "ri-article-line" },
  { labelKey: "quickServices.item5.title", href: "https://doctorium.com/", icon: "ri-stethoscope-line" },
] as const;

const INSTITUT_LINKS = [
  { key: "footer.institutHaqida", to: "/institut" },
  { key: "footer.rahbariyat", to: "/leader/35/rektor" },
  { key: "footer.tuzilma", to: "/institut" },
  { key: "news.title", to: "/yangiliklar" },
] as const;

const TALIM_LINKS = [
  { key: "footer.qabul", to: "/qabul" },
  { key: "footer.bakalavriat", to: "/qabul" },
  { key: "footer.magistratura", to: "/qabul" },
  { key: "footer.ordinatura", to: "/qabul" },
  { key: "footer.doktorantura", to: "/qabul" },
] as const;

type FooterLink = { labelKey: string; to: string; external?: boolean };

const XIZMAT_LINKS: FooterLink[] = [
  { labelKey: "quickServices.item1.title", to: "/virtual-reception/17" },
  { labelKey: "footer.jcpmJurnali", to: "/yangiliklar" },
  { labelKey: "nav.testBaza", to: "/blog/29/mutaxassisliklar-boyicha-testlar-toplami" },
  { labelKey: "quickServices.item3.title", to: "http://hemis.fjsti.uz", external: true },
];

const PORTALS = [
  { key: "footer.prezidentPortali", href: "https://president.uz" },
  { key: "footer.hukumatPortali", href: "https://gov.uz" },
  { key: "footer.vazirlik", href: "https://ssv.uz" },
] as const;

function firstTel(phone: string) {
  return phone.split(/[,\s]/)[0] || phone;
}

function firstEmail(email: string) {
  return email.trim().split(/[,\s]/)[0] || email;
}

export default function Footer() {
  const { t } = useTranslation();
  const { data: settings } = useApi(getSettings, []);

  const address = settings?.setting?.address?.trim() || FALLBACK_ADDRESS;
  const phone = settings?.setting?.phone?.trim() || FALLBACK_PHONE;
  const email = settings?.setting?.email?.trim() || FALLBACK_EMAIL;
  const networks = settings?.networks ?? [];

  const linkCls =
    "inline-flex items-center min-h-[28px] text-[0.8125rem] text-white/70 hover:text-[#ffd600] transition-colors cursor-pointer";

  return (
    <footer className="relative text-white overflow-hidden" style={{ background: NAVY }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 0% 0%, rgba(255,214,0,0.08) 0%, transparent 50%),
            linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)
          `,
        }}
        aria-hidden
      />

      {/* Top service band — compact */}
      <div className="relative border-b border-white/10 bg-black/20">
        <div className="section-container">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {FOOTER_SERVICES.map((s, i) => {
              const external = s.href.startsWith("http");
              const label = t(s.labelKey);
              const cls =
                "group flex items-center justify-center gap-1.5 px-2 py-2.5 min-h-[40px] text-[11px] md:text-xs font-medium text-white/75 hover:text-[#0a1158] hover:bg-[#ffd600] transition-colors cursor-pointer text-center border-white/10 " +
                (i < FOOTER_SERVICES.length - 1 ? "lg:border-r " : "") +
                "border-b lg:border-b-0 sm:border-r";
              const inner = (
                <>
                  <i className={`${s.icon} text-sm text-[#ffd600] group-hover:text-[#0a1158] transition-colors`} />
                  <span className="leading-tight line-clamp-2">{label}</span>
                </>
              );
              return (
                <li key={s.labelKey} className="min-w-0">
                  {external ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className={cls}>
                      {inner}
                    </a>
                  ) : (
                    <Link to={s.href} className={cls}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="relative section-container pt-6 pb-4 md:pt-7 md:pb-5">
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-5 items-start">
          {/* Brand */}
          <div className="lg:col-span-3">
            <Link to="/" className="inline-flex items-center gap-2.5 cursor-pointer">
              <img
                src={LOGO_IMG}
                alt=""
                className="w-10 h-10 object-contain rounded-full ring-2 ring-[#ffd600]/80"
              />
              <BrandMark
                size="md"
                showFull
                className="text-white [&_.brand-fermi\_\_mi]:text-white [&_.brand-fermi\_\_mi]:bg-[linear-gradient(180deg,transparent_75%,rgba(255,214,0,0.75)_75%)] [&_.brand-fermi\_\_full]:text-white/55"
              />
            </Link>

            <p className="mt-2.5 text-xs leading-relaxed text-white/65 line-clamp-3 max-w-xs">
              {t("footer.description")}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#ffd600]/35 bg-[#ffd600]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ffd600]">
                {FOUNDED_YEAR}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/75">
                FerMI
              </span>
            </div>

            {networks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {networks.map((s) => (
                  <a
                    key={`${s.icon}-${s.url}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg border border-white/20 bg-white/5 hover:border-[#ffd600] hover:bg-[#ffd600] hover:text-[#0a1158] flex items-center justify-center transition-all cursor-pointer"
                    aria-label={s.title}
                  >
                    <i className={`${SOCIAL_ICON_MAP[s.icon] ?? "ri-links-line"} text-sm`} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3 sm:gap-4">
            <div>
              <h4 className="font-heading text-xs font-bold tracking-wide mb-2 text-[#ffd600]">
                {t("footer.institut")}
              </h4>
              <ul className="space-y-0.5">
                {INSTITUT_LINKS.map(({ key, to }) => (
                  <li key={key}>
                    <Link to={to} className={linkCls}>
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-xs font-bold tracking-wide mb-2 text-[#ffd600]">
                {t("footer.qabul")}
              </h4>
              <ul className="space-y-0.5">
                {TALIM_LINKS.map(({ key, to }) => (
                  <li key={key}>
                    <Link to={to} className={linkCls}>
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-xs font-bold tracking-wide mb-2 text-[#ffd600]">
                {t("footer.xizmatlar")}
              </h4>
              <ul className="space-y-0.5">
                {XIZMAT_LINKS.map((item) => {
                  const label = t(item.labelKey);
                  if (item.external || item.to.startsWith("http")) {
                    return (
                      <li key={item.labelKey}>
                        <a
                          href={item.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkCls}
                        >
                          <span className="line-clamp-1">{label}</span>
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={item.labelKey}>
                      <Link to={item.to} className={linkCls}>
                        <span className="line-clamp-1">{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Contact — compact panel */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-white/15 bg-white/[0.06] p-3.5 md:p-4">
              <h4 className="font-heading text-xs font-bold tracking-wide mb-2.5 text-[#ffd600]">
                {t("footer.contactUs")}
              </h4>

              <ul className="space-y-2 text-xs text-white/80">
                <li className="flex gap-2 items-start">
                  <i className="ri-map-pin-line text-[#ffd600] mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{address}</span>
                </li>
                <li>
                  <a href={`tel:${firstTel(phone)}`} className="flex gap-2 items-start group cursor-pointer">
                    <i className="ri-phone-line text-[#ffd600] mt-0.5 flex-shrink-0" />
                    <span className="leading-snug group-hover:text-[#ffd600] transition-colors">{phone}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${firstEmail(email)}`} className="flex gap-2 items-start group cursor-pointer">
                    <i className="ri-mail-line text-[#ffd600] mt-0.5 flex-shrink-0" />
                    <span className="leading-snug break-all group-hover:text-[#ffd600] transition-colors">{email}</span>
                  </a>
                </li>
                <li className="flex gap-2 items-start">
                  <i className="ri-time-line text-[#ffd600] mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{t("nav.workingHours")}</span>
                </li>
              </ul>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/aloqa"
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full bg-[#ffd600] text-[#0a1158] text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                >
                  {t("contact.sendMessage")}
                  <i className="ri-send-plane-line text-sm" />
                </Link>
                <Link
                  to="/virtual-reception/17"
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full border border-white/25 text-white text-xs font-semibold hover:border-[#ffd600] hover:text-[#ffd600] transition-colors cursor-pointer"
                >
                  {t("quickServices.item1.title")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Portals + logos + copyright — one compact strip */}
        <div
          className="mt-5 pt-3.5 flex flex-col gap-3"
          style={{ borderTop: `1px solid ${YELLOW}44` }}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ffd600] mr-1">
              {t("footer.davlatPortallari")}
            </span>
            {PORTALS.map((p) => (
              <a
                key={p.key}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 hover:border-[#ffd600] hover:text-[#ffd600] transition-colors cursor-pointer"
              >
                {t(p.key)}
              </a>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5 pt-2.5 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2.5 min-w-0">
              <WwwUzCounter />
              <p className="text-[11px] text-white/45 leading-snug">
                {t("footer.copyright", { year: new Date().getFullYear() })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/50">
              <Link to="/sitemap" className="hover:text-[#ffd600] transition-colors cursor-pointer">
                {t("footer.saytXaritasi")}
              </Link>
              <span>{t("footer.maxfiylikSiyosati")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
