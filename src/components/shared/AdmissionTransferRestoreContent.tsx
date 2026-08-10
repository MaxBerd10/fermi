import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseTransferRestore } from "@/lib/parseKochirishContent";
import AdmissionSupplementaryPdf from "@/components/shared/AdmissionSupplementaryPdf";
import { getKochirishPdfTitleKey } from "@/lib/kochirishSection";

export default function AdmissionTransferRestoreContent({
  html,
  pdfUrl,
}: {
  html: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const content = useMemo(() => parseTransferRestore(html), [html]);

  return (
    <div className="cms-science cms-science--kochirish-restore">
      {content.bannerImage && (
        <figure className="cms-kochirish-restore__banner">
          <img src={content.bannerImage} alt="" loading="lazy" />
        </figure>
      )}

      {content.headline && <h3 className="cms-kochirish-restore__headline">{content.headline}</h3>}
      {content.intro && <p className="cms-kochirish-restore__intro">{content.intro}</p>}

      {content.portals.length > 0 && (
        <div className="cms-kochirish-restore__portals">
          {content.portals.map((portal) => (
            <a
              key={portal.url}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cms-admission-cta cms-kochirish-restore__portal"
            >
              <span className="cms-admission-cta__icon" aria-hidden>
                <i className="ri-external-link-line" />
              </span>
              <span className="cms-admission-cta__body">
                <span className="cms-admission-cta__title">{portal.label}</span>
                <span className="cms-admission-cta__url">{t(portal.description)}</span>
              </span>
              <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
            </a>
          ))}
        </div>
      )}

      {content.deadline && (
        <div className="cms-admission-docs__deadline cms-kochirish-restore__deadline">
          <i className="ri-calendar-check-line" aria-hidden />
          <div>
            <span className="cms-admission-docs__deadline-label">{t("admission.kochirish.deadlineLabel")}</span>
            <span className="cms-admission-docs__deadline-value">{content.deadline}</span>
          </div>
        </div>
      )}

      {content.videoUrl && (
        <div className="cms-admission-video cms-kochirish-restore__video">
          <iframe src={content.videoUrl} title={t("admission.kochirish.video")} loading="lazy" allowFullScreen />
        </div>
      )}

      {content.rejectionReasons.length > 0 && (
        <section className="cms-kochirish-restore__rejections">
          <h3 className="cms-admission-docs__section-title">
            {content.rejectionTitle ?? t("admission.kochirish.rejectionTitle")}
          </h3>
          <ol className="cms-admission-docs__checklist">
            {content.rejectionReasons.map((reason, index) => (
              <li key={reason} className="cms-admission-docs__checklist-item">
                <span className="cms-admission-docs__checklist-num" aria-hidden>
                  {index + 1}
                </span>
                <span className="cms-admission-docs__checklist-text">{reason}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {pdfUrl && <AdmissionSupplementaryPdf pdfUrl={pdfUrl} titleKey={getKochirishPdfTitleKey(pdfUrl)} />}
    </div>
  );
}
