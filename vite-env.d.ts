/// <reference types="vite/client" />

declare const __BASE_PATH__: string;
declare const __IS_PREVIEW__: boolean;
declare const __READDY_PROJECT_ID__: string;
declare const __READDY_VERSION_ID__: string;
declare const __READDY_AI_DOMAIN__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_API_KEY_B64?: string;
  readonly VITE_OPENAI_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}