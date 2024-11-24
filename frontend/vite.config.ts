import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build", // Specify output directory as "build"
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
