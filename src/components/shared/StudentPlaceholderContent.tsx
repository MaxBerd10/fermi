import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BAKALAVRIAT_STUDENT_MENU_ID,
  BAKALAVRIAT_STUDENT_RELATED_LINKS,
} from "@/lib/bakalavriatStudentSection";
import {
  MAGISTRATURA_STUDENT_MENU_ID,
  MAGISTRATURA_STUDENT_RELATED_LINKS,
} from "@/lib/magistraturaStudentSection";

import {
  ORDINATURA_STUDENT_MENU_ID,
  ORDINATURA_STUDENT_RELATED_LINKS,
} from "@/lib/ordinaturaStudentSection";
import {
  XORIJIY_STUDENT_MENU_ID,
  XORIJIY_STUDENT_RELATED_LINKS,
} from "@/lib/xorijiyStudentSection";
import {
  IQTIDORLI_STUDENT_MENU_ID,
  IQTIDORLI_STUDENT_RELATED_LINKS,
} from "@/lib/iqtidorliStudentSection";
import {
  KLINIK_FIKRLASH_STUDENT_MENU_ID,
  KLINIK_FIKRLASH_STUDENT_RELATED_LINKS,
} from "@/lib/klinikFikrlashStudentSection";

const RELATED_BY_MENU: Record<number, { href: string; labelKey: string; icon: string }[]> = {
  [BAKALAVRIAT_STUDENT_MENU_ID]: BAKALAVRIAT_STUDENT_RELATED_LINKS.map((link) => ({
    href: `/blog/${BAKALAVRIAT_STUDENT_MENU_ID}/${link.slug}`,
    labelKey: link.labelKey,
    icon: link.icon,
  })),
  [MAGISTRATURA_STUDENT_MENU_ID]: MAGISTRATURA_STUDENT_RELATED_LINKS.map((link) => ({
    href: `/blog/${MAGISTRATURA_STUDENT_MENU_ID}/${link.slug}`,
    labelKey: link.labelKey,
    icon: link.icon,
  })),
  [ORDINATURA_STUDENT_MENU_ID]: ORDINATURA_STUDENT_RELATED_LINKS.map((link) => ({
    href: `/blog/${ORDINATURA_STUDENT_MENU_ID}/${link.slug}`,
    labelKey: link.labelKey,
    icon: link.icon,
  })),
  [XORIJIY_STUDENT_MENU_ID]: XORIJIY_STUDENT_RELATED_LINKS.map((link) => ({
    href: `/blog/${XORIJIY_STUDENT_MENU_ID}/${link.slug}`,
    labelKey: link.labelKey,
    icon: link.icon,
  })),
  [IQTIDORLI_STUDENT_MENU_ID]: IQTIDORLI_STUDENT_RELATED_LINKS.map((link) => ({
    href: `/blog/${IQTIDORLI_STUDENT_MENU_ID}/${link.slug}`,
    labelKey: link.labelKey,
    icon: link.icon,
  })),
  [KLINIK_FIKRLASH_STUDENT_MENU_ID]: KLINIK_FIKRLASH_STUDENT_RELATED_LINKS.map((link) => ({
    href: `/blog/${KLINIK_FIKRLASH_STUDENT_MENU_ID}/${link.slug}`,
    labelKey: link.labelKey,
    icon: link.icon,
  })),
};

export default function StudentPlaceholderContent({ menuId }: { menuId: number }) {
  const { t } = useTranslation();
  const related = RELATED_BY_MENU[menuId] ?? [];

  return (
    <div className="cms-science cms-science--student-placeholder">
      <div className="cms-student-status">
        <span className="cms-student-status__badge">
          <i className="ri-time-line" aria-hidden />
          {t("student.placeholder.badge")}
        </span>
        <p className="cms-student-status__text">{t("student.placeholder.text")}</p>
      </div>

      {related.length > 0 && (
        <>
          <h3 className="cms-student-related__title">{t("student.placeholder.related")}</h3>
          <div className="cms-fundamental-links">
            {related.map((link) => (
              <Link key={link.href} to={link.href} className="cms-fundamental-link">
                <span className="cms-fundamental-link__icon" aria-hidden>
                  <i className={link.icon} />
                </span>
                <span className="cms-fundamental-link__body">
                  <span className="cms-fundamental-link__title">{t(link.labelKey)}</span>
                </span>
                <i className="ri-arrow-right-s-line cms-fundamental-link__arrow" aria-hidden />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
