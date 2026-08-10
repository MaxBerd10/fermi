import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import KongressHero from "@/components/shared/KongressHero";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import {
  getKongressHeroConfig,
  getKongressPageTheme,
} from "@/lib/kongressSection";
import {
  parseKongressContent,
  type KongressDocument,
  type KongressEventBlock,
} from "@/lib/parseKongressContent";

function DocCard({
  doc,
  featured,
  onPreview,
}: {
  doc: KongressDocument;
  featured?: boolean;
  onPreview: (url: string) => void;
}) {
  const { t } = useTranslation();
  const title =
    doc.title ||
    (featured ? t("kongress.featuredProceedings") : t("kongress.documentFallback"));

  return (
    <div className={`cms-kongress__doc${featured ? " cms-kongress__doc--featured" : ""}`}>
      <div className="cms-kongress__doc-icon" aria-hidden>
        <i className="ri-file-pdf-line" />
      </div>
      <div className="cms-kongress__doc-body">
        <div className="cms-kongress__doc-meta">
          {doc.year && <span className="cms-kongress__doc-year">{doc.year}</span>}
          {featured && (
            <span className="cms-kongress__doc-badge">{t("kongress.featuredBadge")}</span>
          )}
        </div>
        <p className="cms-kongress__doc-title">{title}</p>
        <div className="cms-kongress__doc-actions">
          <button
            type="button"
            className="cms-kongress__btn cms-kongress__btn--primary"
            onClick={() => onPreview(doc.url)}
          >
            <i className="ri-eye-line" aria-hidden />
            {t("kongress.viewPdf")}
          </button>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-kongress__btn"
          >
            <i className="ri-download-2-line" aria-hidden />
            {t("kongress.downloadPdf")}
          </a>
        </div>
      </div>
    </div>
  );
}

function EventBlock({ block }: { block: KongressEventBlock }) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const hasContent =
    block.bannerImage ||
    block.galleryImages.length > 0 ||
    block.videos.length > 0 ||
    block.documents.length > 0;

  if (!hasContent) return null;

  return (
    <section className="cms-kongress__block" aria-labelledby={`kongress-block-${block.id}`}>
      <header className="cms-kongress__block-head">
        <h3 id={`kongress-block-${block.id}`} className="cms-kongress__block-title">
          {t(block.titleKey)}
        </h3>
        {block.year && <span className="cms-kongress__block-year">{block.year}</span>}
      </header>

      {block.bannerImage && (
        <figure className="cms-kongress__banner">
          <img src={block.bannerImage} alt={t(block.titleKey)} loading="lazy" />
        </figure>
      )}

      {block.galleryImages.length > 0 && (
        <ul className="cms-kongress__gallery">
          {block.galleryImages.map((src) => (
            <li key={src} className="cms-kongress__gallery-item">
              <img src={src} alt="" loading="lazy" />
            </li>
          ))}
        </ul>
      )}

      {block.videos.length > 0 && (
        <div className="cms-kongress__videos">
          {block.videos.map((video) => (
            <div key={video.embedUrl} className="cms-kongress__video">
              <iframe
                src={video.embedUrl}
                title={t("kongress.videoTitle")}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      )}

      {block.documents.length > 0 && (
        <div className="cms-kongress__docs">
          {block.documents.map((doc) => (
            <DocCard key={doc.url} doc={doc} onPreview={setPreviewUrl} />
          ))}
        </div>
      )}

      {previewUrl && (
        <div className="cms-kongress__preview">
          <div className="cms-kongress__preview-head">
            <h4 className="cms-kongress__preview-title">{t("kongress.previewTitle")}</h4>
            <button
              type="button"
              className="cms-kongress__preview-close"
              onClick={() => setPreviewUrl(null)}
            >
              <i className="ri-close-line" aria-hidden />
              {t("a11y.close")}
            </button>
          </div>
          <PdfDocumentViewer pdfUrl={previewUrl} title={t("kongress.previewTitle")} interactive />
        </div>
      )}
    </section>
  );
}

export default function KongressPageContent({
  html,
  pdfUrl,
  title,
}: {
  slug: string;
  html: string;
  pdfUrl?: string | null;
  title: string;
}) {
  const { t } = useTranslation();
  const heroConfig = getKongressHeroConfig();
  const pageTheme = getKongressPageTheme();
  const parsed = useMemo(() => parseKongressContent(html, pdfUrl), [html, pdfUrl]);
  const [featuredPreviewUrl, setFeaturedPreviewUrl] = useState<string | null>(null);

  const featuredInBlocks = parsed.featuredDocument
    ? parsed.blocks.some((b) => b.documents.some((d) => d.url === parsed.featuredDocument!.url))
    : false;

  const docCount =
    parsed.blocks.reduce((n, b) => n + b.documents.length, 0) +
    (parsed.featuredDocument && !featuredInBlocks ? 1 : 0);

  return (
    <div className={`kongress-page kongress-page--${pageTheme}`}>
      <KongressHero title={title} config={heroConfig} />

      <section className="kongress-page__body page-card px-5 py-4 md:px-7 md:py-5 lg:px-8 lg:py-6">
        <div className="cms-kongress">
          {parsed.heroImage && (
            <figure className="cms-kongress__hero-image">
              <img src={parsed.heroImage} alt={title} loading="eager" />
            </figure>
          )}

          {(docCount > 0 || parsed.blocks.length > 0) && (
            <div className="cms-kongress__stats">
              <span className="cms-kongress__stat">
                <i className="ri-calendar-event-line" aria-hidden />
                {t("kongress.stats.events", { count: parsed.blocks.length })}
              </span>
              {docCount > 0 && (
                <span className="cms-kongress__stat">
                  <i className="ri-file-pdf-line" aria-hidden />
                  {t("kongress.stats.documents", { count: docCount })}
                </span>
              )}
            </div>
          )}

          {parsed.featuredDocument && !featuredInBlocks && (
            <div className="cms-kongress__featured">
              <DocCard
                doc={parsed.featuredDocument}
                featured
                onPreview={setFeaturedPreviewUrl}
              />
            </div>
          )}

          {parsed.blocks.map((block) => (
            <EventBlock key={block.id} block={block} />
          ))}

          {parsed.blocks.length === 0 && !parsed.featuredDocument && (
            <div className="cms-kongress__empty">
              <i className="ri-presentation-line cms-kongress__empty-icon" aria-hidden />
              <h3 className="cms-kongress__empty-title">{t("kongress.emptyTitle")}</h3>
              <p className="cms-kongress__empty-text">{t("kongress.emptyText")}</p>
            </div>
          )}

          {featuredPreviewUrl && (
            <div className="cms-kongress__preview cms-kongress__preview--global">
              <div className="cms-kongress__preview-head">
                <h4 className="cms-kongress__preview-title">{t("kongress.previewTitle")}</h4>
                <button
                  type="button"
                  className="cms-kongress__preview-close"
                  onClick={() => setFeaturedPreviewUrl(null)}
                >
                  <i className="ri-close-line" aria-hidden />
                  {t("a11y.close")}
                </button>
              </div>
              <PdfDocumentViewer
                pdfUrl={featuredPreviewUrl}
                title={t("kongress.featuredProceedings")}
                interactive
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
