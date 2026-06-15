import { defineConfig, devices } from '@playwright/test'

const isCi = Boolean(process.env.CI)
const webPort = process.env.E2E_WEB_PORT || '3100'
const apiPort = process.env.E2E_API_PORT || '3101'
const webBaseUrl = `http://127.0.0.1:${webPort}`
const apiBaseUrl = `http://127.0.0.1:${apiPort}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: webBaseUrl,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: `HOST=127.0.0.1 PORT=${apiPort} CORS_ORIGIN=${webBaseUrl} npm --prefix backend run dev`,
      url: `${apiBaseUrl}/event-types`,
      reuseExistingServer: !isCi,
      timeout: 120_000,
    },
    {
      command: `WEB_PORT=${webPort} NUXT_PUBLIC_API_BASE=${apiBaseUrl} npm --prefix frontend run dev`,
      url: webBaseUrl,
      reuseExistingServer: !isCi,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
