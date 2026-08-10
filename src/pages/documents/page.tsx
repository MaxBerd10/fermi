import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getDocuments } from "@/api/documents";
import type { DocumentDetail } from "@/types/content";
import { ApiError } from "@/types/api";
import PageHeader from "@/components/shared/PageHeader";
import LeaderRichContent from "@/components/shared/LeaderRichContent";
import { LoadingState, ErrorState } from "@/components/shared/LoadingState";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Reveal } from "@/components/Animation";

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { menuId, slug } = useParams<{ menuId: string; slug: string }>();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getDocuments(slug, menuId ? Number(menuId) : undefined)
      .then(setDoc)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("common.genericError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, menuId]);

  usePageMeta(doc?.title);

  if (loading) return <LoadingState />;
  if (error || !doc) return <ErrorState message={error ?? undefined} />;

  return (
    <div className="text-foreground-950">
      <PageHeader title={doc.title || t("documents.fallbackTitle")} compact />

      <section className="section-pad bg-transparent pb-16 md:pb-20">
        <div className="section-container">
          {doc.items.length === 0 && (
            <Reveal>
              <p className="text-foreground-500">{t("documents.empty")}</p>
            </Reveal>
          )}

          <div className="documents-list">
            {doc.items.map((item, i) => (
              <Reveal key={item.id} delay={i * 50}>
                <div className={`document-card ${openId === item.id ? "document-card--open" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                    className="document-card__toggle"
                    aria-expanded={openId === item.id}
                  >
                    <span className="document-card__title">{item.title}</span>
                    <i
                      className={`ri-arrow-down-s-line text-xl text-slate-400 transition-transform ${openId === item.id ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  {openId === item.id && (
                    <div className="document-card__body cms-article cms-article--menu-section">
                      <LeaderRichContent html={item.content} />
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
