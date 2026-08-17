export interface TestResultPdfQuestion {
  number: number;
  question: string;
  selectedOption?: string;
  correctOption: string;
  explanation?: string;
  isCorrect: boolean;
}

export interface TestResultPdfLabels {
  title: string;
  subject: string;
  result: string;
  correctAnswers: string;
  score: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
  correct: string;
  incorrect: string;
  notAnswered: string;
  page: string;
}

interface DownloadTestResultPdfParams {
  subjectName: string;
  score: number;
  total: number;
  percent: number;
  questions: TestResultPdfQuestion[];
  labels: TestResultPdfLabels;
  locale: string;
}

type PdfMake = {
  addVirtualFileSystem: (files: unknown) => void;
  createPdf: (definition: unknown) => { download: (filename: string) => void };
};

export async function downloadTestResultPdf({
  subjectName,
  score,
  total,
  percent,
  questions,
  labels,
  locale,
}: DownloadTestResultPdfParams) {
  const [{ default: pdfMake }, { default: pdfFonts }] = await Promise.all([
    import("pdfmake/build/pdfmake.js"),
    import("pdfmake/build/vfs_fonts.js"),
  ]);

  const pdf = pdfMake as PdfMake;
  pdf.addVirtualFileSystem(pdfFonts);

  const generatedAt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date());
  const questionBlock = (item: TestResultPdfQuestion) => ({
    stack: [
      { text: `${item.number}. ${item.question}`, style: "question", color: item.isCorrect ? "#172033" : "#b42318" },
      {
        table: {
          widths: [112, "*"],
          body: [
            [
              { text: labels.yourAnswer, style: "label" },
              { text: item.selectedOption || labels.notAnswered, color: item.isCorrect ? "#157347" : "#b42318" },
            ],
            [{ text: labels.correctAnswer, style: "label" }, { text: item.correctOption, color: "#157347" }],
            [{ text: labels.result, style: "label" }, { text: item.isCorrect ? labels.correct : labels.incorrect, color: item.isCorrect ? "#157347" : "#b42318" }],
          ],
        },
        layout: {
          hLineColor: () => "#d9e0ea",
          vLineColor: () => "#d9e0ea",
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
      },
      ...(item.explanation
        ? [{ text: `${labels.explanation}: ${item.explanation}`, style: "explanation" }]
        : []),
    ],
    margin: [0, 0, 0, 15],
    unbreakable: true,
  });
  const definition = {
    pageSize: "A4",
    pageMargins: [44, 48, 44, 42],
    defaultStyle: { font: "Roboto", fontSize: 10, color: "#172033" },
    content: [
      { text: labels.title, style: "title" },
      { text: `${labels.subject}: ${subjectName}`, style: "subject" },
      {
        columns: [
          { text: `${labels.correctAnswers}: ${score} / ${total}`, style: "summary" },
          { text: `${labels.score}: ${percent}%`, style: "summary", alignment: "right" },
        ],
        margin: [0, 10, 0, 18],
      },
      ...questions.map(questionBlock),
    ],
    styles: {
      title: { fontSize: 20, bold: true, color: "#163b72" },
      subject: { fontSize: 11, color: "#4d5b73", margin: [0, 5, 0, 0] },
      summary: { bold: true, fontSize: 11, color: "#163b72" },
      question: { bold: true, fontSize: 11, margin: [0, 0, 0, 7] },
      label: { bold: true, color: "#4d5b73" },
      explanation: { italics: true, color: "#4d5b73", margin: [0, 7, 0, 0] },
    },
    footer: (currentPage: number) => ({
      text: `${labels.page} ${currentPage} - ${generatedAt}`,
      alignment: "center",
      fontSize: 8,
      color: "#667085",
      margin: [0, 12, 0, 0],
    }),
  };

  const date = new Date().toISOString().slice(0, 10);
  pdf.createPdf(definition).download(`test-natija-${date}.pdf`);
}
