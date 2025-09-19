import type { Browser, BrowserContext, Page } from '@playwright/test';

// Dynamic import for UUID to handle ESM/CommonJS compatibility
async function generateUUID(): Promise<string> {
  const { v4: uuidv4 } = await import('uuid');
  return uuidv4();
}

export interface TestUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface AuthSession {
  user: TestUser;
  expires: string;
  sessionToken: string;
}

/**
 * Creates a mock authenticated session by directly manipulating the database
 * This bypasses OAuth flow for testing purposes
 */
export async function createAuthenticatedUser(
  email?: string,
  name?: string
): Promise<TestUser> {
  const id = await generateUUID();
  const emailSuffix = await generateUUID();

  const testUser: TestUser = {
    id,
    name: name || 'Test User',
    email: email || `test-${emailSuffix}@example.com`,
    image: 'https://lh3.googleusercontent.com/a/test-avatar',
  };

  // In a real implementation, you'd insert this into your test database
  // For now, we'll return the mock user
  return testUser;
}

/**
 * Sets up authentication state in the browser by manipulating cookies/localStorage
 * This simulates being logged in without going through OAuth
 */
export async function setupAuthenticatedSession(
  context: BrowserContext,
  user?: TestUser
): Promise<TestUser> {
  const testUser = user || (await createAuthenticatedUser());

  // Create a session token (in real implementation, this would be stored in your test DB)
  const sessionToken = await generateUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Set the session cookie that NextAuth expects
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: sessionToken,
      domain: 'localhost',
      path: '/',
      expires: Math.floor(expires.getTime() / 1000),
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // Store user data in localStorage for client-side access
  await context.addInitScript(userData => {
    window.localStorage.setItem('test-user', JSON.stringify(userData));
  }, testUser);

  return testUser;
}

/**
 * Sets up an unauthenticated session by clearing all auth-related data
 */
export async function setupUnauthenticatedSession(
  context: BrowserContext
): Promise<void> {
  // Clear any existing auth cookies
  await context.clearCookies();

  // Clear localStorage
  await context.addInitScript(() => {
    window.localStorage.removeItem('test-user');
    window.sessionStorage.clear();
  });
}

/**
 * Mock the NextAuth API endpoints for testing
 * This prevents actual OAuth calls during tests
 */
export async function mockAuthEndpoints(
  context: BrowserContext,
  user?: TestUser
): Promise<void> {
  const testUser = user || (await createAuthenticatedUser());

  await context.route('**/api/auth/**', async route => {
    const url = route.request().url();

    if (url.includes('/api/auth/session')) {
      // Mock session endpoint
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: testUser,
          expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      });
    } else if (url.includes('/api/auth/signin')) {
      // Mock sign in endpoint
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Mock Sign In</body></html>',
      });
    } else if (url.includes('/api/auth/signout')) {
      // Mock sign out endpoint
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/' }),
      });
    } else {
      // Let other auth requests through
      await route.continue();
    }
  });
}

/**
 * Utility to check if a page requires authentication
 */
export async function expectAuthenticationRequired(page: Page): Promise<void> {
  // Should redirect to sign in page
  await page.waitForURL('/');
}

/**
 * Utility to log out a user during tests
 */
export async function signOutUser(page: Page): Promise<void> {
  // Navigate to dashboard first if not already there
  if (!page.url().includes('/dashboard')) {
    await page.goto('/dashboard');
  }

  // Click sign out button
  const signOutButton = page.getByRole('button', { name: /sign out/i });
  if (await signOutButton.isVisible()) {
    await signOutButton.click();
  }

  // Should redirect to sign in page
  await page.waitForURL('/');
}

/**
 * Create a test user with specific properties
 */
export async function createTestUser(
  overrides: Partial<TestUser> = {}
): Promise<TestUser> {
  const id = await generateUUID();
  const emailSuffix = await generateUUID();

  return {
    id,
    name: 'Test User',
    email: `test-${emailSuffix}@example.com`,
    image: 'https://lh3.googleusercontent.com/a/test-avatar',
    ...overrides,
  };
}
