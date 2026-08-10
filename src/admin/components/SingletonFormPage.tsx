import { useEffect, useState } from "react";
import { adminResource } from "@/api/admin";
import { fieldKey, type EntityConfig } from "../genericTypes";
import GenericField from "./GenericField";
import { ApiError } from "@/types/api";

type Values = Record<string, unknown>;

/** For 1-row config tables (Counter/Setting/Logo) — no list, no create, no delete. */
export default function SingletonFormPage({ config }: { config: EntityConfig }) {
  const api = adminResource<Values & { id: number }>(config.resource);
  const [values, setValues] = useState<Values>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    api.list({ pageSize: 1 }).then((r) => {
      if (r.items[0]) setValues(r.items[0]);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.resource]);

  function onChange(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      await api.update(values.id as number, values);
      setSaved(true);
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
    <div className="max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-foreground-950 mb-6">{config.title}</h1>

      {error && <div className="mb-4 p-3 rounded-md bg-accent-50 border border-accent-200 text-sm text-accent-800">{error}</div>}
      {saved && <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-800">Saqlandi.</div>}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="bg-background-50 border border-background-200 rounded-lg p-5 space-y-4">
          {config.fields.map((field) => {
            const key = fieldKey(field);
            return (
              <div key={key}>
                <GenericField field={field} values={values} onChange={onChange} />
                {fieldErrors[key] && <p className="mt-1 text-xs text-accent-600">{fieldErrors[key][0]}</p>}
              </div>
            );
          })}
        </div>

        <button type="submit" disabled={saving} className="h-11 px-6 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60">
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
