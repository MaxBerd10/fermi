import { configureTelegramFeed, handleTelegramFeedRequest } from "./telegram-feed.mjs";

export function fjstiTelegramPlugin({ apiKey, model } = {}) {
  configureTelegramFeed({ apiKey, model });
  const mount = (middlewares) => {
    middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/telegram-feed")) return next();
      const handled = await handleTelegramFeedRequest(req, res);
      if (!handled) next();
    });
  };

  return {
    name: "fjsti-telegram-feed",
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    },
  };
}
