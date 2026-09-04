import { defineConfig, devices } from "@playwright/test";

/**
 * 웹 스모크 E2E. 실행 전 준비:
 *   1) 백엔드: cd ../../../dev/baljachuk-api && npm run db:seed && npm run start:dev
 *   2) 프론트: npx expo start --web --port 8081
 *   3) npx playwright install chromium  (최초 1회)
 * 그다음: npx playwright test
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_WEB_URL ?? "http://localhost:8081",
    trace: "on-first-retry",
    viewport: { width: 420, height: 900 },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
