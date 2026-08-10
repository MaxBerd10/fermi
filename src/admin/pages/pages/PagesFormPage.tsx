import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminResource } from "@/api/admin";
import type { AdminPage } from "@/admin/types";
import MediaPicker from "@/admin/components/MediaPicker";
import RichTextEditor from "@/admin/components/RichTextEditor";
import { ApiError } from "@/types/api";

const pagesApi = adminResource<AdminPage>("pages");

const EMPTY: Partial<AdminPage> = {
  title_uz: "",
  title_ru: "",
  title_en: "",
  content_uz: "",
  content_ru: "",
  content_en: "",
  status: 1,
  file: "",
};

export default function PagesFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<AdminPage>>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isNew) {
      pagesApi.get(Number(id)).then((data) => {
        setForm(data);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function set<K extends keyof AdminPage>(key: K, value: AdminPage[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      if (isNew) {
        const created = await pagesApi.create(form);
        navigate(`/admin/pages/${created.id}`, { replace: true });
      } else {
        await pagesApi.update(Number(id), form);
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
    <div className="max-w-4xl">
      <h1 className="font-heading text-2xl font-bold text-foreground-950 mb-6">
        {isNew ? "Yangi sahifa" : "Sahifani tahrirlash"}
      </h1>

      {error && <div className="mb-4 p-3 rounded-md bg-accent-50 border border-accent-200 text-sm text-accent-800">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="bg-background-50 border border-background-200 rounded-lg p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">Holat</label>
              <select
                value={form.status ?? 1}
                onChange={(e) => set("status", Number(e.target.value))}
                className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value={1}>Faol</option>
                <option value={0}>Nofaol</option>
              </select>
            </div>
            {!isNew && (
              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5">Slug</label>
                <input value={form.slug ?? ""} disabled className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-100 text-sm text-foreground-500" />
              </div>
            )}
          </div>
          <MediaPicker label="Biriktirilgan fayl (PDF va h.k.)" value={form.file} onChange={(path) => set("file", path)} />
        </div>

        {(["uz", "ru", "en"] as const).map((lang) => (
          <div key={lang} className="bg-background-50 border border-background-200 rounded-lg p-5 space-y-4">
            <h2 className="font-semibold text-foreground-800 uppercase text-xs tracking-wide">{lang}</h2>
            <div>
              <label className="block text-sm font-medium text-foreground-700 mb-1.5">
                Sarlavha {lang === "uz" && "*"}
              </label>
              <input
                value={(form[`title_${lang}` as keyof AdminPage] as string) ?? ""}
                onChange={(e) => set(`title_${lang}` as keyof AdminPage, e.target.value as never)}
                required={lang === "uz"}
                className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
              />
              {fieldErrors[`title_${lang}`] && <p className="mt-1 text-xs text-accent-600">{fieldErrors[`title_${lang}`][0]}</p>}
            </div>
            <RichTextEditor
              label="Matn"
              value={(form[`content_${lang}` as keyof AdminPage] as string) ?? ""}
              onChange={(v) => set(`content_${lang}` as keyof AdminPage, v as never)}
            />
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="h-11 px-6 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60">
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
          <button type="button" onClick={() => navigate("/admin/pages")} className="h-11 px-6 rounded-md border border-background-300 text-sm font-medium hover:bg-background-100 cursor-pointer">
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
}
