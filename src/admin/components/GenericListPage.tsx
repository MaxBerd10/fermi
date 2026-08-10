import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminResource } from "@/api/admin";
import type { EntityConfig } from "../genericTypes";
import DataTable from "./DataTable";
import Pagination from "./Pagination";

interface Item {
  id: number;
  [key: string]: unknown;
}

export default function GenericListPage({ config }: { config: EntityConfig }) {
  const api = adminResource<Item>(config.resource);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  async function load() {
    setLoading(true);
    try {
      const { items, meta } = await api.list({ page, pageSize, search: search || undefined });
      setItems(items);
      setTotal(meta?.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, config.resource]);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  async function onDelete(item: Item) {
    const label = String(item[config.deleteConfirmField] ?? item.id);
    if (!window.confirm(`"${label}" yozuvini o'chirishni tasdiqlaysizmi?`)) return;
    await api.remove(item.id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground-950">{config.title}</h1>
        <Link to={`/admin/${config.resource}/new`} className="h-10 px-4 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold flex items-center gap-2 cursor-pointer">
          <i className="ri-add-line" /> {config.addLabel ?? "Yangi qo'shish"}
        </Link>
      </div>

      <form onSubmit={onSearchSubmit} className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Qidirish..."
          className="w-full max-w-sm h-10 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
        />
        <button type="submit" className="h-10 px-4 rounded-md border border-background-300 text-sm font-medium hover:bg-background-100 cursor-pointer">
          Qidirish
        </button>
      </form>

      <DataTable
        columns={config.listColumns}
        items={items}
        loading={loading}
        editPathFor={(item) => `/admin/${config.resource}/${item.id}`}
        onDelete={onDelete}
      />
      <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
    </div>
  );
}
