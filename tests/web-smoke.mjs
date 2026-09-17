import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:8081';
const routes = [
  { path: '/', text: /Welcome back|Your feed/i },
  { path: '/login', text: /Welcome back|Sign In/i },
  { path: '/signup', text: /Create account|Create Account/i },
  { path: '/forgot-password', text: /Reset your password|Send reset link/i },
  { path: '/reset-password', text: /Choose a new password|Update password/i },
  { path: '/search', text: /Welcome back|Discover|Sign In/i },
  { path: '/notifications', text: /Welcome back|Notifications|Sign In/i },
  { path: '/profile', text: /Welcome back|Profile|Sign In/i },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const failures = [];

page.on('pageerror', (error) => {
  failures.push(`pageerror: ${error.message}`);
});

for (const route of routes) {
  failures.length = 0;
  const response = await page.goto(`${baseUrl}${route.path}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(1500);

  const status = response?.status() ?? 0;
  const bodyText = (await page.locator('body').innerText()).trim();

  if (status >= 400 || !bodyText) {
    throw new Error(`${route.path}: HTTP ${status}, body length ${bodyText.length}`);
  }

  if (!route.text.test(bodyText)) {
    throw new Error(`${route.path}: expected screen text not found in body: ${bodyText.slice(0, 500)}`);
  }

  if (failures.length) {
    throw new Error(`${route.path}: ${failures.join('; ')}`);
  }

  console.log(`PASS ${route.path} -> HTTP ${status}, body ${bodyText.length} chars`);
}

await browser.close();
console.log('WEB_SMOKE_OK');
