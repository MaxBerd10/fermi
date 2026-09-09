import { startTelegramMediaCache, handleTelegramMediaRequest } from "./telegram-media-cache.mjs";

export function fjstiTelegramMediaPlugin() {
  // No-ops cleanly if TELEGRAM_BOT_TOKEN isn't set in the local .env.local — see
  // telegram-media-cache.mjs's own startup warning.
  startTelegramMediaCache();

  const mount = (middlewares) => {
    middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/telegram-media/")) return next();
      const handled = await handleTelegramMediaRequest(req, res);
      if (!handled) next();
    });
  };

  return {
    name: "fjsti-telegram-media",
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    },
  };
}
