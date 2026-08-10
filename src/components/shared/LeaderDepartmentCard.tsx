import { useTranslation } from "react-i18next";
import type { Leader } from "@/types/content";
import LeaderRichContent from "@/components/shared/LeaderRichContent";
import {
  cleanPhoneForTel,
  displayLeaderText,
  getDepartmentLabel,
  getLeaderRoleTone,
} from "@/lib/leaderDisplay";

export default function LeaderDepartmentCard({
  leader,
  open,
  onToggle,
  index,
}: {
  leader: Leader;
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  const { t } = useTranslation();
  const tone = getLeaderRoleTone(leader.position);
  const department = getDepartmentLabel(leader.position);
  const hasActivity = Boolean(leader.activity?.trim());
  const hasBio = Boolean(leader.biography?.trim());
  const hasDetails = hasActivity || hasBio;
  const singlePanel = hasActivity !== hasBio;

  return (
    <article className={`leader-dept leader-dept--${tone} ${open ? "leader-dept--open" : ""}`}>
      <button type="button" className="leader-dept__head" onClick={onToggle} aria-expanded={open}>
        <span className="leader-dept__index">{String(index + 1).padStart(2, "0")}</span>

        <div className="leader-dept__portrait">
          {leader.photo ? (
            <img src={leader.photo} alt={leader.name} className="leader-dept__photo" loading="lazy" />
          ) : (
            <div className="leader-dept__photo-placeholder" aria-hidden>
              <i className="ri-user-3-line" />
            </div>
          )}
        </div>

        <div className="leader-dept__info">
          <span className="leader-dept__badge">{department}</span>
          <h3 className="leader-dept__name">{displayLeaderText(leader.name)}</h3>
          <p className="leader-dept__position">{displayLeaderText(leader.position)}</p>

          <div className="leader-dept__meta">
            {leader.phone && (
              <span className="leader-dept__meta-item">
                <i className="ri-phone-line" aria-hidden />
                {leader.phone}
              </span>
            )}
            {leader.receptionDays && (
              <span className="leader-dept__meta-item">
                <i className="ri-calendar-line" aria-hidden />
                {displayLeaderText(leader.receptionDays)}
              </span>
            )}
          </div>
        </div>

        <span className="leader-dept__chevron" aria-hidden>
          <i className={`ri-arrow-down-s-line ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && hasDetails && (
        <div className="leader-dept__details">
          <div className="leader-dept__quick">
            {leader.email && (
              <a href={`mailto:${leader.email}`} className="leader-dept__quick-link">
                <i className="ri-mail-line" aria-hidden />
                {leader.email}
              </a>
            )}
            {leader.phone && (
              <a href={`tel:${cleanPhoneForTel(leader.phone)}`} className="leader-dept__quick-link">
                <i className="ri-phone-line" aria-hidden />
                {t("leader.contact.phone")}
              </a>
            )}
          </div>

          <div className={`leader-dept__panels ${singlePanel ? "leader-dept__panels--single" : ""}`}>
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
        </div>
      )}
    </article>
  );
}
