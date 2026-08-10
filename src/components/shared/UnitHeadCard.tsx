import { useTranslation } from "react-i18next";
import type { Leader } from "@/types/content";
import LeaderRichContent from "@/components/shared/LeaderRichContent";
import {
  cleanPhoneForTel,
  displayLeaderText,
  hasLeaderHtmlContent,
  isPlaceholderLeaderName,
} from "@/lib/leaderDisplay";

function splitPhones(phone: string): string[] {
  const byPlus = phone
    .split(/(?=\+\d)/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (byPlus.length > 1) return byPlus;

  return phone
    .split(/[,;]|(?:\s{2,})/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function splitEmails(email: string): string[] {
  return email
    .split(/[,;]/)
    .map((e) => e.trim())
    .filter(Boolean);
}

export default function UnitHeadCard({
  leader,
  open,
  onToggle,
  badgeKey = "unit.headBadge",
}: {
  leader: Leader;
  open: boolean;
  onToggle: () => void;
  badgeKey?: string;
}) {
  const { t } = useTranslation();
  const hasActivity = hasLeaderHtmlContent(leader.activity);
  const hasBio = hasLeaderHtmlContent(leader.biography);
  const hasRichDetails = hasActivity || hasBio;
  const phones = leader.phone ? splitPhones(leader.phone) : [];
  const emails = leader.email ? splitEmails(leader.email) : [];
  const hasContactDetails = Boolean(
    phones.length || emails.length || leader.receptionDays?.trim() || leader.faks?.trim(),
  );
  const hasDetails = hasRichDetails || hasContactDetails;
  const singlePanel = hasRichDetails ? hasActivity !== hasBio : true;
  const showContactFallback = open && !hasRichDetails && hasContactDetails;
  const isPending = isPlaceholderLeaderName(leader.name);
  const isDefaultPhoto = /default%20image|default\.png/i.test(leader.photo ?? "");

  return (
    <article className={`unit-head ${open ? "unit-head--open" : ""}`}>
      <div className="unit-head__summary">
        <div className="unit-head__portrait">
          {leader.photo && !isDefaultPhoto ? (
            <img src={leader.photo} alt={leader.name} className="unit-head__photo" loading="lazy" />
          ) : (
            <div className="unit-head__photo-placeholder" aria-hidden>
              <i className="ri-user-3-line" />
            </div>
          )}
        </div>

        <div className="unit-head__info">
          <span className="unit-head__badge">{t(badgeKey)}</span>
          {isPending ? (
            <>
              <p className="unit-head__pending">{t("unit.headPending")}</p>
              <p className="unit-head__role">{displayLeaderText(leader.position)}</p>
            </>
          ) : (
            <>
              <h3 className="unit-head__name">{displayLeaderText(leader.name)}</h3>
              <p className="unit-head__role">{displayLeaderText(leader.position)}</p>
            </>
          )}

          <div className="unit-head__contacts">
            {phones.map((phone) => (
              <a key={phone} href={`tel:${cleanPhoneForTel(phone)}`} className="unit-head__contact">
                <i className="ri-phone-line" aria-hidden />
                {phone}
              </a>
            ))}
            {emails.map((email) => (
              <a key={email} href={`mailto:${email}`} className="unit-head__contact">
                <i className="ri-mail-line" aria-hidden />
                {email}
              </a>
            ))}
            {leader.receptionDays && (
              <span className="unit-head__contact unit-head__contact--plain">
                <i className="ri-calendar-line" aria-hidden />
                {displayLeaderText(leader.receptionDays)}
              </span>
            )}
          </div>
        </div>

        {hasDetails && (
          <button type="button" className="unit-head__toggle" onClick={onToggle} aria-expanded={open}>
            {open ? t("leader.showLess") : t("leader.readMore")}
            <i className={`ri-arrow-${open ? "up" : "down"}-s-line`} aria-hidden />
          </button>
        )}
      </div>

      {open && hasDetails && (
        <div className={`unit-head__panels${singlePanel ? " unit-head__panels--single" : ""}`}>
          {hasActivity && (
            <section className="unit-head__panel">
              <h4 className="unit-head__panel-title">{t("leader.activity")}</h4>
              <div className="unit-head__panel-scroll">
                <LeaderRichContent html={leader.activity} />
              </div>
            </section>
          )}
          {hasBio && (
            <section className="unit-head__panel">
              <h4 className="unit-head__panel-title">{t("leader.biography")}</h4>
              <div className="unit-head__panel-scroll">
                <LeaderRichContent html={leader.biography} />
              </div>
            </section>
          )}
          {showContactFallback && (
            <section className="unit-head__panel">
              <h4 className="unit-head__panel-title">{t("unit.headContactTitle")}</h4>
              <div className="unit-head__panel-scroll">
                <dl className="unit-head__detail-list">
                  {leader.position?.trim() && (
                    <>
                      <dt>{t("leader.contact.role")}</dt>
                      <dd>{displayLeaderText(leader.position)}</dd>
                    </>
                  )}
                  {phones.map((phone) => (
                    <div key={phone}>
                      <dt>{t("leader.contact.phone")}</dt>
                      <dd>
                        <a href={`tel:${cleanPhoneForTel(phone)}`}>{phone}</a>
                      </dd>
                    </div>
                  ))}
                  {emails.map((email) => (
                    <div key={email}>
                      <dt>{t("leader.contact.email")}</dt>
                      <dd>
                        <a href={`mailto:${email}`}>{email}</a>
                      </dd>
                    </div>
                  ))}
                  {leader.receptionDays?.trim() && (
                    <>
                      <dt>{t("leader.contact.reception")}</dt>
                      <dd>{displayLeaderText(leader.receptionDays)}</dd>
                    </>
                  )}
                  {leader.faks?.trim() && (
                    <>
                      <dt>{t("leader.contact.fax")}</dt>
                      <dd>{displayLeaderText(leader.faks)}</dd>
                    </>
                  )}
                </dl>
                <p className="unit-head__empty-note">{t("leader.noExtendedInfo")}</p>
              </div>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
