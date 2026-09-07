import { defineConfig, mergeConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// react() plugin type mismatches vitest's bundled vite version — see repo memory
export default mergeConfig(
  defineConfig({
    plugins: [react() as never],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      exclude: ["e2e/**", "node_modules/**"],
    },
  }),
);
