import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure"
  },
  webServer: [
    {
      command: "node tests/fixtures/openai-server.mjs",
      port: 10001,
      reuseExistingServer: false
    },
    {
      command:
        "OPENAI_API_KEY=synthetic-e2e-key OPENAI_BASE_URL=http://127.0.0.1:10001/v1 PORT=10000 HOST=127.0.0.1 PUBLIC_ORIGIN=http://127.0.0.1:4173 node backend/server.js",
      port: 10000,
      reuseExistingServer: false
    },
    {
      command: "npm run preview -- --port 4173",
      port: 4173,
      reuseExistingServer: false
    }
  ]
});
