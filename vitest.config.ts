import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Several suites run `astro build` into the shared `dist/` in beforeAll.
    // Running test files in parallel races those builds and clobbers `dist/`,
    // so serialize files. Cheap here — the suite is small.
    fileParallelism: false,
  },
});
