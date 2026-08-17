import { useEffect, useState } from "react";
import { adminResource } from "@/api/admin";
import { getRegions, getDistricts, getQuarters } from "@/api/lookups";
import type { Region, District, Quarter } from "@/types/content";
import type { FieldSpec } from "../genericTypes";
import MediaPicker from "./MediaPicker";
import RichTextEditor from "./RichTextEditor";

type Values = Record<string, unknown>;

interface Props {
  field: FieldSpec;
  values: Values;
  onChange: (key: string, value: unknown) => void;
}

function TextInput({ value, onChange, required }: { value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
    />
  );
}

export default function GenericField({ field, values, onChange }: Props) {
  if (field.kind === "lang-text") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["uz", "ru", "en"] as const).map((lang) => (
          <div key={lang}>
            <label className="block text-xs font-semibold text-foreground-500 uppercase mb-1">
              {field.label} ({lang}) {lang === "uz" && field.requiredUz && "*"}
            </label>
            <TextInput
              value={values[`${field.base}_${lang}`] as string}
              onChange={(v) => onChange(`${field.base}_${lang}`, v)}
              required={lang === "uz" && field.requiredUz}
            />
          </div>
        ))}
      </div>
    );
  }

  if (field.kind === "lang-html") {
    return (
      <div className="space-y-4">
        {(["uz", "ru", "en"] as const).map((lang) => (
          <RichTextEditor
            key={lang}
            label={`${field.label} (${lang})`}
            value={(values[`${field.base}_${lang}`] as string) ?? ""}
            onChange={(v) => onChange(`${field.base}_${lang}`, v)}
          />
        ))}
      </div>
    );
  }

  if (field.kind === "text") {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground-700 mb-1.5">
          {field.label} {field.required && "*"}
        </label>
        <TextInput value={values[field.key] as string} onChange={(v) => onChange(field.key, v)} required={field.required} />
      </div>
    );
  }

  if (field.kind === "textarea") {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground-700 mb-1.5">
          {field.label} {field.required && "*"}
        </label>
        <textarea
          value={(values[field.key] as string) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          required={field.required}
          rows={4}
          className="w-full px-4 py-3 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
        />
      </div>
    );
  }

  if (field.kind === "html") {
    return <RichTextEditor label={field.label} value={(values[field.key] as string) ?? ""} onChange={(v) => onChange(field.key, v)} />;
  }

  if (field.kind === "media") {
    return <MediaPicker label={field.label} value={values[field.key] as string} onChange={(path) => onChange(field.key, path)} />;
  }

  if (field.kind === "number") {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground-700 mb-1.5">
          {field.label} {field.required && "*"}
        </label>
        <input
          type="number"
          value={(values[field.key] as number) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value === "" ? null : Number(e.target.value))}
          required={field.required}
          className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
        />
      </div>
    );
  }

  if (field.kind === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-foreground-700 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(values[field.key])}
          onChange={(e) => onChange(field.key, e.target.checked ? 1 : 0)}
          className="w-4 h-4"
        />
        {field.label}
      </label>
    );
  }

  if (field.kind === "select") {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground-700 mb-1.5">
          {field.label} {field.required && "*"}
        </label>
        <select
          value={(values[field.key] as string | number) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          required={field.required}
          className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
        >
          <option value="">Tanlang</option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.kind === "async-select") {
    return <AsyncSelectField field={field} values={values} onChange={onChange} />;
  }

  if (field.kind === "geo-selects") {
    return <GeoSelectsField field={field} values={values} onChange={onChange} />;
  }

  if (field.kind === "date") {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground-700 mb-1.5">{field.label}</label>
        <input
          type="datetime-local"
          value={(values[field.key] as string)?.replace(" ", "T").slice(0, 16) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value.replace("T", " ") + ":00")}
          className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
        />
      </div>
    );
  }

  return null;
}

function GeoSelectsField({
  field,
  values,
  onChange,
}: {
  field: Extract<FieldSpec, { kind: "geo-selects" }>;
  values: Values;
  onChange: (key: string, value: unknown) => void;
}) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>([]);

  const regionId = values[field.regionKey] as number | string | undefined;
  const districtId = values[field.districtKey] as number | string | undefined;

  useEffect(() => {
    getRegions().then(setRegions);
  }, []);

  useEffect(() => {
    if (!regionId) {
      setDistricts([]);
      return;
    }
    getDistricts(Number(regionId)).then(setDistricts);
  }, [regionId]);

  useEffect(() => {
    if (!field.quarterKey || !districtId) {
      setQuarters([]);
      return;
    }
    getQuarters(Number(districtId)).then(setQuarters);
  }, [districtId, field.quarterKey]);

  return (
    <div>
      <label className="block text-sm font-medium text-foreground-700 mb-1.5">
        {field.label} {field.required && "*"}
      </label>
      <div className={`grid grid-cols-1 ${field.quarterKey ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
        <select
          value={regionId ?? ""}
          onChange={(e) => {
            onChange(field.regionKey, e.target.value);
            onChange(field.districtKey, "");
            if (field.quarterKey) onChange(field.quarterKey, "");
          }}
          required={field.required}
          className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
        >
          <option value="">Viloyat</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select
          value={districtId ?? ""}
          onChange={(e) => {
            onChange(field.districtKey, e.target.value);
            if (field.quarterKey) onChange(field.quarterKey, "");
          }}
          disabled={!regionId}
          required={field.required}
          className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500 disabled:opacity-60"
        >
          <option value="">Tuman</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {field.quarterKey && (
          <select
            value={(values[field.quarterKey] as number | string) ?? ""}
            onChange={(e) => onChange(field.quarterKey as string, e.target.value)}
            disabled={!districtId}
            required={field.required}
            className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500 disabled:opacity-60"
          >
            <option value="">Mahalla</option>
            {quarters.map((q) => (
              <option key={q.id} value={q.id}>{q.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

function AsyncSelectField({
  field,
  values,
  onChange,
}: {
  field: Extract<FieldSpec, { kind: "async-select" }>;
  values: Values;
  onChange: (key: string, value: unknown) => void;
}) {
  const [options, setOptions] = useState<{ value: number; label: string }[]>([]);
  const { optionsResource, optionsLabelKey } = field;

  useEffect(() => {
    adminResource<Record<string, unknown> & { id: number }>(optionsResource)
      .list({ pageSize: 300 })
      .then((r) => setOptions(r.items.map((it) => ({ value: it.id, label: String(it[optionsLabelKey] ?? it.id) }))));
  }, [optionsLabelKey, optionsResource]);

  return (
    <div>
      <label className="block text-sm font-medium text-foreground-700 mb-1.5">
        {field.label} {field.required && "*"}
      </label>
      <select
        value={(values[field.key] as string | number) ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        required={field.required}
        className="w-full h-11 px-4 rounded-md border border-background-300 bg-background-50 text-sm focus:outline-none focus:border-primary-500"
      >
        <option value="">Tanlang</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
