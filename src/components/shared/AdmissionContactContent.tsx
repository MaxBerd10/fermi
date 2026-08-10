import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import RichContent from "@/components/shared/RichContent";
import { enhanceAdmissionHtml } from "@/lib/enhanceAdmissionHtml";
import { parseAdmissionContact } from "@/lib/parseAdmissionContent";

export default function AdmissionContactContent({ html, slug }: { html: string; slug: string }) {
  const { t } = useTranslation();
  const contact = useMemo(() => parseAdmissionContact(html), [html]);
  const articleHtml = useMemo(() => enhanceAdmissionHtml(html), [html]);
  const hasStructured = Boolean(contact.address || contact.phones.length || contact.mapUrl || contact.emails.length);

  return (
    <div className="cms-science cms-science--admission-contact">
      {contact.images[0] && (
        <figure className="cms-admission-contact__banner">
          <img src={contact.images[0].url} alt="" loading="lazy" />
        </figure>
      )}

      <div className="cms-admission-contact__grid">
        {contact.address && (
          <div className="cms-admission-contact__card">
            <span className="cms-admission-contact__icon" aria-hidden>
              <i className="ri-map-pin-line" />
            </span>
            <div>
              <h3 className="cms-admission-contact__label">{t("admission.contact.address")}</h3>
              <p className="cms-admission-contact__value">{contact.address}</p>
            </div>
          </div>
        )}

        {contact.phones.length > 0 && (
          <div className="cms-admission-contact__card">
            <span className="cms-admission-contact__icon" aria-hidden>
              <i className="ri-phone-line" />
            </span>
            <div>
              <h3 className="cms-admission-contact__label">{t("admission.contact.phones")}</h3>
              <div className="cms-admission-contact__phones">
                {contact.phones.map((phone) => (
                  <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="cms-admission-contact__phone">
                    {phone}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {contact.emails.length > 0 && (
          <div className="cms-admission-contact__card">
            <span className="cms-admission-contact__icon" aria-hidden>
              <i className="ri-mail-line" />
            </span>
            <div>
              <h3 className="cms-admission-contact__label">{t("admission.qoshma.email")}</h3>
              <div className="cms-admission-contact__phones">
                {contact.emails.map((email) => (
                  <a key={email} href={`mailto:${email}`} className="cms-admission-contact__phone">
                    {email}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {contact.mapUrl && (
        <div className="cms-admission-contact__map">
          <iframe src={contact.mapUrl} title={t("admission.contact.map")} loading="lazy" allowFullScreen />
        </div>
      )}

      {articleHtml.trim() && !hasStructured && (
        <RichContent html={articleHtml} slug={slug} className="cms-article cms-article--rich cms-article--admission" />
      )}
    </div>
  );
}
