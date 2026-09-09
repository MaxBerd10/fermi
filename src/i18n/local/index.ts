// Each language's translation file is ~130-190 KB of source (uz/ru/en all
// together used to be bundled and shipped on every single page load, no
// matter which language the visitor was actually using — a large chunk of
// genuinely "unused JavaScript" on every request). Loaders below are lazy
// (`import.meta.glob` without `eager: true`), so only the language actually
// requested via `loadMessages()` is fetched.
const loaders = import.meta.glob<{ default: Record<string, string> }>("./*/common.ts");

export const SUPPORTED_LANGS = ["uz", "ru", "en"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export function isSupportedLang(value: string | null): value is SupportedLang {
  return !!value && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

export async function loadMessages(lang: SupportedLang): Promise<Record<string, string>> {
  const loader = loaders[`./${lang}/common.ts`];
  const mod = await loader();
  return mod.default;
}
