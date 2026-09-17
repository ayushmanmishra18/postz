import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:8081';
const routes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/search',
  '/notifications',
  '/profile',
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const failures = [];

page.on('pageerror', (error) => {
  failures.push(`pageerror: ${error.message}`);
});

for (const route of routes) {
  failures.length = 0;
  const response = await page.goto(`${baseUrl}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(1500);

  const status = response?.status() ?? 0;
  const bodyText = (await page.locator('body').innerText()).trim();

  if (status >= 400 || !bodyText) {
    throw new Error(`${route}: HTTP ${status}, body length ${bodyText.length}`);
  }

  if (failures.length) {
    throw new Error(`${route}: ${failures.join('; ')}`);
  }

  console.log(`PASS ${route} -> HTTP ${status}, body ${bodyText.length} chars`);
}

await browser.close();
console.log('WEB_SMOKE_OK');
