import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "admin/index": "src/admin/index.ts",
    "api/index": "src/api/index.ts",
    "components/index": "src/components/index.ts",
    "hooks/index": "src/hooks/index.ts",
    "runtime/index": "src/runtime/index.ts",
  },
  outDir: "dist",
  format: ["esm"],
  target: "es2022",
  platform: "browser",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ["@tanstack/react-query", "react", "react-dom", "react-hook-form"],
});
