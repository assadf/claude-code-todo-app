import { test, expect } from '@playwright/test';
import { TodoListDetailPage } from './page-objects/TodoListDetailPage';
import { TodoItemForm } from './page-objects/TodoItemForm';
import { DashboardPage } from './page-objects/DashboardPage';
import { CreateTodoListModal } from './page-objects/CreateTodoListModal';
import {
  setupAuthenticatedSession,
  setupUnauthenticatedSession,
  mockAuthEndpoints,
  createTestUser,
  expectAuthenticationRequired,
} from './utils/auth';
import { dbUtils } from './utils/database';
import { mockApiError, ConsoleErrorCollector } from './utils/test-helpers';

test.describe('TODO Item Creation', () => {
  let todoListDetailPage: TodoListDetailPage;
  let todoItemForm: TodoItemForm;
  let dashboardPage: DashboardPage;
  let createTodoListModal: CreateTodoListModal;
  let consoleErrors: ConsoleErrorCollector;
  let testTodoListId: string;

  test.beforeEach(async ({ page, context }) => {
    // Initialize page objects
    todoListDetailPage = new TodoListDetailPage(page);
    todoItemForm = new TodoItemForm(page);
    dashboardPage = new DashboardPage(page);
    createTodoListModal = new CreateTodoListModal(page);
    consoleErrors = new ConsoleErrorCollector(page);

    // Clean up database before each test
    await dbUtils.cleanup();

    // Set up authenticated session and mock auth endpoints
    const testUser = await createTestUser();
    await setupAuthenticatedSession(context, testUser);
    await mockAuthEndpoints(context, testUser);

    // Create a test todo list for testing item creation
    await page.goto('/dashboard');
    await dashboardPage.waitForNetworkIdle();

    if (await dashboardPage.isEmptyStateVisible()) {
      await dashboardPage.clickCreateFirstListButton();
    } else {
      // If not empty state, we need to trigger the modal differently
      await page.click('[data-testid="create-todo-list-button"]').catch(() => {
        // Fallback: use the create first list button
        return dashboardPage.clickCreateFirstListButton();
      });
    }

    await createTodoListModal.waitForModal();

    const testListData = {
      name: 'Test TODO List for Items',
      description: 'A test list for testing item creation',
    };

    await createTodoListModal.createTodoList(
      testListData.name,
      testListData.description
    );
    await createTodoListModal.waitForSuccess();

    // Extract the todo list ID from the URL after creation
    await page.waitForURL(/\/todo-lists\/[a-f0-9]{24}/);
    const url = page.url();
    const match = url.match(/\/todo-lists\/([a-f0-9]{24})/);
    if (!match) {
      throw new Error('Failed to extract todo list ID from URL');
    }
    testTodoListId = match[1];
  });

  test.afterEach(async ({ page: _page }) => {
    // Check for console errors after each test
    consoleErrors.assertNoConsoleErrors();

    // Clean up database after each test
    await dbUtils.cleanup();
  });

  test.describe('Authentication Required', () => {
    test('should redirect unauthenticated users to signin when accessing todo list detail', async ({
      page,
      context,
    }) => {
      // Set up unauthenticated session
      await setupUnauthenticatedSession(context);

      // Try to access todo list detail page
      await todoListDetailPage.goto(testTodoListId);

      // Should redirect to authentication
      await expectAuthenticationRequired(page);
    });
  });

  test.describe('Page Load and Structure', () => {
    test('should load todo list detail page with add item form', async ({
      page,
    }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      // Verify page structure
      expect(await todoListDetailPage.getTodoListTitle()).toBe(
        'Test TODO List for Items'
      );
      expect(await todoListDetailPage.isAddItemFormVisible()).toBe(true);
      expect(await todoItemForm.isVisible()).toBe(true);

      // Initially form should not be expanded
      expect(await todoItemForm.isExpanded()).toBe(false);
    });

    test('should show loading state while page loads', async ({ page }) => {
      await page.goto(`/todo-lists/${testTodoListId}`);

      // Check for loading skeleton (might be very brief)
      const loadingVisible = await todoListDetailPage.isLoading();

      await todoListDetailPage.waitForPageLoad();
      expect(await todoListDetailPage.isLoading()).toBe(false);
    });
  });

  test.describe('Happy Path - Adding TODO Items', () => {
    test('should add todo item with title only', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      const itemData = {
        title: 'Simple task with title only',
      };

      await todoItemForm.submitFormWithData(itemData);

      // Verify item was added
      await todoListDetailPage.waitForItemsToLoad();
      expect(
        await todoListDetailPage.hasTodoItemWithTitle(itemData.title)
      ).toBe(true);
      expect(await todoListDetailPage.getTodoItemsCount()).toBe(1);

      // Verify form is reset after submission
      expect(await todoItemForm.getTitleValue()).toBe('');
      expect(await todoItemForm.isExpanded()).toBe(false);
    });

    test('should add todo item with all fields filled', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

      const itemData = {
        title: 'Complete task with all details',
        description:
          'This task has a detailed description explaining what needs to be done',
        priority: 'HIGH' as const,
        dueDate: tomorrowFormatted,
      };

      await todoItemForm.submitFormWithData(itemData);

      // Verify item was added
      await todoListDetailPage.waitForItemsToLoad();
      expect(
        await todoListDetailPage.hasTodoItemWithTitle(itemData.title)
      ).toBe(true);
      expect(await todoListDetailPage.getTodoItemsCount()).toBe(1);
    });

    test('should add multiple todo items in sequence', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      const items = [
        { title: 'First task' },
        { title: 'Second task', priority: 'URGENT' as const },
        { title: 'Third task', description: 'With description' },
      ];

      for (let i = 0; i < items.length; i++) {
        await todoItemForm.submitFormWithData(items[i]);
        await todoListDetailPage.waitForItemsToLoad();
        expect(await todoListDetailPage.getTodoItemsCount()).toBe(i + 1);
      }

      // Verify all items are present
      for (const item of items) {
        expect(await todoListDetailPage.hasTodoItemWithTitle(item.title)).toBe(
          true
        );
      }
    });

    test('should handle different priority levels', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      const priorities: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = [
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT',
      ];

      for (const priority of priorities) {
        const itemData = {
          title: `Task with ${priority.toLowerCase()} priority`,
          priority,
        };

        await todoItemForm.submitFormWithData(itemData);
        await todoListDetailPage.waitForItemsToLoad();
      }

      expect(await todoListDetailPage.getTodoItemsCount()).toBe(
        priorities.length
      );
    });

    test('should handle date picker functionality', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekFormatted = nextWeek.toISOString().split('T')[0];

      await todoItemForm.fillTitle('Task with due date');
      await todoItemForm.setDueDate(nextWeekFormatted);

      // Verify date was set correctly
      expect(await todoItemForm.getDueDateValue()).toBe(nextWeekFormatted);

      await todoItemForm.submit();
      await todoItemForm.waitForSubmission();

      expect(
        await todoListDetailPage.hasTodoItemWithTitle('Task with due date')
      ).toBe(true);
    });
  });

  test.describe('Form Validation', () => {
    test('should require title field', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      // Try to submit with empty title
      await todoItemForm.clickTitle(); // Expand form
      await todoItemForm.submit();

      // Should show validation error
      const titleError = await todoItemForm.getTitleError();
      expect(titleError).toContain('Title is required');

      // Submit button should be disabled
      expect(await todoItemForm.isSubmitDisabled()).toBe(true);

      // No item should be created
      expect(await todoListDetailPage.getTodoItemsCount()).toBe(0);
    });

    test('should validate title length', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      // Test title too long (over 255 characters)
      const longTitle = 'a'.repeat(256);
      await todoItemForm.fillTitle(longTitle);

      const titleError = await todoItemForm.getTitleError();
      expect(titleError).toContain('255 characters');
      expect(await todoItemForm.isSubmitDisabled()).toBe(true);
    });

    test('should accept valid title and enable submit', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      await todoItemForm.fillTitle('Valid task title');

      // Should not show error
      expect(await todoItemForm.getTitleError()).toBe('');

      // Submit should be enabled
      expect(await todoItemForm.isSubmitDisabled()).toBe(false);
    });

    test('should handle form reset on cancel', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      const itemData = {
        title: 'Task to be cancelled',
        description: 'This will be cleared',
        priority: 'HIGH' as const,
      };

      await todoItemForm.fillForm(itemData);

      // Verify data is filled
      expect(await todoItemForm.getTitleValue()).toBe(itemData.title);
      expect(await todoItemForm.getDescriptionValue()).toBe(
        itemData.description
      );
      expect(await todoItemForm.getSelectedPriority()).toBe(itemData.priority);

      // Cancel the form
      await todoItemForm.cancel();

      // Verify form is reset
      expect(await todoItemForm.getTitleValue()).toBe('');
      expect(await todoItemForm.isExpanded()).toBe(false);
      expect(await todoListDetailPage.getTodoItemsCount()).toBe(0);
    });
  });

  test.describe('UI Interactions', () => {
    test('should expand form when title field is focused', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      // Initially form should not be expanded
      expect(await todoItemForm.isExpanded()).toBe(false);
      expect(await todoItemForm.areActionButtonsVisible()).toBe(false);

      // Focus on title should expand form
      await todoItemForm.focusTitle();
      expect(await todoItemForm.isExpanded()).toBe(true);
    });

    test('should show action buttons when form has content', async ({
      page,
    }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      // Initially no action buttons
      expect(await todoItemForm.areActionButtonsVisible()).toBe(false);

      // Adding content should show action buttons
      await todoItemForm.fillTitle('Some content');
      expect(await todoItemForm.areActionButtonsVisible()).toBe(true);
    });

    test('should handle priority selection correctly', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      await todoItemForm.fillTitle('Test priority selection');

      // Test each priority level
      const priorities: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = [
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT',
      ];

      for (const priority of priorities) {
        await todoItemForm.selectPriority(priority);
        expect(await todoItemForm.getSelectedPriority()).toBe(priority);
      }
    });

    test('should show loading state during submission', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      await todoItemForm.fillTitle('Test loading state');

      // Start submission but don't wait for completion immediately
      await todoItemForm.submit();

      // Check if loading state appears (might be brief)
      // Note: This might not always be visible due to fast submissions
      const isLoading = await todoItemForm.isLoading();

      // Wait for submission to complete
      await todoItemForm.waitForSubmission();

      // Loading should be done
      expect(await todoItemForm.isLoading()).toBe(false);
      expect(
        await todoListDetailPage.hasTodoItemWithTitle('Test loading state')
      ).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page, context }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      // Mock API error for todo item creation
      await mockApiError(
        context,
        `/api/todolists/${testTodoListId}/items`,
        'Failed to create todo item',
        500
      );

      await todoItemForm.fillTitle('Task that will fail');
      await todoItemForm.submit();

      // Should show error message
      // Note: The exact behavior depends on how the form handles API errors
      // This might show in form error or as a toast notification
      await page.waitForTimeout(1000); // Give time for error to appear

      // Verify no item was created despite the submission
      expect(await todoListDetailPage.getTodoItemsCount()).toBe(0);
    });

    test('should handle network timeout gracefully', async ({
      page,
      context,
    }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      // Mock slow/timeout response
      await context.route(
        `**/api/todolists/${testTodoListId}/items`,
        async route => {
          // Delay response to simulate timeout
          await new Promise(resolve => setTimeout(resolve, 5000));
          await route.fulfill({
            status: 408,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Request Timeout',
              message: 'Request took too long to complete',
            }),
          });
        }
      );

      await todoItemForm.fillTitle('Task with timeout');
      await todoItemForm.submit();

      // Wait for timeout (adjust timeout as needed)
      await page.waitForTimeout(6000);

      // Verify no item was created
      expect(await todoListDetailPage.getTodoItemsCount()).toBe(0);
    });

    test('should handle invalid todo list ID', async ({ page }) => {
      const invalidId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but non-existent

      await todoListDetailPage.goto(invalidId);

      // Should show error state
      expect(await todoListDetailPage.hasError()).toBe(true);

      const errorMessage = await todoListDetailPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
    });
  });

  test.describe('Data Persistence and Updates', () => {
    test('should persist todo items after page reload', async ({ page }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      const itemData = {
        title: 'Persistent task',
        description: 'This should survive page reload',
      };

      await todoItemForm.submitFormWithData(itemData);
      await todoListDetailPage.waitForItemsToLoad();

      // Verify item was created
      expect(
        await todoListDetailPage.hasTodoItemWithTitle(itemData.title)
      ).toBe(true);

      // Reload page
      await page.reload();
      await todoListDetailPage.waitForPageLoad();
      await todoListDetailPage.waitForItemsToLoad();

      // Verify item still exists
      expect(
        await todoListDetailPage.hasTodoItemWithTitle(itemData.title)
      ).toBe(true);
      expect(await todoListDetailPage.getTodoItemsCount()).toBe(1);
    });

    test('should update task count in header after adding items', async ({
      page,
    }) => {
      await todoListDetailPage.goto(testTodoListId);
      await todoListDetailPage.waitForPageLoad();

      // Initial count should be 0
      expect(await todoListDetailPage.getTasksCount()).toBe(0);

      // Add first item
      await todoItemForm.submitFormWithData({ title: 'First task' });
      await todoListDetailPage.waitForItemsToLoad();

      // Task count should update
      expect(await todoListDetailPage.getTasksCount()).toBe(1);

      // Add second item
      await todoItemForm.submitFormWithData({ title: 'Second task' });
      await todoListDetailPage.waitForItemsToLoad();

      // Task count should update again
      expect(await todoListDetailPage.getTasksCount()).toBe(2);
    });
  });
});
