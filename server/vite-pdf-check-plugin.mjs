import { handlePdfCheckRequest } from "./pdf-check.mjs";

export function fjstiPdfCheckPlugin() {
  const mount = (middlewares) => {
    middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/pdf-check")) return next();
      const handled = await handlePdfCheckRequest(req, res);
      if (!handled) next();
    });
  };

  return {
    name: "fjsti-pdf-check",
    configureServer(server) {
      mount(server.middlewares);
    },
    configurePreviewServer(server) {
      mount(server.middlewares);
    },
  };
}
