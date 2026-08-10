import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminResource } from "@/api/admin";
import { fieldKey, type EntityConfig } from "../genericTypes";
import GenericField from "./GenericField";
import { ApiError } from "@/types/api";

type Values = Record<string, unknown>;

export default function GenericFormPage({ config }: { config: EntityConfig }) {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const api = adminResource<Values & { id: number }>(config.resource);

  const [values, setValues] = useState<Values>({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isNew) {
      api.get(Number(id)).then((data) => {
        setValues(data);
        setLoading(false);
      });
    } else {
      setValues({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, config.resource]);

  function onChange(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      if (isNew) {
        const created = await api.create(values);
        navigate(`/admin/${config.resource}/${created.id}`, { replace: true });
      } else {
        await api.update(Number(id), values);
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
        {isNew ? `Yangi: ${config.title}` : `Tahrirlash: ${config.title}`}
      </h1>

      {error && <div className="mb-4 p-3 rounded-md bg-accent-50 border border-accent-200 text-sm text-accent-800">{error}</div>}

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

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="h-11 px-6 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold cursor-pointer disabled:opacity-60">
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
          <button type="button" onClick={() => navigate(`/admin/${config.resource}`)} className="h-11 px-6 rounded-md border border-background-300 text-sm font-medium hover:bg-background-100 cursor-pointer">
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
}
