import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import AutoImport from "unplugin-auto-import/vite";
import { fjstiAiPlugin } from "./server/vite-ai-plugin.mjs";
// import { readdyJsxRuntimeProxyPlugin } from "./vite.jsx-runtime-proxy";

const base = process.env.BASE_PATH || "/";
const isPreview = process.env.IS_PREVIEW ? true : false;
//const proxyPlugins = isPreview ? [readdyJsxRuntimeProxyPlugin()] : [];
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const encodedOpenAiKey = String(env.OPENAI_API_KEY_B64 || env.VITE_OPENAI_API_KEY_B64 || "").trim();
  const openAiKey = String(env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || "").trim() || (encodedOpenAiKey ? Buffer.from(encodedOpenAiKey, "base64").toString("utf8").trim() : "");
  const encodedImentorKey = String(env.IMENTOR_API_KEY_B64 || env.VITE_IMENTOR_API_KEY_B64 || "").trim();
  const imentorApiKey = String(env.IMENTOR_API_KEY || env.VITE_IMENTOR_API_KEY || "").trim() || (encodedImentorKey ? Buffer.from(encodedImentorKey, "base64").toString("utf8").trim() : "");

  return {
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview),
    __READDY_PROJECT_ID__: JSON.stringify(process.env.PROJECT_ID || ""),
    __READDY_VERSION_ID__: JSON.stringify(process.env.VERSION_ID || ""),
    __READDY_AI_DOMAIN__: JSON.stringify(process.env.READDY_AI_DOMAIN || ""),
  },
  plugins: [
    // ...proxyPlugins,
    fjstiAiPlugin({ apiKey: openAiKey, model: String(env.OPENAI_MODEL || env.VITE_OPENAI_MODEL || "gpt-4o-mini") }),
    react(),
    AutoImport({
      imports: [
        {
          react: [
            ["default", "React"],
            "useState",
            "useEffect",
            "useContext",
            "useReducer",
            "useCallback",
            "useMemo",
            "useRef",
            "useImperativeHandle",
            "useLayoutEffect",
            "useDebugValue",
            "useDeferredValue",
            "useId",
            "useInsertionEffect",
            "useSyncExternalStore",
            "useTransition",
            "startTransition",
            "lazy",
            "memo",
            "forwardRef",
            "createContext",
            "createElement",
            "cloneElement",
            "isValidElement",
          ],
        },
        {
          "react-router-dom": [
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "Link",
            "NavLink",
            "Navigate",
            "Outlet",
          ],
        },
        // React i18n
        {
          "react-i18next": ["useTranslation", "Trans"],
        },
      ],
      dts: true,
    }),
  ],
  base,
  build: {
    sourcemap: false,
    outDir: 'out',
    cssMinify: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    host: "0.0.0.0",
    proxy: {
      "/v1": {
        target: "https://api.fermi.uz",
        changeOrigin: true,
        secure: true,
      },
      "/uploads": {
        target: "https://api.fermi.uz",
        changeOrigin: true,
        secure: true,
      },
      // iMentor doesn't send CORS headers, so direct browser calls are blocked — the dev
      // server does the actual fetch here instead, which sidesteps CORS entirely (only
      // works for local dev/preview; the production static build needs iMentor to
      // whitelist the domain, since there's no server to proxy through there).
      "/imentor-api": {
        target: "https://imentor.devflix.uz",
        changeOrigin: true,
        secure: true,
        headers: imentorApiKey ? { "X-Api-Key": imentorApiKey } : undefined,
        rewrite: (path) => path.replace(/^\/imentor-api/, "/api"),
      },
    },
  },
  };
});
