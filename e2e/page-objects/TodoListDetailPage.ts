import type { Page, Locator } from '@playwright/test';

export class TodoListDetailPage {
  readonly page: Page;

  // Navigation elements
  readonly backToDashboardButton: Locator;

  // Header elements
  readonly todoListTitle: Locator;
  readonly todoListDescription: Locator;
  readonly statusBadge: Locator;
  readonly completedStatusBadge: Locator;
  readonly inProgressStatusBadge: Locator;
  readonly tasksCount: Locator;
  readonly createdDate: Locator;

  // Loading and error states
  readonly loadingSkeleton: Locator;
  readonly errorState: Locator;
  readonly errorMessage: Locator;

  // TODO Items section
  readonly todoItemsSection: Locator;
  readonly todoItemsSectionTitle: Locator;
  readonly noItemsMessage: Locator;
  readonly addItemForm: Locator;

  // Todo Items Display
  readonly todoItemsList: Locator;
  readonly todoItemCards: Locator;
  readonly loadingItemsState: Locator;
  readonly itemsErrorState: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.backToDashboardButton = page.getByRole('button', {
      name: /back to dashboard/i,
    });

    // Header elements
    this.todoListTitle = page.locator('h1').first();
    this.todoListDescription = page
      .locator('p')
      .filter({ hasText: /description/i })
      .first();
    this.statusBadge = page.locator(
      '[class*="bg-green-100"], [class*="bg-orange-100"]'
    );
    this.completedStatusBadge = page.locator(
      '[class*="bg-green-100"]:has-text("Completed")'
    );
    this.inProgressStatusBadge = page.locator(
      '[class*="bg-orange-100"]:has-text("In Progress")'
    );
    this.tasksCount = page.locator('text=/\\d+ tasks/');
    this.createdDate = page.locator('text=/Created/');

    // Loading and error states
    this.loadingSkeleton = page.getByTestId('loading-skeleton');
    this.errorState = page.locator(
      '.card:has-text("Failed to load todo list")'
    );
    this.errorMessage = this.errorState.locator('p.text-gray-400');

    // TODO Items section
    this.todoItemsSection = page.locator('div:has(h2:text("TODO Items"))');
    this.todoItemsSectionTitle = page.getByRole('heading', {
      name: /todo items/i,
    });
    this.noItemsMessage = page.locator('text=/No items found/i');
    this.addItemForm = page.locator('form');

    // Todo Items Display
    this.todoItemsList = page.locator('[data-testid*="todo-item"]');
    this.todoItemCards = page
      .locator('.card')
      .filter({ has: page.locator('[data-testid*="todo-item"]') });
    this.loadingItemsState = page.locator('[data-testid="loading-items"]');
    this.itemsErrorState = page.locator(
      '.card:has-text("Failed to load todo items")'
    );
  }

  /**
   * Navigate to the TODO list detail page
   */
  async goto(todoListId: string): Promise<void> {
    await this.page.goto(`/todo-lists/${todoListId}`);
  }

  /**
   * Wait for the page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.todoListTitle.waitFor({ state: 'visible' });
  }

  /**
   * Check if the page is in loading state
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingSkeleton.isVisible();
  }

  /**
   * Check if there's an error loading the page
   */
  async hasError(): Promise<boolean> {
    return await this.errorState.isVisible();
  }

  /**
   * Get the error message if there's an error
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }

  /**
   * Get the todo list title
   */
  async getTodoListTitle(): Promise<string> {
    return (await this.todoListTitle.textContent()) || '';
  }

  /**
   * Get the todo list description
   */
  async getTodoListDescription(): Promise<string> {
    return (await this.todoListDescription.textContent()) || '';
  }

  /**
   * Check if the todo list is marked as completed
   */
  async isCompleted(): Promise<boolean> {
    return await this.completedStatusBadge.isVisible();
  }

  /**
   * Check if the todo list is marked as in progress
   */
  async isInProgress(): Promise<boolean> {
    return await this.inProgressStatusBadge.isVisible();
  }

  /**
   * Get the tasks count from the header
   */
  async getTasksCount(): Promise<number> {
    const text = await this.tasksCount.textContent();
    const match = text?.match(/(\d+) tasks/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Click the back to dashboard button
   */
  async clickBackToDashboard(): Promise<void> {
    await this.backToDashboardButton.click();
  }

  /**
   * Check if the add item form is visible
   */
  async isAddItemFormVisible(): Promise<boolean> {
    return await this.addItemForm.isVisible();
  }

  /**
   * Get the number of todo items displayed
   */
  async getTodoItemsCount(): Promise<number> {
    return await this.todoItemCards.count();
  }

  /**
   * Check if the "no items" message is displayed
   */
  async hasNoItemsMessage(): Promise<boolean> {
    return await this.noItemsMessage.isVisible();
  }

  /**
   * Check if todo items are loading
   */
  async areItemsLoading(): Promise<boolean> {
    return await this.loadingItemsState.isVisible();
  }

  /**
   * Check if there's an error loading todo items
   */
  async hasItemsError(): Promise<boolean> {
    return await this.itemsErrorState.isVisible();
  }

  /**
   * Wait for todo items to finish loading
   */
  async waitForItemsToLoad(): Promise<void> {
    // Wait for loading state to disappear
    if (await this.areItemsLoading()) {
      await this.loadingItemsState.waitFor({ state: 'hidden', timeout: 10000 });
    }

    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get a specific todo item by index
   */
  getTodoItemByIndex(index: number): Locator {
    return this.todoItemCards.nth(index);
  }

  /**
   * Get a todo item by title
   */
  getTodoItemByTitle(title: string): Locator {
    return this.todoItemCards.filter({ hasText: title });
  }

  /**
   * Check if a todo item with specific title exists
   */
  async hasTodoItemWithTitle(title: string): Promise<boolean> {
    return (await this.getTodoItemByTitle(title).count()) > 0;
  }
}
