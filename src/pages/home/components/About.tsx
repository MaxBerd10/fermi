import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHomeData } from "@/api/home";
import type { About as AboutData } from "@/types/content";
import { stripHtml } from "@/lib/html";
import { FOUNDED_YEAR } from "@/lib/siteConstants";
import { Reveal } from "@/components/Animation";
import { CAMPUS_PHOTOS, pickSafeImage } from "@/lib/mediaFilter";

const FALLBACK_IMG = CAMPUS_PHOTOS[0].img;

const HIGHLIGHTS = [
  { key: "acc" },
  { key: "lab" },
  { key: "int" },
] as const;

export default function About() {
  const { t } = useTranslation();
  const [videoOpen, setVideoOpen] = useState(false);
  const [about, setAbout] = useState<AboutData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    getHomeData().then((d) => {
      setAbout(d.about);
      const withUrl = d.videos.find((v) => v.url);
      if (withUrl) setVideoUrl(withUrl.url);
    });
  }, []);

  if (!about) return null;

  const fullText = stripHtml(about.content);
  const maxLen = 720;
  const description = fullText.slice(0, maxLen);
  const mission = t("about.missionNote");

  const highlightLabels = [
    t("stats.badgeAccreditation"),
    t("whyUs.item2.title"),
    t("hero.features.f5"),
  ];

  const photo = imgFailed
    ? FALLBACK_IMG
    : pickSafeImage(about.img, about.title, FALLBACK_IMG);

  return (
    <section className="py-5 md:py-6 bg-transparent overflow-hidden border-t border-[#e5e5e5]/60">
      <div className="section-container relative z-10 grid lg:grid-cols-12 gap-5 lg:gap-8 lg:items-stretch">
        <Reveal variant="left" className="lg:col-span-5 flex flex-col justify-start">
          <p className="section-eyebrow !mb-1.5">{t("footer.institutHaqida")}</p>
          <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0a0a0a] tracking-tight !leading-snug">
            {about.title}
          </h2>
          <p className="mt-3 text-sm md:text-[0.9375rem] text-foreground-600 leading-relaxed">
            {description}
            {fullText.length > maxLen ? "…" : ""}
          </p>
          <p className="mt-3 text-sm text-foreground-700 leading-relaxed">
            {mission}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {HIGHLIGHTS.map((h, i) => (
              <div key={h.key} className="border-l border-primary-200 pl-2.5">
                <p className="text-[0.75rem] font-semibold text-foreground-800 leading-snug">
                  {highlightLabels[i]}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to={`/about/${about.slug}`} className="uni-btn cursor-pointer">
              {t("about.readMore")}
              <i className="ri-arrow-right-line" />
            </Link>
            {videoUrl && (
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                className="uni-link cursor-pointer !text-primary-800"
              >
                <i className="ri-play-circle-line text-base" />
                {t("about.watchVideo")}
              </button>
            )}
          </div>
        </Reveal>

        <Reveal delay={80} variant="right" className="lg:col-span-7 w-full h-full min-h-[280px] sm:min-h-[320px]">
          <div className="relative w-full h-full min-h-[280px] sm:min-h-[320px] overflow-hidden border border-primary-100 rounded-2xl shadow-[0_12px_36px_rgba(10,17,88,0.08)]">
            <img
              src={photo}
              alt={about.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={() => setImgFailed(true)}
            />
            <div className="absolute left-0 bottom-0 bg-primary-950 px-4 py-2.5 flex items-baseline gap-2">
              <span className="font-heading text-base font-semibold text-secondary-400">{FOUNDED_YEAR}</span>
              <span className="text-[0.65rem] uppercase tracking-[0.14em] text-white/70">
                {t("about.foundedYear")}
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {videoOpen && videoUrl && (
        <div className="fixed inset-0 z-[100] bg-primary-950/90 flex items-center justify-center p-4" onClick={() => setVideoOpen(false)}>
          <div className="bg-primary-950 overflow-hidden max-w-4xl w-full aspect-video relative border border-white/15" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setVideoOpen(false)} className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/10 text-white cursor-pointer" aria-label="Close">
              <i className="ri-close-line text-2xl" />
            </button>
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoUrl}?autoplay=1`} title={t("about.videoTitle")} allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        </div>
      )}
    </section>
  );
}
