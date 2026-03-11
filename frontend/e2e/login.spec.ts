import { test, expect } from '@playwright/test';

test('unauthenticated visit to / redirects to login and shows Login heading', async ({ page }) => {
  await page.route(/\/api\/auth\/me/, (route) => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized' }),
    });
  });
  await page.route(/\/api\/auth\/refresh/, (route) => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized' }),
    });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible({ timeout: 20000 });
  await expect(page).toHaveURL(/\/login/);
});

test('successful login redirects to dashboard and shows user email', async ({ page }) => {
  const user = { id: 'user-1', email: 'staff@clinic.com', role: 'staff' };
  let getMeCallCount = 0;

  await page.route(/\/api\/auth\/me/, (route) => {
    getMeCallCount++;
    if (getMeCallCount <= 1) {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user }),
      });
    }
  });
  await page.route(/\/api\/auth\/refresh/, (route) => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized' }),
    });
  });
  await page.route(/\/api\/auth\/login/, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user }),
      });
    } else {
      route.continue();
    }
  });

  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible({ timeout: 10000 });
  await page.getByLabel('Email').fill('staff@clinic.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/', { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Front Desk' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Welcome, staff@clinic.com')).toBeVisible({ timeout: 10000 });
});

test('failed login keeps user on login page', async ({ page }) => {
  await page.route(/\/api\/auth\/me/, (route) => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized' }),
    });
  });
  await page.route(/\/api\/auth\/refresh/, (route) => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized' }),
    });
  });
  await page.route(/\/api\/auth\/login/, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    } else {
      route.continue();
    }
  });

  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.getByLabel('Email').fill('wrong@clinic.com');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Front Desk' })).not.toBeVisible();
});
