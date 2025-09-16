import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoListForm } from './TodoListForm';

// Mock SWR mutate function
const mockMutate = jest.fn();
jest.mock('swr', () => ({
  mutate: () => mockMutate,
}));

// Mock fetch
global.fetch = jest.fn();

describe('TodoListForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  const defaultProps = {
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  it('renders form fields correctly', () => {
    render(<TodoListForm {...defaultProps} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create list/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup();
    render(<TodoListForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /create list/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when name is too short', async () => {
    const user = userEvent.setup();
    render(<TodoListForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'a');

    const submitButton = screen.getByRole('button', { name: /create list/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/name must be at least 2 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '1',
        name: 'Test List',
        description: 'Test Description',
      }),
    });

    render(<TodoListForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /create list/i });

    await user.type(nameInput, 'Test List');
    await user.type(descriptionInput, 'Test Description');
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test List',
          description: 'Test Description',
        }),
      });
    });

    expect(defaultProps.onSuccess).toHaveBeenCalled();
  });

  it('handles API error gracefully', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to create list' }),
    });

    render(<TodoListForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /create list/i });

    await user.type(nameInput, 'Test List');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create list/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockReturnValueOnce(
      new Promise(resolve => {
        // Store the resolve function for later use
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({ id: '1', name: 'Test List' }),
          });
        }, 100);
      })
    );

    render(<TodoListForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /create list/i });

    await user.type(nameInput, 'Test List');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoListForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('works without description field', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', name: 'Test List' }),
    });

    render(<TodoListForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /create list/i });

    await user.type(nameInput, 'Test List');
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/todolists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test List',
        }),
      });
    });

    expect(defaultProps.onSuccess).toHaveBeenCalled();
  });
});
