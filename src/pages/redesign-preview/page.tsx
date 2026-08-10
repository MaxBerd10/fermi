import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getHomeData } from "@/api/home";
import { getSettings } from "@/api/settings";
import { getLeaders } from "@/api/leaders";
import { stripHtml } from "@/lib/html";
import { formatShortDate, formatLongDate } from "@/lib/date";
import { events, partners } from "@/mocks/homeData";
import type { CoruselSlide, Leader, SiteSettings, Counter, About, FacultyListItem, NewsArticle } from "@/types/content";

/**
 * DESIGN CONCEPT PREVIEW — not linked from real navigation, not the live
 * homepage. Lives at /yangi-dizayn so the client can compare it side by
 * side with the current site before we decide whether to roll any of it
 * into the real components. Self-contained styling (no shared Tailwind
 * config changes) so nothing here can affect the live pages.
 *
 * The live site now uses shared Animation (`@/components/Animation`) and
 * design tokens from global.css; this preview remains for historical
 * comparison only — do not delete the page.
 *
 * This pass covers the client's full-homepage feedback round: dropping the
 * floating quick-services panel (folded into the footer instead), a
 * featured+list news layout, a horizontal events strip, a masonry gallery
 * with lightbox, a marquee partners band, a glass-card contact section, a
 * new "why choose us" section, and a proper multi-column footer. Testimonial
 * quotes were deliberately left out — we don't have real student quotes or
 * photos yet, and inventing them would misrepresent real people.
 */

const LOGO_IMG = "/images/logo.png";

const RECTOR_HIGHLIGHTS = [
  "2009-yilda Sankt-Peterburg pediatriya tibbiyot universitetini tamomlagan",
  "33 yoshida Farg'ona jamoat salomatligi tibbiyot instituti rektori etib tayinlangan",
  "100 dan ortiq ilmiy ish muallifi, YUNESKO tarkibidagi akademiya professori",
];

const WHY_US = [
  { icon: "ri-global-line", title: "Xalqaro akkreditatsiya", desc: "Xalqaro standartlarga javob beruvchi o'quv dasturlari va hamkorlik shartnomalari." },
  { icon: "ri-flask-line", title: "Zamonaviy laboratoriyalar", desc: "Amaliy ko'nikmalarni real jihozlarda mustahkamlash imkoniyati." },
  { icon: "ri-user-star-line", title: "Malakali professor-o'qituvchilar", desc: "Ilmiy daraja va amaliy tajribaga ega mutaxassislar jamoasi." },
  { icon: "ri-stethoscope-line", title: "Amaliy klinik ta'lim", desc: "Simulyatsiya markazi va klinik bazalarda real amaliyot." },
];

function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

function StatFigure({ value, label, active, delay }: { value: number; label: string; active: boolean; delay: number }) {
  const val = useCountUp(value, active);
  return (
    <Reveal delay={delay} className="py-7 md:py-0 md:px-8 first:pl-0 first:pt-0">
      <div className="font-heading text-4xl md:text-6xl text-[#12182a] tabular-nums">
        {val.toLocaleString("uz")}
        <span className="text-[#c9a04e]">+</span>
      </div>
      <p className="mt-3 text-sm text-[#5b6270] leading-snug max-w-[180px]">{label}</p>
    </Reveal>
  );
}

function newsHref(article: NewsArticle) {
  return `/detail/${article.slug}?menuId=71`;
}

function isNewArticle(iso: string) {
  return Date.now() - new Date(iso).getTime() < 3 * 24 * 60 * 60 * 1000;
}

function formatViews(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function RedesignPreviewPage() {
  const [slides, setSlides] = useState<CoruselSlide[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [rector, setRector] = useState<Leader | null>(null);
  const [prorectors, setProrectors] = useState<Leader[]>([]);
  const [counter, setCounter] = useState<Counter | null>(null);
  const [about, setAbout] = useState<About | null>(null);
  const [faculties, setFaculties] = useState<FacultyListItem[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [images, setImages] = useState<{ id: number; img: string }[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsActive, setStatsActive] = useState(false);

  useEffect(() => {
    Promise.all([
      getHomeData(),
      getSettings(),
      getLeaders("rektor", 35),
      getLeaders("prorektorlar", 35),
    ]).then(([home, s, rectorRes, proRes]) => {
      setSlides(home.corusel);
      setSettings(s);
      setCounter(home.counter);
      setAbout(home.about);
      setFaculties(home.faculties);
      setNews(home.news);
      setImages(home.images);
      setRector(rectorRes.leaders[0] ?? null);
      setProrectors(proRes.leaders.filter((l) => l.name !== "VAKANT").slice(0, 2));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(statsRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroImg = slides[0]?.img;
  const instituteName = settings?.logo?.title || "Farg'ona jamoat salomatligi tibbiyot instituti";

  const stats = counter
    ? [
        { value: counter.professor_teachers, label: "Professor-o'qituvchilar" },
        { value: counter.students, label: "Talabalar" },
        { value: counter.graduaters, label: "Bitiruvchilar" },
        { value: counter.book_fund, label: "Kutubxona fondi" },
      ]
    : [];

  const aboutDescription = about ? stripHtml(about.content).slice(0, 380) : "";
  const featuredNews = news[0];
  const secondaryNews = news.slice(1, 5);

  return (
    <div className="min-h-screen bg-[#f3f1ec] font-['Inter'] text-[#12182a]">
      {/* Preview banner */}
      <div className="bg-[#c9a04e] text-[#12182a] text-center text-xs md:text-sm font-semibold py-2 px-4 sticky top-0 z-[100]">
        Bu — dizayn taklifi (preview). Real saytga hech qanday ta'sir qilmaydi. {" "}
        <Link to="/" className="underline underline-offset-2">Asl saytga qaytish</Link>
      </div>

      {/* Minimal new-language nav — shrinks and gains a stronger backdrop on scroll */}
      <header
        className={`sticky top-[33px] md:top-[29px] z-50 bg-[#080b14]/90 backdrop-blur-md border-b border-white/10 transition-all duration-300 ${scrolled ? "shadow-[0_8px_30px_rgba(0,0,0,0.3)]" : ""}`}
      >
        <div className={`max-w-[1400px] mx-auto px-5 md:px-10 flex items-center justify-between transition-all duration-300 ${scrolled ? "h-[60px]" : "h-[76px]"}`}>
          <div className="flex items-center gap-3">
            <img src={LOGO_IMG} alt="" className="w-10 h-10 object-contain rounded-md bg-white/95 p-1" />
            <span className="font-heading text-lg text-[#f7f6f3] tracking-tight">FJSTI</span>
          </div>
          <nav className="hidden md:flex items-center gap-9 text-[13px] uppercase tracking-[0.14em] text-[#cfd3dd]">
            <span className="hover:text-white transition-colors cursor-pointer">Institut</span>
            <span className="hover:text-white transition-colors cursor-pointer">Rahbariyat</span>
            <span className="hover:text-white transition-colors cursor-pointer">Fakultetlar</span>
            <span className="hover:text-white transition-colors cursor-pointer">Qabul</span>
          </nav>
          <Link
            to="/qabul"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#1c9c8e] hover:bg-[#17877b] text-white text-[13px] font-semibold tracking-wide transition-colors"
          >
            Qabul-2026
          </Link>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative w-full min-h-[92vh] flex items-end overflow-hidden bg-[#080b14]">
        {heroImg && (
          <img
            src={heroImg}
            alt={instituteName}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1400ms] ease-out ${loaded ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050710] via-[#080b14]/70 to-[#080b14]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050710]/95 via-[#080b14]/40 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "3px 3px" }}
        />

        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-5 md:px-10 pb-20 md:pb-28 pt-40">
          <div className={`transition-all duration-1000 ease-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-px bg-[#c9a04e]" />
              <span className="text-[#c9a04e] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">
                Farg'ona &middot; 2020-yildan buyon
              </span>
            </div>
            <h1 className="font-heading font-semibold text-[13vw] leading-[0.95] sm:text-6xl md:text-7xl lg:text-[5.5rem] text-[#f7f6f3] tracking-tight max-w-4xl">
              Jamoat salomatligi kelajagini shu yerda quramiz
            </h1>
            <p className="mt-7 text-base md:text-lg text-[#cfd3dd] max-w-xl leading-relaxed">
              {instituteName} — zamonaviy laboratoriyalar, xalqaro akkreditatsiya va yetakchi mutaxassislar bilan tibbiyot ta'limining yangi standarti.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/qabul"
                className="inline-flex items-center gap-2 h-13 px-7 py-3.5 rounded-full bg-[#1c9c8e] hover:bg-[#17877b] text-white text-sm font-semibold tracking-wide transition-colors"
              >
                Qabul-2026 haqida
                <i className="ri-arrow-right-line" />
              </Link>
              <Link
                to="/institut"
                className="inline-flex items-center gap-2 h-13 px-7 py-3.5 rounded-full border border-white/25 hover:border-white/50 hover:bg-white/5 text-white text-sm font-semibold tracking-wide transition-colors"
              >
                Institut haqida
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-white/50 text-[11px] tracking-[0.2em] uppercase">
          <span style={{ writingMode: "vertical-rl" }}>Pastga</span>
          <span className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </section>

      {/* ============ STATS (Institut raqamlarda) ============ */}
      {stats.length > 0 && (
        <section ref={statsRef} className="py-20 md:py-28 bg-[#f3f1ec]">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-px bg-[#c9a04e]" />
                <span className="text-[#8a6a2c] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Raqamlarda</span>
              </div>
              <h2 className="font-heading text-3xl md:text-5xl text-[#12182a] tracking-tight max-w-2xl">
                Institut raqamlarda
              </h2>
              <p className="mt-5 text-base md:text-lg text-[#5b6270] max-w-xl leading-relaxed">
                Har bir raqam ortida — real natija va ishonch
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#dcd8cc]">
              {stats.map((s, i) => (
                <StatFigure key={s.label} value={s.value} label={s.label} active={statsActive} delay={i * 100} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ INSTITUT HAQIDA (About) ============ */}
      {about && (
        <section className="py-24 md:py-32 bg-[#080b14] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "3px 3px" }}
          />
          <div className="max-w-[1400px] mx-auto px-5 md:px-10 grid lg:grid-cols-[1fr_minmax(0,440px)] gap-14 lg:gap-20 items-center relative">
            <Reveal>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-px bg-[#c9a04e]" />
                <span className="text-[#c9a04e] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Institut haqida</span>
              </div>
              <h2 className="font-heading text-3xl md:text-5xl text-white tracking-tight leading-[1.1] max-w-xl">
                {about.title}
              </h2>
              <p className="mt-7 text-base md:text-lg text-[#cfd3dd] leading-relaxed max-w-xl">
                {aboutDescription}
                {stripHtml(about.content).length > 380 ? "…" : ""}
              </p>
              <div className="mt-10 flex items-center gap-9">
                <Link
                  to={`/about/${about.slug}`}
                  className="inline-flex items-center gap-2 h-13 px-7 py-3.5 rounded-full bg-[#1c9c8e] hover:bg-[#17877b] text-white text-sm font-semibold tracking-wide transition-colors"
                >
                  To'liq ma'lumot
                  <i className="ri-arrow-right-line" />
                </Link>
                <div>
                  <p className="font-heading text-3xl text-white">2020</p>
                  <p className="text-xs text-[#9096a3] uppercase tracking-wide mt-1">Tashkil etilgan</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150} className="relative mx-auto lg:mx-0 w-full max-w-[420px]">
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-[#c9a04e]/50 rounded-2xl" />
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#12182a] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
                {about.img && <img src={about.img} alt={about.title} className="w-full h-full object-cover object-top" />}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ NEGA AYNAN BIZ (Why choose us) ============ */}
      <section className="py-20 md:py-28 bg-[#f3f1ec]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-[#c9a04e]" />
              <span className="text-[#8a6a2c] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Nega aynan biz</span>
            </div>
            <h2 className="font-heading text-3xl md:text-5xl text-[#12182a] tracking-tight max-w-2xl">
              Nega talabalar FJSTI'ni tanlashadi
            </h2>
          </Reveal>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#dcd8cc]">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} delay={i * 80} className="bg-[#f3f1ec] p-8 md:p-10">
                <i className={`${w.icon} text-3xl text-[#c9a04e] flex items-center`} />
                <h3 className="mt-5 font-heading text-xl text-[#12182a]">{w.title}</h3>
                <p className="mt-3 text-sm text-[#5b6270] leading-relaxed">{w.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ RAHBARIYAT (Leadership) ============ */}
      <section className="py-24 md:py-32 bg-[#f3f1ec]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-[#c9a04e]" />
              <span className="text-[#8a6a2c] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Rahbariyat</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-[#12182a] tracking-tight max-w-2xl">
              Institutni boshqarayotgan yetakchilar
            </h2>
          </Reveal>

          {rector && (
            <Reveal delay={100} className="mt-16 grid lg:grid-cols-[minmax(0,420px)_1fr] gap-10 lg:gap-16 items-center">
              <div className="relative mx-auto lg:mx-0 w-full max-w-[380px]">
                <div className="absolute -top-4 -left-4 w-full h-full border border-[#c9a04e]/60 rounded-2xl" />
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#e3e0d8] shadow-[0_30px_60px_-20px_rgba(8,11,20,0.35)]">
                  {rector.photo && (
                    <img src={rector.photo} alt={rector.name} className="w-full h-full object-cover object-top" />
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1c9c8e] mb-3">Rektor</p>
                <h3 className="font-heading text-3xl md:text-4xl text-[#12182a] tracking-tight">{rector.name}</h3>
                <p className="mt-2 text-[#5b6270] text-base">{rector.position}</p>

                <ul className="mt-8 space-y-4">
                  {RECTOR_HIGHLIGHTS.map((h) => (
                    <li key={h} className="flex gap-3 text-[15px] text-[#3a3f4b] leading-relaxed">
                      <i className="ri-checkbox-blank-fill text-[6px] text-[#c9a04e] mt-2.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/leader/35/rektor"
                  className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#12182a] border-b border-[#12182a]/30 hover:border-[#12182a] pb-1 transition-colors"
                >
                  To'liq ma'lumot
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
            </Reveal>
          )}

          {prorectors.length > 0 && (
            <div className="mt-20 grid sm:grid-cols-2 gap-px bg-[#dcd8cc]">
              {prorectors.map((p, i) => (
                <Reveal key={p.id} delay={200 + i * 100} className="bg-[#f3f1ec] p-8 md:p-10 group">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500">
                      {p.photo && <img src={p.photo} alt={p.name} className="w-full h-full object-cover object-top" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#12182a]">{p.name}</h4>
                      <p className="mt-1 text-sm text-[#5b6270]">{p.position}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ FAKULTETLAR (Faculties) ============ */}
      {faculties.length > 0 && (
        <section className="py-24 md:py-32 bg-[#080b14]">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10">
            <Reveal>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-px bg-[#c9a04e]" />
                <span className="text-[#c9a04e] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Ta'lim yo'nalishlari</span>
              </div>
              <h2 className="font-heading text-3xl md:text-5xl text-white tracking-tight max-w-2xl">
                Fakultetlar va kafedralar
              </h2>
            </Reveal>

            <div className="mt-14 border-t border-white/10">
              {faculties.map((f, i) => (
                <Reveal key={f.id} delay={i * 60}>
                  <Link
                    to={`/faculty/0/${f.slug}`}
                    className="group flex items-center justify-between gap-6 py-6 md:py-8 border-b border-white/10 hover:pl-3 transition-all duration-300"
                  >
                    <div className="flex items-center gap-6 md:gap-10 min-w-0">
                      <span className="font-heading text-lg md:text-2xl text-[#5b6270] group-hover:text-[#c9a04e] transition-colors flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-xl md:text-3xl text-white group-hover:text-[#c9a04e] transition-colors truncate">
                        {f.title}
                      </h3>
                    </div>
                    <i className="ri-arrow-right-up-line text-xl md:text-2xl text-[#5b6270] group-hover:text-[#c9a04e] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ YANGILIKLAR (News) — featured + list ============ */}
      {featuredNews && (
        <section className="py-24 md:py-32 bg-[#f3f1ec]">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-14">
              <Reveal>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-px bg-[#c9a04e]" />
                  <span className="text-[#8a6a2c] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Yangiliklar</span>
                </div>
                <h2 className="font-heading text-3xl md:text-5xl text-[#12182a] tracking-tight max-w-2xl">
                  So'nggi yangiliklar va e'lonlar
                </h2>
              </Reveal>
              <Link to="/yangiliklar" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#12182a] border-b border-[#12182a]/30 hover:border-[#12182a] pb-1 transition-colors whitespace-nowrap">
                Barchasini ko'rish
                <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              <Reveal delay={100} className="lg:col-span-2">
                <Link to={newsHref(featuredNews)} className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer">
                  <div className="relative h-[340px] md:h-[440px] overflow-hidden bg-[#e3e0d8]">
                    {featuredNews.img && (
                      <img src={featuredNews.img} alt={featuredNews.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                    <div className="absolute top-5 left-5 flex items-center gap-2">
                      {featuredNews.category && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-xs font-semibold text-[#12182a]">
                          {featuredNews.category.title}
                        </span>
                      )}
                      {isNewArticle(featuredNews.date) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#c9a04e] text-[#12182a] text-xs font-bold">
                          Yangi
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <div className="flex items-center gap-4 text-sm text-white/75 mb-3">
                        <span className="inline-flex items-center gap-1.5"><i className="ri-calendar-line" />{formatLongDate(featuredNews.date, "uz")}</span>
                        <span className="inline-flex items-center gap-1.5"><i className="ri-eye-line" />{formatViews(featuredNews.seen)}</span>
                      </div>
                      <h3 className="font-heading text-2xl md:text-3xl text-white leading-snug group-hover:text-[#c9a04e] transition-colors">
                        {featuredNews.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/70 line-clamp-2 max-w-xl">{stripHtml(featuredNews.content).slice(0, 190)}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>

              <div className="flex flex-col gap-5">
                {secondaryNews.map((n, i) => (
                  <Reveal key={n.id} delay={150 + i * 80}>
                    <Link to={newsHref(n)} className="group flex gap-4 cursor-pointer">
                      <div className="relative w-28 h-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#e3e0d8]">
                        {n.img && <img src={n.img} alt={n.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />}
                      </div>
                      <div className="flex-1 flex flex-col min-w-0 border-b border-[#dcd8cc] pb-4">
                        <span className="text-xs text-[#8a8f9a]">{formatShortDate(n.date, "uz")}</span>
                        <h3 className="mt-1.5 font-heading text-lg text-[#12182a] group-hover:text-[#8a6a2c] leading-snug line-clamp-2 transition-colors">
                          {n.title}
                        </h3>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ TADBIRLAR (Events) — horizontal strip ============ */}
      <section className="py-24 md:py-32 bg-[#080b14]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-[#c9a04e]" />
              <span className="text-[#c9a04e] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Kalendar</span>
            </div>
            <h2 className="font-heading text-3xl md:text-5xl text-white tracking-tight max-w-2xl">
              Yaqinlashib kelayotgan tadbirlar
            </h2>
          </Reveal>

          <div className="mt-14 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {events.map((e, i) => (
              <Reveal key={e.id} delay={i * 80} className="snap-start flex-shrink-0 w-[270px] md:w-[300px]">
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] hover:border-[#c9a04e]/50 hover:bg-white/[0.05] transition-colors p-6 md:p-7">
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-5xl text-white leading-none">{e.day}</span>
                    <span className="text-xs uppercase tracking-widest text-[#c9a04e]">{e.month}</span>
                  </div>
                  <span className="mt-5 inline-block px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-[#cfd3dd]">{e.type}</span>
                  <h3 className="mt-4 font-heading text-lg text-white leading-snug min-h-[3.4em]">{e.title}</h3>
                  <div className="mt-5 space-y-1.5 text-xs text-[#9096a3]">
                    <div className="flex items-center gap-1.5"><i className="ri-time-line" />{e.time}</div>
                    <div className="flex items-center gap-1.5"><i className="ri-map-pin-line" />{e.place}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALEREYA (Gallery) — masonry + lightbox ============ */}
      {images.length > 0 && (
        <section className="py-24 md:py-32 bg-[#f3f1ec]">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-14">
              <Reveal>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-px bg-[#c9a04e]" />
                  <span className="text-[#8a6a2c] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Galereya</span>
                </div>
                <h2 className="font-heading text-3xl md:text-5xl text-[#12182a] tracking-tight max-w-2xl">
                  Institut hayotidan lavhalar
                </h2>
              </Reveal>
              <Link to="/galereya" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#12182a] border-b border-[#12182a]/30 hover:border-[#12182a] pb-1 transition-colors whitespace-nowrap">
                Barcha albomlar
                <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="columns-2 md:columns-3 gap-4">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setLightbox(i)}
                  className="group relative mb-4 block w-full break-inside-avoid rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={img.img}
                    alt=""
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ aspectRatio: i % 3 === 0 ? "3 / 4" : "4 / 3" }}
                  />
                  <div className="absolute inset-0 bg-[#080b14]/0 group-hover:bg-[#080b14]/30 transition-colors flex items-center justify-center">
                    <i className="ri-zoom-in-line text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {lightbox !== null && (
            <div className="fixed inset-0 z-[100] bg-[#080b14]/92 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
              <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer">
                <i className="ri-close-line text-xl" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((v) => (v! - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <i className="ri-arrow-left-line text-xl" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((v) => (v! + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <i className="ri-arrow-right-line text-xl" />
              </button>
              <img src={images[lightbox].img} alt="" className="max-w-[92vw] max-h-[86vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            </div>
          )}
        </section>
      )}

      {/* ============ HAMKORLAR (Partners) — marquee ============ */}
      <section className="py-16 bg-[#080b14] border-y border-white/10">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 text-center mb-10">
          <span className="text-[#c9a04e] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Ishonchli hamkorlik</span>
          <h2 className="mt-3 font-heading text-2xl md:text-3xl text-white tracking-tight">Hamkor tashkilotlar va tizimlar</h2>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee gap-4 w-max">
            {[...partners, ...partners].map((p, i) => (
              <a
                key={`${p.name}-${i}`}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 h-16 rounded-full border border-white/10 hover:border-[#c9a04e]/50 hover:bg-white/[0.03] cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className={`${p.icon} text-[#c9a04e] text-lg`} />
                <span className="text-sm text-white/80">{p.name}</span>
              </a>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080b14] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080b14] to-transparent" />
        </div>
      </section>

      {/* ============ ALOQA (ContactMap) — glass card over map ============ */}
      <section className="relative py-24 md:py-32 bg-[#080b14] overflow-hidden min-h-[560px] flex items-center">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3006.5!2d71.7833!3d40.3894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sFergana!5e0!3m2!1sen!2suz!4v1720000000000"
          title="Xarita"
          className="absolute inset-0 w-full h-full opacity-30 grayscale contrast-125 pointer-events-none"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/70 to-[#080b14]/30 pointer-events-none" />

        <div className="relative max-w-[1400px] w-full mx-auto px-5 md:px-10">
          <Reveal className="max-w-md rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md p-8 md:p-10">
            <span className="text-[#c9a04e] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">Aloqa</span>
            <h2 className="mt-3 font-heading text-2xl md:text-3xl text-white tracking-tight">Biz bilan bog'laning</h2>
            <div className="mt-7 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <i className="ri-map-pin-line text-[#c9a04e] mt-0.5" />
                <span className="text-[#cfd3dd]">Farg'ona sh., Yangi Turon, 2-a uy</span>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-phone-line text-[#c9a04e] mt-0.5" />
                <a href="tel:+998950622345" className="text-[#cfd3dd] hover:text-white transition-colors">+998 95 062-23-45</a>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-mail-line text-[#c9a04e] mt-0.5" />
                <a href="mailto:info@fjsti.uz" className="text-[#cfd3dd] hover:text-white transition-colors">info@fjsti.uz</a>
              </div>
            </div>
            <Link
              to="/aloqa"
              className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#1c9c8e] hover:bg-[#17877b] text-white text-sm font-semibold tracking-wide transition-colors"
            >
              Xabar yuborish
              <i className="ri-arrow-right-line" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#050710] text-[#cfd3dd] pt-20 pb-10">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <img src={LOGO_IMG} alt="" className="w-9 h-9 object-contain rounded-md bg-white/95 p-1" />
              <span className="font-heading text-lg text-white tracking-tight">FJSTI</span>
            </div>
            <p className="mt-5 text-sm text-white/50 leading-relaxed max-w-xs">
              Farg'ona jamoat salomatligi tibbiyot instituti — 2020-yildan buyon zamonaviy tibbiyot ta'limi standarti.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {["facebook", "telegram", "instagram", "youtube"].map((s) => (
                <span key={s} className="w-9 h-9 rounded-full border border-white/15 hover:border-[#c9a04e]/60 flex items-center justify-center cursor-pointer transition-colors">
                  <i className={`ri-${s}-fill text-sm text-white/70`} />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Institut</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/institut" className="hover:text-white transition-colors">Institut haqida</Link></li>
              <li><Link to="/leader/35/rektor" className="hover:text-white transition-colors">Rahbariyat</Link></li>
              <li><Link to="/institut/tuzilma" className="hover:text-white transition-colors">Tuzilma</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Tezkor kirish</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="https://hemis.fjsti.uz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">HEMIS</a></li>
              <li><Link to="/virtual-qabulxona" className="hover:text-white transition-colors">Virtual qabulxona</Link></li>
              <li><a href="tel:+998950622345" className="hover:text-white transition-colors">Call markaz: +998 95 062-23-45</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Aloqa</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-white/70">Farg'ona sh., Yangi Turon, 2-a</li>
              <li><a href="mailto:info@fjsti.uz" className="hover:text-white transition-colors">info@fjsti.uz</a></li>
              <li><a href="tel:+998950622345" className="hover:text-white transition-colors">+998 95 062-23-45</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-white/35">
          © {new Date().getFullYear()} Farg'ona jamoat salomatligi tibbiyot instituti. Barcha huquqlar himoyalangan.
        </div>
      </footer>
    </div>
  );
}
