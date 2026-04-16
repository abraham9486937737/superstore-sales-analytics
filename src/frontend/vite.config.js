import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/superstore-sales-analytics/",
  server: {
    proxy: {
      // Forward /api/* requests to the Express feedback server in development
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
