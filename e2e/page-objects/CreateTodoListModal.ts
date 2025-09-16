import type { Page, Locator } from '@playwright/test';

export class CreateTodoListModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly backdrop: Locator;
  readonly modalContent: Locator;
  readonly modalTitle: Locator;
  readonly closeButton: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly nameErrorMessage: Locator;
  readonly descriptionErrorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Modal structure
    this.modal = page.getByTestId('create-todo-list-modal');
    this.backdrop = page.getByTestId('modal-backdrop');
    this.modalContent = page.getByTestId('modal-content');
    this.modalTitle = page.getByRole('heading', {
      name: /create new todo list/i,
    });
    this.closeButton = page.getByTestId('close-modal-button');

    // Form elements
    this.nameInput = page.getByTestId('todo-list-name-input');
    this.descriptionInput = page.getByTestId('todo-list-description-input');
    this.createButton = page.getByTestId('create-list-submit-button');
    this.cancelButton = page.getByTestId('cancel-button');

    // Error states
    this.errorMessage = page.getByTestId('form-error-message');
    this.nameErrorMessage = page.locator('[id="name"] ~ p.text-red-400');
    this.descriptionErrorMessage = page.locator(
      '[id="description"] ~ p.text-red-400'
    );
    this.loadingSpinner = page.locator('.animate-spin');
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  async isHidden(): Promise<boolean> {
    return await this.modal.isHidden();
  }

  async waitForModal(): Promise<void> {
    await this.modal.waitFor({ state: 'visible' });
  }

  async waitForModalHidden(): Promise<void> {
    await this.modal.waitFor({ state: 'hidden' });
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async clearName(): Promise<void> {
    await this.nameInput.clear();
  }

  async clearDescription(): Promise<void> {
    await this.descriptionInput.clear();
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickClose(): Promise<void> {
    await this.closeButton.click();
  }

  async clickBackdrop(): Promise<void> {
    await this.backdrop.click();
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async isCreateButtonDisabled(): Promise<boolean> {
    return await this.createButton.isDisabled();
  }

  async isCreateButtonLoading(): Promise<boolean> {
    const buttonText = await this.createButton.textContent();
    return buttonText?.includes('Creating...') || false;
  }

  async isLoadingSpinnerVisible(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  async getNameErrorMessage(): Promise<string | null> {
    if (await this.nameErrorMessage.isVisible()) {
      return await this.nameErrorMessage.textContent();
    }
    return null;
  }

  async getDescriptionErrorMessage(): Promise<string | null> {
    if (await this.descriptionErrorMessage.isVisible()) {
      return await this.descriptionErrorMessage.textContent();
    }
    return null;
  }

  async getFormErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  async createTodoList(name: string, description?: string): Promise<void> {
    await this.fillName(name);
    if (description) {
      await this.fillDescription(description);
    }
    await this.clickCreate();
  }

  async waitForSuccess(): Promise<void> {
    // Wait for modal to close, indicating success
    await this.waitForModalHidden();
  }

  async waitForError(): Promise<void> {
    // Wait for error message to appear
    await this.errorMessage.waitFor({ state: 'visible' });
  }

  async isFocused(): Promise<boolean> {
    return await this.modalContent.evaluate(element => {
      return document.activeElement === element;
    });
  }

  async getNameInputValue(): Promise<string> {
    return await this.nameInput.inputValue();
  }

  async getDescriptionInputValue(): Promise<string> {
    return await this.descriptionInput.inputValue();
  }
}
