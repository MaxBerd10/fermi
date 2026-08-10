import CouncilPdfContent from "@/components/shared/CouncilPdfContent";

export default function ActivityPdfPageContent({
  pdfUrl,
  title,
}: {
  pdfUrl: string;
  title?: string;
}) {
  return (
    <div className="cms-science cms-science--pdf">
      <CouncilPdfContent pdfUrl={pdfUrl} title={title} />
    </div>
  );
}
