import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Leader } from "@/types/content";
import { normalizeCmsOrthography } from "@/lib/normalizeCmsText";
import LeaderRichContent from "@/components/shared/LeaderRichContent";

function displayText(value: string): string {
  return normalizeCmsOrthography(value.replace(/`/g, "'"));
}

function ContactChip({
  icon,
  label,
  href,
  value,
}: {
  icon: string;
  label: string;
  href?: string;
  value: string;
}) {
  const content = (
    <>
      <span className="leader-contact__label">{label}</span>
      <span className="leader-contact__value">{value}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="leader-contact">
        <i className={icon} aria-hidden />
        {content}
      </a>
    );
  }

  return (
    <div className="leader-contact">
      <i className={icon} aria-hidden />
      {content}
    </div>
  );
}

export default function LeaderFeaturedProfile({
  leader,
  slug,
}: {
  leader: Leader;
  slug: string;
}) {
  const { t } = useTranslation();
  const highlights =
    slug === "rektor"
      ? [
          t("leadership.highlight1"),
          t("leadership.highlight2"),
          t("leadership.highlight3"),
          t("leadership.highlight4"),
        ]
      : [];

  const phoneHref = leader.phone ? `tel:${leader.phone.replace(/\s/g, "")}` : undefined;
  const emailHref = leader.email ? `mailto:${leader.email}` : undefined;

  return (
    <article className="leader-featured">
      <div className="leader-featured__hero">
        <div className="leader-featured__portrait">
          {leader.photo ? (
            <img
              src={leader.photo}
              alt={leader.name}
              className="leader-featured__photo"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="leader-featured__photo-placeholder" aria-hidden>
              <i className="ri-user-3-line" />
            </div>
          )}
        </div>

        <div className="leader-featured__intro">
          <span className="leader-featured__badge">{t("leadership.rectorLabel")}</span>
          <h2 className="leader-featured__name">{displayText(leader.name)}</h2>
          <p className="leader-featured__position">{displayText(leader.position)}</p>

          <blockquote className="leader-featured__quote">{t("leadership.quote")}</blockquote>

          {highlights.length > 0 && (
            <ul className="leader-featured__highlights">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          <div className="leader-featured__contacts">
            {leader.phone && (
              <ContactChip
                icon="ri-phone-line"
                label={t("leader.contact.phone")}
                value={leader.phone}
                href={phoneHref}
              />
            )}
            {leader.email && (
              <ContactChip
                icon="ri-mail-line"
                label={t("leader.contact.email")}
                value={leader.email}
                href={emailHref}
              />
            )}
            {leader.receptionDays && (
              <ContactChip
                icon="ri-calendar-check-line"
                label={t("leader.contact.reception")}
                value={displayText(leader.receptionDays)}
              />
            )}
          </div>

          <Link to="/virtual-qabulxona" className="leader-featured__cta">
            <i className="ri-customer-service-2-line" aria-hidden />
            {t("leader.virtualReception")}
          </Link>
        </div>
      </div>

      <div className="leader-featured__sections">
        {leader.activity?.trim() && (
          <section className="leader-panel leader-panel--duties">
            <header className="leader-panel__head">
              <i className="ri-briefcase-4-line" aria-hidden />
              <h3>{t("leader.activity")}</h3>
            </header>
            <div className="leader-panel__body">
              <LeaderRichContent html={leader.activity} />
            </div>
          </section>
        )}

        {leader.biography?.trim() && (
          <section className="leader-panel leader-panel--bio">
            <header className="leader-panel__head">
              <i className="ri-book-open-line" aria-hidden />
              <h3>{t("leader.biography")}</h3>
            </header>
            <div className="leader-panel__body">
              <LeaderRichContent html={leader.biography} />
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
