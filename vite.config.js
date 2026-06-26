import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/atcoder": {
        target: "https://atcoder.jp",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/atcoder/, ""),
      },
    },
  },
});
