import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { submitContact } from "@/api/forms";
import { getSettings } from "@/api/settings";
import type { SiteSettings } from "@/types/content";
import { ApiError } from "@/types/api";
import { Reveal } from "@/components/Animation";
import { MAP_EMBED_URL } from "@/lib/siteConstants";

export default function ContactMap() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string>("");
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const hp = String(formData.get("website_alt") || "").trim();
    if (hp) {
      setStatus("success");
      formEl.reset();
      return;
    }
    const msg = String(formData.get("message") || "");
    if (msg.length > 500) {
      setStatus("error");
      setFormError(t("contact.messageTooLong"));
      return;
    }
    setStatus("loading");
    setFormError("");
    try {
      await submitContact({
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        subject: String(formData.get("topic") || ""),
        message: msg,
      });
      setStatus("success");
      formEl.reset();
    } catch (err) {
      setStatus("error");
      setFormError(err instanceof ApiError ? err.message : t("contact.submitError"));
    }
  }

  const phone = settings?.setting?.phone;
  const email = settings?.setting?.email;
  const address = settings?.setting?.address;

  const inputClass =
    "mt-1 w-full h-9 px-3 rounded-lg bg-white border border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#555555] focus:outline-none focus:border-[#0a1158] transition-colors";

  return (
    <section id="aloqa" className="pt-3 pb-6 md:pt-4 md:pb-7 bg-transparent border-t border-[#e5e5e5]/60">
      <div className="section-container">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#0a1158] mb-1">
                {t("contact.title")}
              </p>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0a0a0a] tracking-tight">
                {t("contact.heading")}
              </h2>
            </div>
            <p className="text-sm text-[#333333] max-w-md leading-snug">{t("contact.helpLine")}</p>
          </div>
        </Reveal>

        {/* Compact contact chips */}
        <Reveal>
          <div className="flex flex-wrap gap-2 mb-5">
            {address && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e5e5e5] px-3 py-1.5 text-xs text-[#0a0a0a]">
                <i className="ri-map-pin-line text-[#0a1158]" />
                {address}
              </span>
            )}
            {phone && (
              <a
                href={`tel:${phone.split(" ")[0]}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#0a0a0a] hover:border-[#ffd600] cursor-pointer"
              >
                <i className="ri-phone-line text-[#0a1158]" />
                {phone}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email.trim().split(" ")[0]}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#0a0a0a] hover:border-[#ffd600] cursor-pointer"
              >
                <i className="ri-mail-line text-[#0a1158]" />
                {email}
              </a>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#e5e5e5] px-3 py-1.5 text-xs text-[#0a0a0a]">
              <i className="ri-time-line text-[#0a1158]" />
              {t("nav.workingHours")}
            </span>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-4 lg:items-stretch">
          <Reveal className="rounded-2xl bg-white/85 backdrop-blur-md border border-[#e5e5e5]/80 p-4 md:p-5 shadow-sm h-full">
            <h3 className="font-heading text-base font-bold text-[#0a0a0a] mb-3">{t("contact.sendMessage")}</h3>
            <form id="fjsti-contact" onSubmit={onSubmit}>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-[#333333] font-bold">{t("contact.name")}</label>
                  <input name="name" required type="text" placeholder={t("contact.namePlaceholder")} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-[#333333] font-bold">{t("contact.emailLabel")}</label>
                  <input name="email" required type="email" placeholder={t("contact.emailPlaceholder")} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-[#333333] font-bold">{t("contact.phoneLabel")}</label>
                  <input name="phone" required type="tel" placeholder={t("contact.phonePlaceholder")} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-[#333333] font-bold">{t("contact.subject")}</label>
                  <select name="topic" required className={inputClass}>
                    <option value="Qabul haqida">{t("contact.topicAdmission")}</option>
                    <option value="Oʻquv jarayoni">{t("contact.topicStudy")}</option>
                    <option value="Ilmiy faoliyat">{t("contact.topicScience")}</option>
                    <option value="Xalqaro hamkorlik">{t("contact.topicInternational")}</option>
                    <option value="Boshqa">{t("contact.topicOther")}</option>
                  </select>
                </div>
              </div>
              <div className="mt-2.5">
                <label className="text-[10px] uppercase tracking-wide text-[#333333] font-bold">{t("contact.messageLabel")}</label>
                <textarea
                  name="message"
                  required
                  maxLength={500}
                  rows={3}
                  placeholder={t("contact.messagePlaceholder")}
                  className={`${inputClass} h-auto py-2 resize-none`}
                />
              </div>
              <input type="text" name="website_alt" tabIndex={-1} autoComplete="off" aria-hidden="true" readOnly className="hp-field-x9" />
              {status === "success" && <p className="mt-2 text-xs font-bold text-[#0a1158]">{t("contact.successMessage")}</p>}
              {status === "error" && <p className="mt-2 text-xs font-bold text-red-600">{formError}</p>}
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-3 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#0a1158] hover:bg-[#060a3d] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {status === "loading" ? t("contact.sending") : t("contact.sendMessage")}
                <i className="ri-send-plane-line" />
              </button>
            </form>
          </Reveal>

          <Reveal
            delay={80}
            className="relative rounded-2xl overflow-hidden border border-[#e5e5e5] bg-[#e5e5e5] min-h-[280px] h-full self-stretch"
          >
            <iframe
              src={MAP_EMBED_URL}
              title={t("contact.mapTitle")}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
