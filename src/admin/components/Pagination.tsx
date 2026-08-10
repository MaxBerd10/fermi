interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-foreground-600">
      <span>
        Jami {total} ta yozuv — {page}/{totalPages} sahifa
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-background-300 disabled:opacity-40 hover:bg-background-100 cursor-pointer"
        >
          <i className="ri-arrow-left-s-line" />
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-background-300 disabled:opacity-40 hover:bg-background-100 cursor-pointer"
        >
          <i className="ri-arrow-right-s-line" />
        </button>
      </div>
    </div>
  );
}
