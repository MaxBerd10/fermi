import { useTranslation } from "react-i18next";

type Project = {
  id: string;
  name: string;
  href: string | null;
  icon: string;
  img: string;
  hintKey: "live" | "soon";
};

const PROJECTS: Project[] = [
  {
    id: "aishifokor",
    name: "AiShifokor",
    href: "https://aishifokor.uz",
    icon: "ri-heart-pulse-line",
    img: "/images/projects/aishifokor.jpg",
    hintKey: "live",
  },
  {
    id: "imentor",
    name: "iMentor",
    href: "https://imentor.uz",
    icon: "ri-user-star-line",
    img: "/images/projects/imentor.jpg",
    hintKey: "live",
  },
  {
    id: "itest",
    name: "iTest",
    href: "https://online-imtixon.uz",
    icon: "ri-questionnaire-line",
    img: "/images/projects/itest.jpg",
    hintKey: "live",
  },
  {
    id: "teletibbiyot",
    name: "Teletibbiyot",
    href: null,
    icon: "ri-vidicon-line",
    img: "/images/projects/teletibbiyot.jpg",
    hintKey: "soon",
  },
  {
    id: "slikon",
    name: "Slikonli mashgʻulot",
    href: null,
    icon: "ri-cpu-line",
    img: "/images/projects/slikon.jpg",
    hintKey: "soon",
  },
  {
    id: "icamera",
    name: "iCamera",
    href: null,
    icon: "ri-camera-line",
    img: "/images/projects/icamera.jpg",
    hintKey: "soon",
  },
];

function ProjectCard({ p, liveLabel, soonLabel, soonHint }: {
  p: Project;
  liveLabel: string;
  soonLabel: string;
  soonHint: string;
}) {
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e5e5e5]">
        <img
          src={p.img}
          alt={p.name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
            p.href ? "group-hover:scale-105" : "grayscale-[30%]"
          }`}
          loading="lazy"
          width={480}
          height={360}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1158]/70 via-transparent to-transparent" />
        <span className="absolute left-2.5 bottom-2.5 w-9 h-9 rounded-xl bg-[#0a1158] text-[#ffd600] flex items-center justify-center shadow-md">
          <i className={`${p.icon} text-lg`} aria-hidden />
        </span>
        {!p.href && (
          <span className="absolute right-2.5 top-2.5 w-8 h-8 rounded-full bg-white/90 text-[#0a1158] flex items-center justify-center">
            <i className="ri-lock-line text-sm" aria-hidden />
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-sm md:text-base font-bold text-[#0a0a0a] leading-snug">
            {p.name}
          </h3>
          {p.href ? (
            <i className="ri-external-link-line text-[#0a1158]/45 group-hover:text-[#ffd600] transition-colors shrink-0 mt-0.5" />
          ) : null}
        </div>
        <p
          className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${
            p.href ? "text-[#0a1158]" : "text-[#555555]"
          }`}
        >
          {p.href ? liveLabel : soonLabel}
        </p>
      </div>
    </>
  );

  const cardCls =
    "group flex flex-col overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-[#e5e5e5]/80 shadow-[0_6px_20px_rgba(10,17,88,0.05)] transition-all";

  if (p.href) {
    return (
      <a
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardCls} hover:border-[#ffd600] hover:shadow-[0_10px_28px_rgba(10,17,88,0.1)] cursor-pointer`}
      >
        {body}
      </a>
    );
  }

  return (
    <div className={`${cardCls} opacity-85 cursor-default select-none`} title={soonHint} aria-disabled="true">
      {body}
    </div>
  );
}

export default function OurProjects() {
  const { t } = useTranslation();

  return (
    <section className="pt-5 pb-6 md:pt-6 md:pb-8 bg-transparent border-t border-[#e5e5e5]/60">
      <div className="section-container">
        <div className="mb-4">
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#0a1158] mb-1">
            {t("projects.eyebrow")}
          </p>
          <h2 className="font-heading text-lg md:text-xl font-bold text-[#0a0a0a] tracking-tight">
            {t("projects.heading")}
          </h2>
          <p className="mt-1 text-xs md:text-sm text-[#333333] max-w-2xl">{t("projects.intro")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PROJECTS.map((p) => (
            <ProjectCard
              key={p.id}
              p={p}
              liveLabel={t("projects.live")}
              soonLabel={t("projects.soon")}
              soonHint={t("projects.soonHint")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
