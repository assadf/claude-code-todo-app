import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', {
      name: /claude code todo app/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<HomePage />);

    const welcomeText = screen.getByText(
      /welcome to your todo management system/i
    );

    expect(welcomeText).toBeInTheDocument();
  });

  it('renders the get started button', () => {
    render(<HomePage />);

    const button = screen.getByText(/get started/i);

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-primary');
  });

  it('has proper styling classes', () => {
    render(<HomePage />);

    const main = screen.getByRole('main');

    expect(main).toHaveClass(
      'flex',
      'min-h-screen',
      'items-center',
      'justify-center'
    );
  });
});
