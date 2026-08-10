import { useSearchParams } from "react-router-dom";

export default function NewsPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const [, setSearchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  return (
    <nav className="news-pagination" aria-label="Pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setSearchParams({ page: String(p) })}
          className={`news-pagination__btn ${p === page ? "news-pagination__btn--active" : ""}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
    </nav>
  );
}
