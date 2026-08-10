/**
 * CORS-safe OpenAI proxy for Vite dev/preview.
 * API key is sent by the frontend (VITE_OPENAI_API_KEY) — not stored on institute API.
 */
export function fjstiAiPlugin() {
  const mount = (middlewares) => {
    middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/openai-api")) return next();

      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.end();
        return;
      }

      if (req.method !== "POST") {
        res.statusCode = 405;
        res.end("Method not allowed");
        return;
      }

      const targetPath = req.url.replace(/^\/openai-api/, "") || "/v1/chat/completions";
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks);

      try {
        const upstream = await fetch(`https://api.openai.com${targetPath}`, {
          method: "POST",
          headers: {
            Authorization: req.headers.authorization || "",
            "Content-Type": "application/json",
          },
          body,
        });
        const text = await upstream.text();
        res.statusCode = upstream.status;
        res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
        res.end(text);
      } catch (e) {
        res.statusCode = 502;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: { message: e?.message || "OpenAI proxy xatosi" } }));
      }
    });
  };

  return {
    name: "fjsti-openai-proxy",
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    },
  };
}
