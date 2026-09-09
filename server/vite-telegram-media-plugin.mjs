import { startTelegramMediaCache, handleTelegramMediaRequest } from "./telegram-media-cache.mjs";

export function fjstiTelegramMediaPlugin() {
  const mount = (middlewares) => {
    // Only a real dev/preview server needs the long-poller — `vite build` also
    // evaluates this plugin factory (just to register hooks) but never calls either
    // hook below, so starting it here unconditionally would spin up a second
    // getUpdates consumer on every production build, conflicting (409) with the
    // one actually running continuously in production-server.mjs.
    startTelegramMediaCache();
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
