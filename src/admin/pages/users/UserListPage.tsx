import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listUsers, deleteUser, type AdminUserItem } from "@/api/adminUsers";
import DataTable from "@/admin/components/DataTable";
import Pagination from "@/admin/components/Pagination";
import { useAdminAuth } from "@/admin/AdminAuthContext";
import { ApiError } from "@/types/api";

const STATUS_LABELS: Record<number, string> = { 10: "Faol", 9: "Nofaol", 0: "O'chirilgan" };

export default function UserListPage() {
  const { user: currentUser } = useAdminAuth();
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const pageSize = 20;

  async function load() {
    setLoading(true);
    try {
      const { items, meta } = await listUsers({ page, pageSize, search: search || undefined });
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

  async function onDelete(item: AdminUserItem) {
    if (!window.confirm(`"${item.username}" hisobini o'chirishni tasdiqlaysizmi?`)) return;
    setError("");
    try {
      await deleteUser(item.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "O'chirishda xatolik yuz berdi.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground-950">Foydalanuvchilar</h1>
        <Link to="/admin/users/new" className="h-10 px-4 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold flex items-center gap-2 cursor-pointer">
          <i className="ri-add-line" /> Yangi qo'shish
        </Link>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-accent-50 border border-accent-200 text-sm text-accent-800">{error}</div>}

      <form onSubmit={onSearchSubmit} className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Login yoki email bo'yicha qidirish..."
          className="w-full max-w-sm h-10 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
        />
        <button type="submit" className="h-10 px-4 rounded-md border border-background-300 text-sm font-medium hover:bg-background-100 cursor-pointer">
          Qidirish
        </button>
      </form>

      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "username", label: "Login" },
          { key: "email", label: "Email" },
          {
            key: "role",
            label: "Rol",
            render: (item) => (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.role === "admin" ? "bg-primary-100 text-primary-700" : "bg-background-200 text-foreground-600"}`}>
                {item.role === "admin" ? "Administrator" : "Foydalanuvchi"}
              </span>
            ),
          },
          { key: "status", label: "Holat", render: (item) => STATUS_LABELS[item.status] ?? item.status },
          { key: "createdAt", label: "Ro'yxatdan o'tgan" },
          {
            key: "self",
            label: "",
            render: (item) => (currentUser?.id === item.id ? <span className="text-xs text-primary-600 font-medium">(siz)</span> : ""),
          },
        ]}
        items={items}
        loading={loading}
        editPathFor={(item) => `/admin/users/${item.id}`}
        onDelete={onDelete}
      />
      <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
    </div>
  );
}
