import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3010";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  use: { baseURL: BASE_URL, trace: "on-first-retry", screenshot: "only-on-failure" },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "admin",
      testIgnore: /(login|guest|portal-public|portal-admissions)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/admin.json" },
      dependencies: ["setup"],
    },
    {
      name: "guest",
      testMatch: /(login|guest|portal-public|portal-admissions)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // ต้องตรงพอร์ตกับ E2E_BASE_URL (ค่าเริ่มต้น 3010) — อย่า reuse Docker production image บน 3010
  webServer: {
    command: "npm run dev:3010",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
