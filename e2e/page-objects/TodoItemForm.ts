import type { Page, Locator } from '@playwright/test';

export interface TodoItemFormData {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string; // Format: YYYY-MM-DD
}

export class TodoItemForm {
  readonly page: Page;

  // Form container
  readonly formContainer: Locator;
  readonly form: Locator;

  // Title field (always visible)
  readonly titleLabel: Locator;
  readonly titleInput: Locator;
  readonly titleError: Locator;

  // Expandable section trigger
  readonly expandableSection: Locator;

  // Description field (in expandable section)
  readonly descriptionLabel: Locator;
  readonly descriptionTextarea: Locator;
  readonly descriptionError: Locator;

  // Priority field (in expandable section)
  readonly priorityLabel: Locator;
  readonly prioritySelect: Locator;
  readonly priorityError: Locator;
  readonly priorityOptions: {
    low: Locator;
    medium: Locator;
    high: Locator;
    urgent: Locator;
  };

  // Due date field (in expandable section)
  readonly dueDateLabel: Locator;
  readonly dueDateInput: Locator;
  readonly dueDateError: Locator;

  // Form error message
  readonly formError: Locator;

  // Action buttons (shown when expanded or title has content)
  readonly actionButtons: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Form container and form
    this.formContainer = page.locator('.card:has(form)');
    this.form = page.locator('form');

    // Title field
    this.titleLabel = page.locator('label[for="title"]');
    this.titleInput = page.locator('#title');
    this.titleError = this.titleInput.locator('..').locator('p.text-red-400');

    // Expandable section
    this.expandableSection = page.locator('.space-y-4.border-t');

    // Description field
    this.descriptionLabel = page.locator('label[for="description"]');
    this.descriptionTextarea = page.locator('#description');
    this.descriptionError = this.descriptionTextarea
      .locator('..')
      .locator('p.text-red-400');

    // Priority field
    this.priorityLabel = page.locator('label[for="priority"]');
    this.prioritySelect = page.locator('#priority');
    this.priorityError = this.prioritySelect
      .locator('..')
      .locator('p.text-red-400');
    this.priorityOptions = {
      low: this.prioritySelect.locator('option[value="LOW"]'),
      medium: this.prioritySelect.locator('option[value="MEDIUM"]'),
      high: this.prioritySelect.locator('option[value="HIGH"]'),
      urgent: this.prioritySelect.locator('option[value="URGENT"]'),
    };

    // Due date field
    this.dueDateLabel = page.locator('label[for="dueDate"]');
    this.dueDateInput = page.locator('#dueDate');
    this.dueDateError = this.dueDateInput
      .locator('..')
      .locator('p.text-red-400');

    // Form error
    this.formError = page.locator('.border-red-500 p.text-red-400');

    // Action buttons
    this.actionButtons = page.locator('.flex.items-center.justify-end');
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.submitButton = page.getByRole('button', { name: /add task/i });
    this.loadingSpinner = this.submitButton.locator('svg.animate-spin');
  }

  /**
   * Check if the form is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.formContainer.isVisible();
  }

  /**
   * Check if the form is expanded (showing all fields)
   */
  async isExpanded(): Promise<boolean> {
    return await this.expandableSection.isVisible();
  }

  /**
   * Focus on the title input to expand the form
   */
  async focusTitle(): Promise<void> {
    await this.titleInput.focus();
  }

  /**
   * Click on the title input to expand the form
   */
  async clickTitle(): Promise<void> {
    await this.titleInput.click();
  }

  /**
   * Fill the title field
   */
  async fillTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
  }

  /**
   * Get the title field value
   */
  async getTitleValue(): Promise<string> {
    return (await this.titleInput.inputValue()) || '';
  }

  /**
   * Fill the description field
   */
  async fillDescription(description: string): Promise<void> {
    await this.descriptionTextarea.fill(description);
  }

  /**
   * Get the description field value
   */
  async getDescriptionValue(): Promise<string> {
    return (await this.descriptionTextarea.inputValue()) || '';
  }

  /**
   * Select a priority option
   */
  async selectPriority(
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  ): Promise<void> {
    await this.prioritySelect.selectOption(priority);
  }

  /**
   * Get the selected priority value
   */
  async getSelectedPriority(): Promise<string> {
    return (await this.prioritySelect.inputValue()) || '';
  }

  /**
   * Set the due date
   */
  async setDueDate(date: string): Promise<void> {
    await this.dueDateInput.fill(date);
  }

  /**
   * Get the due date value
   */
  async getDueDateValue(): Promise<string> {
    return (await this.dueDateInput.inputValue()) || '';
  }

  /**
   * Fill the entire form with provided data
   */
  async fillForm(data: TodoItemFormData): Promise<void> {
    // Always fill title first to potentially expand the form
    await this.fillTitle(data.title);

    // If we have additional fields, ensure form is expanded
    if (data.description || data.priority || data.dueDate) {
      if (!(await this.isExpanded())) {
        await this.focusTitle();
      }

      if (data.description) {
        await this.fillDescription(data.description);
      }

      if (data.priority) {
        await this.selectPriority(data.priority);
      }

      if (data.dueDate) {
        await this.setDueDate(data.dueDate);
      }
    }
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Cancel the form
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Check if the submit button is disabled
   */
  async isSubmitDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Check if the form is in loading state
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  /**
   * Check if action buttons are visible
   */
  async areActionButtonsVisible(): Promise<boolean> {
    return await this.actionButtons.isVisible();
  }

  /**
   * Get title validation error message
   */
  async getTitleError(): Promise<string> {
    if (await this.titleError.isVisible()) {
      return (await this.titleError.textContent()) || '';
    }
    return '';
  }

  /**
   * Get description validation error message
   */
  async getDescriptionError(): Promise<string> {
    if (await this.descriptionError.isVisible()) {
      return (await this.descriptionError.textContent()) || '';
    }
    return '';
  }

  /**
   * Get priority validation error message
   */
  async getPriorityError(): Promise<string> {
    if (await this.priorityError.isVisible()) {
      return (await this.priorityError.textContent()) || '';
    }
    return '';
  }

  /**
   * Get due date validation error message
   */
  async getDueDateError(): Promise<string> {
    if (await this.dueDateError.isVisible()) {
      return (await this.dueDateError.textContent()) || '';
    }
    return '';
  }

  /**
   * Get form-level error message
   */
  async getFormError(): Promise<string> {
    if (await this.formError.isVisible()) {
      return (await this.formError.textContent()) || '';
    }
    return '';
  }

  /**
   * Check if any validation errors are visible
   */
  async hasValidationErrors(): Promise<boolean> {
    const titleError = await this.getTitleError();
    const descriptionError = await this.getDescriptionError();
    const priorityError = await this.getPriorityError();
    const dueDateError = await this.getDueDateError();

    return !!(titleError || descriptionError || priorityError || dueDateError);
  }

  /**
   * Wait for form submission to complete
   */
  async waitForSubmission(): Promise<void> {
    // Wait for loading state to start
    await this.loadingSpinner
      .waitFor({ state: 'visible', timeout: 1000 })
      .catch(() => {});

    // Wait for loading state to end
    await this.loadingSpinner
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});

    // Wait for any network requests to complete
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    await this.titleInput.fill('');

    if (await this.isExpanded()) {
      await this.descriptionTextarea.fill('');
      await this.prioritySelect.selectOption('MEDIUM'); // Reset to default
      await this.dueDateInput.fill('');
    }
  }

  /**
   * Complete form submission workflow with data
   */
  async submitFormWithData(data: TodoItemFormData): Promise<void> {
    await this.fillForm(data);
    await this.submit();
    await this.waitForSubmission();
  }
}
