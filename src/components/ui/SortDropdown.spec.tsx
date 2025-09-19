import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SortDropdown } from './SortDropdown';

describe('SortDropdown', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with default label', () => {
    render(<SortDropdown value="updated-desc" onChange={mockOnChange} />);

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.getByText('Recently Updated')).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(
      <SortDropdown value="name-asc" onChange={mockOnChange} label="Order by" />
    );

    expect(screen.getByText('Order by:')).toBeInTheDocument();
    expect(screen.getByText('Name A-Z')).toBeInTheDocument();
  });

  it('should show dropdown when clicked', async () => {
    render(<SortDropdown value="updated-desc" onChange={mockOnChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByText('Recently Updated')).toHaveLength(2); // One in button, one in dropdown
      expect(screen.getByText('Recently Created')).toBeInTheDocument();
      expect(screen.getByText('Name A-Z')).toBeInTheDocument();
      expect(screen.getByText('Name Z-A')).toBeInTheDocument();
    });
  });

  it('should close dropdown when clicking outside', async () => {
    render(
      <div>
        <SortDropdown value="updated-desc" onChange={mockOnChange} />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const outsideElement = screen.getByTestId('outside');
    fireEvent.mouseDown(outsideElement);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('should close dropdown when pressing Escape', async () => {
    render(<SortDropdown value="updated-desc" onChange={mockOnChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.keyDown(button, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('should call onChange when option is selected', async () => {
    render(<SortDropdown value="updated-desc" onChange={mockOnChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const nameAscOption = screen.getByText('Name A-Z');
    fireEvent.click(nameAscOption);

    expect(mockOnChange).toHaveBeenCalledWith('name-asc');

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('should highlight selected option', async () => {
    render(<SortDropdown value="name-asc" onChange={mockOnChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const selectedOption = screen.getByRole('option', { name: /Name A-Z/i });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should show descriptions for each option', async () => {
    render(<SortDropdown value="updated-desc" onChange={mockOnChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('Sort by most recently updated first')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Sort alphabetically A to Z')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Sort by most recently created first')
      ).toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes', () => {
    render(<SortDropdown value="updated-desc" onChange={mockOnChange} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should update ARIA expanded when dropdown opens', async () => {
    render(<SortDropdown value="updated-desc" onChange={mockOnChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
