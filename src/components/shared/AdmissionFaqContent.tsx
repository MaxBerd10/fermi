import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseAdmissionFaq } from "@/lib/parseKochirishContent";

export default function AdmissionFaqContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const content = useMemo(() => parseAdmissionFaq(html), [html]);

  return (
    <div className="cms-science cms-science--admission-faq">
      {content.bannerImage && (
        <figure className="cms-admission-faq__banner">
          <img src={content.bannerImage} alt="" loading="lazy" />
        </figure>
      )}

      <div className="cms-admission-faq__list">
        {content.items.map((item) => (
          <details key={item.question} className="cms-admission-faq__item">
            <summary className="cms-admission-faq__question">
              <i className="ri-question-line" aria-hidden />
              <span>{item.question}</span>
            </summary>
            <div className="cms-admission-faq__answer">{item.answer}</div>
          </details>
        ))}
      </div>

      {content.videoUrl && (
        <div className="cms-admission-video cms-admission-faq__video">
          <iframe src={content.videoUrl} title={t("admission.kochirish.video")} loading="lazy" allowFullScreen />
        </div>
      )}

      {content.mapUrl && (
        <div className="cms-admission-contact__map cms-admission-faq__map">
          <iframe src={content.mapUrl} title={t("admission.contact.map")} loading="lazy" allowFullScreen />
        </div>
      )}
    </div>
  );
}
