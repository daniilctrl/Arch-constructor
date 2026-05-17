import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/e2e/**/*.test.ts"],
    environment: "node",
    hookTimeout: 30000,
    testTimeout: 20000,
    // E2E tests share a real DB schema; serialize to avoid flake.
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
