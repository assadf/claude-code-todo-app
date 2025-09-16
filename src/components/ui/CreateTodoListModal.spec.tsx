import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTodoListModal } from './CreateTodoListModal';

// Mock the TodoListForm component
jest.mock('../forms/TodoListForm', () => ({
  TodoListForm: ({
    onSuccess,
    onCancel,
  }: {
    onSuccess: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <div>Mock TodoListForm</div>
      <button onClick={onSuccess}>Mock Success</button>
      <button onClick={onCancel}>Mock Cancel</button>
    </div>
  ),
}));

describe('CreateTodoListModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(<CreateTodoListModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create New TODO List')).toBeInTheDocument();
    expect(screen.getByText('Mock TodoListForm')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<CreateTodoListModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateTodoListModal {...defaultProps} />);

    const backdrop = screen.getByTestId('modal-backdrop');
    await user.click(backdrop);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<CreateTodoListModal {...defaultProps} />);

    await user.keyboard('{Escape}');

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateTodoListModal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when form is successfully submitted', async () => {
    const user = userEvent.setup();
    render(<CreateTodoListModal {...defaultProps} />);

    const successButton = screen.getByText('Mock Success');
    await user.click(successButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when form is cancelled', async () => {
    const user = userEvent.setup();
    render(<CreateTodoListModal {...defaultProps} />);

    const cancelButton = screen.getByText('Mock Cancel');
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('prevents backdrop click event from bubbling to content', async () => {
    const user = userEvent.setup();
    render(<CreateTodoListModal {...defaultProps} />);

    // Click on the modal content (not the backdrop)
    const modalContent = screen.getByText('Create New TODO List');
    await user.click(modalContent);

    // onClose should not be called when clicking on content
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('focuses on modal when opened', () => {
    render(<CreateTodoListModal {...defaultProps} />);

    // The focus should be on the modal content div (tabIndex={-1})
    const modalContent = document.querySelector('[tabindex="-1"]');
    expect(modalContent).toHaveFocus();
  });

  it('traps focus within modal', async () => {
    const user = userEvent.setup();
    render(<CreateTodoListModal {...defaultProps} />);

    // Tab should cycle through focusable elements within the modal
    await user.tab();
    expect(screen.getByRole('button', { name: /close/i })).toHaveFocus();
  });
});
