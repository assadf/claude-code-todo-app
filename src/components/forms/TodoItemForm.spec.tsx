import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItemForm from './TodoItemForm';
import { Priority } from '@/types';

describe('TodoItemForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
    error: null,
    onCancel: mockOnCancel,
  };

  it('renders the title input field', () => {
    render(<TodoItemForm {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('What needs to be done?')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
  });

  it('expands to show additional fields when title input is focused', async () => {
    const user = userEvent.setup();
    render(<TodoItemForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('What needs to be done?');

    // Initially, advanced fields should not be visible
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/priority/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/due date/i)).not.toBeInTheDocument();

    // Focus on title input
    await user.click(titleInput);

    // Now advanced fields should be visible
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('shows action buttons when form is expanded or title has content', async () => {
    const user = userEvent.setup();
    render(<TodoItemForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('What needs to be done?');

    // Initially, buttons should not be visible
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Task')).not.toBeInTheDocument();

    // Type in title
    await user.type(titleInput, 'Test task');

    // Buttons should now be visible
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  it('validates required title field', async () => {
    const user = userEvent.setup();
    render(<TodoItemForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('What needs to be done?');

    // Focus and expand form
    await user.click(titleInput);

    // Try to submit without title
    const submitButton = screen.getByText('Add Task');
    expect(submitButton).toBeDisabled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<TodoItemForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('What needs to be done?');

    // Fill in the form
    await user.type(titleInput, 'Test task');
    await user.type(screen.getByLabelText(/description/i), 'Test description');
    await user.selectOptions(screen.getByLabelText(/priority/i), Priority.HIGH);
    await user.type(screen.getByLabelText(/due date/i), '2024-12-31');

    // Submit form
    const submitButton = screen.getByText('Add Task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test task',
        description: 'Test description',
        priority: Priority.HIGH,
        dueDate: new Date('2024-12-31'),
      });
    });
  });

  it('submits form with minimal data (title only)', async () => {
    const user = userEvent.setup();
    render(<TodoItemForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('What needs to be done?');

    // Fill in just the title
    await user.type(titleInput, 'Minimal task');

    // Submit form
    const submitButton = screen.getByText('Add Task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Minimal task',
        description: undefined,
        priority: Priority.MEDIUM, // default value
        dueDate: undefined,
      });
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItemForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    await user.type(titleInput, 'Test');

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', () => {
    render(<TodoItemForm {...defaultProps} isLoading={true} />);

    // Focus to expand form
    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    fireEvent.focus(titleInput);
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to add todo item';
    render(<TodoItemForm {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();

    // Mock successful submission
    mockOnSubmit.mockResolvedValue(undefined);

    render(<TodoItemForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText('What needs to be done?');

    // Fill and submit form
    await user.type(titleInput, 'Test task');
    const submitButton = screen.getByText('Add Task');

    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
    });
  });
});
