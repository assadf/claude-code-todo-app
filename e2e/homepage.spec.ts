import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the homepage correctly', async ({ page }) => {
    await page.goto('/');

    // Check the main heading
    await expect(
      page.getByRole('heading', { name: /claude code todo app/i })
    ).toBeVisible();

    // Check the welcome message
    await expect(
      page.getByText(/welcome to your todo management system/i)
    ).toBeVisible();

    // Check the get started button
    await expect(page.getByText(/get started/i)).toBeVisible();
  });

  test('should have proper responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    await expect(page.getByRole('main')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /claude code todo app/i })
    ).toBeVisible();
  });

  test('should have proper dark theme styling', async ({ page }) => {
    await page.goto('/');

    // Check that the page has dark background
    const body = page.locator('body');
    await expect(body).toHaveClass(/bg-dark-900/);

    // Check gradient text styling
    const heading = page.getByRole('heading', {
      name: /claude code todo app/i,
    });
    await expect(heading).toHaveClass(/bg-gradient-to-r/);
  });
});
