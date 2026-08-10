import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { parseBuildingGallery, type BuildingPhoto } from "@/lib/parseBuildingGallery";

function resolveCaption(caption: string, t: (key: string, opts?: object) => string): string {
  if (caption.startsWith("buildings.caption.photo|")) {
    const num = caption.split("|")[1];
    return t("buildings.caption.photo", { number: num });
  }
  if (caption.startsWith("buildings.caption.")) return t(caption);
  return caption;
}

export default function BuildingGalleryContent({
  html,
  featuredImage,
}: {
  html: string;
  featuredImage?: string | null;
}) {
  const { t } = useTranslation();
  const photos = useMemo(() => parseBuildingGallery(html), [html]);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  const allPhotos = useMemo(() => {
    if (featuredImage && !photos.some((p) => p.src === featuredImage)) {
      return [
        { src: featuredImage, caption: "buildings.caption.featured", alt: "featured" },
        ...photos,
      ] satisfies BuildingPhoto[];
    }
    return photos;
  }, [photos, featuredImage]);

  const activeItem = allPhotos.find((p) => p.src === activeSrc);

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

  if (allPhotos.length === 0) {
    return (
      <div className="cms-buildings__empty">
        <i className="ri-building-4-line cms-buildings__empty-icon" aria-hidden />
        <h3 className="cms-buildings__empty-title">{t("buildings.emptyTitle")}</h3>
        <p className="cms-buildings__empty-text">{t("buildings.emptyText")}</p>
      </div>
    );
  }

  return (
    <div className="cms-buildings">
      <div className="cms-buildings__head">
        <span className="cms-buildings__badge">
          <i className="ri-camera-3-line" aria-hidden />
          {t("buildings.photosBadge")}
        </span>
        <span className="cms-buildings__count">{t("buildings.photosCount", { count: allPhotos.length })}</span>
      </div>

      <ul className="cms-buildings__grid" role="list">
        {allPhotos.map((photo, i) => {
          const caption = resolveCaption(photo.caption, t);
          return (
            <li key={photo.src}>
              <figure className="cms-buildings__card">
                <button
                  type="button"
                  className="cms-buildings__preview"
                  onClick={() => setActiveSrc(photo.src)}
                  aria-label={`${caption} — ${t("buildings.viewFull")}`}
                >
                  <img
                    src={photo.src}
                    alt={caption}
                    loading={i < 4 ? "eager" : "lazy"}
                    decoding="async"
                    className="cms-buildings__img"
                  />
                  <span className="cms-buildings__overlay" aria-hidden>
                    <i className="ri-zoom-in-line" />
                    <span>{t("buildings.viewFull")}</span>
                  </span>
                </button>
                <figcaption className="cms-buildings__caption">
                  <span className="cms-buildings__index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cms-buildings__title">{caption}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>

      <p className="cms-buildings__hint">
        <i className="ri-information-line" aria-hidden />
        {t("buildings.zoomHint")}
      </p>

      {activeSrc && activeItem && (
        <div
          className="cms-buildings-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={resolveCaption(activeItem.caption, t)}
          onClick={() => setActiveSrc(null)}
        >
          <div className="cms-buildings-lightbox__panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cms-buildings-lightbox__close"
              onClick={() => setActiveSrc(null)}
              aria-label={t("a11y.close")}
            >
              <i className="ri-close-line" />
            </button>
            <img
              src={activeSrc}
              alt={resolveCaption(activeItem.caption, t)}
              className="cms-buildings-lightbox__img"
            />
            <p className="cms-buildings-lightbox__caption">{resolveCaption(activeItem.caption, t)}</p>
            <a
              href={activeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="cms-buildings-lightbox__link"
            >
              <i className="ri-external-link-line" aria-hidden />
              {t("buildings.openOriginal")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
