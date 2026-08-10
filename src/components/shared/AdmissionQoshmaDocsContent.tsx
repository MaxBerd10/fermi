import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseQoshmaDocs } from "@/lib/parseQoshmaContent";

export default function AdmissionQoshmaDocsContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const content = useMemo(() => parseQoshmaDocs(html), [html]);

  return (
    <div className="cms-science cms-science--qoshma-docs">
      {content.bannerImage && (
        <figure className="cms-qoshma-docs__banner">
          <img src={content.bannerImage} alt="" loading="lazy" />
        </figure>
      )}

      {content.intro.map((paragraph) => (
        <p key={paragraph} className="cms-qoshma-docs__intro">
          {paragraph}
        </p>
      ))}

      {content.checklistItems.length > 0 && (
        <section className="cms-qoshma-docs__section">
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

      {(content.phones.length > 0 || content.emails.length > 0) && (
        <div className="cms-qoshma-docs__contact-grid">
          {content.phones.length > 0 && (
            <div className="cms-admission-contact__card">
              <span className="cms-admission-contact__icon" aria-hidden>
                <i className="ri-phone-line" />
              </span>
              <div>
                <h4 className="cms-admission-contact__label">{t("admission.contact.phones")}</h4>
                <div className="cms-admission-contact__phones">
                  {content.phones.map((phone) => (
                    <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="cms-admission-contact__phone">
                      {phone}
                    </a>
                  ))}
                </div>
                {content.schedule && <p className="cms-qoshma-docs__schedule">{content.schedule}</p>}
              </div>
            </div>
          )}

          {content.emails.length > 0 && (
            <div className="cms-admission-contact__card">
              <span className="cms-admission-contact__icon" aria-hidden>
                <i className="ri-mail-line" />
              </span>
              <div>
                <h4 className="cms-admission-contact__label">{t("admission.qoshma.email")}</h4>
                <div className="cms-admission-contact__phones">
                  {content.emails.map((email) => (
                    <a key={email} href={`mailto:${email}`} className="cms-admission-contact__phone">
                      {email}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {content.address && (
        <div className="cms-admission-contact__card cms-qoshma-docs__address">
          <span className="cms-admission-contact__icon" aria-hidden>
            <i className="ri-map-pin-line" />
          </span>
          <div>
            <h4 className="cms-admission-contact__label">{t("admission.contact.address")}</h4>
            <p className="cms-admission-contact__value">{content.address}</p>
          </div>
        </div>
      )}

      {content.mapUrl && (
        <div className="cms-admission-contact__map">
          <iframe src={content.mapUrl} title={t("admission.contact.map")} loading="lazy" allowFullScreen />
        </div>
      )}
    </div>
  );
}
