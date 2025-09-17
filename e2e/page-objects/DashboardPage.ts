import type { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly createFirstListButton: Locator;
  readonly welcomeHeading: Locator;
  readonly totalListsCard: Locator;
  readonly completedCard: Locator;
  readonly inProgressCard: Locator;
  readonly totalTasksCard: Locator;
  readonly signOutButton: Locator;
  readonly emptyStateCard: Locator;
  readonly emptyStateHeading: Locator;
  readonly emptyStateDescription: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main elements
    this.createFirstListButton = page.getByTestId('create-first-list-button');
    this.welcomeHeading = page.getByRole('heading', { name: /welcome back/i });
    this.emptyStateCard = page.locator('.card:has-text("No TODO lists yet")');
    this.emptyStateHeading = page.getByRole('heading', {
      name: /no todo lists yet/i,
    });
    this.emptyStateDescription = page.getByText(
      /create your first todo list to get started/i
    );

    // Stats cards
    this.totalListsCard = page.locator('.card:has-text("Total Lists")');
    this.completedCard = page.locator('.card:has-text("Completed")');
    this.inProgressCard = page.locator('.card:has-text("In Progress")');
    this.totalTasksCard = page.locator('.card:has-text("Total Tasks")');

    // Navigation
    this.signOutButton = page.getByRole('button', { name: /sign out/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async clickCreateFirstListButton(): Promise<void> {
    await this.createFirstListButton.click();
  }

  async isWelcomeVisible(): Promise<boolean> {
    return await this.welcomeHeading.isVisible();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return await this.emptyStateCard.isVisible();
  }

  async getTotalListsCount(): Promise<string> {
    return (
      (await this.totalListsCard
        .locator('.text-2xl.font-bold')
        .textContent()) || '0'
    );
  }

  async getCompletedCount(): Promise<string> {
    return (
      (await this.completedCard.locator('.text-2xl.font-bold').textContent()) ||
      '0'
    );
  }

  async getInProgressCount(): Promise<string> {
    return (
      (await this.inProgressCard
        .locator('.text-2xl.font-bold')
        .textContent()) || '0'
    );
  }

  async getTotalTasksCount(): Promise<string> {
    return (
      (await this.totalTasksCard
        .locator('.text-2xl.font-bold')
        .textContent()) || '0'
    );
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
