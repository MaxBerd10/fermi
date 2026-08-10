import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { getInternaturaCommissionContact } from "@/lib/internaturaSection";
import { INSTITUTE_ADDRESS, MAP_EMBED_URL } from "@/lib/siteConstants";

export default function AdmissionInternaturaCommissionContent({
  pdfUrl,
  pdfTitleKey,
}: {
  pdfUrl?: string | null;
  pdfTitleKey?: string;
}) {
  const { t } = useTranslation();
  const contact = getInternaturaCommissionContact();

  return (
    <div className="cms-science cms-science--admission-contact cms-science--internatura-commission">
      <p className="cms-admission-internatura__lead">{t("admission.internatura.commission.lead")}</p>

      <div className="cms-admission-contact__grid">
        <div className="cms-admission-contact__card">
          <span className="cms-admission-contact__icon" aria-hidden>
            <i className="ri-map-pin-line" />
          </span>
          <div>
            <h3 className="cms-admission-contact__label">{t("admission.contact.address")}</h3>
            <p className="cms-admission-contact__value">{contact.address || INSTITUTE_ADDRESS}</p>
          </div>
        </div>

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

        <div className="cms-admission-contact__card">
          <span className="cms-admission-contact__icon" aria-hidden>
            <i className="ri-time-line" />
          </span>
          <div>
            <h3 className="cms-admission-contact__label">{t("admission.internatura.commission.scheduleLabel")}</h3>
            <p className="cms-admission-contact__value">{t("admission.internatura.commission.schedule")}</p>
          </div>
        </div>
      </div>

      <div className="cms-admission-contact__map">
        <iframe src={contact.mapUrl || MAP_EMBED_URL} title={t("admission.contact.map")} loading="lazy" allowFullScreen />
      </div>

      {pdfUrl && (
        <div className="cms-admission-internatura__pdf">
          <div className="cms-admission-gallery__pdf-head">
            <h3 className="cms-admission-gallery__pdf-title">{t(pdfTitleKey ?? "admission.internatura.pdf.info")}</h3>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
              <i className="ri-download-2-line" aria-hidden />
              {t("science.downloadDocument")}
            </a>
          </div>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t(pdfTitleKey ?? "admission.internatura.pdf.info")} interactive />
        </div>
      )}
    </div>
  );
}
