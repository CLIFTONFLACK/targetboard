import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { createApiMiddleware } from "./server/apiMiddleware.js";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "content-agent-api",
      configureServer(server) {
        server.middlewares.use(createApiMiddleware());
      },
    },
  ],
  server: {
    host: "127.0.0.1",
  },
});
