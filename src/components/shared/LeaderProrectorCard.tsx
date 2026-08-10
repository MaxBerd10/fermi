import { useTranslation } from "react-i18next";
import type { Leader } from "@/types/content";
import LeaderRichContent from "@/components/shared/LeaderRichContent";
import {
  cleanPhoneForTel,
  displayLeaderText,
  getLeaderRoleKey,
  getLeaderRoleTone,
} from "@/lib/leaderDisplay";

function ContactPill({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="leader-pill__label">{label}</span>
      <span className="leader-pill__value">{value}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="leader-pill">
        <i className={icon} aria-hidden />
        {inner}
      </a>
    );
  }

  return (
    <div className="leader-pill">
      <i className={icon} aria-hidden />
      {inner}
    </div>
  );
}

export default function LeaderProrectorCard({
  leader,
  open,
  onToggle,
}: {
  leader: Leader;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const roleKey = getLeaderRoleKey(leader.position);
  const tone = getLeaderRoleTone(leader.position);
  const hasActivity = Boolean(leader.activity?.trim());
  const hasBio = Boolean(leader.biography?.trim());
  const hasDetails = hasActivity || hasBio;
  const singlePanel = hasActivity !== hasBio;

  return (
    <article className={`leader-prorector leader-prorector--${tone} ${open ? "leader-prorector--open" : ""}`}>
      <div className="leader-prorector__header">
        <div className="leader-prorector__portrait">
          {leader.photo ? (
            <img src={leader.photo} alt={leader.name} className="leader-prorector__photo" loading="lazy" />
          ) : (
            <div className="leader-prorector__photo-placeholder" aria-hidden>
              <i className="ri-user-3-line" />
            </div>
          )}
        </div>

        <div className="leader-prorector__summary">
          {roleKey && <span className="leader-prorector__badge">{t(roleKey)}</span>}
          <h3 className="leader-prorector__name">{displayLeaderText(leader.name)}</h3>
          <p className="leader-prorector__position">{displayLeaderText(leader.position)}</p>

          <div className="leader-prorector__contacts">
            {leader.phone && (
              <ContactPill
                icon="ri-phone-line"
                label={t("leader.contact.phone")}
                value={leader.phone}
                href={`tel:${cleanPhoneForTel(leader.phone)}`}
              />
            )}
            {leader.email && (
              <ContactPill
                icon="ri-mail-line"
                label={t("leader.contact.email")}
                value={leader.email}
                href={`mailto:${leader.email}`}
              />
            )}
            {leader.receptionDays && (
              <ContactPill
                icon="ri-calendar-check-line"
                label={t("leader.contact.reception")}
                value={displayLeaderText(leader.receptionDays)}
              />
            )}
          </div>
        </div>

        {hasDetails && (
          <button
            type="button"
            className="leader-prorector__toggle"
            onClick={onToggle}
            aria-expanded={open}
          >
            <span>{open ? t("leader.showLess") : t("leader.readMore")}</span>
            <i className={`ri-arrow-down-s-line ${open ? "rotate-180" : ""}`} aria-hidden />
          </button>
        )}
      </div>

      {open && hasDetails && (
        <div className={`leader-prorector__panels ${singlePanel ? "leader-prorector__panels--single" : ""}`}>
          {hasActivity && (
            <section className="leader-panel leader-panel--duties leader-panel--compact">
              <header className="leader-panel__head">
                <i className="ri-briefcase-4-line" aria-hidden />
                <h4>{t("leader.activity")}</h4>
              </header>
              <div className="leader-panel__body">
                <LeaderRichContent html={leader.activity} />
              </div>
            </section>
          )}
          {hasBio && (
            <section className="leader-panel leader-panel--bio leader-panel--compact">
              <header className="leader-panel__head">
                <i className="ri-book-open-line" aria-hidden />
                <h4>{t("leader.biography")}</h4>
              </header>
              <div className="leader-panel__body">
                <LeaderRichContent html={leader.biography} />
              </div>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
