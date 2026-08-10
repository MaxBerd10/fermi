import { useTranslation } from "react-i18next";
import { getOrdinaturaStudentInfoPointKey } from "@/lib/ordinaturaStudentSection";
import { getStudentPageMeta } from "@/lib/studentSection";

export default function StudentInfoContent({ menuId, slug }: { menuId: number; slug: string }) {
  const { t } = useTranslation();
  const meta = getStudentPageMeta(menuId, slug);

  if (!meta.infoIntroKey) return null;

  const points = meta.infoPointCount
    ? Array.from({ length: meta.infoPointCount }, (_, i) =>
        t(getOrdinaturaStudentInfoPointKey(slug, i + 1)),
      )
    : [];

  return (
    <div className="cms-science cms-science--student-info">
      <p className="cms-student__lead">{t(meta.infoIntroKey)}</p>
      {points.length > 0 && (
        <ul className="cms-student-info__list">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      {meta.infoNoteKey && <p className="cms-student__note">{t(meta.infoNoteKey)}</p>}
    </div>
  );
}
