import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function buildGviewUrl(pdfUrl: string): string {
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
}

function buildDirectUrl(pdfUrl: string): string {
  return `${pdfUrl}#toolbar=1&navpanes=0&view=FitH`;
}

export default function PdfDocumentViewer({
  pdfUrl,
  title,
  compact = false,
  interactive = false,
}: {
  pdfUrl: string;
  title?: string;
  compact?: boolean;
  interactive?: boolean;
}) {
  const { t } = useTranslation();

  // gview (Google's viewer) is the safe default — it tolerates a PDF's owner/permissions
  // encryption, while the browser's own renderer blocks behind a "Password required"
  // prompt for the same file (see git history). But gview is also slow: it has to fetch
  // the whole document server-side before showing anything, where the browser's own
  // renderer streams it via HTTP range requests. server/pdf-check.mjs checks each file
  // once (cheap: two small range reads, cached after) for a PDF /Encrypt entry — most
  // documents on this site have none, so most get the fast path automatically; only
  // ones that actually need it fall back to gview. `null` = not decided yet.
  const [autoDirect, setAutoDirect] = useState<boolean | null>(null);
  // The manual toggle below always wins once used, in either direction.
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAutoDirect(null);
    setManualOverride(null);
    fetch(`/pdf-check?src=${encodeURIComponent(pdfUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAutoDirect(!data.encrypted);
      })
      .catch(() => {
        if (!cancelled) setAutoDirect(false); // couldn't check — stay on the safe (gview) path
      });
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  const deciding = autoDirect === null && manualOverride === null;
  const useDirect = manualOverride ?? autoDirect ?? false;
  const embedSrc = useDirect ? buildDirectUrl(pdfUrl) : buildGviewUrl(pdfUrl);

  const openPdf = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`cms-council-pdf${compact ? " cms-council-pdf--compact" : ""}${interactive ? " cms-council-pdf--interactive" : ""}`}>
      <div className="cms-council-pdf__actions">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cms-council-pdf__download"
        >
          <i className="ri-file-pdf-line" aria-hidden />
          {t("journal.openPdfNewTab")}
        </a>
        <button
          type="button"
          className="cms-council-pdf__switch"
          onClick={() => setManualOverride(!useDirect)}
          disabled={deciding}
        >
          {t("journal.pdfAltViewer")}
        </button>
      </div>

      <div className="cms-council-pdf__frame">
        {deciding ? (
          <div className="cms-council-pdf__checking">
            <i className="ri-loader-4-line" aria-hidden />
            <span>{t("journal.pdfPreparing")}</span>
          </div>
        ) : (
          <iframe src={embedSrc} title={title ?? t("council.pdfViewerTitle")} className="cms-council-pdf__iframe" />
        )}
        {interactive && !deciding && (
          <button type="button" className="cms-council-pdf__overlay" onClick={openPdf} aria-label={t("journal.openPdfNewTab")}>
            <i className="ri-fullscreen-line" aria-hidden />
            <span>{t("journal.pdfClickToView")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
