import { useSearchParams } from "react-router-dom";

/** Full run of page numbers when it fits, otherwise 1 … [current ± sibling] … last. */
function getPageWindow(current: number, total: number, siblingCount = 1): (number | "…")[] {
  const totalSlots = siblingCount * 2 + 5;
  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, total);
  const showLeftDots = left > 2;
  const showRightDots = right < total - 1;

  if (!showLeftDots && showRightDots) {
    const count = 3 + siblingCount * 2;
    return [...Array.from({ length: count }, (_, i) => i + 1), "…", total];
  }

  if (showLeftDots && !showRightDots) {
    const count = 3 + siblingCount * 2;
    return [1, "…", ...Array.from({ length: count }, (_, i) => total - count + 1 + i)];
  }

  return [1, "…", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "…", total];
}

export default function NewsPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const [, setSearchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (p: number) => setSearchParams({ page: String(p) });

  return (
    <nav className="news-pagination" aria-label="Pagination">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="news-pagination__btn news-pagination__nav"
        aria-label="Oldingi sahifa"
      >
        <i className="ri-arrow-left-s-line" aria-hidden="true" />
      </button>

      {getPageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`dots-${i}`} className="news-pagination__dots" aria-hidden="true">
            {p}
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goTo(p)}
            className={`news-pagination__btn ${p === page ? "news-pagination__btn--active" : ""}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="news-pagination__btn news-pagination__nav"
        aria-label="Keyingi sahifa"
      >
        <i className="ri-arrow-right-s-line" aria-hidden="true" />
      </button>
    </nav>
  );
}
