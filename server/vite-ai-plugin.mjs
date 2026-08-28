/**
 * CORS-safe OpenAI proxy for Vite dev/preview.
 * The API key stays in Vite's server process and is never sent to the browser.
 */
export function fjstiAiPlugin({ apiKey, model = "gpt-4o-mini" } = {}) {
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
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: { message: "OPENAI_API_KEY sozlanmagan" } }));
          return;
        }

        const parsed = JSON.parse(body.toString("utf8"));
        // Clamp regardless of what the client asked for — a modified/malicious client
        // could otherwise send its own (or no) max_tokens and rack up cost per call.
        const maxTokens = Math.min(Number(parsed.max_tokens) || 900, 900);
        const upstream = await fetch(`https://api.openai.com${targetPath}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...parsed, model, max_tokens: maxTokens }),
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
