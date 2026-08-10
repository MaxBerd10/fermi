import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";

export default function JournalAboutContent({ pdfUrl }: { pdfUrl?: string | null }) {
  const { t } = useTranslation();
  const features = t("journal.about.features", { returnObjects: true }) as string[];
  const topics = t("journal.about.topics", { returnObjects: true }) as string[];

  return (
    <div className="cms-journal-about">
      <div className="cms-journal-about__hero">
        <span className="cms-journal-about__badge">
          <i className="ri-award-line" aria-hidden />
          {t("journal.scopusIndexed")}
        </span>
        <h2 className="cms-journal-about__title">{t("journal.about.title")}</h2>
        <p className="cms-journal-about__lead">{t("journal.about.lead")}</p>
      </div>

      <div className="cms-journal-about__stats">
        <div className="cms-journal-about__stat">
          <span className="cms-journal-about__stat-value">JCPM</span>
          <span className="cms-journal-about__stat-label">{t("journal.about.statName")}</span>
        </div>
        <div className="cms-journal-about__stat">
          <span className="cms-journal-about__stat-value">Scopus</span>
          <span className="cms-journal-about__stat-label">{t("journal.about.statIndex")}</span>
        </div>
        <div className="cms-journal-about__stat">
          <span className="cms-journal-about__stat-value">OAK</span>
          <span className="cms-journal-about__stat-label">{t("journal.about.statOak")}</span>
        </div>
      </div>

      {Array.isArray(features) && features.length > 0 && (
        <ul className="cms-journal-about__features">
          {features.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {Array.isArray(topics) && topics.length > 0 && (
        <div className="cms-journal-about__topics">
          <h3 className="cms-journal-about__topics-title">{t("journal.about.topicsTitle")}</h3>
          <div className="cms-journal-about__topics-grid">
            {topics.map((topic) => (
              <span key={topic} className="cms-journal-about__topic">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      <aside className="cms-journal-about__highlight">
        <p>{t("journal.benefits")}</p>
      </aside>

      <div className="cms-journal-about__links">
        <Link to="/blog/283/maqola-namunasi" className="cms-journal-about__link cms-journal-about__link--primary">
          <i className="ri-file-text-line" aria-hidden />
          {t("journal.submitArticle")}
        </Link>
        <Link to="/blog/283/tahrir-hayati-kengashi" className="cms-journal-about__link">
          <i className="ri-team-line" aria-hidden />
          {t("journal.about.editorialLink")}
        </Link>
      </div>

      {pdfUrl && (
        <div className="cms-journal-about__pdf">
          <h3 className="cms-journal-about__pdf-title">{t("journal.about.oakTitle")}</h3>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t("journal.about.oakTitle")} interactive />
        </div>
      )}
    </div>
  );
}
