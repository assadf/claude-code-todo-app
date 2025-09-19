import type { Page, Locator } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly welcomeHeading: Locator;
  readonly signInDescription: Locator;
  readonly googleSignInButton: Locator;
  readonly termsText: Locator;
  readonly errorHeading: Locator;
  readonly errorMessage: Locator;
  readonly tryAgainLink: Locator;
  readonly goHomeLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sign in page elements
    this.welcomeHeading = page.getByRole('heading', {
      name: /claude code todo app/i,
    });
    this.signInDescription = page.getByText(/sign in to manage your tasks/i);
    this.googleSignInButton = page.getByRole('button', {
      name: /continue with google/i,
    });
    this.termsText = page.getByText(/by signing in, you agree to our terms/i);

    // Error page elements
    this.errorHeading = page.getByRole('heading', {
      name: /authentication error/i,
    });
    this.errorMessage = page.getByText(/access denied/i);
    this.tryAgainLink = page.getByRole('link', { name: /try again/i });
    this.goHomeLink = page.getByRole('link', { name: /go home/i });
  }

  async gotoSignIn(): Promise<void> {
    await this.page.goto('/');
  }

  async gotoError(error = 'AccessDenied'): Promise<void> {
    await this.page.goto(`/?error=${error}`);
  }

  async clickGoogleSignIn(): Promise<void> {
    await this.googleSignInButton.click();
  }

  async isSignInPageVisible(): Promise<boolean> {
    return await this.welcomeHeading.isVisible();
  }

  async isErrorPageVisible(): Promise<boolean> {
    return await this.errorHeading.isVisible();
  }
}
