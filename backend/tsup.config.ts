import { defineConfig } from "tsup";

// tsc-ийн оронд tsup: workspace дахь TS эх кодтой package (@winu/contracts,
// @winu/mn-integrations) болон `@/*` alias-ыг bundle дотроо шийднэ.
export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node22",
  platform: "node",
  sourcemap: true,
  clean: true,
  // express, cors зэрэг runtime хамаарлыг bundle-д оруулахгүй — node_modules-оос уншина.
  noExternal: [/^@winu\//],
});
