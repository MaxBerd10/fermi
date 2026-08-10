import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Leader } from "@/types/content";
import { normalizeCmsOrthography } from "@/lib/normalizeCmsText";
import LeaderRichContent from "@/components/shared/LeaderRichContent";

function displayText(value: string): string {
  return normalizeCmsOrthography(value.replace(/`/g, "'"));
}

export default function LeaderTeamCard({ leader, defaultOpen = false }: { leader: Leader; defaultOpen?: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  const hasDetails = Boolean(leader.activity?.trim() || leader.biography?.trim());

  return (
    <article className={`leader-card ${open ? "leader-card--open" : ""}`}>
      <div className="leader-card__main">
        <div className="leader-card__photo-wrap">
          {leader.photo ? (
            <img src={leader.photo} alt={leader.name} className="leader-card__photo" loading="lazy" />
          ) : (
            <div className="leader-card__photo-placeholder" aria-hidden>
              <i className="ri-user-3-line" />
            </div>
          )}
        </div>

        <div className="leader-card__info">
          <h3 className="leader-card__name">{displayText(leader.name)}</h3>
          <p className="leader-card__position">{displayText(leader.position)}</p>

          <div className="leader-card__meta">
            {leader.phone && (
              <a href={`tel:${leader.phone.replace(/\s/g, "")}`} className="leader-card__meta-item">
                <i className="ri-phone-line" aria-hidden />
                {leader.phone}
              </a>
            )}
            {leader.email && (
              <a href={`mailto:${leader.email}`} className="leader-card__meta-item">
                <i className="ri-mail-line" aria-hidden />
                {leader.email}
              </a>
            )}
            {leader.receptionDays && (
              <span className="leader-card__meta-item">
                <i className="ri-calendar-line" aria-hidden />
                {displayText(leader.receptionDays)}
              </span>
            )}
          </div>
        </div>

        {hasDetails && (
          <button
            type="button"
            className="leader-card__toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t("leader.showLess") : t("leader.readMore")}
          >
            <i className={`ri-arrow-down-s-line ${open ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {open && hasDetails && (
        <div className="leader-card__details">
          {leader.activity?.trim() && (
            <section className="leader-card__section">
              <h4>{t("leader.activity")}</h4>
              <LeaderRichContent html={leader.activity} />
            </section>
          )}
          {leader.biography?.trim() && (
            <section className="leader-card__section">
              <h4>{t("leader.biography")}</h4>
              <LeaderRichContent html={leader.biography} />
            </section>
          )}
        </div>
      )}
    </article>
  );
}
