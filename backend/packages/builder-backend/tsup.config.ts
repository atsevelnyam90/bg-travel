import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "datasources/index": "src/datasources/index.ts",
    "errors/index": "src/errors/index.ts",
    "migrations/index": "src/migrations/index.ts",
    "metadata/index": "src/metadata/index.ts",
    "router/index": "src/router/index.ts",
    "runtime/index": "src/runtime/index.ts",
    "triggers/index": "src/triggers/index.ts",
    "usecases/index": "src/usecases/index.ts",
  },
  outDir: "dist",
  format: ["esm"],
  target: "node22",
  platform: "node",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ["@winu/contracts", "express"],
});
