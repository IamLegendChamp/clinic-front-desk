import { test, expect } from '@playwright/test';

test('unauthenticated visit to / redirects to login and shows Login heading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

test('successful login redirects to dashboard and shows user email', async ({ page }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
  const user = { id: 'user-1', email: 'staff@clinic.com', role: 'staff' };

  await page.route(/\/api\/auth\/login/, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token, user }),
      });
    } else {
      route.continue();
    }
  });
  await page.route(/\/api\/auth\/me/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user }),
    });
  });

  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('staff@clinic.com');
  await page.getByPlaceholder('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Front Desk' })).toBeVisible();
  await expect(page.getByText('Welcome, staff@clinic.com')).toBeVisible();
});

test('failed login keeps user on login page', async ({ page }) => {
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

  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('wrong@clinic.com');
  await page.getByPlaceholder('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Front Desk' })).not.toBeVisible();
});
