import { test, expect, type BrowserContext } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { CreateTodoListModal } from './page-objects/CreateTodoListModal';
import { AuthPage } from './page-objects/AuthPage';
import {
  setupAuthenticatedSession,
  setupUnauthenticatedSession,
  mockAuthEndpoints,
  createTestUser,
  expectAuthenticationRequired,
} from './utils/auth';
import { dbUtils } from './utils/database';
import {
  waitForNetworkIdle,
  waitForApiRequest,
  mockApiError,
  ApiRequestCollector,
  testData,
  ConsoleErrorCollector,
} from './utils/test-helpers';

test.describe('TODO List Creation', () => {
  let dashboardPage: DashboardPage;
  let modal: CreateTodoListModal;
  let authPage: AuthPage;
  let consoleErrors: ConsoleErrorCollector;

  test.beforeEach(async ({ page, context }) => {
    // Initialize page objects
    dashboardPage = new DashboardPage(page);
    modal = new CreateTodoListModal(page);
    authPage = new AuthPage(page);
    consoleErrors = new ConsoleErrorCollector(page);

    // Clean up database before each test
    await dbUtils.cleanup();
  });

  test.afterEach(async ({ page }) => {
    // Check for console errors after each test
    consoleErrors.assertNoConsoleErrors();

    // Clean up database after each test
    await dbUtils.cleanup();
  });

  test.describe('Authentication Required', () => {
    test('should redirect unauthenticated users to signin', async ({
      page,
      context,
    }) => {
      await setupUnauthenticatedSession(context);

      await dashboardPage.goto();

      await expectAuthenticationRequired(page);
      await expect(authPage.welcomeHeading).toBeVisible();
    });

    test('should allow authenticated users to access dashboard', async ({
      page,
      context,
    }) => {
      const testUser = await createTestUser({
        name: 'John Doe',
        email: 'john@example.com',
      });
      await setupAuthenticatedSession(context, testUser);
      await mockAuthEndpoints(context, testUser);

      await dashboardPage.goto();

      await expect(dashboardPage.welcomeHeading).toBeVisible();
      await expect(dashboardPage.welcomeHeading).toContainText('John Doe');
    });
  });

  test.describe('Modal Interaction', () => {
    test.beforeEach(async ({ context }) => {
      const testUser = await createTestUser();
      await setupAuthenticatedSession(context, testUser);
      await mockAuthEndpoints(context, testUser);
    });

    test('should open modal when clicking "Create Your First List" button', async ({
      page,
    }) => {
      await dashboardPage.goto();

      await expect(modal.modal).toBeHidden();

      await dashboardPage.clickCreateFirstListButton();

      await modal.waitForModal();
      await expect(modal.modal).toBeVisible();
      await expect(modal.modalTitle).toBeVisible();
      await expect(modal.modalTitle).toContainText('Create New TODO List');
    });

    test('should close modal when clicking close button', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.clickClose();

      await modal.waitForModalHidden();
      await expect(modal.modal).toBeHidden();
    });

    test('should close modal when clicking cancel button', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.clickCancel();

      await modal.waitForModalHidden();
      await expect(modal.modal).toBeHidden();
    });

    test('should close modal when clicking backdrop', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.clickBackdrop();

      await modal.waitForModalHidden();
      await expect(modal.modal).toBeHidden();
    });

    test('should close modal when pressing escape key', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.pressEscape();

      await modal.waitForModalHidden();
      await expect(modal.modal).toBeHidden();
    });

    test('should focus modal content when opened', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      const isFocused = await modal.isFocused();
      expect(isFocused).toBe(true);
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ context }) => {
      const testUser = await createTestUser();
      await setupAuthenticatedSession(context, testUser);
      await mockAuthEndpoints(context, testUser);
    });

    test('should show validation error for empty name', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      // Try to submit with empty name
      await modal.clickCreate();

      const nameError = await modal.getNameErrorMessage();
      expect(nameError).toContain('Name is required');

      // Modal should still be open
      await expect(modal.modal).toBeVisible();
    });

    test('should show validation error for name too short', async ({
      page,
    }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.fillName('a');
      await modal.clickCreate();

      const nameError = await modal.getNameErrorMessage();
      expect(nameError).toContain('Name must be at least 2 characters');
    });

    test('should show validation error for name too long', async ({ page }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      const longName = 'A'.repeat(101);
      await modal.fillName(longName);
      await modal.clickCreate();

      const nameError = await modal.getNameErrorMessage();
      expect(nameError).toContain('Name must be less than 100 characters');
    });

    test('should show validation error for description too long', async ({
      page,
    }) => {
      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.fillName('Valid Name');
      const longDescription = 'A'.repeat(501);
      await modal.fillDescription(longDescription);
      await modal.clickCreate();

      const descriptionError = await modal.getDescriptionErrorMessage();
      expect(descriptionError).toContain(
        'Description must be less than 500 characters'
      );
    });

    test('should accept valid name only', async ({ page, context }) => {
      // Mock successful API response
      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 'test-id',
              name: 'Valid List Name',
              description: null,
              userId: 'user-id',
              createdAt: new Date().toISOString(),
            },
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.fillName('Valid List Name');
      await modal.clickCreate();

      await modal.waitForSuccess();
      await expect(modal.modal).toBeHidden();
    });

    test('should accept valid name and description', async ({
      page,
      context,
    }) => {
      // Mock successful API response
      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 'test-id',
              name: 'Valid List Name',
              description: 'Valid description',
              userId: 'user-id',
              createdAt: new Date().toISOString(),
            },
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.fillName('Valid List Name');
      await modal.fillDescription('Valid description');
      await modal.clickCreate();

      await modal.waitForSuccess();
      await expect(modal.modal).toBeHidden();
    });
  });

  test.describe('API Integration', () => {
    test.beforeEach(async ({ context }) => {
      const testUser = await createTestUser();
      await setupAuthenticatedSession(context, testUser);
      await mockAuthEndpoints(context, testUser);
    });

    test('should send correct API request for name only', async ({
      page,
      context,
    }) => {
      const apiCollector = new ApiRequestCollector(page, /\/api\/todolists/);

      // Mock successful API response
      await context.route('**/api/todolists', async route => {
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

      await modal.createTodoList('Test List');

      await waitForApiRequest(page, /\/api\/todolists/, 'POST');

      apiCollector.assertRequestCount(1);
      apiCollector.assertLastRequestBody({
        name: 'Test List',
      });
    });

    test('should send correct API request for name and description', async ({
      page,
      context,
    }) => {
      const apiCollector = new ApiRequestCollector(page, /\/api\/todolists/);

      // Mock successful API response
      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 'test-id',
              name: 'Test List',
              description: 'Test Description',
              userId: 'user-id',
            },
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList('Test List', 'Test Description');

      await waitForApiRequest(page, /\/api\/todolists/, 'POST');

      apiCollector.assertRequestCount(1);
      apiCollector.assertLastRequestBody({
        name: 'Test List',
        description: 'Test Description',
      });
    });

    test('should handle API errors gracefully', async ({ page, context }) => {
      await mockApiError(
        context,
        '/api/todolists',
        'Internal server error',
        500
      );

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList('Test List');

      await modal.waitForError();
      const errorMessage = await modal.getFormErrorMessage();
      expect(errorMessage).toContain('Internal server error');

      // Modal should still be open
      await expect(modal.modal).toBeVisible();
    });

    test('should handle validation errors from API', async ({
      page,
      context,
    }) => {
      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Validation failed',
            details: [{ message: 'Name is required' }],
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList('Test List');

      await modal.waitForError();
      const errorMessage = await modal.getFormErrorMessage();
      expect(errorMessage).toContain('Validation failed');
    });

    test('should handle authentication errors', async ({ page, context }) => {
      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Authentication required',
            message: 'You must be logged in to create a todo list',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList('Test List');

      await modal.waitForError();
      const errorMessage = await modal.getFormErrorMessage();
      expect(errorMessage).toContain('Authentication required');
    });
  });

  test.describe('Loading States', () => {
    test.beforeEach(async ({ context }) => {
      const testUser = await createTestUser();
      await setupAuthenticatedSession(context, testUser);
      await mockAuthEndpoints(context, testUser);
    });

    test('should show loading state during form submission', async ({
      page,
      context,
    }) => {
      // Add delay to API response to see loading state
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

      // Check loading state
      await expect(modal.createButton).toBeDisabled();
      expect(await modal.isCreateButtonLoading()).toBe(true);
      expect(await modal.isLoadingSpinnerVisible()).toBe(true);

      await modal.waitForSuccess();
    });

    test('should disable buttons during loading', async ({ page, context }) => {
      // Add delay to API response
      await context.route('**/api/todolists', async route => {
        await new Promise(resolve => setTimeout(resolve, 500));
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

      // Both buttons should be disabled during loading
      await expect(modal.createButton).toBeDisabled();
      await expect(modal.cancelButton).toBeDisabled();

      await modal.waitForSuccess();
    });
  });

  test.describe('Form Reset', () => {
    test.beforeEach(async ({ context }) => {
      const testUser = await createTestUser();
      await setupAuthenticatedSession(context, testUser);
      await mockAuthEndpoints(context, testUser);
    });

    test('should reset form after successful submission', async ({
      page,
      context,
    }) => {
      // Mock successful API response
      await context.route('**/api/todolists', async route => {
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
      await modal.fillDescription('Test Description');
      await modal.clickCreate();

      await modal.waitForSuccess();

      // Open modal again to check if form is reset
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      expect(await modal.getNameInputValue()).toBe('');
      expect(await modal.getDescriptionInputValue()).toBe('');
    });

    test('should not reset form after failed submission', async ({
      page,
      context,
    }) => {
      await mockApiError(context, '/api/todolists', 'Server error', 500);

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.fillName('Test List');
      await modal.fillDescription('Test Description');
      await modal.clickCreate();

      await modal.waitForError();

      // Form values should be preserved
      expect(await modal.getNameInputValue()).toBe('Test List');
      expect(await modal.getDescriptionInputValue()).toBe('Test Description');
    });
  });
});
