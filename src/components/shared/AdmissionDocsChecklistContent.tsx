import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import FinancePdfPageContent from "@/components/shared/FinancePdfPageContent";
import {
  getAdmissionDocsPdfTitleKey,
  parseAdmissionDocsContent,
} from "@/lib/parseAdmissionDocsContent";

export default function AdmissionDocsChecklistContent({
  html,
  pdfUrl,
  title,
  portalLabelKey = "admission.magistratura.cta.documentsPortal",
}: {
  html: string;
  pdfUrl?: string | null;
  title?: string;
  portalLabelKey?: string;
}) {
  const { t } = useTranslation();
  const content = useMemo(() => parseAdmissionDocsContent(html, pdfUrl), [html, pdfUrl]);
  const pdfTitleKey = getAdmissionDocsPdfTitleKey(pdfUrl, content.pdfTitleKey);

  return (
    <div className="cms-science cms-science--admission-docs">
      {content.portalUrl && (
        <a
          href={content.portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cms-admission-cta cms-admission-docs__portal"
        >
          <span className="cms-admission-cta__icon" aria-hidden>
            <i className="ri-global-line" />
          </span>
          <span className="cms-admission-cta__body">
            <span className="cms-admission-cta__title">{t(portalLabelKey)}</span>
            <span className="cms-admission-cta__url">{content.portalUrl.replace(/^https?:\/\//, "")}</span>
          </span>
          <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
        </a>
      )}

      {content.headline && <p className="cms-admission-docs__headline">{content.headline}</p>}

      {content.introParagraphs.map((paragraph) => (
        <p key={paragraph} className="cms-admission-docs__intro">
          {paragraph}
        </p>
      ))}

      {content.highlights.length > 0 && (
        <div className="cms-admission-docs__highlights">
          {content.highlights.map((item) => (
            <div key={item.text} className="cms-admission-docs__highlight">
              <span className="cms-admission-docs__highlight-icon" aria-hidden>
                <i className={item.icon} />
              </span>
              <p className="cms-admission-docs__highlight-text">{item.text}</p>
            </div>
          ))}
        </div>
      )}

      {content.checklistItems.length > 0 && (
        <section className="cms-admission-docs__section">
          <h3 className="cms-admission-docs__section-title">
            {content.checklistTitle ?? t("admission.docs.checklistTitle")}
          </h3>
          <ol className="cms-admission-docs__checklist">
            {content.checklistItems.map((item, index) => (
              <li key={item} className="cms-admission-docs__checklist-item">
                <span className="cms-admission-docs__checklist-num" aria-hidden>
                  {index + 1}
                </span>
                <span className="cms-admission-docs__checklist-text">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {content.deadline && (
        <div className="cms-admission-docs__deadline">
          <i className="ri-calendar-check-line" aria-hidden />
          <div>
            <span className="cms-admission-docs__deadline-label">{t("admission.docs.deadlineLabel")}</span>
            <span className="cms-admission-docs__deadline-value">{content.deadline}</span>
          </div>
        </div>
      )}

      {content.notes.map((note) => (
        <p key={note} className="cms-admission-docs__note">
          {note}
        </p>
      ))}

      {pdfUrl && (
        <section className="cms-admission-docs__pdf">
          <div className="cms-admission-docs__pdf-head">
            <h3 className="cms-admission-docs__section-title">{t(pdfTitleKey)}</h3>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
              <i className="ri-download-2-line" aria-hidden />
              {t("science.downloadDocument")}
            </a>
          </div>
          <FinancePdfPageContent pdfUrl={pdfUrl} title={t(pdfTitleKey)} />
        </section>
      )}
    </div>
  );
}
