import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { search } from "@/api/search";
import { aiSearch } from "@/api/ai";
import type { SearchResults } from "@/types/content";
import { stripHtml } from "@/lib/html";
import PageHeader from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Reveal } from "@/components/Animation";
import AiPanel from "@/components/ai/AiPanel";

export default function SearchPage() {
  const { t, i18n } = useTranslation();
  usePageMeta(t("nav.search"));
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(q);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiHints, setAiHints] = useState<{
    interpretation: string;
    suggestions: { title: string; href: string; reason: string }[];
  } | null>(null);

  useEffect(() => {
    if (!q) {
      setResults(null);
      setAiHints(null);
      return;
    }
    setLoading(true);
    setAiLoading(true);
    setAiError("");
    search(q)
      .then((res) => setResults(res.data))
      .finally(() => setLoading(false));
    aiSearch(q, i18n.language)
      .then(setAiHints)
      .catch((e) => setAiError(e instanceof Error ? e.message : t("ai.error")))
      .finally(() => setAiLoading(false));
  }, [q, i18n.language, t]);

  return (
    <div>
      <PageHeader title={t("nav.search")} />

      <section className="section-pad bg-transparent">
        <div className="section-container">
          <Reveal>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchParams({ q: inputValue });
              }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-foreground-400" />
                <input
                  type="search"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("search.placeholder")}
                  className="w-full h-12 pl-11 pr-4 page-input !h-auto text-sm focus:outline-none focus:border-primary-500 transition-colors duration-200"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer transition-colors duration-300"
              >
                {t("nav.searchSubmit")}
              </button>
            </form>
          </Reveal>

          {(aiLoading || aiHints || aiError) && (
            <Reveal delay={40}>
              <AiPanel title={t("ai.searchTitle")} subtitle={t("ai.searchSub")} className="mb-6">
                {aiLoading && <p className="text-xs text-[#555555]">{t("ai.thinking")}</p>}
                {aiError && <p className="text-xs text-red-600">{aiError}</p>}
                {aiHints && (
                  <>
                    <p className="text-sm text-[#0a0a0a] leading-relaxed mb-3">{aiHints.interpretation}</p>
                    <div className="space-y-2">
                      {aiHints.suggestions?.map((s) =>
                        s.href.startsWith("http") ? (
                          <a
                            key={s.href + s.title}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl border border-[#e5e5e5] bg-white px-3 py-2.5 hover:border-[#ffd600] transition-colors"
                          >
                            <p className="text-sm font-semibold text-[#0a1158]">{s.title}</p>
                            <p className="text-xs text-[#555555] mt-0.5">{s.reason}</p>
                          </a>
                        ) : (
                          <Link
                            key={s.href + s.title}
                            to={s.href}
                            className="block rounded-xl border border-[#e5e5e5] bg-white px-3 py-2.5 hover:border-[#ffd600] transition-colors"
                          >
                            <p className="text-sm font-semibold text-[#0a1158]">{s.title}</p>
                            <p className="text-xs text-[#555555] mt-0.5">{s.reason}</p>
                          </Link>
                        ),
                      )}
                    </div>
                  </>
                )}
              </AiPanel>
            </Reveal>
          )}

          {loading && <LoadingState />}

          {!loading && results && (
            <div className="space-y-6">
              {results.posts.length > 0 && (
                <Reveal>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground-950 mb-3">
                      {t("news.title")}
                    </h2>
                    <div className="space-y-2.5">
                      {results.posts.map((p, i) => (
                        <Reveal key={p.id} delay={i * 50}>
                          <Link
                            to={`/detail/${p.slug}?menuId=71`}
                            className="group block p-3.5 page-card hover:border-primary-300 hover:shadow-md transition-all duration-300"
                          >
                            <h3 className="font-heading font-semibold text-foreground-900 group-hover:text-primary-600 transition-colors">
                              {p.title}
                            </h3>
                            <p className="text-sm text-foreground-600 mt-1.5 line-clamp-2">
                              {stripHtml(p.content)}
                            </p>
                          </Link>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {results.pages.length > 0 && (
                <Reveal delay={80}>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground-950 mb-3">
                      {t("search.pagesHeading")}
                    </h2>
                    <div className="space-y-2.5">
                      {results.pages.map((p, i) => (
                        <Reveal key={p.slug} delay={i * 50}>
                          <Link
                            to={`/blog/71/${p.slug}`}
                            className="group block p-3.5 page-card hover:border-primary-300 hover:shadow-md transition-all duration-300"
                          >
                            <h3 className="font-heading font-semibold text-foreground-900 group-hover:text-primary-600 transition-colors">
                              {p.title}
                            </h3>
                          </Link>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {results.posts.length === 0 && results.pages.length === 0 && (
                <Reveal>
                  <p className="text-foreground-500">{t("search.noResults", { query: q })}</p>
                </Reveal>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
