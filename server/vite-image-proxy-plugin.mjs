import { handleImageProxyRequest } from "./image-proxy.mjs";

export function fjstiImageProxyPlugin() {
  const mount = (middlewares) => {
    middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/img-cache")) return next();
      const handled = await handleImageProxyRequest(req, res);
      if (!handled) next();
    });
  };

  return {
    name: "fjsti-image-proxy",
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    },
  };
}
