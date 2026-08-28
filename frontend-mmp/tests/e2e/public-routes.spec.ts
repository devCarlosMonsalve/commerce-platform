import { expect, test } from '@playwright/test';

test('renders the localized landing page', async ({ page }) => {
  await page.goto('/es');

  await expect(page).toHaveTitle(/Commerce Platform/i);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /iniciar sesión/i })).toBeVisible();
});

test('serves application metadata assets', async ({ request }) => {
  for (const path of ['/manifest.webmanifest', '/robots.txt', '/sitemap.xml']) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
  }
});

test('renders a localized not-found page', async ({ page }) => {
  await page.goto('/es/route-that-does-not-exist');

  await expect(
    page.getByRole('heading', { name: /no encontramos esa página/i }),
  ).toBeVisible();
  await expect(page.getByRole('link')).toBeVisible();
});
