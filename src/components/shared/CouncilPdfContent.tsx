import PdfDocumentViewer from "@/components/shared/PdfDocumentViewer";

// Was its own standalone <iframe src={pdfUrl}> (always the direct/native renderer,
// no gview option) — the same "Password required" failure PdfDocumentViewer's default
// was reverted away from (see its own comment) applied here too, with no toggle
// available to work around it. Delegating to PdfDocumentViewer gets the same safe
// gview-by-default behavior (plus the alternate-viewer toggle) for every page that
// used this component, instead of maintaining two slightly different PDF embeds.
export default function CouncilPdfContent({
  pdfUrl,
  title,
  compact = false,
}: {
  pdfUrl: string;
  title?: string;
  compact?: boolean;
}) {
  return <PdfDocumentViewer pdfUrl={pdfUrl} title={title} compact={compact} />;
}
