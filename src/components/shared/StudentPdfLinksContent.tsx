import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import { getStudentPageMeta } from "@/lib/studentSection";
import { parseStudentFlatDocuments, type StudentDocumentLink } from "@/lib/parseBakalavriatStudentContent";

function DocumentRow({
  doc,
  index,
  onPreview,
}: {
  doc: StudentDocumentLink;
  index: number;
  onPreview: (url: string) => void;
}) {
  const { t } = useTranslation();
  const icon = doc.isArchive ? "ri-folder-zip-line" : doc.isPdf ? "ri-file-pdf-line" : "ri-links-line";

  return (
    <li className="cms-student-doc">
      <div className="cms-student-doc__icon" aria-hidden>
        <i className={icon} />
      </div>
      <div className="cms-student-doc__body">
        <span className="cms-student-doc__num">{index + 1}</span>
        <p className="cms-student-doc__title">{doc.title}</p>
        <div className="cms-student-doc__actions">
          {doc.isPdf && (
            <button type="button" className="cms-science-btn cms-science-btn--primary" onClick={() => onPreview(doc.url)}>
              <i className="ri-eye-line" aria-hidden />
              {t("science.viewDocument")}
            </button>
          )}
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="cms-science-btn">
            <i className="ri-download-2-line" aria-hidden />
            {t("science.downloadDocument")}
          </a>
        </div>
      </div>
    </li>
  );
}

export default function StudentPdfLinksContent({
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
  const documents = useMemo(() => parseStudentFlatDocuments(html), [html]);
  const [query, setQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => doc.title.toLowerCase().includes(q));
  }, [documents, query]);

  return (
    <div className="cms-science cms-science--student-links">
      {meta.linksIntroKey && <p className="cms-student__lead">{t(meta.linksIntroKey)}</p>}

      {documents.length >= 8 && (
        <label className="cms-student-search">
          <i className="ri-search-line" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("student.searchDocuments")}
            className="cms-student-search__input"
          />
        </label>
      )}

      {filtered.length > 0 && (
        <>
          <div className="cms-student__head">
            <span className="cms-student__badge">
              <i className="ri-folder-3-line" aria-hidden />
              {t("student.documentsBadge")}
            </span>
            <span className="cms-student__count">{t("student.documentsCount", { count: filtered.length })}</span>
          </div>
          <ul className="cms-student-docs">
            {filtered.map((doc, index) => (
              <DocumentRow key={doc.url} doc={doc} index={index} onPreview={setPreviewUrl} />
            ))}
          </ul>
        </>
      )}

      {previewUrl && (
        <div className="cms-student__pdf">
          <PdfDocumentViewer pdfUrl={previewUrl} title={t("science.viewDocument")} interactive />
        </div>
      )}
    </div>
  );
}
