import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRegions, getDistricts, getQuarters, getConnectLeaders } from "@/api/lookups";
import { submitQabul } from "@/api/forms";
import { aiQabul } from "@/api/ai";
import type { ConnectLeader, District, Quarter, Region } from "@/types/content";
import { ApiError } from "@/types/api";
import PageHeader from "@/components/shared/PageHeader";
import { Reveal } from "@/components/Animation";
import { usePageMeta } from "@/hooks/usePageMeta";
import AiPanel from "@/components/ai/AiPanel";

const colorMap: Record<string, string> = {
  primary: "bg-primary-50 border-primary-200 text-primary-700",
  secondary: "bg-secondary-50 border-secondary-200 text-secondary-700",
  accent: "bg-accent-50 border-accent-200 text-accent-700",
};

export default function QabulPage() {
  const { t, i18n } = useTranslation();
  usePageMeta(t("footer.qabul"));

  const levels = [
    { key: "bakalavriat", title: t("footer.bakalavriat"), icon: "ri-graduation-cap-line", color: "primary", desc: t("qabul.level.bakalavriat.desc") },
    { key: "magistratura", title: t("footer.magistratura"), icon: "ri-book-2-line", color: "secondary", desc: t("qabul.level.magistratura.desc") },
    { key: "ordinatura", title: t("qabul.level.ordinatura.title"), icon: "ri-hospital-line", color: "accent", desc: t("qabul.level.ordinatura.desc") },
  ];

  const steps = [
    { step: "01", title: t("qabul.step1.title"), desc: t("qabul.step1.desc"), icon: "ri-user-add-line" },
    { step: "02", title: t("qabul.step2.title"), desc: t("qabul.step2.desc"), icon: "ri-file-upload-line" },
    { step: "03", title: t("qabul.step3.title"), desc: t("qabul.step3.desc"), icon: "ri-article-line" },
    { step: "04", title: t("qabul.step4.title"), desc: t("qabul.step4.desc"), icon: "ri-check-double-line" },
  ];
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [leaders, setLeaders] = useState<ConnectLeader[]>([]);
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [aiQ, setAiQ] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLinks, setAiLinks] = useState<{ label?: string; href: string }[]>([]);

  useEffect(() => {
    getRegions().then(setRegions);
    getConnectLeaders().then(setLeaders);
  }, []);

  useEffect(() => {
    setDistrictId("");
    setQuarters([]);
    if (!regionId) { setDistricts([]); return; }
    getDistricts(Number(regionId)).then(setDistricts);
  }, [regionId]);

  useEffect(() => {
    setQuarters([]);
    if (!districtId) return;
    getQuarters(Number(districtId)).then(setQuarters);
  }, [districtId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("loading");
    setError("");
    try {
      await submitQabul({
        categoryId: Number(fd.get("categoryId")),
        date: String(fd.get("date") || ""),
        subject: String(fd.get("subject") || ""),
        fish: String(fd.get("fish") || ""),
        phone: String(fd.get("phone") || ""),
        email: String(fd.get("email") || ""),
        regionId: Number(regionId),
        districtId: Number(districtId),
        quarterId: Number(fd.get("quarterId")),
      });
      setStatus("success");
      e.currentTarget.reset();
      setRegionId("");
      setDistrictId("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : t("qabul.applicationError"));
    }
  }

  return (
    <div className="text-foreground-950">
      <PageHeader
        title={t("footer.qabul")}
        breadcrumb={t("footer.qabul")}
        description={t("qabul.heroDescription")}
      />
      <div className="section-container -mt-2 pb-6 relative z-10">
        <div className="flex flex-wrap gap-3">
          <a
            href="https://my.uzedu.uz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#0a1158] hover:bg-[#060a3d] text-white text-sm font-semibold cursor-pointer transition-colors shadow-[0_8px_20px_rgba(10,17,88,0.25)]"
          >
            <i className="ri-user-add-line text-base" />
            {t("qabul.registerOnline")}
          </a>
          <a
            href="tel:+998950622345"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white/85 border border-[#e5e5e5] text-[#0a0a0a] text-sm font-semibold hover:border-[#ffd600] cursor-pointer transition-colors"
          >
            <i className="ri-phone-line text-base text-[#0a1158]" />
            {t("qabul.callCenter")}
          </a>
        </div>
      </div>

      <main className="section-container section-pad space-y-8 md:space-y-10">
        <Reveal>
          <AiPanel title={t("ai.qabulTitle")} subtitle={t("ai.qabulSub")}>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={aiQ}
                onChange={(e) => setAiQ(e.target.value)}
                placeholder={t("ai.qabulPlaceholder")}
                className="flex-1 h-10 px-3 rounded-xl border border-[#e5e5e5] bg-white text-sm focus:outline-none focus:border-[#0a1158]"
              />
              <button
                type="button"
                disabled={aiLoading || !aiQ.trim()}
                onClick={async () => {
                  setAiLoading(true);
                  setAiError("");
                  try {
                    const res = await aiQabul(aiQ, i18n.language);
                    setAiReply(res.reply);
                    setAiLinks(res.links || []);
                  } catch (e) {
                    setAiError(e instanceof Error ? e.message : t("ai.error"));
                  } finally {
                    setAiLoading(false);
                  }
                }}
                className="h-10 px-4 rounded-xl bg-[#0a1158] text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? t("ai.thinking") : t("ai.ask")}
              </button>
            </div>
            {aiError && <p className="mt-2 text-xs text-red-600">{aiError}</p>}
            {aiReply && (
              <div className="mt-3 rounded-xl bg-white border border-[#e5e5e5] p-3">
                <p className="text-sm text-[#0a0a0a] whitespace-pre-wrap leading-relaxed">{aiReply}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {aiLinks.map((l) =>
                    l.href.startsWith("http") ? (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#0a1158] underline"
                      >
                        {l.label || l.href}
                      </a>
                    ) : (
                      <a key={l.href} href={l.href} className="text-xs font-semibold text-[#0a1158] underline">
                        {l.label || l.href}
                      </a>
                    ),
                  )}
                </div>
              </div>
            )}
          </AiPanel>
        </Reveal>

        <Reveal as="section">
          <div className="text-center mb-5 md:mb-6">
            <span className="section-eyebrow">{t("qabul.levelsEyebrow")}</span>
            <h2 className="section-title text-xl md:text-2xl mt-2">{t("qabul.levelsHeading")}</h2>
            <div className="w-12 h-px bg-accent-400 mx-auto mt-3" aria-hidden />
          </div>
          <div className="grid md:grid-cols-3 gap-3 md:gap-4 items-stretch">
            {levels.map((lvl, i) => (
              <Reveal key={lvl.key} delay={i * 60}>
                <div className="h-full page-card overflow-hidden hover:-translate-y-0.5 hover:shadow-md hover:border-primary-200 transition-all group">
                  <div className={`p-4 md:p-5 ${colorMap[lvl.color].split(" ")[0]}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${colorMap[lvl.color]}`}>
                      <i className={`${lvl.icon} text-xl`} />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground-900">{lvl.title}</h3>
                    <p className="text-sm text-foreground-600 mt-1.5 leading-relaxed">{lvl.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal as="section">
          <div className="text-center mb-5 md:mb-6">
            <span className="section-eyebrow">{t("qabul.processEyebrow")}</span>
            <h2 className="section-title text-xl md:text-2xl mt-2">{t("qabul.processHeading")}</h2>
            <div className="w-12 h-px bg-accent-400 mx-auto mt-3" aria-hidden />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 60}>
                <div className="h-full text-center p-4 page-card hover:-translate-y-0.5">
                  <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-2.5">
                    <i className={`${s.icon} text-lg`} />
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold mb-1.5">{s.step}</span>
                  <h4 className="font-heading text-sm font-semibold text-foreground-900">{s.title}</h4>
                  <p className="text-xs text-foreground-600 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* Real appointment-request form (Acceptance model) */}
        <Reveal as="section" className="page-card p-4 md:p-5 lg:p-6" id="ariza">
          <div className="text-center mb-5">
            <span className="section-eyebrow">{t("qabul.applicationEyebrow")}</span>
            <h2 className="section-title text-xl md:text-2xl mt-2">{t("qabul.applicationHeading")}</h2>
            <div className="w-12 h-px bg-accent-400 mx-auto mt-3" aria-hidden />
          </div>

          {status === "success" && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200/80 text-green-800 text-sm">{t("qabul.applicationSuccess")}</div>
          )}
          {status === "error" && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-sm">{error}</div>
          )}

          <form onSubmit={onSubmit} className="max-w-3xl mx-auto space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1">{t("qabul.fullName")} <span className="text-red-500">*</span></label>
                <input name="fish" required className="w-full h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1">{t("qabul.recipientLabel")} <span className="text-red-500">*</span></label>
                <select name="categoryId" required className="w-full h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500">
                  <option value="">{t("qabul.selectPlaceholder")}</option>
                  {leaders.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1">{t("contact.phone")} <span className="text-red-500">*</span></label>
                <input name="phone" required placeholder="+998 90 123 45 67" className="w-full h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1">{t("contact.email")} <span className="text-red-500">*</span></label>
                <input name="email" type="email" required className="w-full h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500" />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1">{t("qabul.regionLabel")} <span className="text-red-500">*</span></label>
                <select required value={regionId} onChange={(e) => setRegionId(e.target.value)} className="w-full h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500">
                  <option value="">{t("qabul.selectPlaceholder")}</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1">{t("qabul.districtLabel")} <span className="text-red-500">*</span></label>
                <select required value={districtId} onChange={(e) => setDistrictId(e.target.value)} disabled={!regionId} className="w-full h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500 disabled:opacity-50">
                  <option value="">{t("qabul.selectPlaceholder")}</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1">{t("qabul.quarterLabel")} <span className="text-red-500">*</span></label>
                <select name="quarterId" required disabled={!districtId} className="w-full h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500 disabled:opacity-50">
                  <option value="">{t("qabul.selectPlaceholder")}</option>
                  {quarters.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1">{t("qabul.dateLabel")} <span className="text-red-500">*</span></label>
              <input name="date" type="date" required className="w-full h-10 px-3 page-input !h-auto text-sm focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1">{t("qabul.subjectLabel")} <span className="text-red-500">*</span></label>
              <textarea name="subject" required rows={3} className="w-full px-3 py-2.5 page-input !h-auto text-sm focus:outline-none focus:border-primary-500 resize-y" />
            </div>
            <button type="submit" disabled={status === "loading"} className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60 transition-colors">
              {status === "loading" ? t("contact.sending") : t("admission.applyNow")}
            </button>
          </form>
        </Reveal>
      </main>
    </div>
  );
}
