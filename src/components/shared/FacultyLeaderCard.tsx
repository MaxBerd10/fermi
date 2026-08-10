import { useTranslation } from "react-i18next";
import type { Leader } from "@/types/content";
import LeaderRichContent from "@/components/shared/LeaderRichContent";
import {
  cleanPhoneForTel,
  displayLeaderText,
} from "@/lib/leaderDisplay";
import {
  getFacultyRoleKey,
  getFacultyRoleTone,
  isFacultyDean,
} from "@/lib/facultyDisplay";

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
      <span className="faculty-pill__label">{label}</span>
      <span className="faculty-pill__value">{value}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="faculty-pill">
        <i className={icon} aria-hidden />
        {inner}
      </a>
    );
  }

  return (
    <div className="faculty-pill">
      <i className={icon} aria-hidden />
      {inner}
    </div>
  );
}

export default function FacultyLeaderCard({
  leader,
  facultyTitle,
  index,
  open,
  onToggle,
}: {
  leader: Leader;
  facultyTitle: string;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const isDean = isFacultyDean(leader, facultyTitle, index);
  const roleKey = getFacultyRoleKey(leader, facultyTitle, index);
  const tone = getFacultyRoleTone(leader, facultyTitle, index);
  const hasActivity = Boolean(leader.activity?.trim());
  const hasBio = Boolean(leader.biography?.trim());
  const hasDetails = hasActivity || hasBio;
  const singlePanel = hasActivity !== hasBio;
  const displayPosition = isDean && !/dekan/i.test(leader.position)
    ? t("faculty.role.dean")
    : displayLeaderText(leader.position);

  if (isDean) {
    return (
      <article className={`faculty-dean faculty-dean--${tone}`}>
        <div className="faculty-dean__hero">
          <div className="faculty-dean__portrait">
            {leader.photo ? (
              <img src={leader.photo} alt={leader.name} className="faculty-dean__photo" loading="eager" />
            ) : (
              <div className="faculty-dean__photo-placeholder" aria-hidden>
                <i className="ri-user-3-line" />
              </div>
            )}
          </div>
          <div className="faculty-dean__summary">
            <span className="faculty-dean__badge">{t(roleKey)}</span>
            <h3 className="faculty-dean__name">{displayLeaderText(leader.name)}</h3>
            <p className="faculty-dean__position">{displayPosition}</p>
            <div className="faculty-dean__contacts">
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
                  value={leader.receptionDays.trim()}
                />
              )}
            </div>
          </div>
        </div>

        {hasDetails && (
          <>
            <button type="button" className="faculty-dean__toggle" onClick={onToggle} aria-expanded={open}>
              {open ? t("leader.showLess") : t("leader.readMore")}
              <i className={`ri-arrow-${open ? "up" : "down"}-s-line`} aria-hidden />
            </button>
            {open && (
              <div className={`faculty-dean__panels${singlePanel ? " faculty-dean__panels--single" : ""}`}>
                {hasActivity && (
                  <section className="faculty-dean__panel">
                    <h4 className="faculty-dean__panel-title">{t("leader.activity")}</h4>
                    <div className="faculty-dean__panel-scroll">
                      <LeaderRichContent html={leader.activity} />
                    </div>
                  </section>
                )}
                {hasBio && (
                  <section className="faculty-dean__panel">
                    <h4 className="faculty-dean__panel-title">{t("leader.biography")}</h4>
                    <div className="faculty-dean__panel-scroll">
                      <LeaderRichContent html={leader.biography} />
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </article>
    );
  }

  return (
    <article className={`faculty-deputy faculty-deputy--${tone} ${open ? "faculty-deputy--open" : ""}`}>
      <div className="faculty-deputy__header">
        <div className="faculty-deputy__portrait">
          {leader.photo ? (
            <img src={leader.photo} alt={leader.name} className="faculty-deputy__photo" loading="lazy" />
          ) : (
            <div className="faculty-deputy__photo-placeholder" aria-hidden>
              <i className="ri-user-3-line" />
            </div>
          )}
        </div>
        <div className="faculty-deputy__summary">
          <span className="faculty-deputy__badge">{t(roleKey)}</span>
          <h3 className="faculty-deputy__name">{displayLeaderText(leader.name)}</h3>
          <p className="faculty-deputy__position">{displayPosition}</p>
          <div className="faculty-deputy__contacts">
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
          </div>
        </div>
      </div>

      {hasDetails && (
        <>
          <button type="button" className="faculty-deputy__toggle" onClick={onToggle} aria-expanded={open}>
            {open ? t("leader.showLess") : t("leader.readMore")}
            <i className={`ri-arrow-${open ? "up" : "down"}-s-line`} aria-hidden />
          </button>
          {open && (
            <div className={`faculty-deputy__panels${singlePanel ? " faculty-deputy__panels--single" : ""}`}>
              {hasActivity && (
                <section className="faculty-deputy__panel">
                  <h4 className="faculty-deputy__panel-title">{t("leader.activity")}</h4>
                  <div className="faculty-deputy__panel-scroll">
                    <LeaderRichContent html={leader.activity} />
                  </div>
                </section>
              )}
              {hasBio && (
                <section className="faculty-deputy__panel">
                  <h4 className="faculty-deputy__panel-title">{t("leader.biography")}</h4>
                  <div className="faculty-deputy__panel-scroll">
                    <LeaderRichContent html={leader.biography} />
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}
