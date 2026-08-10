import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSettings } from "@/api/settings";
import { submitContact } from "@/api/forms";
import type { SiteSettings } from "@/types/content";
import { ApiError } from "@/types/api";
import PageHeader from "@/components/shared/PageHeader";
import { Reveal } from "@/components/Animation";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MAP_EMBED_URL } from "@/lib/siteConstants";

const SOCIAL_ICON_MAP: Record<string, { icon: string; color: string }> = {
  facebook: { icon: "ri-facebook-fill", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  twitter: { icon: "ri-twitter-x-line", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
  youtube: { icon: "ri-youtube-fill", color: "bg-red-50 text-red-600 hover:bg-red-100" },
  telegram: { icon: "ri-telegram-fill", color: "bg-sky-50 text-sky-600 hover:bg-sky-100" },
  instagram: { icon: "ri-instagram-line", color: "bg-pink-50 text-pink-600 hover:bg-pink-100" },
};

export default function AloqaPage() {
  const { t } = useTranslation();
  usePageMeta(t("contact.title"), t("aloqa.heroDescription"));
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("loading");
    setError("");
    try {
      await submitContact({
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
        subject: String(fd.get("subject") || ""),
        message: String(fd.get("message") || ""),
      });
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : t("aloqa.submitError"));
    }
  }

  return (
    <div className="text-foreground-950">
      <PageHeader
        title={t("contact.heading")}
        breadcrumb={t("contact.title")}
        description={t("aloqa.heroDescription")}
      />

      <main className="section-container section-pad">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-5 lg:items-stretch">
          <div className="lg:col-span-2 space-y-4">
            <Reveal>
              <div className="grid sm:grid-cols-2 gap-3">
                {settings?.setting?.phone && (
                  <div className="page-card p-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                      <i className="ri-phone-line text-lg" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground-900 mb-1.5 text-sm">{t("contact.phone")}</h3>
                    <a href={`tel:${settings.setting.phone.split(" ")[0]}`} className="text-sm text-foreground-700 hover:text-primary-600 transition-colors">{settings.setting.phone}</a>
                  </div>
                )}
                {settings?.setting?.email && (
                  <div className="page-card p-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center text-secondary-700 mb-3">
                      <i className="ri-mail-line text-lg" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground-900 mb-1.5 text-sm">{t("aloqa.emailCardTitle")}</h3>
                    <a href={`mailto:${settings.setting.email.trim().split(" ")[0]}`} className="text-sm text-foreground-700 hover:text-secondary-700 transition-colors">{settings.setting.email}</a>
                  </div>
                )}
                {settings?.setting?.address && (
                  <div className="page-card p-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center text-accent-700 mb-3">
                      <i className="ri-map-pin-line text-lg" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground-900 mb-1.5 text-sm">{t("contact.address")}</h3>
                    <p className="text-sm text-foreground-700">{settings.setting.address}</p>
                  </div>
                )}
                <div className="page-card p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                    <i className="ri-time-line text-lg" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground-900 mb-1.5 text-sm">{t("contact.workingHoursLabel")}</h3>
                  <p className="text-sm text-foreground-700">{t("nav.workingHours")}</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <form onSubmit={onSubmit} className="page-card p-4 md:p-5">
                <h3 className="font-heading text-base font-semibold text-foreground-950 mb-3">{t("contact.sendMessage")}</h3>
                {status === "success" && <div className="mb-3 p-2.5 rounded-xl bg-secondary-50 border border-secondary-200/80 text-sm text-secondary-800">{t("aloqa.successMessage")}</div>}
                {status === "error" && <div className="mb-3 p-2.5 rounded-xl bg-accent-50 border border-accent-200/80 text-sm text-accent-800">{error}</div>}
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <input name="name" required placeholder={t("aloqa.namePlaceholder")} className="h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500" />
                  <input name="email" type="email" required placeholder={t("contact.email")} className="h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500" />
                  <input name="phone" required placeholder={t("contact.phone")} className="h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500" />
                  <input name="subject" required placeholder={t("aloqa.subjectPlaceholder")} className="h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500" />
                </div>
                <textarea name="message" required rows={4} placeholder={t("aloqa.messagePlaceholder")} className="mt-2.5 w-full px-3 py-2 page-input !h-auto text-sm focus:outline-none focus:border-primary-500 resize-none" />
                <button type="submit" disabled={status === "loading"} className="mt-3 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60 transition-colors">
                  {status === "loading" ? t("contact.sending") : t("contact.sendMessage")}
                </button>
              </form>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-2xl overflow-hidden border border-background-200/80 h-[280px] md:h-[320px]">
                <iframe
                  src={MAP_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t("aloqa.mapTitle")}
                />
              </div>
            </Reveal>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-24 self-start">
            <Reveal delay={60}>
              <div className="page-card p-4">
                <h3 className="font-heading font-semibold text-foreground-900 mb-3 text-sm">{t("aloqa.quickContact")}</h3>
                <div className="space-y-2">
                  <Link to="/virtual-reception/17" className="flex items-center gap-3 p-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer">
                    <i className="ri-customer-service-2-line w-5 h-5 flex items-center justify-center text-primary-600" />
                    <span className="text-sm font-medium text-foreground-800">{t("nav.virtualReception")}</span>
                  </Link>
                  <a href="http://hemis.fjsti.uz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer">
                    <i className="ri-dashboard-3-line w-5 h-5 flex items-center justify-center text-secondary-600" />
                    <span className="text-sm font-medium text-foreground-800">HEMIS</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {settings && settings.networks.length > 0 && (
              <Reveal delay={100}>
                <div className="page-card p-4">
                  <h3 className="font-heading font-semibold text-foreground-900 mb-3 text-sm">{t("aloqa.socialNetworks")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {settings.networks.map((s) => {
                      const meta = SOCIAL_ICON_MAP[s.icon] || { icon: "ri-links-line", color: "bg-background-100 text-foreground-700" };
                      return (
                        <a key={s.title} href={s.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${meta.color}`}>
                          <i className={`${meta.icon} w-4 h-4 flex items-center justify-center`} />
                          {s.title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
