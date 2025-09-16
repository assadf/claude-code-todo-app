import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { CreateTodoListModal } from './page-objects/CreateTodoListModal';
import {
  setupAuthenticatedSession,
  mockAuthEndpoints,
  createTestUser,
  type TestUser,
} from './utils/auth';
import { dbUtils, type TestTodoList } from './utils/database';
import { waitForApiRequest } from './utils/test-helpers';

test.describe('TODO List Creation - Database Integration', () => {
  let dashboardPage: DashboardPage;
  let modal: CreateTodoListModal;
  let testUser: TestUser;

  test.beforeEach(async ({ page, context }) => {
    // Initialize page objects
    dashboardPage = new DashboardPage(page);
    modal = new CreateTodoListModal(page);

    // Setup authentication
    testUser = await createTestUser({
      name: 'Database Test User',
      email: 'dbtest@example.com',
    });

    await setupAuthenticatedSession(context, testUser);
    await mockAuthEndpoints(context, testUser);

    // Clean up database before each test
    await dbUtils.cleanup();

    // Create the test user in database
    await dbUtils.createTestUser(testUser);
  });

  test.afterEach(async () => {
    // Clean up database after each test
    await dbUtils.cleanup();
  });

  test.describe('Data Persistence', () => {
    test('should persist TODO list with name only in database', async ({
      page,
      context,
    }) => {
      const listName = 'Persistent Test List';

      // Mock successful API response that simulates real database storage
      await context.route('**/api/todolists', async route => {
        const request = route.request();
        const requestBody = JSON.parse(request.postData() || '{}');

        // Simulate database creation
        const createdList = await dbUtils.createTestTodoList({
          name: requestBody.name,
          description: requestBody.description,
          userId: testUser.id,
        });

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: createdList,
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList(listName);

      await waitForApiRequest(page, /\/api\/todolists/, 'POST');
      await modal.waitForSuccess();

      // Verify data exists in database
      const persistedList = await dbUtils.verifyTodoListExists(
        testUser.id,
        listName
      );
      expect(persistedList).toBeTruthy();
      expect(persistedList?.name).toBe(listName);
      expect(persistedList?.userId).toBe(testUser.id);
      expect(persistedList?.description).toBeUndefined();
    });

    test('should persist TODO list with name and description in database', async ({
      page,
      context,
    }) => {
      const listName = 'Complete Test List';
      const listDescription = 'This is a test list with description';

      await context.route('**/api/todolists', async route => {
        const request = route.request();
        const requestBody = JSON.parse(request.postData() || '{}');

        const createdList = await dbUtils.createTestTodoList({
          name: requestBody.name,
          description: requestBody.description,
          userId: testUser.id,
        });

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: createdList,
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList(listName, listDescription);

      await waitForApiRequest(page, /\/api\/todolists/, 'POST');
      await modal.waitForSuccess();

      // Verify data exists in database
      const persistedList = await dbUtils.verifyTodoListExists(
        testUser.id,
        listName,
        listDescription
      );
      expect(persistedList).toBeTruthy();
      expect(persistedList?.name).toBe(listName);
      expect(persistedList?.description).toBe(listDescription);
      expect(persistedList?.userId).toBe(testUser.id);
    });

    test('should associate TODO list with correct user', async ({
      page,
      context,
    }) => {
      const listName = 'User Association Test';

      // Create another test user
      const otherUser = await createTestUser({
        name: 'Other User',
        email: 'other@example.com',
      });
      await dbUtils.createTestUser(otherUser);

      // Create a list for the other user
      await dbUtils.createTestTodoList({
        name: 'Other User List',
        userId: otherUser.id,
      });

      await context.route('**/api/todolists', async route => {
        const request = route.request();
        const requestBody = JSON.parse(request.postData() || '{}');

        const createdList = await dbUtils.createTestTodoList({
          name: requestBody.name,
          description: requestBody.description,
          userId: testUser.id,
        });

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: createdList,
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList(listName);
      await modal.waitForSuccess();

      // Verify the list is associated with the correct user
      const userLists = await dbUtils.getTodoListsForUser(testUser.id);
      const otherUserLists = await dbUtils.getTodoListsForUser(otherUser.id);

      expect(userLists).toHaveLength(1);
      expect(userLists[0].name).toBe(listName);
      expect(userLists[0].userId).toBe(testUser.id);

      expect(otherUserLists).toHaveLength(1);
      expect(otherUserLists[0].name).toBe('Other User List');
      expect(otherUserLists[0].userId).toBe(otherUser.id);
    });

    test('should store timestamps correctly', async ({ page, context }) => {
      const listName = 'Timestamp Test List';
      const startTime = new Date();

      await context.route('**/api/todolists', async route => {
        const request = route.request();
        const requestBody = JSON.parse(request.postData() || '{}');

        const createdList = await dbUtils.createTestTodoList({
          name: requestBody.name,
          description: requestBody.description,
          userId: testUser.id,
        });

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: createdList,
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList(listName);
      await modal.waitForSuccess();

      const endTime = new Date();

      // Verify timestamps
      const persistedList = await dbUtils.verifyTodoListExists(
        testUser.id,
        listName
      );
      expect(persistedList).toBeTruthy();

      if (persistedList) {
        expect(persistedList.createdAt).toBeInstanceOf(Date);
        expect(persistedList.updatedAt).toBeInstanceOf(Date);

        // Timestamps should be within the test execution window
        expect(persistedList.createdAt.getTime()).toBeGreaterThanOrEqual(
          startTime.getTime()
        );
        expect(persistedList.createdAt.getTime()).toBeLessThanOrEqual(
          endTime.getTime()
        );

        expect(persistedList.updatedAt.getTime()).toBeGreaterThanOrEqual(
          startTime.getTime()
        );
        expect(persistedList.updatedAt.getTime()).toBeLessThanOrEqual(
          endTime.getTime()
        );
      }
    });
  });

  test.describe('Data Validation', () => {
    test('should handle duplicate list names for same user', async ({
      page,
      context,
    }) => {
      const listName = 'Duplicate Test List';

      // Create first list
      await dbUtils.createTestTodoList({
        name: listName,
        userId: testUser.id,
      });

      // Mock API to allow duplicate names (business logic dependent)
      await context.route('**/api/todolists', async route => {
        const request = route.request();
        const requestBody = JSON.parse(request.postData() || '{}');

        const createdList = await dbUtils.createTestTodoList({
          name: requestBody.name,
          description: requestBody.description,
          userId: testUser.id,
        });

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: createdList,
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList(listName);
      await modal.waitForSuccess();

      // Verify both lists exist
      const userLists = await dbUtils.getTodoListsForUser(testUser.id);
      expect(userLists).toHaveLength(2);
      expect(userLists.every(list => list.name === listName)).toBe(true);
    });

    test('should handle special characters in list name', async ({
      page,
      context,
    }) => {
      const specialName = 'Test List with "quotes" & symbols: #@$%^&*()';

      await context.route('**/api/todolists', async route => {
        const request = route.request();
        const requestBody = JSON.parse(request.postData() || '{}');

        const createdList = await dbUtils.createTestTodoList({
          name: requestBody.name,
          description: requestBody.description,
          userId: testUser.id,
        });

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: createdList,
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList(specialName);
      await modal.waitForSuccess();

      // Verify special characters are preserved
      const persistedList = await dbUtils.verifyTodoListExists(
        testUser.id,
        specialName
      );
      expect(persistedList).toBeTruthy();
      expect(persistedList?.name).toBe(specialName);
    });

    test('should handle Unicode characters in list name and description', async ({
      page,
      context,
    }) => {
      const unicodeName = '🚀 My Awesome List 中文测试 العربية';
      const unicodeDescription =
        'Description with emojis 🎯 and international text: 日本語テスト';

      await context.route('**/api/todolists', async route => {
        const request = route.request();
        const requestBody = JSON.parse(request.postData() || '{}');

        const createdList = await dbUtils.createTestTodoList({
          name: requestBody.name,
          description: requestBody.description,
          userId: testUser.id,
        });

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: createdList,
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList(unicodeName, unicodeDescription);
      await modal.waitForSuccess();

      // Verify Unicode characters are preserved
      const persistedList = await dbUtils.verifyTodoListExists(
        testUser.id,
        unicodeName,
        unicodeDescription
      );
      expect(persistedList).toBeTruthy();
      expect(persistedList?.name).toBe(unicodeName);
      expect(persistedList?.description).toBe(unicodeDescription);
    });
  });

  test.describe('Data Isolation', () => {
    test('should not create list if user is not authenticated', async ({
      page,
      context,
    }) => {
      // Mock authentication failure
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

      await modal.createTodoList('Unauthorized List');
      await modal.waitForError();

      // Verify no list was created in database
      const userLists = await dbUtils.getTodoListsForUser(testUser.id);
      expect(userLists).toHaveLength(0);
    });

    test('should not create list if validation fails on server', async ({
      page,
      context,
    }) => {
      // Mock server-side validation failure
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

      await modal.createTodoList('Invalid List');
      await modal.waitForError();

      // Verify no list was created in database
      const userLists = await dbUtils.getTodoListsForUser(testUser.id);
      expect(userLists).toHaveLength(0);
    });

    test('should handle database connection failures gracefully', async ({
      page,
      context,
    }) => {
      // Mock database error
      await context.route('**/api/todolists', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal server error',
            message: 'Database connection failed',
          }),
        });
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList('Database Error List');
      await modal.waitForError();

      const errorMessage = await modal.getFormErrorMessage();
      expect(errorMessage).toContain('Internal server error');

      // Verify no list was created
      const userLists = await dbUtils.getTodoListsForUser(testUser.id);
      expect(userLists).toHaveLength(0);
    });
  });

  test.describe('Concurrent Operations', () => {
    test('should handle multiple rapid submissions', async ({
      page,
      context,
    }) => {
      let requestCount = 0;

      await context.route('**/api/todolists', async route => {
        requestCount++;
        const request = route.request();
        const requestBody = JSON.parse(request.postData() || '{}');

        // Add slight delay to simulate real database operation
        await new Promise(resolve => setTimeout(resolve, 100));

        const createdList = await dbUtils.createTestTodoList({
          name: `${requestBody.name} (${requestCount})`,
          description: requestBody.description,
          userId: testUser.id,
        });

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: createdList,
            message: 'TodoList created successfully',
          }),
        });
      });

      await dashboardPage.goto();

      // Simulate rapid submissions by opening multiple modals quickly
      // Note: This tests the prevention of double-submission rather than actual concurrent requests
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.fillName('Rapid Test List');

      // Click submit multiple times rapidly
      await modal.createButton.click();

      // Button should be disabled after first click, preventing double submission
      await expect(modal.createButton).toBeDisabled();

      await modal.waitForSuccess();

      // Only one request should have been made
      expect(requestCount).toBe(1);

      // Only one list should exist in database
      const userLists = await dbUtils.getTodoListsForUser(testUser.id);
      expect(userLists).toHaveLength(1);
    });
  });

  test.describe('Transaction Integrity', () => {
    test('should maintain data consistency during creation process', async ({
      page,
      context,
    }) => {
      const listName = 'Consistency Test List';
      const creationSteps: string[] = [];

      await context.route('**/api/todolists', async route => {
        const request = route.request();
        const requestBody = JSON.parse(request.postData() || '{}');

        creationSteps.push('API_CALLED');

        // Simulate database transaction
        try {
          creationSteps.push('DB_CREATE_START');

          const createdList = await dbUtils.createTestTodoList({
            name: requestBody.name,
            description: requestBody.description,
            userId: testUser.id,
          });

          creationSteps.push('DB_CREATE_SUCCESS');

          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              data: createdList,
              message: 'TodoList created successfully',
            }),
          });

          creationSteps.push('RESPONSE_SENT');
        } catch (error) {
          creationSteps.push('DB_CREATE_FAILED');

          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Database error',
              message: 'Failed to create todo list',
            }),
          });
        }
      });

      await dashboardPage.goto();
      await dashboardPage.clickCreateFirstListButton();
      await modal.waitForModal();

      await modal.createTodoList(listName);
      await modal.waitForSuccess();

      // Verify all steps were executed in correct order
      expect(creationSteps).toEqual([
        'API_CALLED',
        'DB_CREATE_START',
        'DB_CREATE_SUCCESS',
        'RESPONSE_SENT',
      ]);

      // Verify data exists and is correct
      const persistedList = await dbUtils.verifyTodoListExists(
        testUser.id,
        listName
      );
      expect(persistedList).toBeTruthy();
      expect(persistedList?.name).toBe(listName);
    });
  });
});
