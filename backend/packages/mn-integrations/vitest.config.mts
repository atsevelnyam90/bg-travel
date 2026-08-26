import { defineConfig } from "vitest/config";

// Node орчны package — jsdom хэрэггүй.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
  },
});
