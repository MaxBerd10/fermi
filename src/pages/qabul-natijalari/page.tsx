import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHeader from "@/components/shared/PageHeader";
import { Reveal } from "@/components/Animation";
import { usePageMeta } from "@/hooks/usePageMeta";

type Language = "uz" | "ru" | "en";

type ResultFile = {
  title: Record<Language, string>;
  language: "uz" | "ru" | "other";
  file: string;
};

type ResultGroup = {
  title: Record<Language, string>;
  icon: string;
  files: ResultFile[];
};

const pdf = (name: string) => `/documents/admission-results/${name}`;

const resultGroups: ResultGroup[] = [
  {
    title: { uz: "Farmatsiya", ru: "Фармация", en: "Pharmacy" },
    icon: "ri-capsule-line",
    files: [
      { title: { uz: "O‘zbek tili", ru: "Узбекский язык", en: "Uzbek language" }, language: "uz", file: pdf("farmatsiya-uzbek.pdf") },
      { title: { uz: "Rus tili", ru: "Русский язык", en: "Russian language" }, language: "ru", file: pdf("farmatsiya-rus.pdf") },
      { title: { uz: "Qo‘shimcha qaydnoma", ru: "Дополнительная ведомость", en: "Additional record" }, language: "other", file: pdf("farmatsiya-qoshimcha.pdf") },
    ],
  },
  {
    title: { uz: "Stomatologiya", ru: "Стоматология", en: "Dentistry" },
    icon: "ri-heart-pulse-line",
    files: [
      { title: { uz: "O‘zbek tili", ru: "Узбекский язык", en: "Uzbek language" }, language: "uz", file: pdf("stomatologiya-uzbek.pdf") },
      { title: { uz: "Rus tili", ru: "Русский язык", en: "Russian language" }, language: "ru", file: pdf("stomatologiya-rus.pdf") },
      { title: { uz: "Qo‘shimcha qaydnoma", ru: "Дополнительная ведомость", en: "Additional record" }, language: "other", file: pdf("stomatologiya-qoshimcha.pdf") },
    ],
  },
  {
    title: { uz: "Pediatriya", ru: "Педиатрия", en: "Pediatrics" },
    icon: "ri-parent-line",
    files: [
      { title: { uz: "O‘zbek tili", ru: "Узбекский язык", en: "Uzbek language" }, language: "uz", file: pdf("pediatriya-uzbek.pdf") },
      { title: { uz: "Rus tili", ru: "Русский язык", en: "Russian language" }, language: "ru", file: pdf("pediatriya-rus.pdf") },
      { title: { uz: "Pediatriya ishi", ru: "Педиатрическое дело", en: "Pediatric practice" }, language: "other", file: pdf("pediatriya-ishi.pdf") },
    ],
  },
  {
    title: { uz: "Davolash ishi", ru: "Лечебное дело", en: "General medicine" },
    icon: "ri-stethoscope-line",
    files: [
      { title: { uz: "O‘zbek tili", ru: "Узбекский язык", en: "Uzbek language" }, language: "uz", file: pdf("davolash-ishi-uzbek.pdf") },
      { title: { uz: "Rus tili", ru: "Русский язык", en: "Russian language" }, language: "ru", file: pdf("davolash-ishi-rus.pdf") },
      { title: { uz: "Qo‘shimcha qaydnoma", ru: "Дополнительная ведомость", en: "Additional record" }, language: "other", file: pdf("davolash-ishi-qoshimcha.pdf") },
    ],
  },
  {
    title: { uz: "Davolash", ru: "Лечебное направление", en: "Medicine" },
    icon: "ri-hospital-line",
    files: [
      { title: { uz: "O‘zbek tili", ru: "Узбекский язык", en: "Uzbek language" }, language: "uz", file: pdf("davolash-uzbek.pdf") },
      { title: { uz: "Rus tili", ru: "Русский язык", en: "Russian language" }, language: "ru", file: pdf("davolash-rus.pdf") },
    ],
  },
  {
    title: { uz: "Tibbiy profilaktika ishi", ru: "Медико-профилактическое дело", en: "Medical prevention" },
    icon: "ri-shield-cross-line",
    files: [
      { title: { uz: "O‘zbek tili", ru: "Узбекский язык", en: "Uzbek language" }, language: "uz", file: pdf("tibbiy-profilaktika-ishi-uzbek.pdf") },
    ],
  },
];

const text: Record<Language, Record<string, string>> = {
  uz: {
    title: "Test natijalari 2026/2027",
    description: "Tasdiqlangan elektron qaydnomalarni yo‘nalish va ta’lim tili bo‘yicha oching.",
    notice: "Xurmatli talabgorlar!",
    noticeBody: "2026/2027-o‘quv yili uchun o‘tkazilgan test sinovlarining tasdiqlangan natijalari e’lon qilinadi.",
    recommendation: "100 va undan yuqori ball to‘plagan talabgorlar talabalikka tavsiya etiladi.",
    count: "rasmiy PDF hujjat",
    open: "PDF-ni ochish",
    download: "Yuklab olish",
    privacy: "Hujjatlardan faqat shaxsiy natijangizni tekshirish maqsadida foydalaning.",
    back: "Qabul sahifasiga qaytish",
  },
  ru: {
    title: "Результаты тестирования 2026/2027",
    description: "Откройте утверждённые электронные ведомости по направлению и языку обучения.",
    notice: "Уважаемые абитуриенты!",
    noticeBody: "Публикуются утверждённые результаты тестовых испытаний на 2026/2027 учебный год.",
    recommendation: "Абитуриенты, набравшие 100 и более баллов, рекомендуются к зачислению.",
    count: "официальных PDF-документов",
    open: "Открыть PDF",
    download: "Скачать",
    privacy: "Используйте документы только для проверки собственного результата.",
    back: "Вернуться к приёму",
  },
  en: {
    title: "Test results 2026/2027",
    description: "Open the approved electronic records by programme and language of instruction.",
    notice: "Dear applicants!",
    noticeBody: "Approved results of the 2026/2027 academic-year test examinations are published here.",
    recommendation: "Applicants with 100 points or more are recommended for admission.",
    count: "official PDF documents",
    open: "Open PDF",
    download: "Download",
    privacy: "Use the documents only to verify your own result.",
    back: "Back to admissions",
  },
};

function languageBadge(language: ResultFile["language"], locale: Language) {
  if (language === "uz") return locale === "ru" ? "UZ" : locale === "en" ? "UZ" : "O‘Z";
  if (language === "ru") return "RU";
  return locale === "ru" ? "PDF" : "PDF";
}

export default function QabulNatijalariPage() {
  const { i18n } = useTranslation();
  const locale = (i18n.language?.slice(0, 2) as Language) || "uz";
  const safeLocale: Language = locale in text ? locale : "uz";
  const copy = text[safeLocale];
  const fileCount = useMemo(() => resultGroups.reduce((count, group) => count + group.files.length, 0), []);

  usePageMeta(copy.title);

  return (
    <div className="text-foreground-950">
      <PageHeader title={copy.title} breadcrumb={copy.title} description={copy.description} />

      <main className="section-container section-pad space-y-7 md:space-y-9">
        <Reveal>
          <section className="relative overflow-hidden rounded-[1.5rem] bg-[#0a1158] px-5 py-6 text-white shadow-[0_18px_50px_rgba(10,17,88,0.18)] sm:px-7 sm:py-7">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,214,0,0.27),transparent_58%)]" aria-hidden />
            <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase text-[#ffd600]">
                  <i className="ri-verified-badge-line text-base" />
                  {copy.notice}
                </div>
                <p className="text-lg font-semibold leading-relaxed sm:text-xl">{copy.noticeBody}</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">{copy.recommendation}</p>
              </div>
              <div className="inline-flex items-center gap-3 self-start rounded-2xl border border-white/15 bg-white/10 px-4 py-3 lg:self-auto">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd600] text-[#0a1158]">
                  <i className="ri-file-list-3-line text-xl" />
                </span>
                <span className="text-sm font-semibold leading-tight">{fileCount} {copy.count}</span>
              </div>
            </div>
          </section>
        </Reveal>

        <section aria-label={copy.title}>
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <span className="section-eyebrow">2026/2027</span>
              <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-[#0a0a0a] sm:text-2xl">{copy.title}</h2>
            </div>
            <p className="text-sm text-foreground-500">{copy.privacy}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resultGroups.map((group, index) => (
              <Reveal key={group.title.uz} delay={index * 45}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e4e7f1] bg-white shadow-[0_8px_24px_rgba(20,32,86,0.05)] transition-shadow hover:shadow-[0_14px_30px_rgba(20,32,86,0.10)]">
                  <header className="flex items-center gap-3 border-b border-[#eef0f5] bg-[#f8f9fd] px-4 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9edfb] text-lg text-[#0a1158]">
                      <i className={group.icon} />
                    </span>
                    <h3 className="font-heading text-base font-bold text-[#101010]">{group.title[safeLocale]}</h3>
                  </header>
                  <div className="divide-y divide-[#eef0f5]">
                    {group.files.map((item) => (
                      <div key={item.file} className="flex items-center gap-3 px-4 py-3">
                        <span className={`inline-flex min-w-9 justify-center rounded-md px-2 py-1 text-[10px] font-extrabold tracking-wide ${item.language === "ru" ? "bg-[#f3efff] text-[#5b35a4]" : item.language === "uz" ? "bg-[#eaf7ef] text-[#23744c]" : "bg-[#fff7de] text-[#8a6200]"}`}>
                          {languageBadge(item.language, safeLocale)}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-[#343434]">{item.title[safeLocale]}</span>
                        <a
                          href={item.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-[#0a1158] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#060a3d] focus:outline-none focus:ring-2 focus:ring-[#ffd600] focus:ring-offset-2"
                        >
                          <i className="ri-external-link-line" />
                          {copy.open}
                        </a>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="flex justify-center pt-1">
          <Link to="/qabul" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dfe3ee] bg-white px-5 text-sm font-semibold text-[#0a1158] transition-colors hover:border-[#0a1158] hover:bg-[#f6f7fc]">
            <i className="ri-arrow-left-line" />
            {copy.back}
          </Link>
        </div>
      </main>
    </div>
  );
}
