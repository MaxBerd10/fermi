import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { getStudentPageMeta } from "@/lib/studentSection";
import { parseStudentGroupedDocuments, type StudentDocumentLink } from "@/lib/parseBakalavriatStudentContent";

function DocumentRow({
  doc,
  onPreview,
}: {
  doc: StudentDocumentLink;
  onPreview: (url: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="cms-doc-specialty cms-doc-specialty--link">
      <span className="cms-doc-specialty__title">{doc.title}</span>
      <span className="cms-student-test__actions">
        {doc.isPdf && (
          <button
            type="button"
            className="cms-student-test__preview"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPreview(doc.url);
            }}
          >
            <i className="ri-eye-line" aria-hidden />
          </button>
        )}
        <i className="ri-download-2-line" aria-hidden />
      </span>
    </a>
  );
}

export default function StudentTestCollectionsContent({
  menuId,
  html,
  slug,
}: {
  menuId: number;
  html: string;
  slug: string;
}) {
  const { t } = useTranslation();
  const meta = getStudentPageMeta(menuId, slug);
  const introKey = meta.linksIntroKey ?? "student.bakalavriat.testToplamlari.intro";
  const parsed = useMemo(() => parseStudentGroupedDocuments(html), [html]);
  const [query, setQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return parsed.groups;
    return parsed.groups
      .map((group) => ({
        ...group,
        documents: group.documents.filter(
          (doc) => doc.title.toLowerCase().includes(q) || group.heading.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.documents.length > 0);
  }, [parsed.groups, query]);

  const totalDocs = groups.reduce((sum, g) => sum + g.documents.length, 0);

  return (
    <div className="cms-science cms-science--student-tests">
      <p className="cms-student__lead">{t(introKey)}</p>

      {parsed.coverImage && (
        <figure className="cms-student__cover">
          <img src={parsed.coverImage} alt="" loading="lazy" />
        </figure>
      )}

      <label className="cms-student-search">
        <i className="ri-search-line" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("student.searchTests")}
          className="cms-student-search__input"
        />
      </label>

      <div className="cms-student__head">
        <span className="cms-student__badge">
          <i className="ri-book-read-line" aria-hidden />
          {t("student.testCollectionsBadge")}
        </span>
        <span className="cms-student__count">{t("student.documentsCount", { count: totalDocs })}</span>
      </div>

      <div className="cms-student-test__groups">
        {groups.map((group) => (
          <section key={group.heading || group.documents[0]?.url} className="cms-student-test__group">
            {group.heading && <h3 className="cms-admission-docs__section-title">{group.heading}</h3>}
            <div className="cms-student-test__list">
              {group.documents.map((doc) => (
                <DocumentRow key={doc.url} doc={doc} onPreview={setPreviewUrl} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {previewUrl && (
        <div className="cms-student__pdf">
          <PdfDocumentViewer pdfUrl={previewUrl} title={t("science.viewDocument")} interactive />
        </div>
      )}
    </div>
  );
}
