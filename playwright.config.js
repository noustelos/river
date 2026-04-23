const os = require("os");
const { defineConfig, devices } = require("@playwright/test");

const darwinMajor = process.platform === "darwin" ? Number(os.release().split(".")[0] || 0) : 0;
const supportsWebkit = process.platform !== "darwin" || darwinMajor >= 22;

const projects = [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] }
  },
  {
    name: "firefox",
    use: { ...devices["Desktop Firefox"] }
  }
];

if (supportsWebkit) {
  projects.push({
    name: "webkit",
    use: { ...devices["Desktop Safari"] }
  });
}

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }]
  ],
  outputDir: "e2e-artifacts",
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: "npx http-server . -p 4173 -c-1 --silent",
    url: "http://127.0.0.1:4173",
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  },
  projects
});
