import { useEffect, useState } from "react";
import type { AdminMenuNode } from "../menuTypes";
import type { MenuNodeInput } from "@/api/adminMenu";

const URL_TYPES = [
  { value: "main", label: "main — Bosh sahifa" },
  { value: "page", label: "page — Sahifa (Page)" },
  { value: "category", label: "category — Yangilik kategoriyasi" },
  { value: "leader", label: "leader — Rahbariyat toifasi" },
  { value: "documents", label: "documents — Hujjatlar to'plami" },
  { value: "faculty", label: "faculty — Fakultet" },
  { value: "departments", label: "departments — Kafedra" },
  { value: "c-action", label: "c-action — Maxsus sahifa (route)" },
  { value: "other", label: "other — Boshqa / tashqi havola" },
];

interface Props {
  node: AdminMenuNode;
  onSave: (input: MenuNodeInput) => Promise<void>;
  onClose: () => void;
}

export default function MenuNodeEditor({ node, onSave, onClose }: Props) {
  const [form, setForm] = useState<MenuNodeInput>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      title_uz: node.titleUz ?? "",
      title_ru: node.titleRu ?? "",
      title_en: node.titleEn ?? "",
      url_type: node.urlType ?? "other",
      url_value: node.urlValue ?? "",
      status: node.status,
      active: node.active,
      disabled: node.disabled,
    });
    setError("");
  }, [node]);

  function set<K extends keyof MenuNodeInput>(key: K, value: MenuNodeInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch {
      setError("Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-background-50 border border-background-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground-900">Tahrirlash — #{node.id}</h2>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-foreground-400 hover:bg-background-200 cursor-pointer">
          <i className="ri-close-line" />
        </button>
      </div>

      {error && <div className="mb-3 p-2.5 rounded-md bg-accent-50 border border-accent-200 text-xs text-accent-800">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        {(["uz", "ru", "en"] as const).map((lang) => (
          <div key={lang}>
            <label className="block text-xs font-semibold text-foreground-500 uppercase mb-1">Nomi ({lang})</label>
            <input
              value={(form[`title_${lang}`] as string) ?? ""}
              onChange={(e) => set(`title_${lang}`, e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-semibold text-foreground-500 uppercase mb-1">Havola turi (url_type)</label>
          <select
            value={form.url_type ?? "other"}
            onChange={(e) => set("url_type", e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
          >
            {URL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-500 uppercase mb-1">Qiymati (url_value — slug/route)</label>
          <input
            value={form.url_value ?? ""}
            onChange={(e) => set("url_value", e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-background-300 bg-background-50 text-sm font-mono focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center gap-4 pt-1">
          <label className="flex items-center gap-1.5 text-sm text-foreground-700 cursor-pointer">
            <input type="checkbox" checked={form.status === 1} onChange={(e) => set("status", e.target.checked ? 1 : 0)} />
            Status
          </label>
          <label className="flex items-center gap-1.5 text-sm text-foreground-700 cursor-pointer">
            <input type="checkbox" checked={form.active === 1} onChange={(e) => set("active", e.target.checked ? 1 : 0)} />
            Faol (active)
          </label>
          <label className="flex items-center gap-1.5 text-sm text-foreground-700 cursor-pointer">
            <input type="checkbox" checked={form.disabled === 1} onChange={(e) => set("disabled", e.target.checked ? 1 : 0)} />
            O'chirilgan (disabled)
          </label>
        </div>

        <button type="submit" disabled={saving} className="w-full h-10 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60">
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
