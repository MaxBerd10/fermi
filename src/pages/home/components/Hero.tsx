import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHomeData } from "@/api/home";
import { getSettings } from "@/api/settings";
import type { Counter } from "@/types/content";
import { FOUNDED_YEAR } from "@/lib/siteConstants";
import { CountUp, useInViewOnce, usePrefersReducedMotion } from "@/components/Animation";

const FALLBACK_TITLE = "Farg'ona jamoat salomatligi tibbiyot instituti";

const PILLARS = [
  { icon: "ri-award-line", key: "hero.features.f1" },
  { icon: "ri-user-star-line", key: "hero.features.f2" },
  { icon: "ri-cpu-line", key: "hero.features.f3" },
  { icon: "ri-global-line", key: "hero.features.f5" },
] as const;

const QUICK_TOOLS: {
  key: string;
  icon: string;
  href: string;
  external?: boolean;
  accent?: boolean;
}[] = [
  { key: "vq", icon: "ri-chat-smile-3-line", href: "/virtual-reception/17" },
  { key: "admit", icon: "ri-file-user-line", href: "/qabul", accent: true },
  { key: "path", icon: "ri-route-line", href: "#pathfinder" },
  { key: "test", icon: "ri-questionnaire-line", href: "https://online-imtixon.uz", external: true },
  { key: "hemis", icon: "ri-dashboard-3-line", href: "http://hemis.fjsti.uz", external: true },
  { key: "contact", icon: "ri-map-pin-line", href: "/aloqa" },
];

type RadarId = "students" | "tracks" | "practice" | "partners" | "labs" | "staff";

const RADAR_NODES: {
  id: RadarId;
  icon: string;
  angle: number;
  value: number | "counter";
  suffix: string;
  labelKey: string;
  wordKey: string;
  hintKey: string;
}[] = [
  {
    id: "students",
    icon: "ri-group-line",
    angle: -20,
    value: "counter",
    suffix: "+",
    labelKey: "hero.band.stat3",
    wordKey: "hero.radar.word.students",
    hintKey: "hero.radar.hint.students",
  },
  {
    id: "tracks",
    icon: "ri-heart-pulse-line",
    angle: 40,
    value: 50,
    suffix: "+",
    labelKey: "hero.band.stat1",
    wordKey: "hero.radar.word.tracks",
    hintKey: "hero.radar.hint.tracks",
  },
  {
    id: "practice",
    icon: "ri-stethoscope-line",
    angle: 100,
    value: 100,
    suffix: "%",
    labelKey: "hero.band.stat2",
    wordKey: "hero.radar.word.practice",
    hintKey: "hero.radar.hint.practice",
  },
  {
    id: "partners",
    icon: "ri-global-line",
    angle: 160,
    value: 80,
    suffix: "+",
    labelKey: "hero.band.stat4",
    wordKey: "hero.radar.word.partners",
    hintKey: "hero.radar.hint.partners",
  },
  {
    id: "labs",
    icon: "ri-flask-line",
    angle: 220,
    value: 24,
    suffix: "+",
    labelKey: "hero.radar.label.labs",
    wordKey: "hero.radar.word.labs",
    hintKey: "hero.radar.hint.labs",
  },
  {
    id: "staff",
    icon: "ri-user-star-line",
    angle: 280,
    value: 275,
    suffix: "+",
    labelKey: "hero.strip.stat.staff",
    wordKey: "hero.radar.word.staff",
    hintKey: "hero.radar.hint.staff",
  },
];

export default function Hero() {
  const { t } = useTranslation();
  const reduced = usePrefersReducedMotion();
  const { ref, active } = useInViewOnce<HTMLDivElement>(0.1);
  const stageRef = useRef<HTMLDivElement>(null);
  const [institute, setInstitute] = useState(FALLBACK_TITLE);
  const [ready, setReady] = useState(false);
  const [counter, setCounter] = useState<Counter | null>(null);
  const [description, setDescription] = useState("");
  const [href, setHref] = useState("/institut");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<RadarId | null>("students");
  const [burstKey, setBurstKey] = useState(0);
  /** Once true — stays open until page refresh */
  const [radarExpanded, setRadarExpanded] = useState(false);
  const [radarSettled, setRadarSettled] = useState(false);
  const radarArmed = useRef(false);

  useEffect(() => {
    getHomeData()
      .then((d) => {
        setCounter(d.counter);
        const withUrl = d.videos?.find((v) => v.url);
        if (withUrl?.url) setVideoUrl(withUrl.url);
        const textSlide = d.corusel?.[0];
        if (textSlide) {
          const raw = stripHtml(textSlide.content || "").trim();
          if (raw.length > 40) {
            setDescription(raw.length > 420 ? `${raw.slice(0, 420).trim()}…` : raw);
          }
          if (textSlide.href) setHref(textSlide.href);
        }
        setReady(true);
      })
      .catch(() => setReady(true));

    getSettings().then((s) => {
      if (s.logo?.title) setInstitute(s.logo.title);
    });
  }, []);

  useEffect(() => {
    if (!description) {
      setDescription(t("hero.fallbackDescription"));
    }
  }, [description, t]);

  useEffect(() => {
    // Ignore accidental hover when the core mounts under the cursor
    const t = window.setTimeout(() => {
      radarArmed.current = true;
    }, 700);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = stageRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      if (!radarExpanded) return;
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.setProperty("--hx", x.toFixed(3));
      el.style.setProperty("--hy", y.toFixed(3));
    };
    const onLeave = () => {
      el.style.setProperty("--hx", "0");
      el.style.setProperty("--hy", "0");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, ready, radarExpanded]);

  function openRadar() {
    if (!radarArmed.current || radarExpanded) return;
    setRadarExpanded(true);
    window.setTimeout(() => setRadarSettled(true), 2300);
  }

  const isExternal = href.startsWith("http");
  const students = Number(counter?.students) || 6238;

  const resolveValue = (v: number | "counter") => (v === "counter" ? students : v);

  const current = RADAR_NODES.find((n) => n.id === activeNode) ?? RADAR_NODES[0];

  function selectNode(id: RadarId) {
    setActiveNode(id);
    setBurstKey((k) => k + 1);
  }

  const bandStats = [
    { value: 50, suffix: "+", icon: "ri-heart-add-line", label: t("hero.band.stat1") },
    { value: 100, suffix: "%", icon: "ri-checkbox-circle-line", label: t("hero.band.stat2") },
    { value: students, suffix: "+", icon: "ri-group-line", label: t("hero.band.stat3") },
    { value: 80, suffix: "+", icon: "ri-building-line", label: t("hero.band.stat4") },
  ];

  return (
    <div ref={ref} className="bg-transparent">
      <section className={`hero-v2 relative overflow-hidden ${ready ? "is-ready" : ""}`}>
        <div className="hero-v2__glow" aria-hidden />
        <div className="hero-v2__grid" aria-hidden />

        <div className="relative z-10 section-container pt-6 pb-8 sm:pt-8 sm:pb-10 md:pt-12 md:pb-14">
          <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-5 hero-v2__copy">
              <p className="hero-v2__badge">
                <span className="hero-v2__badge-dot" aria-hidden />
                <span className="hero-v2__badge-short">FerMI</span>
                <span className="hero-v2__badge-sep" aria-hidden>
                  ·
                </span>
                <span className="hero-v2__badge-full">{t("hero.badgeFull")}</span>
              </p>

              <h1 className="mt-4 font-heading text-[clamp(1.85rem,3.6vw,3rem)] font-extrabold text-[#0a0a0a] leading-[1.08] tracking-tight">
                {t("hero.headlineBefore")}{" "}
                <span className="hero-v2__accent">{t("hero.headlineAccent")}</span>{" "}
                {t("hero.headlineAfter")}
              </h1>

              <p className="mt-4 text-sm md:text-[0.98rem] text-[#333333] leading-relaxed max-w-xl">
                {description || t("hero.fallbackDescription")}
              </p>
              <p className="sr-only">{institute}</p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="hero-v2__btn-primary"
                >
                  {t("footer.institutHaqida")}
                  <i className="ri-arrow-right-line" />
                </a>
                <Link to="/qabul" className="hero-v2__btn-ghost">
                  {t("hero.band.cta")}
                  <i className="ri-arrow-right-line" />
                </Link>
                <button
                  type="button"
                  onClick={() => videoUrl && setVideoOpen(true)}
                  disabled={!videoUrl}
                  className="hero-v2__btn-text disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <i className="ri-play-circle-line text-lg" />
                  {t("about.watchVideo")}
                </button>
                <button
                  type="button"
                  disabled
                  title={t("hero.virtualTourSoon")}
                  aria-label={`${t("hero.virtualTour")} — ${t("hero.virtualTourSoon")}`}
                  className="hero-v2__btn-text disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <i className="ri-walking-line text-lg" aria-hidden />
                  {t("hero.virtualTour")}
                </button>
              </div>

              <ul className="mt-6 flex flex-wrap gap-2">
                {PILLARS.map((p, i) => (
                  <li key={p.key} className="hero-v2__pill" style={{ animationDelay: `${0.35 + i * 0.08}s` }}>
                    <i className={`${p.icon} text-[#0a1158]`} aria-hidden />
                    <span>{t(p.key)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive radar — no photo */}
            <div className="lg:col-span-7">
              <div
                ref={stageRef}
                className={`hero-radar ${activeNode ? "is-open" : ""} ${
                  radarExpanded ? "is-expanded" : "is-packed"
                } ${radarExpanded && !radarSettled ? "is-opening" : ""} ${radarSettled ? "is-settled" : ""}`}
                style={{ ["--hx" as string]: 0, ["--hy" as string]: 0 }}
              >
                <div className="hero-radar__orb hero-radar__orb--a" aria-hidden />
                <div className="hero-radar__orb hero-radar__orb--b" aria-hidden />

                {/* Corner + side fillers */}
                <aside className="hero-radar__corner hero-radar__corner--tl">
                  <span className="hero-radar__corner-icon">
                    <i className="ri-shield-check-line" aria-hidden />
                  </span>
                  <div>
                    <p className="hero-radar__corner-kicker">{t("hero.corner.acc.kicker")}</p>
                    <p className="hero-radar__corner-title">{t("hero.strip.badge.accreditation")}</p>
                  </div>
                  <span className="hero-radar__live" aria-hidden />
                </aside>

                <aside className="hero-radar__corner hero-radar__corner--tr">
                  <p className="hero-radar__corner-kicker">{t("hero.foundedBadge")}</p>
                  <p className="hero-radar__corner-year">{FOUNDED_YEAR}</p>
                  <p className="hero-radar__corner-note">{t("hero.corner.year.note")}</p>
                </aside>

                <aside className="hero-radar__corner hero-radar__corner--bl">
                  <div className="hero-radar__mini-ecg" aria-hidden>
                    <svg viewBox="0 0 120 28" preserveAspectRatio="none">
                      <path
                        className="hero-ecg"
                        d="M0,16 L18,16 L26,16 L32,6 L38,24 L44,16 L70,16 L76,16 L82,8 L88,22 L94,16 L120,16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p className="hero-radar__corner-title">{t("hero.corner.ecg.title")}</p>
                  <p className="hero-radar__corner-note">{t("hero.corner.ecg.note")}</p>
                </aside>

                <Link to="/virtual-reception/17" className="hero-radar__corner hero-radar__corner--br is-link">
                  <span className="hero-radar__corner-icon">
                    <i className="ri-chat-smile-3-line" aria-hidden />
                  </span>
                  <div>
                    <p className="hero-radar__corner-kicker">{t("hero.corner.vq.kicker")}</p>
                    <p className="hero-radar__corner-title">{t("hero.tools.vq.title")}</p>
                    <p className="hero-radar__corner-note">{t("hero.corner.vq.note")}</p>
                  </div>
                  <span className="hero-radar__corner-go" aria-hidden>
                    <i className="ri-arrow-right-up-line" />
                  </span>
                </Link>

                <a href="tel:+998950622345" className="hero-radar__side hero-radar__side--ml is-link">
                  <i className="ri-phone-line" aria-hidden />
                  <span>
                    <strong>{t("hero.corner.call.title")}</strong>
                    <em>+998 95 062 23 45</em>
                  </span>
                </a>

                <a
                  href="https://online-imtixon.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-radar__side hero-radar__side--mr is-link"
                >
                  <i className="ri-questionnaire-line" aria-hidden />
                  <span>
                    <strong>{t("hero.tools.test.title")}</strong>
                    <em>{t("hero.corner.test.note")}</em>
                  </span>
                </a>

                <Link to="/qabul" className="hero-radar__side hero-radar__side--tm is-link">
                  <i className="ri-calendar-check-line" aria-hidden />
                  <span>
                    <strong>{t("hero.tools.admit.title")}</strong>
                    <em>{t("hero.corner.admit.note")}</em>
                  </span>
                </Link>

                <a href="#pathfinder" className="hero-radar__side hero-radar__side--bm is-link">
                  <i className="ri-route-line" aria-hidden />
                  <span>
                    <strong>{t("hero.tools.path.title")}</strong>
                    <em>{t("hero.corner.path.note")}</em>
                  </span>
                </a>

                <div className="hero-radar__ring hero-radar__ring--outer" aria-hidden />
                <div className="hero-radar__ring hero-radar__ring--mid" aria-hidden />
                <div className="hero-radar__ring hero-radar__ring--inner" aria-hidden />

                <svg className="hero-radar__arcs" viewBox="0 0 400 400" aria-hidden>
                  <circle cx="200" cy="200" r="118" fill="none" stroke="rgba(10,17,88,0.08)" strokeWidth="1" strokeDasharray="4 8" />
                  <circle cx="200" cy="200" r="78" fill="none" stroke="rgba(10,17,88,0.1)" strokeWidth="1" />
                  <path
                    className="hero-radar__scan"
                    d="M200,200 L200,82 A118,118 0 0 1 310,160 Z"
                    fill="rgba(10,17,88,0.04)"
                  />
                  <path
                    className="hero-ecg hero-radar__ecg"
                    d="M70,210 L110,210 L122,210 L132,178 L142,242 L152,210 L210,210 L222,210 L232,188 L242,228 L252,210 L330,210"
                    fill="none"
                    stroke="rgba(10,17,88,0.35)"
                    strokeWidth="1.4"
                  />
                </svg>

                <span key={burstKey} className="hero-radar__burst" aria-hidden />

                {/* Center core — expands with words */}
                <div
                  className={`hero-radar__core is-active ${radarExpanded ? "" : "is-trigger"}`}
                  aria-live="polite"
                  role={radarExpanded ? undefined : "button"}
                  tabIndex={radarExpanded ? undefined : 0}
                  aria-label={radarExpanded ? undefined : `${t(current.wordKey)} ${resolveValue(current.value)}${current.suffix}`}
                  onMouseEnter={() => {
                    if (!radarExpanded) openRadar();
                  }}
                  onMouseMove={() => {
                    if (!radarExpanded) openRadar();
                  }}
                  onFocus={() => {
                    if (!radarExpanded) openRadar();
                  }}
                  onClick={() => {
                    if (!radarExpanded) openRadar();
                  }}
                  onKeyDown={(e) => {
                    if (!radarExpanded && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      openRadar();
                    }
                  }}
                >
                  <div className="hero-radar__core-inner">
                    <p className="hero-radar__word">{t(current.wordKey)}</p>
                    <p className="hero-radar__value">
                      <CountUp
                        key={current.id}
                        target={resolveValue(current.value)}
                        active={active || ready}
                      />
                      {current.suffix}
                    </p>
                    <p className="hero-radar__label">{t(current.labelKey)}</p>
                    <p className="hero-radar__hint">{t(current.hintKey)}</p>
                  </div>
                </div>
                {!radarExpanded && <span className="hero-radar__glow" aria-hidden />}

                {/* Orbit nodes */}
                {RADAR_NODES.map((node, i) => {
                  const val = resolveValue(node.value);
                  const isOn = activeNode === node.id;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={`hero-radar__node ${isOn ? "is-on" : ""} ${activeNode && !isOn ? "is-dim" : ""}`}
                      style={{
                        ["--na" as string]: `${node.angle}deg`,
                        ["--ni" as string]: i,
                      }}
                      onClick={() => selectNode(node.id)}
                      aria-pressed={isOn}
                      aria-label={`${t(node.labelKey)}: ${val}${node.suffix}`}
                    >
                      <span className="hero-radar__node-ring" aria-hidden />
                      <span className="hero-radar__node-face">
                        <i className={node.icon} aria-hidden />
                        <strong>
                          {val}
                          {node.suffix}
                        </strong>
                        <em>{t(node.labelKey)}</em>
                      </span>
                      <span className={`hero-radar__pop ${isOn ? "is-show" : ""} ${node.angle > 90 && node.angle < 270 ? "is-up" : ""}`}>
                        <span className="hero-radar__pop-word">{t(node.wordKey)}</span>
                        <span className="hero-radar__pop-hint">{t(node.hintKey)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile / tablet — useful links when corners hide */}
              <div className="hero-mobile-links lg:hidden">
                <Link to="/virtual-reception/17" className="hero-mobile-links__item is-accent">
                  <i className="ri-chat-smile-3-line" aria-hidden />
                  <span>{t("hero.tools.vq.title")}</span>
                </Link>
                <a href="tel:+998950622345" className="hero-mobile-links__item">
                  <i className="ri-phone-line" aria-hidden />
                  <span>{t("hero.corner.call.title")}</span>
                </a>
                <Link to="/qabul" className="hero-mobile-links__item">
                  <i className="ri-file-user-line" aria-hidden />
                  <span>{t("hero.tools.admit.title")}</span>
                </Link>
                <a href="#pathfinder" className="hero-mobile-links__item">
                  <i className="ri-route-line" aria-hidden />
                  <span>{t("hero.tools.path.title")}</span>
                </a>
                <a
                  href="https://online-imtixon.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-mobile-links__item"
                >
                  <i className="ri-questionnaire-line" aria-hidden />
                  <span>{t("hero.tools.test.title")}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-2 pb-5 md:pb-6">
        <div className="section-container">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#0a1158]">
                {t("hero.tools.eyebrow")}
              </p>
              <h2 className="font-heading text-base md:text-lg font-bold text-[#0a0a0a] tracking-tight">
                {t("hero.tools.heading")}
              </h2>
            </div>
            <p className="text-xs text-[#555555] max-w-sm">{t("hero.tools.sub")}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
            {QUICK_TOOLS.map((tool, i) => {
              const inner = (
                <>
                  <span className={`hero-tool__icon ${tool.accent ? "is-accent" : ""}`}>
                    <i className={tool.icon} aria-hidden />
                  </span>
                  <span className="hero-tool__body">
                    <span className="hero-tool__title">{t(`hero.tools.${tool.key}.title`)}</span>
                    <span className="hero-tool__desc">{t(`hero.tools.${tool.key}.desc`)}</span>
                  </span>
                  <span className="hero-tool__go" aria-hidden>
                    <i className={tool.external ? "ri-external-link-line" : "ri-arrow-right-up-line"} />
                  </span>
                  <span className="hero-tool__shine" aria-hidden />
                </>
              );

              const cls = `hero-tool ${tool.accent ? "is-accent" : ""}`;
              const style = { animationDelay: `${0.08 + i * 0.05}s` };

              if (tool.external) {
                return (
                  <a
                    key={tool.key}
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                    style={style}
                  >
                    {inner}
                  </a>
                );
              }

              if (tool.href.startsWith("#")) {
                return (
                  <a key={tool.key} href={tool.href} className={cls} style={style}>
                    {inner}
                  </a>
                );
              }

              return (
                <Link key={tool.key} to={tool.href} className={cls} style={style}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hero-v2__band">
        <div className="section-container py-6 md:py-7">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-5">
              <h2 className="font-heading text-xl md:text-2xl font-bold text-white leading-tight">
                {t("hero.band.title")}
              </h2>
              <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-md">{t("hero.band.sub")}</p>
              <Link to="/qabul" className="hero-v2__band-cta">
                {t("hero.band.cta")}
                <i className="ri-arrow-right-line" />
              </Link>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {bandStats.map((s) => (
                <div key={s.label} className="hero-v2__stat">
                  <span className="inline-flex w-8 h-8 rounded-lg bg-[#ffd600]/15 text-[#ffd600] items-center justify-center mb-2">
                    <i className={`${s.icon} text-base`} aria-hidden />
                  </span>
                  <p className="font-heading text-xl md:text-2xl font-bold tabular-nums leading-none text-white">
                    <CountUp target={s.value} active={active} />
                    {s.suffix}
                  </p>
                  <p className="mt-1 text-[10px] md:text-[11px] font-semibold text-white/65 leading-snug">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {videoOpen && videoUrl && (
        <div
          className="fixed inset-0 z-[100] bg-[#0a1158]/90 flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="bg-[#0a1158] overflow-hidden max-w-4xl w-full aspect-video relative border border-white/15 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setVideoOpen(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/10 text-white cursor-pointer"
              aria-label="Close"
            >
              <i className="ri-close-line text-2xl" />
            </button>
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoUrl}?autoplay=1`}
              title={t("about.videoTitle")}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
