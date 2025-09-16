import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { DashboardPage } from '../page-objects/DashboardPage';
import { CreateTodoListModal } from '../page-objects/CreateTodoListModal';
import { AuthPage } from '../page-objects/AuthPage';
import {
  setupAuthenticatedSession,
  setupUnauthenticatedSession,
  mockAuthEndpoints,
  createTestUser,
  type TestUser,
} from '../utils/auth';
import { dbUtils } from '../utils/database';
import {
  ConsoleErrorCollector,
  ApiRequestCollector,
} from '../utils/test-helpers';

// Define the types for our fixtures
type TestFixtures = {
  dashboardPage: DashboardPage;
  modal: CreateTodoListModal;
  authPage: AuthPage;
  authenticatedContext: BrowserContext;
  unauthenticatedContext: BrowserContext;
  testUser: TestUser;
  consoleErrors: ConsoleErrorCollector;
  apiCollector: ApiRequestCollector;
};

type WorkerFixtures = {
  // Worker-scoped fixtures would go here
};

// Extend the base test to include our fixtures
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Page object fixtures
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  modal: async ({ page }, use) => {
    const modal = new CreateTodoListModal(page);
    await use(modal);
  },

  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  // Test user fixture
  testUser: async ({}, use) => {
    const testUser = await createTestUser({
      name: 'Test User',
      email: 'testuser@example.com',
    });

    // Setup user in test database
    await dbUtils.createTestUser(testUser);

    await use(testUser);
  },

  // Authenticated context fixture
  authenticatedContext: async ({ context, testUser }, use) => {
    await setupAuthenticatedSession(context, testUser);
    await mockAuthEndpoints(context, testUser);
    await use(context);
  },

  // Unauthenticated context fixture
  unauthenticatedContext: async ({ context }, use) => {
    await setupUnauthenticatedSession(context);
    await use(context);
  },

  // Console error collector fixture
  consoleErrors: async ({ page }, use) => {
    const consoleErrors = new ConsoleErrorCollector(page);
    await use(consoleErrors);

    // Automatically check for console errors after each test
    consoleErrors.assertNoConsoleErrors();
  },

  // API request collector fixture
  apiCollector: async ({ page }, use) => {
    const apiCollector = new ApiRequestCollector(page, /\/api\/todolists/);
    await use(apiCollector);
  },
});

// Export expect for convenience
export { expect } from '@playwright/test';

/**
 * Custom test functions for common scenarios
 */

/**
 * Test with authenticated user setup
 */
export const testWithAuth = test.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page, testUser, context }, use) => {
    await setupAuthenticatedSession(context, testUser);
    await mockAuthEndpoints(context, testUser);
    await use(page);
  },
});

/**
 * Test with successful API mock setup
 */
export const testWithSuccessfulAPI = test.extend<{
  successApiContext: BrowserContext;
}>({
  successApiContext: async ({ context }, use) => {
    await context.route('**/api/todolists', async route => {
      const request = route.request();
      const requestBody = JSON.parse(request.postData() || '{}');

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'test-list-id',
            name: requestBody.name,
            description: requestBody.description || undefined,
            userId: 'test-user-id',
            createdAt: new Date().toISOString(),
          },
          message: 'TodoList created successfully',
        }),
      });
    });

    await use(context);
  },
});

/**
 * Test with failing API mock setup
 */
export const testWithFailingAPI = test.extend<{
  failApiContext: BrowserContext;
}>({
  failApiContext: async ({ context }, use) => {
    await context.route('**/api/todolists', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          message: 'Something went wrong on the server',
        }),
      });
    });

    await use(context);
  },
});

/**
 * Test with database cleanup hooks
 */
export const testWithCleanDB = test.extend({
  page: async ({ page }, use, testInfo) => {
    // Clean database before test
    await dbUtils.cleanup();

    await use(page);

    // Clean database after test
    await dbUtils.cleanup();
  },
});

/**
 * Test with pre-populated data
 */
export const testWithData = test.extend<{ prePopulatedUser: TestUser }>({
  prePopulatedUser: async ({ testUser }, use) => {
    // Create some initial data for the user
    await dbUtils.setupUserWithLists(testUser.id, 2, 3);

    await use(testUser);
  },
});

/**
 * Mobile test variant
 */
export const testMobile = test.extend({
  page: async ({ page }, use) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await use(page);
  },
});

/**
 * Tablet test variant
 */
export const testTablet = test.extend({
  page: async ({ page }, use) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await use(page);
  },
});

/**
 * Desktop test variant
 */
export const testDesktop = test.extend({
  page: async ({ page }, use) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await use(page);
  },
});

/**
 * Test with slow network simulation
 */
export const testSlowNetwork = test.extend({
  context: async ({ context }, use) => {
    // Simulate slow network conditions
    await context.route('**/api/**', async route => {
      // Add artificial delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await use(context);
  },
});
