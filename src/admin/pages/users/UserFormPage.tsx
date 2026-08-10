import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, createUser, updateUser, type AdminUserInput } from "@/api/adminUsers";
import { useAdminAuth } from "@/admin/AdminAuthContext";
import { ApiError } from "@/types/api";

export default function UserFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user: currentUser } = useAdminAuth();
  const isSelf = !isNew && currentUser?.id === Number(id);

  const [form, setForm] = useState<AdminUserInput>({ status: 10, role: "user" });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isNew) {
      getUser(Number(id)).then((data) => {
        setForm({ username: data.username, email: data.email, status: data.status, role: data.role });
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function set<K extends keyof AdminUserInput>(key: K, value: AdminUserInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      const payload = { ...form };
      if (password) payload.password = password;
      if (isNew) {
        const created = await createUser(payload);
        navigate(`/admin/users/${created.id}`, { replace: true });
      } else {
        await updateUser(Number(id), payload);
        setPassword("");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fields ?? {});
      } else {
        setError("Saqlashda xatolik yuz berdi.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <i className="ri-loader-4-line w-8 h-8 flex items-center justify-center animate-spin text-primary-500 text-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-foreground-950 mb-6">
        {isNew ? "Yangi foydalanuvchi" : "Foydalanuvchini tahrirlash"}
      </h1>

      {error && <div className="mb-4 p-3 rounded-md bg-accent-50 border border-accent-200 text-sm text-accent-800">{error}</div>}
      {isSelf && <div className="mb-4 p-3 rounded-md bg-primary-50 border border-primary-200 text-sm text-primary-800">Bu — sizning o'z hisobingiz.</div>}

      <form onSubmit={onSubmit} className="space-y-4 bg-background-50 border border-background-200 rounded-lg p-5">
        <div>
          <label className="block text-sm font-medium text-foreground-700 mb-1.5">Login *</label>
          <input
            value={form.username ?? ""}
            onChange={(e) => set("username", e.target.value)}
            required
            className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
          />
          {fieldErrors.username && <p className="mt-1 text-xs text-accent-600">{fieldErrors.username[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-700 mb-1.5">Email *</label>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            required
            className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-accent-600">{fieldErrors.email[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-700 mb-1.5">
            {isNew ? "Parol *" : "Yangi parol (bo'sh qoldirsangiz o'zgarmaydi)"}
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={isNew}
            placeholder={isNew ? "" : "••••••••"}
            className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm font-mono focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground-700 mb-1.5">Holat</label>
            <select
              value={form.status ?? 10}
              onChange={(e) => set("status", Number(e.target.value))}
              className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
            >
              <option value={10}>Faol</option>
              <option value={9}>Nofaol</option>
              <option value={0}>O'chirilgan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-700 mb-1.5">Rol</label>
            <select
              value={form.role ?? "user"}
              disabled={isSelf}
              onChange={(e) => set("role", e.target.value as "user" | "admin")}
              className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500 disabled:opacity-60"
            >
              <option value="user">Oddiy foydalanuvchi</option>
              <option value="admin">Administrator</option>
            </select>
            {isSelf && <p className="mt-1 text-xs text-foreground-400">O'z rolingizni bu yerdan o'zgartira olmaysiz.</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="h-11 px-6 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60">
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
          <button type="button" onClick={() => navigate("/admin/users")} className="h-11 px-6 rounded-md border border-background-300 text-sm font-medium hover:bg-background-100 cursor-pointer">
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
}
