import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminResource } from "@/api/admin";
import type { AdminPost } from "@/admin/types";
import DataTable from "@/admin/components/DataTable";
import Pagination from "@/admin/components/Pagination";

const postsApi = adminResource<AdminPost>("news");

export default function NewsListPage() {
  const [items, setItems] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  async function load() {
    setLoading(true);
    try {
      const { items, meta } = await postsApi.list({ page, pageSize, search: search || undefined });
      setItems(items);
      setTotal(meta?.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  async function onDelete(item: AdminPost) {
    if (!window.confirm(`"${item.title_uz}" yangiligini o'chirishni tasdiqlaysizmi?`)) return;
    await postsApi.remove(item.id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground-950">Yangiliklar</h1>
        <Link to="/admin/news/new" className="h-10 px-4 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold flex items-center gap-2 cursor-pointer">
          <i className="ri-add-line" /> Yangi qo'shish
        </Link>
      </div>

      <form onSubmit={onSearchSubmit} className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sarlavha bo'yicha qidirish..."
          className="w-full max-w-sm h-10 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
        />
        <button type="submit" className="h-10 px-4 rounded-md border border-background-300 text-sm font-medium hover:bg-background-100 cursor-pointer">
          Qidirish
        </button>
      </form>

      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "title_uz", label: "Sarlavha" },
          { key: "date", label: "Sana" },
          { key: "seen", label: "Ko'rishlar" },
          {
            key: "status",
            label: "Holat",
            render: (item) => (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 1 ? "bg-green-100 text-green-700" : "bg-background-200 text-foreground-500"}`}>
                {item.status === 1 ? "Faol" : "Nofaol"}
              </span>
            ),
          },
        ]}
        items={items}
        loading={loading}
        editPathFor={(item) => `/admin/news/${item.id}`}
        onDelete={onDelete}
      />
      <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
    </div>
  );
}
