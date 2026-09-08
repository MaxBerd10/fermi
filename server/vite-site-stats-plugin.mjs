import { handleSiteStatsRequest } from "./site-stats.mjs";

export function fjstiSiteStatsPlugin() {
  const mount = (middlewares) => {
    middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/site-stats/")) return next();
      const handled = await handleSiteStatsRequest(req, res);
      if (!handled) next();
    });
  };

  return {
    name: "fjsti-site-stats",
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    },
  };
}
