import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RichContent from "@/components/shared/RichContent";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { enhanceScienceHtml } from "@/lib/enhanceScienceHtml";
import {
  extractDoctorateIntro,
  parseDoctorateDocuments,
  parseDoctorateSpecialties,
  parseDoctorateStats,
  stripDoctorateSpecialtyBlocks,
  toDoctorateInternalPath,
} from "@/lib/parseDoctorateContent";

function SpecialtyItem({
  code,
  title,
  url,
  soonLabel,
}: {
  code: string;
  title: string;
  url: string | null;
  soonLabel: string;
}) {
  const internal = url ? toDoctorateInternalPath(url) : null;
  const body = (
    <>
      <span className="cms-doc-specialty__code">{code}</span>
      <span className="cms-doc-specialty__title">{title}</span>
      {internal ? (
        <i className="ri-arrow-right-s-line" aria-hidden />
      ) : (
        !url && <span className="cms-doc-specialty__soon">{soonLabel}</span>
      )}
    </>
  );

  if (internal) {
    return (
      <Link to={internal} className="cms-doc-specialty cms-doc-specialty--link">
        {body}
      </Link>
    );
  }

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="cms-doc-specialty cms-doc-specialty--link">
        {body}
      </a>
    );
  }

  return <div className="cms-doc-specialty">{body}</div>;
}

export default function DoktoranturaMalumotPageContent({
  html,
  pdfUrl,
  slug,
}: {
  html: string;
  pdfUrl?: string | null;
  slug: string;
}) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const intro = useMemo(() => extractDoctorateIntro(html), [html]);
  const stats = useMemo(() => parseDoctorateStats(intro), [intro]);
  const specialties = useMemo(() => parseDoctorateSpecialties(html), [html]);
  const documents = useMemo(() => parseDoctorateDocuments(html), [html]);
  const articleHtml = useMemo(
    () => enhanceScienceHtml(stripDoctorateSpecialtyBlocks(html)),
    [html],
  );

  return (
    <div className="cms-science cms-science--doctorate-info">
      {intro && <p className="cms-doc-intro">{intro}</p>}

      {stats.length > 0 && (
        <div className="cms-doc-stats" role="list">
          {stats.map((stat) => (
            <div key={stat.labelKey} className="cms-doc-stat" role="listitem">
              <span className="cms-doc-stat__icon" aria-hidden>
                <i className={stat.icon} />
              </span>
              <div>
                <span className="cms-doc-stat__value">{stat.value}</span>
                <span className="cms-doc-stat__label">{t(stat.labelKey)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {specialties.length > 0 && (
        <section className="cms-doc-block">
          <h3 className="cms-doc-block__title">{t("faoliyat.doctorate.specialtiesTitle")}</h3>
          <p className="cms-doc-block__lead">{t("faoliyat.doctorate.specialtiesLead")}</p>
          <div className="cms-doc-specialties">
            {specialties.map((item) => (
              <SpecialtyItem
                key={item.code}
                code={item.code}
                title={item.title}
                url={item.url}
                soonLabel={t("faoliyat.doctorate.examSoon")}
              />
            ))}
          </div>
        </section>
      )}

      {articleHtml.trim() && (
        <RichContent
          html={articleHtml}
          slug={slug}
          className="cms-article cms-article--rich cms-article--science cms-article--faoliyat cms-doc-article"
        />
      )}

      {documents.length > 0 && (
        <section className="cms-doc-block">
          <h3 className="cms-doc-block__title">{t("faoliyat.doctorate.regulationsTitle")}</h3>
          <ul className="cms-doc-regulations">
            {documents.map((doc) => (
              <li key={doc.url} className="cms-doc-regulation">
                <div className="cms-doc-regulation__body">
                  <p className="cms-doc-regulation__title">{doc.title}</p>
                  <div className="cms-doc-regulation__actions">
                    {doc.isPdf && (
                      <button type="button" className="cms-science-btn cms-science-btn--primary" onClick={() => setPreviewUrl(doc.url)}>
                        <i className="ri-eye-line" aria-hidden />
                        {t("science.viewDocument")}
                      </button>
                    )}
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
                      <i className="ri-download-2-line" aria-hidden />
                      {t("science.downloadDocument")}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {previewUrl && (
        <div className="cms-science__preview">
          <div className="cms-science__preview-head">
            <h3 className="cms-science__preview-title">{t("science.previewTitle")}</h3>
            <button type="button" className="cms-science__preview-close" onClick={() => setPreviewUrl(null)}>
              <i className="ri-close-line" aria-hidden />
              {t("a11y.close")}
            </button>
          </div>
          <PdfDocumentViewer pdfUrl={previewUrl} title={t("science.previewTitle")} interactive />
        </div>
      )}

      {pdfUrl && !documents.some((d) => d.url === pdfUrl) && (
        <div className="cms-science__primary">
          <h3 className="cms-science__primary-title">{t("faoliyat.doctorate.primaryRegulation")}</h3>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t("faoliyat.doctorate.primaryRegulation")} interactive />
        </div>
      )}
    </div>
  );
}
