import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardClient } from './DashboardClient';

// Mock the CreateTodoListModal component
jest.mock('../ui/CreateTodoListModal', () => ({
  CreateTodoListModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <div>Modal is open</div>
        <button onClick={onClose}>Close modal</button>
      </div>
    ) : null,
}));

describe('DashboardClient', () => {
  it('opens modal when create list button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DashboardClient>
        <button className="create-list-button">Create Your First List</button>
      </DashboardClient>
    );

    // Modal should not be visible initially
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    // Click the create list button
    const createButton = screen.getByText('Create Your First List');
    await user.click(createButton);

    // Modal should now be visible
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Modal is open')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DashboardClient>
        <button className="create-list-button">Create Your First List</button>
      </DashboardClient>
    );

    // Open the modal
    const createButton = screen.getByText('Create Your First List');
    await user.click(createButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByText('Close modal');
    await user.click(closeButton);

    // Modal should be closed
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('works with nested elements in create button', async () => {
    const user = userEvent.setup();

    render(
      <DashboardClient>
        <button className="create-list-button">
          <span>Create Your First List</span>
        </button>
      </DashboardClient>
    );

    // Click the span inside the button
    const createSpan = screen.getByText('Create Your First List');
    await user.click(createSpan);

    // Modal should be visible
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });
});
