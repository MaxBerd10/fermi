import { useTranslation } from "react-i18next";

export default function ReformsPageContent({ pdfUrl }: { pdfUrl?: string | null }) {
  const { t } = useTranslation();
  const points = t("reforms.points", { returnObjects: true }) as string[];

  return (
    <div className="cms-reforms-page">
      <p className="cms-reforms-lead">{t("reforms.lead")}</p>

      <ul className="cms-reforms-list">
        {Array.isArray(points) &&
          points.map((point) => (
            <li key={point} className="cms-reforms-list__item">
              {point}
            </li>
          ))}
      </ul>

      <aside className="cms-reforms-highlight">
        <i className="ri-heart-pulse-line text-2xl text-[#0a1158]" aria-hidden />
        <p>{t("reforms.highlight")}</p>
      </aside>

      {pdfUrl && (
        <div className="cms-reforms-pdf">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-reforms-pdf__download"
          >
            <i className="ri-file-pdf-line" />
            {t("reforms.downloadFlayer")}
          </a>
          <div className="cms-reforms-pdf__frame">
            <iframe src={pdfUrl} title={t("reforms.pdfTitle")} className="cms-reforms-pdf__iframe" />
          </div>
        </div>
      )}
    </div>
  );
}
