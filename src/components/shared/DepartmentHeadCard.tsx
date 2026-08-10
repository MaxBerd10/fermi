import { useTranslation } from "react-i18next";
import type { Leader } from "@/types/content";
import LeaderRichContent from "@/components/shared/LeaderRichContent";
import {
  cleanPhoneForTel,
  displayLeaderText,
  getDepartmentLabel,
} from "@/lib/leaderDisplay";

/** Compact kafedra mudiri card for department detail pages */
export default function DepartmentHeadCard({
  leader,
  open,
  onToggle,
}: {
  leader: Leader;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const department = getDepartmentLabel(leader.position);
  const hasActivity = Boolean(leader.activity?.trim());
  const hasBio = Boolean(leader.biography?.trim());
  const hasDetails = hasActivity || hasBio;
  const singlePanel = hasActivity !== hasBio;

  return (
    <article className={`dept-head ${open ? "dept-head--open" : ""}`}>
      <div className="dept-head__summary">
        <div className="dept-head__portrait">
          {leader.photo ? (
            <img src={leader.photo} alt={leader.name} className="dept-head__photo" loading="lazy" />
          ) : (
            <div className="dept-head__photo-placeholder" aria-hidden>
              <i className="ri-user-3-line" />
            </div>
          )}
        </div>

        <div className="dept-head__info">
          <span className="dept-head__badge">{department}</span>
          <h3 className="dept-head__name">{displayLeaderText(leader.name)}</h3>
          <p className="dept-head__role">{t("department.headTitle")}</p>

          <div className="dept-head__contacts">
            {leader.phone && (
              <a href={`tel:${cleanPhoneForTel(leader.phone)}`} className="dept-head__contact">
                <i className="ri-phone-line" aria-hidden />
                {leader.phone}
              </a>
            )}
            {leader.email && (
              <a href={`mailto:${leader.email}`} className="dept-head__contact">
                <i className="ri-mail-line" aria-hidden />
                {leader.email}
              </a>
            )}
            {leader.receptionDays && (
              <span className="dept-head__contact dept-head__contact--plain">
                <i className="ri-calendar-line" aria-hidden />
                {displayLeaderText(leader.receptionDays)}
              </span>
            )}
          </div>
        </div>

        {hasDetails && (
          <button type="button" className="dept-head__toggle" onClick={onToggle} aria-expanded={open}>
            {open ? t("leader.showLess") : t("leader.readMore")}
            <i className={`ri-arrow-${open ? "up" : "down"}-s-line`} aria-hidden />
          </button>
        )}
      </div>

      {open && hasDetails && (
        <div className={`dept-head__panels${singlePanel ? " dept-head__panels--single" : ""}`}>
          {hasActivity && (
            <section className="dept-head__panel">
              <h4 className="dept-head__panel-title">{t("leader.activity")}</h4>
              <div className="dept-head__panel-scroll">
                <LeaderRichContent html={leader.activity} />
              </div>
            </section>
          )}
          {hasBio && (
            <section className="dept-head__panel">
              <h4 className="dept-head__panel-title">{t("leader.biography")}</h4>
              <div className="dept-head__panel-scroll">
                <LeaderRichContent html={leader.biography} />
              </div>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
