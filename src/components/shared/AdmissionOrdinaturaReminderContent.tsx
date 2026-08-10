import { useMemo } from "react";
import { parseOrdinaturaReminder } from "@/lib/parseOrdinaturaContent";
import { getOrdinaturaPdfTitleKey } from "@/lib/parseOrdinaturaContent";
import AdmissionSupplementaryPdf from "@/components/shared/AdmissionSupplementaryPdf";

export default function AdmissionOrdinaturaReminderContent({
  html,
  pdfUrl,
}: {
  html: string;
  pdfUrl?: string | null;
}) {
  const content = useMemo(() => parseOrdinaturaReminder(html, pdfUrl), [html, pdfUrl]);

  return (
    <div className="cms-science cms-science--ordinatura-reminder">
      {content.bannerImage && (
        <figure className="cms-ordinatura-reminder__banner">
          <img src={content.bannerImage} alt="" loading="lazy" />
        </figure>
      )}

      {content.title && <h3 className="cms-ordinatura-reminder__title">{content.title}</h3>}

      <div className="cms-ordinatura-reminder__sections">
        {content.sections.map((section) => (
          <section key={section.title} className="cms-ordinatura-reminder__section">
            <h4 className="cms-ordinatura-reminder__section-title">{section.title}</h4>
            <ul className="cms-ordinatura-reminder__list">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {pdfUrl && (
        <AdmissionSupplementaryPdf pdfUrl={pdfUrl} titleKey={getOrdinaturaPdfTitleKey(pdfUrl, content.pdfTitleKey)} />
      )}
    </div>
  );
}
