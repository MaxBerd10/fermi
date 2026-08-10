import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getGalleryVariant,
  parseImageGallery,
  type GalleryVariant,
} from "@/lib/parseCertificateGallery";

function introKey(variant: GalleryVariant): string {
  if (variant === "diagram") return "structure.intro";
  if (variant === "document") return "document.intro";
  if (variant === "accreditation") return "accreditation.intro";
  if (variant === "roadmap") return "roadmap.intro";
  return "certificates.intro";
}

function badgeIcon(variant: GalleryVariant): string {
  if (variant === "roadmap") return "ri-map-2-line";
  if (variant === "document") return "ri-file-list-3-line";
  if (variant === "accreditation") return "ri-verified-badge-line";
  if (variant === "diagram") return "ri-organization-chart";
  return "ri-award-line";
}

export default function CertificateGallery({
  html,
  slug,
}: {
  html: string;
  slug?: string;
}) {
  const { t } = useTranslation();
  const variant = useMemo(() => getGalleryVariant(slug, html) ?? "certificates", [slug, html]);
  const { items, footerNote } = useMemo(() => parseImageGallery(html, variant), [html, variant]);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  const activeItem = items.find((c) => c.src === activeSrc);

  useEffect(() => {
    if (!activeSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveSrc(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [activeSrc]);

  if (items.length === 0) return null;

  const lightbox = activeSrc && activeItem && (
    <div
      className="cms-cert-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={activeItem.caption}
      onClick={() => setActiveSrc(null)}
    >
      <div className="cms-cert-lightbox__panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="cms-cert-lightbox__close"
          onClick={() => setActiveSrc(null)}
          aria-label={t("a11y.close")}
        >
          <i className="ri-close-line text-2xl" />
        </button>
        <img src={activeSrc} alt={activeItem.alt} className="cms-cert-lightbox__img" />
        <p className="cms-cert-lightbox__caption">{activeItem.caption}</p>
        <a
          href={activeSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="cms-cert-lightbox__download"
        >
          <i className="ri-external-link-line" />
          {t("certificates.openOriginal")}
        </a>
      </div>
    </div>
  );

  if (variant === "diagram" || variant === "document" || variant === "accreditation") {
    const item = items[0];
    const frameClass =
      variant === "accreditation"
        ? "cms-diagram-frame cms-diagram-frame--accreditation"
        : "cms-diagram-frame";
    const imgClass =
      variant === "accreditation"
        ? "cms-diagram-frame__img cms-diagram-frame__img--accreditation"
        : "cms-diagram-frame__img";

    return (
      <div className={`cms-diagram-page${variant === "accreditation" ? " cms-diagram-page--accreditation" : ""}`}>
        <p className="cms-cert-intro">{t(introKey(variant))}</p>
        <div className={frameClass}>
          <button
            type="button"
            className="cms-diagram-frame__btn"
            onClick={() => setActiveSrc(item.src)}
            aria-label={`${item.caption} — ${t("certificates.viewFull")}`}
          >
            <img
              src={item.src}
              alt={item.alt}
              className={imgClass}
              loading="eager"
              decoding="async"
            />
            <span className="cms-diagram-frame__overlay">
              <i className="ri-zoom-in-line text-3xl" />
              <span>{t("certificates.viewFull")}</span>
            </span>
          </button>
        </div>
        <p className="cms-diagram-hint">
          <i className="ri-information-line" aria-hidden />
          {variant === "accreditation" ? t("accreditation.zoomHint") : t("structure.zoomHint")}
        </p>
        {lightbox}
      </div>
    );
  }

  const galleryClass =
    variant === "roadmap" ? "cms-cert-gallery cms-roadmap-gallery" : "cms-cert-gallery";

  return (
    <div className={`cms-cert-page cms-cert-page--${variant}`}>
      <p className="cms-cert-intro">{t(introKey(variant))}</p>

      <ul className={galleryClass} role="list">
        {items.map((cert, i) => (
          <li key={cert.src}>
            <figure className="cms-cert-card">
              <button
                type="button"
                className="cms-cert-card__preview"
                onClick={() => setActiveSrc(cert.src)}
                aria-label={`${cert.caption} — ${t("certificates.viewFull")}`}
              >
                <img
                  src={cert.src}
                  alt={cert.alt}
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                  className="cms-cert-card__img"
                />
                <span className="cms-cert-card__overlay" aria-hidden>
                  <i className="ri-zoom-in-line text-2xl" />
                  <span className="text-xs font-semibold mt-1">{t("certificates.viewFull")}</span>
                </span>
              </button>
              <figcaption className="cms-cert-card__caption">
                <span className="cms-cert-card__index">{String(i + 1).padStart(2, "0")}</span>
                <span className="cms-cert-card__title">{cert.caption}</span>
              </figcaption>
              <span className="cms-cert-card__badge" aria-hidden>
                <i className={badgeIcon(variant)} />
              </span>
            </figure>
          </li>
        ))}
      </ul>

      {footerNote && (
        <aside className="cms-cert-footer">
          <i className="ri-information-line text-lg flex-shrink-0 text-[#0a1158]" aria-hidden />
          <p>{footerNote}</p>
        </aside>
      )}

      {lightbox}
    </div>
  );
}
