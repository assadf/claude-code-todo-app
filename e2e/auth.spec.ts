import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display sign in page correctly', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check the welcome heading
    await expect(
      page.getByRole('heading', { name: /welcome to claude code todo/i })
    ).toBeVisible();

    // Check the description
    await expect(page.getByText(/sign in to manage your tasks/i)).toBeVisible();

    // Check the Google sign in button
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeVisible();

    // Check terms of service text
    await expect(
      page.getByText(/by signing in, you agree to our terms/i)
    ).toBeVisible();
  });

  test('should have proper styling on sign in page', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check dark theme
    const body = page.locator('body');
    await expect(body).toHaveClass(/bg-dark-900/);

    // Check card styling
    const card = page.locator('.card');
    await expect(card).toBeVisible();

    // Check Google button styling
    const googleButton = page.getByRole('button', {
      name: /continue with google/i,
    });
    await expect(googleButton).toHaveClass(/bg-white/);
  });

  test('should display error page correctly', async ({ page }) => {
    await page.goto('/auth/error?error=AccessDenied');

    // Check the error heading
    await expect(
      page.getByRole('heading', { name: /authentication error/i })
    ).toBeVisible();

    // Check the error message
    await expect(page.getByText(/access denied/i)).toBeVisible();

    // Check the action buttons
    await expect(page.getByRole('link', { name: /try again/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /go home/i })).toBeVisible();
  });

  test('should redirect to dashboard when accessing protected route without auth', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Should redirect to sign in page
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/signin');

    // Check that elements are still visible and properly arranged
    await expect(
      page.getByRole('heading', { name: /welcome to claude code todo/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeVisible();

    // Check card takes appropriate width on mobile
    const card = page.locator('.card');
    await expect(card).toBeVisible();
  });
});
