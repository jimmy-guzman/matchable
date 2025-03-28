import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [...(configDefaults.coverage.exclude ?? []), "knip.config.*"],
    },
    globals: true,
  },
});
