import type { Page, BrowserContext } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Common test utilities and helpers
 */

/**
 * Wait for network requests to complete
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout = 2000
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for a specific API request to complete
 */
export async function waitForApiRequest(
  page: Page,
  urlPattern: string | RegExp,
  method = 'POST'
): Promise<void> {
  await page.waitForResponse(
    response =>
      response.url().match(urlPattern) !== null &&
      response.request().method() === method
  );
}

/**
 * Mock API endpoints with custom responses
 */
export async function mockApiEndpoint(
  context: BrowserContext,
  endpoint: string,
  responseData: any,
  status = 200
): Promise<void> {
  await context.route(`**${endpoint}`, async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Mock API endpoint to return an error
 */
export async function mockApiError(
  context: BrowserContext,
  endpoint: string,
  error: string,
  status = 500
): Promise<void> {
  await context.route(`**${endpoint}`, async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error, message: error }),
    });
  });
}

/**
 * Intercept and collect API requests for assertions
 */
export class ApiRequestCollector {
  private requests: Array<{
    url: string;
    method: string;
    body: any;
    headers: any;
  }> = [];

  constructor(
    private page: Page,
    private urlPattern: string | RegExp
  ) {
    this.setupInterception();
  }

  private setupInterception(): void {
    this.page.on('request', request => {
      if (request.url().match(this.urlPattern)) {
        const body = request.postData();
        this.requests.push({
          url: request.url(),
          method: request.method(),
          body: body ? JSON.parse(body) : null,
          headers: request.headers(),
        });
      }
    });
  }

  getRequests(): Array<{
    url: string;
    method: string;
    body: any;
    headers: any;
  }> {
    return [...this.requests];
  }

  getLastRequest(): {
    url: string;
    method: string;
    body: any;
    headers: any;
  } | null {
    return this.requests.length > 0
      ? this.requests[this.requests.length - 1]
      : null;
  }

  clear(): void {
    this.requests = [];
  }

  assertRequestCount(expectedCount: number): void {
    expect(this.requests).toHaveLength(expectedCount);
  }

  assertLastRequestBody(expectedBody: any): void {
    const lastRequest = this.getLastRequest();
    expect(lastRequest?.body).toEqual(expectedBody);
  }
}

/**
 * Take a screenshot with a specific name for debugging
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `e2e/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Check if an element has focus
 */
export async function expectElementToHaveFocus(
  page: Page,
  selector: string
): Promise<void> {
  const isFocused = await page.evaluate(sel => {
    const element = document.querySelector(sel);
    return document.activeElement === element;
  }, selector);

  expect(isFocused).toBe(true);
}

/**
 * Check for console errors during test execution
 */
export class ConsoleErrorCollector {
  private errors: string[] = [];

  constructor(private page: Page) {
    this.setupConsoleListener();
  }

  private setupConsoleListener(): void {
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errors.push(msg.text());
      }
    });
  }

  getErrors(): string[] {
    return [...this.errors];
  }

  assertNoConsoleErrors(): void {
    expect(this.errors).toHaveLength(0);
  }

  clear(): void {
    this.errors = [];
  }
}

/**
 * Wait for an element to be stable (not moving/changing)
 */
export async function waitForElementStable(
  page: Page,
  selector: string,
  timeout = 1000
): Promise<void> {
  const element = page.locator(selector);

  let lastBoundingBox = await element.boundingBox();
  let stableCount = 0;
  const requiredStableChecks = 5;
  const checkInterval = timeout / (requiredStableChecks * 2);

  while (stableCount < requiredStableChecks) {
    await page.waitForTimeout(checkInterval);
    const currentBoundingBox = await element.boundingBox();

    if (
      lastBoundingBox &&
      currentBoundingBox &&
      lastBoundingBox.x === currentBoundingBox.x &&
      lastBoundingBox.y === currentBoundingBox.y &&
      lastBoundingBox.width === currentBoundingBox.width &&
      lastBoundingBox.height === currentBoundingBox.height
    ) {
      stableCount++;
    } else {
      stableCount = 0;
    }

    lastBoundingBox = currentBoundingBox;
  }
}

/**
 * Generate test data
 */
export const testData = {
  validTodoListNames: [
    'My Shopping List',
    'Work Tasks',
    'Weekend Plans',
    'Books to Read',
    'Travel Checklist',
  ],

  invalidTodoListNames: [
    '', // empty
    'a', // too short
    'A'.repeat(101), // too long
  ],

  validDescriptions: [
    'A simple description',
    'This is a longer description with more details about the todo list',
    '', // empty is valid for description
  ],

  invalidDescriptions: [
    'A'.repeat(501), // too long
  ],

  generateRandomListName(): string {
    const adjectives = ['Important', 'Urgent', 'Personal', 'Work', 'Daily'];
    const nouns = ['Tasks', 'Goals', 'Items', 'Plans', 'Notes'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective} ${noun}`;
  },
};
