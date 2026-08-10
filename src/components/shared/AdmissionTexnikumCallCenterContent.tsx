import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { getTexnikumCallCenterContact, getTexnikumBitiruvPdfTitleKey } from "@/lib/texnikumBitiruvSection";

export default function AdmissionTexnikumCallCenterContent({
  pdfUrl,
  slug,
}: {
  pdfUrl?: string | null;
  slug: string;
}) {
  const { t } = useTranslation();
  const contact = getTexnikumCallCenterContact();

  return (
    <div className="cms-science cms-science--texnikum-callcenter">
      <p className="cms-admission-texnikum__lead">{t("admission.texnikum.callcenter.lead")}</p>

      <div className="cms-admission-contact__grid">
        <div className="cms-admission-contact__card">
          <span className="cms-admission-contact__icon" aria-hidden>
            <i className="ri-map-pin-line" />
          </span>
          <div>
            <h3 className="cms-admission-contact__label">{t("admission.contact.address")}</h3>
            <p className="cms-admission-contact__value">{contact.address}</p>
          </div>
        </div>

        <div className="cms-admission-contact__card">
          <span className="cms-admission-contact__icon" aria-hidden>
            <i className="ri-phone-line" />
          </span>
          <div>
            <h3 className="cms-admission-contact__label">{t("admission.texnikum.callcenter.phonesLabel")}</h3>
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
      </div>

      {pdfUrl && (
        <div className="cms-admission-texnikum__pdf">
          <div className="cms-admission-gallery__pdf-head">
            <h3 className="cms-admission-gallery__pdf-title">{t(getTexnikumBitiruvPdfTitleKey(pdfUrl, slug))}</h3>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
              <i className="ri-download-2-line" aria-hidden />
              {t("science.downloadDocument")}
            </a>
          </div>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t(getTexnikumBitiruvPdfTitleKey(pdfUrl, slug))} interactive />
        </div>
      )}
    </div>
  );
}
