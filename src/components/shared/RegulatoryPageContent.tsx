import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";
import {
  buildEducationLawTitle,
  parseRegulatoryContent,
  type RegulatoryDocument,
  type RegulatoryMetadataRow,
} from "@/lib/parseRegulatoryContent";

const META_LABEL_KEYS: Record<string, string> = {
  manba: "regulatory.meta.source",
  "hujjat nomi": "regulatory.meta.name",
  shakl: "regulatory.meta.type",
  organ: "regulatory.meta.authority",
  raqam: "regulatory.meta.number",
  "qabul qilingan sanasi": "regulatory.meta.adoptedDate",
  "e'lon qilingan sana": "regulatory.meta.publishedDate",
  "kuchga kirish sanasi": "regulatory.meta.effectiveDate",
};

function resolveMetaLabel(label: string, t: (key: string) => string): string {
  const key = META_LABEL_KEYS[label.toLowerCase()];
  return key ? t(key) : label;
}

function DocumentCard({
  doc,
  index,
  onPreview,
}: {
  doc: RegulatoryDocument;
  index: number;
  onPreview: (url: string) => void;
}) {
  const { t } = useTranslation();
  const icon = doc.isPdf ? "ri-file-pdf-line" : "ri-file-text-line";

  return (
    <li className="cms-regulatory__doc">
      <div className="cms-regulatory__doc-icon" aria-hidden>
        <i className={icon} />
      </div>
      <div className="cms-regulatory__doc-body">
        <span className="cms-regulatory__doc-num">{index + 1}</span>
        <p className="cms-regulatory__doc-title">{doc.title}</p>
        <div className="cms-regulatory__doc-actions">
          {doc.isPdf && (
            <button
              type="button"
              className="cms-regulatory__btn cms-regulatory__btn--primary"
              onClick={() => onPreview(doc.url)}
            >
              <i className="ri-eye-line" aria-hidden />
              {t("regulatory.viewDocument")}
            </button>
          )}
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-regulatory__btn"
          >
            <i className="ri-download-2-line" aria-hidden />
            {t("regulatory.downloadDocument")}
          </a>
        </div>
      </div>
    </li>
  );
}

function applySlugFixes(
  parsed: ReturnType<typeof parseRegulatoryContent>,
  slug?: string,
): ReturnType<typeof parseRegulatoryContent> {
  if (slug !== "talim-togrisia") return parsed;

  const cleanTitle = buildEducationLawTitle(parsed.metadata);
  if (!cleanTitle) return parsed;

  const allDocuments = parsed.allDocuments.map((doc) => ({ ...doc, title: cleanTitle }));
  const groups = parsed.groups.map((group) => ({
    ...group,
    documents: group.documents.map((doc) => ({ ...doc, title: cleanTitle })),
  }));

  return { ...parsed, allDocuments, groups };
}

export default function RegulatoryPageContent({
  html,
  slug,
  pdfUrl,
}: {
  html: string;
  slug?: string;
  pdfUrl?: string | null;
}) {
  const { t } = useTranslation();
  const parsed = useMemo(() => applySlugFixes(parseRegulatoryContent(html), slug), [html, slug]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const docCount = parsed.allDocuments.length;
  const fileInList = Boolean(pdfUrl && parsed.allDocuments.some((d) => d.url === pdfUrl));
  const showPrimaryPdf = Boolean(pdfUrl) && !fileInList && !previewUrl;

  let docIndex = 0;

  const renderMeta = (row: RegulatoryMetadataRow) => (
    <div key={row.label} className="cms-regulatory__meta-row">
      <dt>{resolveMetaLabel(row.label, t)}</dt>
      <dd>{row.value}</dd>
    </div>
  );

  return (
    <div className="cms-regulatory">
      {parsed.preamble.length > 0 && (
        <header className="cms-regulatory__preamble">
          {parsed.preamble.map((line) => (
            <p key={line} className="cms-regulatory__preamble-line">
              {line}
            </p>
          ))}
        </header>
      )}

      {parsed.metadata.length > 0 && (
        <dl className="cms-regulatory__metadata">{parsed.metadata.map(renderMeta)}</dl>
      )}

      {parsed.coverImage && (
        <figure className="cms-regulatory__cover">
          <img src={parsed.coverImage} alt={t("regulatory.coverAlt")} loading="lazy" />
        </figure>
      )}

      {docCount > 0 && (
        <div className="cms-regulatory__head">
          <span className="cms-regulatory__badge">
            <i className="ri-file-list-3-line" aria-hidden />
            {t("regulatory.documentsListBadge")}
          </span>
          <span className="cms-regulatory__count">{t("regulatory.documentsCount", { count: docCount })}</span>
        </div>
      )}

      {parsed.groups.map((group, gi) => (
        <section key={`group-${gi}`} className="cms-regulatory__group">
          {group.heading && <h3 className="cms-regulatory__group-title">{group.heading}</h3>}
          {group.documents.length > 0 && (
            <ul className="cms-regulatory__list">
              {group.documents.map((doc) => {
                const idx = docIndex;
                docIndex += 1;
                return (
                  <DocumentCard key={doc.url} doc={doc} index={idx} onPreview={setPreviewUrl} />
                );
              })}
            </ul>
          )}
        </section>
      ))}

      {previewUrl && (
        <div className="cms-regulatory__preview">
          <div className="cms-regulatory__preview-head">
            <h3 className="cms-regulatory__preview-title">{t("regulatory.previewTitle")}</h3>
            <button type="button" className="cms-regulatory__preview-close" onClick={() => setPreviewUrl(null)}>
              <i className="ri-close-line" aria-hidden />
              {t("a11y.close")}
            </button>
          </div>
          <PdfDocumentViewer pdfUrl={previewUrl} title={t("regulatory.previewTitle")} interactive />
        </div>
      )}

      {showPrimaryPdf && pdfUrl && (
        <div className="cms-regulatory__primary">
          <h3 className="cms-regulatory__primary-title">{t("regulatory.primaryDocument")}</h3>
          <PdfDocumentViewer pdfUrl={pdfUrl} title={t("regulatory.primaryDocument")} interactive />
        </div>
      )}
    </div>
  );
}
