export type FieldSpec =
  | { kind: "lang-text"; base: string; label: string; requiredUz?: boolean }
  | { kind: "lang-html"; base: string; label: string }
  | { kind: "text"; key: string; label: string; required?: boolean }
  | { kind: "textarea"; key: string; label: string; required?: boolean }
  | { kind: "html"; key: string; label: string }
  | { kind: "media"; key: string; label: string; required?: boolean }
  | { kind: "number"; key: string; label: string; required?: boolean }
  | { kind: "checkbox"; key: string; label: string }
  | { kind: "select"; key: string; label: string; required?: boolean; options: { value: number | string; label: string }[] }
  | { kind: "async-select"; key: string; label: string; required?: boolean; optionsResource: string; optionsLabelKey: string }
  | { kind: "geo-selects"; label: string; regionKey: string; districtKey: string; quarterKey?: string; required?: boolean }
  | { kind: "date"; key: string; label: string };

export interface ListColumn {
  key: string;
  label: string;
}

export interface EntityConfig {
  resource: string;
  title: string;
  addLabel?: string;
  listColumns: ListColumn[];
  fields: FieldSpec[];
  deleteConfirmField: string;
}

/** A stable React key / field-error lookup key for any FieldSpec variant. */
export function fieldKey(field: FieldSpec): string {
  if ("key" in field) return field.key;
  if ("base" in field) return field.base;
  return field.regionKey;
}
