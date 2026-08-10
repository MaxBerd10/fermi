import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseAdmissionLocations } from "@/lib/parseOrdinaturaContent";

export default function AdmissionLocationsContent({ html }: { html: string }) {
  const { t } = useTranslation();
  const content = useMemo(() => parseAdmissionLocations(html), [html]);

  return (
    <div className="cms-science cms-science--admission-locations">
      {content.bannerImage && (
        <figure className="cms-admission-locations__banner">
          <img src={content.bannerImage} alt="" loading="lazy" />
        </figure>
      )}

      {content.intro && <p className="cms-admission-locations__intro">{content.intro}</p>}
      {content.heading && <h3 className="cms-admission-locations__heading">{content.heading}</h3>}

      <div className="cms-admission-locations__grid">
        {content.locations.map((loc) => (
          <article key={loc.region} className="cms-admission-locations__card">
            <span className="cms-admission-locations__region">{loc.region}</span>
            {loc.venue && <p className="cms-admission-locations__venue">{loc.venue}</p>}
            {loc.address && <p className="cms-admission-locations__address">{loc.address}</p>}
            {loc.mapUrl && (
              <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="cms-admission-locations__map">
                <i className="ri-map-pin-line" aria-hidden />
                {t("admission.ordinatura.openMap")}
              </a>
            )}
          </article>
        ))}
      </div>

      {content.alerts.map((alert) => (
        <div key={alert} className="cms-admission-locations__alert">
          <i className="ri-error-warning-line" aria-hidden />
          <p>{alert}</p>
        </div>
      ))}

      {content.portalUrl && (
        <a
          href={content.portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cms-admission-cta cms-admission-locations__portal"
        >
          <span className="cms-admission-cta__icon" aria-hidden>
            <i className="ri-ticket-2-line" />
          </span>
          <span className="cms-admission-cta__body">
            <span className="cms-admission-cta__title">
              {content.portalLabel ?? t("admission.ordinatura.cta.ruxsatnoma")}
            </span>
            <span className="cms-admission-cta__url">{content.portalUrl.replace(/^https?:\/\//, "")}</span>
          </span>
          <i className="ri-arrow-right-up-line cms-admission-cta__arrow" aria-hidden />
        </a>
      )}
    </div>
  );
}
