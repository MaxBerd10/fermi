import { useState } from "react";
import { useTranslation } from "react-i18next";
import { aiSummarize } from "@/api/ai";
import AiPanel from "./AiPanel";

export default function AiSummaryBlock({
  title,
  content,
  className = "",
}: {
  title: string;
  content: string;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await aiSummarize(title, content, i18n.language);
      setSummary(res.summary);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("ai.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      {!open && !summary ? (
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-[#0a1158]/15 bg-white text-[#0a1158] text-sm font-semibold cursor-pointer hover:bg-[#f0f4ff] transition-colors disabled:opacity-50 shadow-sm"
        >
          <i className="ri-sparkling-2-line text-base" />
          {loading ? t("ai.summaryLoading") : t("ai.summaryRun")}
        </button>
      ) : (
        <AiPanel title={t("ai.summaryTitle")} className="mt-0">
          <div className="flex justify-end mb-2 -mt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              aria-label={t("a11y.close")}
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>
          {!summary ? (
            <button
              type="button"
              onClick={run}
              disabled={loading}
              className="h-9 px-4 rounded-full bg-[#0a1158] text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              {loading ? t("ai.summaryLoading") : t("ai.summaryRun")}
            </button>
          ) : (
            <p className="text-sm text-[#0a0a0a] leading-relaxed whitespace-pre-wrap">{summary}</p>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </AiPanel>
      )}
    </div>
  );
}
