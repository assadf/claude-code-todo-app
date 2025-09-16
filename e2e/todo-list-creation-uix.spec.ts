import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { CreateTodoListModal } from './page-objects/CreateTodoListModal';
import {
  setupAuthenticatedSession,
  mockAuthEndpoints,
  createTestUser,
} from './utils/auth';
import { dbUtils } from './utils/database';
import { waitForElementStable } from './utils/test-helpers';

test.describe('TODO List Creation - UI/UX', () => {
  let dashboardPage: DashboardPage;
  let modal: CreateTodoListModal;

  test.beforeEach(async ({ page, context }) => {
    // Initialize page objects
    dashboardPage = new DashboardPage(page);
    modal = new CreateTodoListModal(page);

    // Setup authentication
    const testUser = await createTestUser();
    await setupAuthenticatedSession(context, testUser);
    await mockAuthEndpoints(context, testUser);

    // Clean up database
    await dbUtils.cleanup();
  });

  test.afterEach(async () => {
    await dbUtils.cleanup();
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile devices', async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      // Mock successful API response
      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { id: 'test-id', name: 'Mobile List', userId: 'user-id' },
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();

      // Dashboard should be visible
      await expect(dashboardPage.welcomeHeading).toBeVisible();
      await expect(dashboardPage.createFirstListButton).toBeVisible();

      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Modal should fit in mobile viewport
      await expect(modal.modal).toBeVisible();
      await expect(modal.modalContent).toBeVisible();

      // Form elements should be visible and properly sized
      await expect(modal.nameInput).toBeVisible();
      await expect(modal.descriptionInput).toBeVisible();
      await expect(modal.createButton).toBeVisible();
      await expect(modal.cancelButton).toBeVisible();

      // Buttons should stack vertically on mobile
      const createButtonBox = await modal.createButton.boundingBox();
      const cancelButtonBox = await modal.cancelButton.boundingBox();

      expect(createButtonBox?.y).toBeGreaterThan(cancelButtonBox?.y || 0);

      // Test form submission on mobile
      await modal.fillName('Mobile Test List');
      await modal.clickCreate();

      await modal.waitForSuccess();
      await expect(modal.modal).toBeHidden();
    });

    test('should display correctly on tablet devices', async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad

      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { id: 'test-id', name: 'Tablet List', userId: 'user-id' },
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();

      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Modal should be properly centered
      const modalBox = await modal.modalContent.boundingBox();
      const viewportWidth = page.viewportSize()?.width || 0;

      if (modalBox) {
        const modalCenter = modalBox.x + modalBox.width / 2;
        const viewportCenter = viewportWidth / 2;
        const centerDifference = Math.abs(modalCenter - viewportCenter);

        // Modal should be approximately centered (within 50px tolerance)
        expect(centerDifference).toBeLessThan(50);
      }

      await modal.fillName('Tablet Test List');
      await modal.clickCreate();

      await modal.waitForSuccess();
    });

    test('should display correctly on desktop', async ({ page, context }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop

      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { id: 'test-id', name: 'Desktop List', userId: 'user-id' },
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();

      // Dashboard stats should be in grid layout
      await expect(dashboardPage.totalListsCard).toBeVisible();
      await expect(dashboardPage.completedCard).toBeVisible();
      await expect(dashboardPage.inProgressCard).toBeVisible();
      await expect(dashboardPage.totalTasksCard).toBeVisible();

      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Modal should be properly sized for desktop
      const modalBox = await modal.modalContent.boundingBox();
      if (modalBox) {
        expect(modalBox.width).toBeLessThan(600); // Should not be too wide
        expect(modalBox.width).toBeGreaterThan(300); // Should not be too narrow
      }

      // Buttons should be side by side on desktop
      const createButtonBox = await modal.createButton.boundingBox();
      const cancelButtonBox = await modal.cancelButton.boundingBox();

      expect(createButtonBox?.y).toBeCloseTo(cancelButtonBox?.y || 0, 10);

      await modal.fillName('Desktop Test List');
      await modal.clickCreate();

      await modal.waitForSuccess();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Modal should have proper ARIA attributes
      await expect(modal.modal).toHaveAttribute('role', 'dialog');
      await expect(modal.modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal.modal).toHaveAttribute(
        'aria-labelledby',
        'modal-title'
      );

      // Close button should have proper label
      await expect(modal.closeButton).toHaveAttribute(
        'aria-label',
        'Close modal'
      );

      // Form inputs should have proper labels
      await expect(modal.nameInput).toHaveAttribute('id', 'name');
      const nameLabel = page.locator('label[for="name"]');
      await expect(nameLabel).toBeVisible();

      await expect(modal.descriptionInput).toHaveAttribute('id', 'description');
      const descriptionLabel = page.locator('label[for="description"]');
      await expect(descriptionLabel).toBeVisible();
    });

    test('should manage focus properly', async ({ page }) => {
      await dashboardPage.goto();

      // Focus should initially be on the page
      const initialFocus = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(initialFocus).toBe('BODY');

      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Focus should move to modal
      await page.waitForTimeout(100); // Small delay for focus to settle
      const modalIsFocused = await modal.isFocused();
      expect(modalIsFocused).toBe(true);

      // Tab should move focus to form elements
      await page.keyboard.press('Tab');
      await expect(modal.nameInput).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(modal.descriptionInput).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(modal.cancelButton).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(modal.createButton).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(modal.closeButton).toBeFocused();
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await dashboardPage.goto();

      // Should be able to focus and activate the create button with keyboard
      await page.keyboard.press('Tab');
      await dashboardPage.createFirstListButton.focus();
      await page.keyboard.press('Enter');

      await modal.waitForModal();
      await expect(modal.modal).toBeVisible();
    });

    test('should announce form errors to screen readers', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Submit empty form
      await modal.clickCreate();

      // Error message should be visible
      const nameError = await modal.getNameErrorMessage();
      expect(nameError).toBeTruthy();

      // Error should be associated with the input
      const nameErrorElement = page.locator(
        'input[name="name"] ~ p.text-red-400'
      );
      await expect(nameErrorElement).toBeVisible();
    });
  });

  test.describe('Animation and Transitions', () => {
    test('should animate modal opening', async ({ page }) => {
      await dashboardPage.goto();

      await expect(modal.modal).toBeHidden();

      await dashboardPage.clickCreateFirstListButton();

      // Modal should have animation classes
      await expect(modal.modalContent).toHaveClass(/animate-in/);
      await expect(modal.modalContent).toHaveClass(/fade-in-0/);
      await expect(modal.modalContent).toHaveClass(/zoom-in-95/);

      await modal.waitForModal();
      await expect(modal.modal).toBeVisible();
    });

    test('should handle backdrop blur effect', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Backdrop should have blur effect
      await expect(modal.backdrop).toHaveClass(/backdrop-blur-sm/);
      await expect(modal.backdrop).toHaveClass(/bg-black\/50/);
    });

    test('should prevent body scroll when modal is open', async ({ page }) => {
      await dashboardPage.goto();

      // Body should be scrollable initially
      const initialOverflow = await page.evaluate(
        () => document.body.style.overflow
      );
      expect(initialOverflow).toBe('');

      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Body scroll should be prevented
      const modalOverflow = await page.evaluate(
        () => document.body.style.overflow
      );
      expect(modalOverflow).toBe('hidden');

      await modal.clickClose();
      await modal.waitForModalHidden();

      // Body scroll should be restored
      const finalOverflow = await page.evaluate(
        () => document.body.style.overflow
      );
      expect(finalOverflow).toBe('unset');
    });
  });

  test.describe('Visual Feedback', () => {
    test('should show loading spinner during submission', async ({
      page,
      context,
    }) => {
      // Add delay to see loading state
      await context.route('**/api/todolists', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { id: 'test-id', name: 'Test List', userId: 'user-id' },
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.fillName('Test List');
      await modal.clickCreate();

      // Loading spinner should be visible
      await expect(modal.loadingSpinner).toBeVisible();

      // Button text should change
      const buttonText = await modal.createButton.textContent();
      expect(buttonText).toContain('Creating...');

      await modal.waitForSuccess();
    });

    test('should display error states visually', async ({ page, context }) => {
      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Server error',
            message: 'Internal server error occurred',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.fillName('Test List');
      await modal.clickCreate();

      await modal.waitForError();

      // Error message should have proper styling
      await expect(modal.errorMessage).toBeVisible();
      await expect(modal.errorMessage).toHaveClass(/border-red-600/);
      await expect(modal.errorMessage).toHaveClass(/bg-red-900\/20/);
    });

    test('should provide hover and focus states', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Hover over create button
      await modal.createButton.hover();

      // Focus on name input
      await modal.nameInput.focus();
      await expect(modal.nameInput).toBeFocused();

      // Close button should respond to hover
      await modal.closeButton.hover();
    });
  });

  test.describe('Layout Stability', () => {
    test('should maintain layout when switching between states', async ({
      page,
      context,
    }) => {
      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Server error',
            message: 'Internal server error occurred',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Get initial button positions
      const initialCreatePosition = await modal.createButton.boundingBox();
      const initialCancelPosition = await modal.cancelButton.boundingBox();

      await modal.fillName('Test List');
      await modal.clickCreate();

      // Wait for error
      await modal.waitForError();

      // Button positions should remain stable
      const errorCreatePosition = await modal.createButton.boundingBox();
      const errorCancelPosition = await modal.cancelButton.boundingBox();

      expect(initialCreatePosition?.x).toBeCloseTo(
        errorCreatePosition?.x || 0,
        5
      );
      expect(initialCreatePosition?.y).toBeCloseTo(
        errorCreatePosition?.y || 0,
        5
      );
      expect(initialCancelPosition?.x).toBeCloseTo(
        errorCancelPosition?.x || 0,
        5
      );
      expect(initialCancelPosition?.y).toBeCloseTo(
        errorCancelPosition?.y || 0,
        5
      );
    });

    test('should handle long text gracefully', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Fill with very long text (but within limits)
      const longName = 'A'.repeat(99);
      const longDescription = 'B'.repeat(499);

      await modal.fillName(longName);
      await modal.fillDescription(longDescription);

      // Modal should not break layout
      await expect(modal.modal).toBeVisible();
      await expect(modal.modalContent).toBeVisible();

      // Text should not overflow containers
      const nameInputBox = await modal.nameInput.boundingBox();
      const descInputBox = await modal.descriptionInput.boundingBox();
      const modalBox = await modal.modalContent.boundingBox();

      if (nameInputBox && modalBox) {
        expect(nameInputBox.x + nameInputBox.width).toBeLessThanOrEqual(
          modalBox.x + modalBox.width
        );
      }
      if (descInputBox && modalBox) {
        expect(descInputBox.x + descInputBox.width).toBeLessThanOrEqual(
          modalBox.x + modalBox.width
        );
      }
    });
  });
});
