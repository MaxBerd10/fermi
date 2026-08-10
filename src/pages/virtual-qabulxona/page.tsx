import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRegions, getDistricts } from "@/api/lookups";
import { listFaculty } from "@/api/faculty";
import { submitVirtualReception } from "@/api/forms";
import { aiReception } from "@/api/ai";
import type { District, FacultyListItem, Region } from "@/types/content";
import { ApiError } from "@/types/api";
import PageHeader from "@/components/shared/PageHeader";
import { Reveal } from "@/components/Animation";
import { usePageMeta } from "@/hooks/usePageMeta";
import AiPanel from "@/components/ai/AiPanel";

export default function VirtualQabulxonaPage() {
  const { t, i18n } = useTranslation();
  usePageMeta(t("nav.virtualReception"), t("vq.pageDescription"));
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [ticketId, setTicketId] = useState<number | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [faculties, setFaculties] = useState<FacultyListItem[]>([]);
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiHelp, setAiHelp] = useState<{
    polished: string;
    subject: string;
    summary: string;
    category: string;
  } | null>(null);

  useEffect(() => {
    getRegions().then(setRegions);
    listFaculty().then(setFaculties);
  }, []);

  useEffect(() => {
    setDistrictId("");
    if (!regionId) {
      setDistricts([]);
      return;
    }
    getDistricts(Number(regionId)).then(setDistricts);
  }, [regionId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const honey = (formData.get("company_alt") as string)?.trim();
    if (honey) {
      setFormStatus("success");
      form.reset();
      return;
    }

    setFormStatus("loading");
    setFormError("");

    const file = formData.get("file") as File;

    try {
      const res = await submitVirtualReception({
        fish: String(formData.get("fish") || ""),
        provinceId: Number(regionId),
        districtId: Number(districtId),
        address: String(formData.get("address") || ""),
        phone: String(formData.get("phone") || ""),
        email: String(formData.get("email") || ""),
        gender: String(formData.get("gender") || ""),
        facultyId: Number(formData.get("facultyId") || 0),
        text: String(formData.get("text") || ""),
        file: file && file.size > 0 ? file : null,
      });
      setTicketId(res.id);
      setFormStatus("success");
      form.reset();
      setRegionId("");
      setDistrictId("");
    } catch (err) {
      setFormStatus("error");
      setFormError(err instanceof ApiError ? err.message : t("vq.submitError"));
    }
  };

  return (
    <div className="text-foreground-950">
      <PageHeader
        title={t("nav.virtualReception")}
        breadcrumb={t("nav.virtualReception")}
        description={t("vq.heroDescription")}
      />

      <main className="section-container section-pad">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-5 lg:items-start">
          <div className="lg:col-span-2">
            <Reveal className="page-card p-4 md:p-5">
              <h2 className="font-heading text-lg font-semibold text-foreground-900 mb-1">{t("vq.formTitle")}</h2>
              <p className="text-sm text-foreground-600 mb-4">{t("vq.formSubtitle")}</p>

              {formStatus === "success" && (
                <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200/80 text-green-800 text-sm flex items-start gap-3">
                  <i className="ri-checkbox-circle-line w-5 h-5 flex items-center justify-center text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{t("vq.successTitle")}</p>
                    {ticketId && <p>{t("vq.ticketNote", { id: ticketId })}</p>}
                  </div>
                </div>
              )}

              {formStatus === "error" && formError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-800 text-sm flex items-start gap-3">
                  <i className="ri-error-warning-line w-5 h-5 flex items-center justify-center text-red-600 flex-shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="absolute opacity-0 pointer-events-none">
                  <input type="text" name="company_alt" tabIndex={-1} autoComplete="off" aria-hidden="true" readOnly className="sr-only" />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">{t("vq.fullName")} <span className="text-red-500">*</span></label>
                    <input name="fish" type="text" required className="w-full h-10 px-3 page-input text-sm focus:outline-none focus:border-primary-500" placeholder={t("vq.fullNamePlaceholder")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">{t("aloqa.emailCardTitle")} <span className="text-red-500">*</span></label>
                    <input name="email" type="email" required className="w-full h-10 px-3 page-input text-sm focus:outline-none focus:border-primary-500" placeholder="email@example.com" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">{t("vq.phoneNumberLabel")} <span className="text-red-500">*</span></label>
                    <input name="phone" type="tel" required className="w-full h-10 px-3 page-input text-sm focus:outline-none focus:border-primary-500" placeholder="+998 90 123 45 67" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">{t("vq.genderLabel")} <span className="text-red-500">*</span></label>
                    <select name="gender" required className="w-full h-10 px-3 page-input text-sm focus:outline-none focus:border-primary-500">
                      <option value="">{t("qabul.selectPlaceholder")}</option>
                      <option value="Erkak">{t("vq.genderMale")}</option>
                      <option value="Ayol">{t("vq.genderFemale")}</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">{t("qabul.regionLabel")} <span className="text-red-500">*</span></label>
                    <select required value={regionId} onChange={(e) => setRegionId(e.target.value)} className="w-full h-10 px-3 page-input text-sm focus:outline-none focus:border-primary-500">
                      <option value="">{t("qabul.selectPlaceholder")}</option>
                      {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">{t("qabul.districtLabel")} <span className="text-red-500">*</span></label>
                    <select required value={districtId} onChange={(e) => setDistrictId(e.target.value)} disabled={!regionId} className="w-full h-10 px-3 page-input text-sm focus:outline-none focus:border-primary-500 disabled:opacity-50">
                      <option value="">{t("qabul.selectPlaceholder")}</option>
                      {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">{t("vq.facultyLabel")} <span className="text-red-500">*</span></label>
                    <select name="facultyId" required className="w-full h-10 px-3 page-input text-sm focus:outline-none focus:border-primary-500">
                      <option value="">{t("qabul.selectPlaceholder")}</option>
                      {faculties.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t("contact.address")} <span className="text-red-500">*</span></label>
                  <input name="address" type="text" required className="w-full h-11 px-4 page-input text-sm focus:outline-none focus:border-primary-500" placeholder={t("vq.addressPlaceholder")} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t("vq.messageLabel")} <span className="text-red-500">*</span></label>
                  <textarea
                    ref={textRef}
                    name="text"
                    required
                    rows={5}
                    maxLength={2000}
                    className="w-full px-4 py-3 page-input text-sm focus:outline-none focus:border-primary-500 resize-y"
                    placeholder={t("vq.messagePlaceholder")}
                  />
                  <AiPanel title={t("ai.receptionTitle")} subtitle={t("ai.receptionSub")} className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={async () => {
                          const text = textRef.current?.value || "";
                          if (!text.trim()) return;
                          setAiLoading(true);
                          setAiError("");
                          try {
                            const res = await aiReception(text, i18n.language);
                            setAiHelp(res);
                          } catch (e) {
                            setAiError(e instanceof Error ? e.message : t("ai.error"));
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                        className="h-9 px-3 rounded-full bg-[#0a1158] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {aiLoading ? t("ai.thinking") : t("ai.receptionPolish")}
                      </button>
                      {aiHelp && (
                        <button
                          type="button"
                          onClick={() => {
                            if (textRef.current) textRef.current.value = aiHelp.polished;
                          }}
                          className="h-9 px-3 rounded-full border border-[#0a1158] text-[#0a1158] text-xs font-semibold cursor-pointer"
                        >
                          {t("ai.receptionApply")}
                        </button>
                      )}
                    </div>
                    {aiError && <p className="mt-2 text-xs text-red-600">{aiError}</p>}
                    {aiHelp && (
                      <div className="mt-3 space-y-2 text-sm">
                        <p>
                          <span className="font-semibold text-[#0a1158]">{t("ai.subject")}: </span>
                          {aiHelp.subject}
                          {aiHelp.category ? ` · ${aiHelp.category}` : ""}
                        </p>
                        <p>
                          <span className="font-semibold text-[#0a1158]">{t("ai.adminSummary")}: </span>
                          {aiHelp.summary}
                        </p>
                        <p className="text-xs text-[#555555] whitespace-pre-wrap border-t border-[#e5e5e5] pt-2">
                          {aiHelp.polished}
                        </p>
                      </div>
                    )}
                  </AiPanel>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5">{t("vq.fileLabel")}</label>
                  <input name="file" type="file" accept=".pdf,.docx,.png,.jpg,.xlsx,.svg,.pptx" className="w-full text-sm text-foreground-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary-50 file:text-primary-700 file:text-sm" />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === "loading"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors disabled:opacity-60"
                >
                  {formStatus === "loading" ? (
                    <><i className="ri-loader-4-line w-4 h-4 flex items-center justify-center animate-spin" />{t("contact.sending")}</>
                  ) : (
                    <><i className="ri-send-plane-line w-4 h-4 flex items-center justify-center" />{t("vq.submit")}</>
                  )}
                </button>
              </form>
            </Reveal>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-24">
            <Reveal delay={80}>
              <div className="bg-accent-50 rounded-2xl border border-accent-200/80 p-4">
                <h3 className="font-heading font-semibold text-accent-900 mb-2 flex items-center gap-2 text-sm">
                  <i className="ri-phone-line text-accent-600" />
                  {t("aloqa.quickContact")}
                </h3>
                <p className="text-sm text-accent-800 mb-2">{t("vq.urgentNote")}</p>
                <a href="tel:+998950622345" className="block text-base font-heading font-bold text-accent-700 hover:text-accent-800 cursor-pointer transition-colors">
                  +998 95 062-23-45
                </a>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="page-card p-4 space-y-2">
                <h3 className="font-heading font-semibold text-foreground-900 text-sm mb-2">{t("vq.formTitle")}</h3>
                <p className="text-xs text-foreground-600 leading-relaxed">{t("vq.formSubtitle")}</p>
                <a href="http://hemis.fjsti.uz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-[#0a1158] hover:underline">
                  <i className="ri-dashboard-3-line" /> HEMIS
                </a>
                <a href="/qabul" className="flex items-center gap-2 text-sm font-semibold text-[#0a1158] hover:underline">
                  <i className="ri-file-user-line" /> {t("footer.qabul")}
                </a>
              </div>
            </Reveal>
          </aside>
        </div>
      </main>
    </div>
  );
}
